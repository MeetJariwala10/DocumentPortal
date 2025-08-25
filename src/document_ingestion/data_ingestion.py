from __future__ import annotations
import os
import sys
import json
import shutil
import uuid
import hashlib
from pathlib import Path
from typing import Iterable, List, Optional, Dict, Any

import fitz # PyMuPDF 
from langchain.schema import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_community.vectorstores import FAISS

from utils.model_loader import ModelLoader
from exception.custom_exception import DocumentPortalException

from utils.file_io import generate_session_id, save_uploaded_files
from utils.document_ops import load_documents, concat_for_analysis, concat_for_comparison
from logger import GLOBAL_LOGGER as log

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}


# FAISS Manager for vector database operations
class FaissManager:
    """
    Manages FAISS vector index operations with idempotent document addition and metadata tracking.
    
    This class provides functionality to:
    1. Create new FAISS indices or load existing ones
    2. Add documents to indices with duplicate detection
    3. Track document fingerprints to prevent duplicates
    4. Persist metadata alongside vector indices
    
    The manager uses document fingerprinting based on content hashing or source identifiers
    to ensure documents are only added once, making operations idempotent.
    """
    
    def __init__(self, index_dir: Path, model_loader: Optional[ModelLoader] = None):
        """
        Initialize the FAISS manager with a directory for index storage.
        
        Args:
            index_dir: Directory path where FAISS index and metadata will be stored
            model_loader: Optional ModelLoader instance for embeddings (created if None)
        """
        # Set up index directory
        self.index_dir = Path(index_dir)
        self.index_dir.mkdir(parents=True, exist_ok=True)

        # Initialize metadata tracking
        self.meta_path = self.index_dir / "ingested_meta.json"
        self._meta: Dict[str, Any] = {"rows": {}}

        # Load existing metadata if available
        if self.meta_path.exists():
            try:
                self._meta = json.loads(self.meta_path.read_text(encoding="utf-8")) or {"rows": {}}
            except Exception as e:
                # Reset metadata if loading fails
                self._meta = {"rows": {}}

        # Initialize embedding model
        self.model_loader = model_loader or ModelLoader()
        self.emb = self.model_loader.load_embeddings()
        self.vs: Optional[FAISS] = None        

    def _exists(self) -> bool:
        """Check if a FAISS index already exists in the specified directory.
        
        Returns:
            bool: True if both index.faiss and index.pkl files exist
        """
        return (self.index_dir / "index.faiss").exists() and (self.index_dir / "index.pkl").exists()

    @staticmethod
    def _fingerprint(text: str, md: Dict[str, Any]) -> str:
        """Generate a unique fingerprint for a document to detect duplicates.
        
        Uses source path and row_id if available, otherwise hashes the content.
        
        Args:
            text: Document text content
            md: Document metadata dictionary
            
        Returns:
            str: Unique fingerprint for the document
        """
        # Try to use source path and row_id from metadata
        src = md.get("source") or md.get("file_path")
        rid = md.get("row_id")
        if src is not None:
            return f"{src}::{'' if rid is None else rid}"
        # Fallback to content hash if no source information
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def _save_meta(self):
        """Save the metadata tracking dictionary to disk as JSON.
        
        This persists the record of ingested documents to prevent duplicates
        across multiple runs.
        """
        self.meta_path.write_text(json.dumps(self._meta, ensure_ascii=False, indent=2), encoding="utf-8")

    def add_documents(self, docs: List[Document]):
        """Add documents to the FAISS index with duplicate detection.
        
        This method is idempotent - it checks each document against previously
        ingested documents and only adds new ones. This prevents duplicates
        even across multiple runs.
        
        Args:
            docs: List of Document objects to add to the index
            
        Returns:
            int: Number of new documents actually added
            
        Raises:
            RuntimeError: If load_or_create() hasn't been called first
        """
        if self.vs is None:
            raise RuntimeError("Call load_or_create() before add_documents_idempotent().")
        
        new_docs: List[Document] = []
        
        # Filter out documents that have already been added
        for d in docs:
            # Generate unique fingerprint for the document
            key = self._fingerprint(d.page_content, d.metadata or {})
            if key in self._meta["rows"]:
                continue  # Skip documents we've seen before
            self._meta["rows"][key] = True
            new_docs.append(d)
            
        # Only update the index if we have new documents
        if new_docs:
            self.vs.add_documents(new_docs)
            self.vs.save_local(str(self.index_dir))
            self._save_meta()

        return len(new_docs)

    def load_or_create(self, texts: Optional[List[str]] = None, metadatas: Optional[List[dict]] = None):
        """Load an existing FAISS index or create a new one if none exists.
        
        This method checks if a FAISS index already exists in the specified directory.
        If it does, it loads the index. If not, it creates a new one using the
        provided texts and metadata.
        
        Args:
            texts: List of text strings to index (required if creating new index)
            metadatas: Optional list of metadata dictionaries for each text
            
        Returns:
            FAISS: The loaded or newly created FAISS vector store
            
        Raises:
            DocumentPortalException: If no index exists and no texts are provided
        """
        # If index exists, load it
        if self._exists():
            self.vs = FAISS.load_local(
                str(self.index_dir),
                embeddings=self.emb,
                allow_dangerous_deserialization=True,
            )
            return self.vs
        
        # Otherwise create new index if we have data
        if not texts:
            raise DocumentPortalException("No existing FAISS index and no data to create one", sys)
        
        # Create new index from texts
        self.vs = FAISS.from_texts(texts=texts, embedding=self.emb, metadatas=metadatas or [])
        self.vs.save_local(str(self.index_dir))
        
        return self.vs

class ChatIngestor:
    """
    Processes documents for RAG-based chat functionality with session-based storage.
    
    This class handles the complete document ingestion pipeline:
    1. Saving uploaded files to session directories
    2. Processing documents into text chunks
    3. Creating FAISS vector indices for efficient retrieval
    4. Managing session isolation for multi-user support
    
    The class supports configurable chunking parameters and maintains
    session isolation through directory structure.
    """
    
    def __init__( self,
        temp_base: str = "data",
        faiss_base: str = "faiss_index",
        use_session_dirs: bool = True,
        session_id: Optional[str] = None,
    ):
        """
        Initialize the ChatIngestor with configurable paths and session settings.
        
        Args:
            temp_base: Base directory for temporary file storage
            faiss_base: Base directory for FAISS index storage
            use_session_dirs: Whether to use session-based directories for isolation
            session_id: Optional session ID (auto-generated if None)
        """
        try:
            # Initialize model loader for embeddings
            self.model_loader = ModelLoader()
            
            # Set up session configuration
            self.use_session = use_session_dirs
            self.session_id = session_id or generate_session_id()
            
            # Create base directories
            self.temp_base = Path(temp_base); self.temp_base.mkdir(parents=True, exist_ok=True)
            self.faiss_base = Path(faiss_base); self.faiss_base.mkdir(parents=True, exist_ok=True)
            
            # Resolve session-specific directories
            self.temp_dir = self._resolve_dir(self.temp_base)
            self.faiss_dir = self._resolve_dir(self.faiss_base)

            log.info("ChatIngestor initialized",
                      session_id=self.session_id,
                      temp_dir=str(self.temp_dir),
                      faiss_dir=str(self.faiss_dir),
                      sessionized=self.use_session)
        except Exception as e:
            log.error("Failed to initialize ChatIngestor", error=str(e))
            raise DocumentPortalException("Initialization error in ChatIngestor", e) from e
            
        
    def _resolve_dir(self, base: Path):
        """Resolve directory path based on session configuration.
        
        Creates a session-specific subdirectory if session isolation is enabled,
        otherwise returns the base directory.
        
        Args:
            base: Base directory path
            
        Returns:
            Path: Resolved directory path (session-specific or base)
        """
        if self.use_session:
            d = base / self.session_id # e.g. "faiss_index/abc123"
            d.mkdir(parents=True, exist_ok=True) # creates dir if not exists
            return d
        return base # fallback: "faiss_index/"
        
    def _split(self, docs: List[Document], chunk_size=1000, chunk_overlap=200) -> List[Document]:
        """Split documents into smaller chunks for better retrieval.
        
        Uses RecursiveCharacterTextSplitter to divide documents into chunks
        with specified size and overlap parameters.
        
        Args:
            docs: List of documents to split
            chunk_size: Maximum size of each chunk in characters
            chunk_overlap: Overlap between chunks in characters
            
        Returns:
            List[Document]: Split document chunks
        """
        splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        chunks = splitter.split_documents(docs)
        log.info("Documents split", chunks=len(chunks), chunk_size=chunk_size, overlap=chunk_overlap)
        return chunks
    
    def build_retriever( 
        self,
        uploaded_files: Iterable,
        *,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
        k: int = 5,):
        """Process documents and build a retriever for RAG-based chat.
        
        This method implements the complete document processing pipeline:
        1. Save uploaded files to the session directory
        2. Load and parse documents based on file type
        3. Split documents into chunks for better retrieval
        4. Create or update FAISS vector index
        5. Configure and return a retriever
        
        Args:
            uploaded_files: Iterable of file objects to process
            chunk_size: Size of text chunks for embedding
            chunk_overlap: Overlap between chunks to maintain context
            k: Number of similar chunks to retrieve in chat
            
        Returns:
            Retriever: Configured retriever for similarity search
            
        Raises:
            DocumentPortalException: If retriever creation fails
            ValueError: If no valid documents are loaded
        """
        try:
            # Save uploaded files to session directory
            paths = save_uploaded_files(uploaded_files, self.temp_dir)
            # Load documents using appropriate loaders based on file type
            docs = load_documents(paths)
            if not docs:
                raise ValueError("No valid documents loaded")
            
            # Split documents into chunks for better retrieval
            chunks = self._split(docs, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
            
            # Initialize FAISS manager for vector storage
            fm = FaissManager(self.faiss_dir, self.model_loader)
            
            # Extract text content and metadata for indexing
            texts = [c.page_content for c in chunks]
            metas = [c.metadata for c in chunks]
            
            # Load existing index or create new one
            try:
                vs = fm.load_or_create(texts=texts, metadatas=metas)
            except Exception:
                # Retry once if first attempt fails
                vs = fm.load_or_create(texts=texts, metadatas=metas)
                
            # Add documents to index with duplicate detection
            added = fm.add_documents(chunks)
            log.info("FAISS index updated", added=added, index=str(self.faiss_dir))
            
            # Configure and return retriever
            return vs.as_retriever(search_type="similarity", search_kwargs={"k": k})
            
        except Exception as e:
            log.error("Failed to build retriever", error=str(e))
            raise DocumentPortalException("Failed to build retriever", e) from e

    

class DocHandler:
    """
    PDF document handler for saving and reading PDF files with session-based isolation.
    
    This class provides functionality to save uploaded PDF files to a session-specific
    directory and read their contents with page markers. It maintains session isolation
    to prevent file conflicts between different user sessions.
    
    Attributes:
        data_dir: Base directory for document storage
        session_id: Unique identifier for the current session
        session_path: Full path to the session-specific directory
    """
    def __init__(self, data_dir: Optional[str] = None, session_id: Optional[str] = None):
        """
        Initialize the DocHandler with session-based storage.
        
        Args:
            data_dir: Base directory for document storage, defaults to environment variable
                      or a subdirectory in the current working directory
            session_id: Unique session identifier, auto-generated if not provided
        """
        self.data_dir = data_dir or os.getenv("DATA_STORAGE_PATH", os.path.join(os.getcwd(), "data", "document_analysis"))
        self.session_id = session_id or generate_session_id("session")
        self.session_path = os.path.join(self.data_dir, self.session_id)
        os.makedirs(self.session_path, exist_ok=True)
        log.info("DocHandler initialized", session_id=self.session_id, session_path=self.session_path)

    def save_pdf(self, uploaded_file) -> str:
        """Save an uploaded PDF file to the session directory.
        
        Args:
            uploaded_file: File object with name attribute and read/getbuffer method
            
        Returns:
            str: Path where the file was saved
            
        Raises:
            ValueError: If the file is not a PDF
            DocumentPortalException: If saving fails for any reason
        """
        try:
            filename = os.path.basename(uploaded_file.name)
            if not filename.lower().endswith(".pdf"):
                raise ValueError("Invalid file type. Only PDFs are allowed.")
            save_path = os.path.join(self.session_path, filename)
            with open(save_path, "wb") as f:
                if hasattr(uploaded_file, "read"):
                    f.write(uploaded_file.read())
                else:
                    f.write(uploaded_file.getbuffer())
            log.info("PDF saved successfully", file=filename, save_path=save_path, session_id=self.session_id)
            return save_path
        except Exception as e:
            log.error("Failed to save PDF", error=str(e), session_id=self.session_id)
            raise DocumentPortalException(f"Failed to save PDF: {str(e)}", e) from e

    def read_pdf(self, pdf_path: str) -> str:
        """Extract text content from a PDF file with page markers.
        
        Uses PyMuPDF (fitz) to extract text from each page and adds page
        number markers to help maintain document structure.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            str: Extracted text with page markers
            
        Raises:
            DocumentPortalException: If PDF processing fails
        """
        try:
            text_chunks = []
            with fitz.open(pdf_path) as doc:
                for page_num in range(doc.page_count):
                    page = doc.load_page(page_num)
                    text_chunks.append(f"\n--- Page {page_num + 1} ---\n{page.get_text()}")  # type: ignore
            text = "\n".join(text_chunks)
            log.info("PDF read successfully", pdf_path=pdf_path, session_id=self.session_id, pages=len(text_chunks))
            return text
        except Exception as e:
            log.error("Failed to read PDF", error=str(e), pdf_path=pdf_path, session_id=self.session_id)
            raise DocumentPortalException(f"Could not process PDF: {pdf_path}", e) from e

class DocumentComparator:
    """
    Document comparison utility for analyzing differences between PDF documents.
    
    This class provides functionality to save, read, and combine PDF documents for
    comparison with session-based isolation. It maintains a unique session directory
    for each comparison task to prevent file conflicts between different user sessions.
    
    Attributes:
        base_dir: Base directory for document comparison storage
        session_id: Unique identifier for the current comparison session
        session_path: Full path to the session-specific directory
    """
    def __init__(self, base_dir: str = "data/document_compare", session_id: Optional[str] = None):
        """
        Initialize the DocumentComparator with session-based storage.
        
        Args:
            base_dir: Base directory for document comparison storage
            session_id: Unique session identifier, auto-generated if not provided
        """
        self.base_dir = Path(base_dir)
        self.session_id = session_id or generate_session_id()
        self.session_path = self.base_dir / self.session_id
        self.session_path.mkdir(parents=True, exist_ok=True)
        log.info("DocumentComparator initialized", session_path=str(self.session_path))

    def save_uploaded_files(self, reference_file, actual_file):
        """
        Save reference and actual PDF files to the session directory.
        
        Args:
            reference_file: Reference PDF file object
            actual_file: Actual PDF file object to compare against reference
            
        Raises:
            ValueError: If any file is not a PDF
            DocumentPortalException: If saving fails for any reason
        """
        try:
            ref_path = self.session_path / reference_file.name
            act_path = self.session_path / actual_file.name
            for fobj, out in ((reference_file, ref_path), (actual_file, act_path)):
                if not fobj.name.lower().endswith(".pdf"):
                    raise ValueError("Only PDF files are allowed.")
                with open(out, "wb") as f:
                    if hasattr(fobj, "read"):
                        f.write(fobj.read())
                    else:
                        f.write(fobj.getbuffer())
            log.info("Files saved", reference=str(ref_path), actual=str(act_path), session=self.session_id)
            return ref_path, act_path
        except Exception as e:
            log.error("Error saving PDF files", error=str(e), session=self.session_id)
            raise DocumentPortalException("Error saving files", e) from e

    def read_pdf(self, pdf_path: Path) -> str:
        """
        Extract text content from a PDF file with page markers.
        
        Uses PyMuPDF (fitz) to extract text from each page and adds page
        number markers to help maintain document structure. Skips empty pages.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            str: Extracted text with page markers
            
        Raises:
            ValueError: If the PDF is encrypted
            DocumentPortalException: If PDF processing fails
        """
        try:
            with fitz.open(pdf_path) as doc:
                if doc.is_encrypted:
                    raise ValueError(f"PDF is encrypted: {pdf_path.name}")
                parts = []
                for page_num in range(doc.page_count):
                    page = doc.load_page(page_num)
                    text = page.get_text()  # type: ignore
                    if text.strip():
                        parts.append(f"\n --- Page {page_num + 1} --- \n{text}")
            log.info("PDF read successfully", file=str(pdf_path), pages=len(parts))
            return "\n".join(parts)
        except Exception as e:
            log.error("Error reading PDF", file=str(pdf_path), error=str(e))
            raise DocumentPortalException("Error reading PDF", e) from e

    def combine_documents(self) -> str:
        """
        Combine all PDF documents in the session directory into a single text.
        
        Reads all PDF files in the session directory, extracts their text content,
        and combines them with document name headers for clear separation.
        
        Returns:
            str: Combined text from all PDF documents in the session
            
        Raises:
            DocumentPortalException: If document combination fails
        """
        try:
            doc_parts = []
            for file in sorted(self.session_path.iterdir()):
                if file.is_file() and file.suffix.lower() == ".pdf":
                    content = self.read_pdf(file)
                    doc_parts.append(f"Document: {file.name}\n{content}")
            combined_text = "\n\n".join(doc_parts)
            log.info("Documents combined", count=len(doc_parts), session=self.session_id)
            return combined_text
        except Exception as e:
            log.error("Error combining documents", error=str(e), session=self.session_id)
            raise DocumentPortalException("Error combining documents", e) from e

    def clean_old_sessions(self, keep_latest: int = 3):
        """
        Remove old session directories to manage disk space.
        
        Keeps a specified number of the most recent session directories
        and deletes all older ones to prevent disk space issues.
        
        Args:
            keep_latest: Number of recent session directories to preserve
            
        Raises:
            DocumentPortalException: If session cleanup fails
        """
        try:
            sessions = sorted([f for f in self.base_dir.iterdir() if f.is_dir()], reverse=True)
            for folder in sessions[keep_latest:]:
                shutil.rmtree(folder, ignore_errors=True)
                log.info("Old session folder deleted", path=str(folder))
        except Exception as e:
            log.error("Error cleaning old sessions", error=str(e))
            raise DocumentPortalException("Error cleaning old sessions", e) from e