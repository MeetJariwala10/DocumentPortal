import os
from typing import List, Optional, Any, Dict
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

# Import document processing components
from src.document_ingestion.data_ingestion import (
    DocHandler,              # Handles PDF file storage and retrieval
    DocumentComparator,      # Compares multiple documents
    ChatIngestor,           # Processes documents for RAG system
)
from src.document_analyzer.data_analysis import DocumentAnalyzer  # Analyzes document content using LLMs
from src.document_compare.document_comparator import DocumentComparatorLLM  # LLM-based document comparison
from src.document_chat.retrieval import ConversationalRAG  # RAG-based document chat system
from utils.document_ops import FastAPIFileAdapter, read_pdf_via_handler  # File handling utilities
from logger import GLOBAL_LOGGER as log  # Centralized logging

# Environment variables for file storage and vector database configuration
FAISS_BASE = os.getenv("FAISS_BASE", "faiss_index")  # Base directory for FAISS vector database
UPLOAD_BASE = os.getenv("UPLOAD_BASE", "data")  # Base directory for uploaded files
FAISS_INDEX_NAME = os.getenv("FAISS_INDEX_NAME", "index")  # Index name - must match save_local() calls

# Initialize FastAPI application
app = FastAPI(title="Document Portal API", version="0.1")

# Set up static files and templates for the web interface
BASE_DIR = Path(__file__).resolve().parent.parent
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Configure CORS to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes

@app.get("/", response_class=HTMLResponse)
async def serve_ui(request: Request):
    """Serve the main web interface HTML page."""
    log.info("Serving UI homepage.")
    resp = templates.TemplateResponse("index.html", {"request": request})
    resp.headers["Cache-Control"] = "no-store"  # Prevent caching for fresh content
    return resp

@app.get("/health")
def health() -> Dict[str, str]:
    """Health check endpoint for monitoring and deployment verification."""
    log.info("Health check passed.")
    return {"status": "ok", "service": "document-portal"}

# ---------- ANALYZE ----------
@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)) -> Any:
    """Analyze a PDF document using LLM to extract metadata and insights.
    
    This endpoint:
    1. Saves the uploaded PDF to a session directory
    2. Extracts text content from the PDF
    3. Uses LLM to analyze the document and extract structured metadata
    4. Returns the analysis results as JSON
    
    Args:
        file: The uploaded PDF file
        
    Returns:
        JSON response with document metadata and analysis
        
    Raises:
        HTTPException: If analysis fails or file is invalid
    """
    try:
        log.info(f"Received file for analysis: {file.filename}")
        # Create document handler with session-based storage
        dh = DocHandler()
        # Save the uploaded PDF and get its path
        saved_path = dh.save_pdf(FastAPIFileAdapter(file))
        # Extract text content from the PDF
        text = read_pdf_via_handler(dh, saved_path)
        # Initialize document analyzer with LLM
        analyzer = DocumentAnalyzer()
        # Analyze document and get structured metadata
        result = analyzer.analyze_document(text)
        log.info("Document analysis complete.")
        return JSONResponse(content=result)
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Error during document analysis")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

# ---------- COMPARE ----------
@app.post("/compare")
async def compare_documents(reference: UploadFile = File(...), actual: UploadFile = File(...)) -> Any:
    """Compare two PDF documents to identify differences using LLM analysis.
    
    This endpoint:
    1. Saves both uploaded PDFs to a session directory
    2. Combines the documents into a structured text format
    3. Uses LLM to analyze differences between the documents
    4. Returns a structured comparison as a table
    
    Args:
        reference: The reference/original PDF file
        actual: The comparison/new PDF file
        
    Returns:
        JSON with comparison results as table rows and session ID
        
    Raises:
        HTTPException: If comparison fails or files are invalid
    """
    try:
        log.info(f"Comparing files: {reference.filename} vs {actual.filename}")
        # Create document comparator with session-based storage
        dc = DocumentComparator()
        # Save both uploaded PDFs and get their paths
        ref_path, act_path = dc.save_uploaded_files(
            FastAPIFileAdapter(reference), FastAPIFileAdapter(actual)
        )
        _ = ref_path, act_path  # Unused but kept for clarity

        # Combine documents into a structured format for comparison
        combined_text = dc.combine_documents()
        # Initialize LLM-based document comparator
        comp = DocumentComparatorLLM()
        # Perform comparison analysis and get results as DataFrame
        df = comp.compare_documents(combined_text)
        log.info("Document comparison completed.")
        return {"rows": df.to_dict(orient="records"), "session_id": dc.session_id}
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Comparison failed")
        raise HTTPException(status_code=500, detail=f"Comparison failed: {e}")

# ---------- CHAT: INDEX ----------
@app.post("/chat/index")
async def chat_build_index(
    files: List[UploadFile] = File(...),
    session_id: Optional[str] = Form(None),
    use_session_dirs: bool = Form(True),
    chunk_size: int = Form(1000),
    chunk_overlap: int = Form(200),
    k: int = Form(5),
) -> Any:
    """Build or update a FAISS vector index for document chat functionality.
    
    This endpoint:
    1. Saves uploaded documents to a session directory
    2. Processes documents by splitting into chunks
    3. Creates vector embeddings and builds a FAISS index
    4. Configures a retriever for RAG-based chat
    
    Args:
        files: List of documents to index (PDF, DOCX, TXT)
        session_id: Optional session ID for persistence (auto-generated if None)
        use_session_dirs: Whether to use session-based directories for isolation
        chunk_size: Size of text chunks for embedding
        chunk_overlap: Overlap between chunks to maintain context
        k: Number of similar chunks to retrieve in chat
        
    Returns:
        JSON with session ID and configuration parameters
        
    Raises:
        HTTPException: If indexing fails or files are invalid
    """
    try:
        log.info(f"Indexing chat session. Session ID: {session_id}, Files: {[f.filename for f in files]}")
        # Wrap uploaded files with adapter for consistent interface
        wrapped = [FastAPIFileAdapter(f) for f in files]
        
        # Initialize ChatIngestor for vector database creation
        ci = ChatIngestor(
            temp_base=UPLOAD_BASE,          # Directory for temporary file storage
            faiss_base=FAISS_BASE,          # Directory for FAISS index storage
            use_session_dirs=use_session_dirs,  # Whether to use isolated session directories
            session_id=session_id or None,      # Session ID (auto-generated if None)
        )
        
        # Build retriever by processing documents and creating FAISS index
        # Note: ChatIngestor saves with index_name="index" matching FAISS_INDEX_NAME
        ci.build_retriever(
            wrapped,                    # Wrapped file objects
            chunk_size=chunk_size,      # Size of text chunks for embedding
            chunk_overlap=chunk_overlap,  # Overlap between chunks
            k=k                         # Number of chunks to retrieve
        )
        
        log.info(f"Index created successfully for session: {ci.session_id}")
        return {"session_id": ci.session_id, "k": k, "use_session_dirs": use_session_dirs}
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Chat index building failed")
        raise HTTPException(status_code=500, detail=f"Indexing failed: {e}")

# ---------- CHAT: QUERY ----------
@app.post("/chat/query")
async def chat_query(
    question: str = Form(...),
    session_id: Optional[str] = Form(None),
    use_session_dirs: bool = Form(True),
    k: int = Form(5),
) -> Any:
    """Process a chat query using RAG (Retrieval-Augmented Generation).
    
    This endpoint:
    1. Loads the FAISS index for the specified session
    2. Retrieves relevant document chunks based on the query
    3. Generates a contextual response using LLM with retrieved context
    4. Maintains conversation history for follow-up questions
    
    Args:
        query: User's question or prompt
        session_id: Session ID from previous indexing operation
        use_session_dirs: Whether to use session-based directories
        k: Number of similar chunks to retrieve
        history: Optional conversation history as list of message dicts
        
    Returns:
        JSON with LLM-generated answer based on document context
        
    Raises:
        HTTPException: If query processing fails or session not found
    """
    try:
        log.info(f"Received chat query: '{question}' | session: {session_id}")
        if use_session_dirs and not session_id:
            raise HTTPException(status_code=400, detail="session_id is required when use_session_dirs=True")

        index_dir = os.path.join(FAISS_BASE, session_id) if use_session_dirs else FAISS_BASE  # type: ignore
        if not os.path.isdir(index_dir):
            raise HTTPException(status_code=404, detail=f"FAISS index not found at: {index_dir}")

        rag = ConversationalRAG(session_id=session_id)
        rag.load_retriever_from_faiss(index_dir, k=k, index_name=FAISS_INDEX_NAME)  # build retriever + chain
        response = rag.invoke(question, chat_history=[])
        log.info("Chat query handled successfully.")

        return {
            "answer": response,
            "session_id": session_id,
            "k": k,
            "engine": "LCEL-RAG"
        }
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Chat query failed")
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")

# command for executing the fast api
# uvicorn api.main:app --port 8080 --reload    
#uvicorn api.main:app --host 0.0.0.0 --port 8080 --reload