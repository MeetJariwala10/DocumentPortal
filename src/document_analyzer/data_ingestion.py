"""
Document Ingestion Module

This module provides functionality for handling PDF document operations including
saving uploaded files and reading PDF content. It includes session-based organization
and comprehensive logging for all operations.

Classes:
    DocumentHandler: Main class for PDF document operations
"""

import os
import fitz
import uuid
from datetime import datetime
from logger.custom_logger import CustomLogger
from exception.custom_exception import DocumentPortalException


class DocumentHandler:
    """
    Handles PDF saving and reading operations with session-based organization.
    
    This class provides functionality to:
    - Save uploaded PDF files to session-specific directories
    - Read and extract text content from PDF files
    - Automatically log all operations for debugging and auditing
    - Organize files by session for better management
    
    Attributes:
        log (CustomLogger): Logger instance for operation tracking
        data_dir (str): Base directory for storing document data
        session_id (str): Unique identifier for the current session
        session_path (str): Full path to the session-specific directory
    
    Example:
        >>> handler = DocumentHandler()
        >>> saved_path = handler.save_pdf(uploaded_file)
        >>> content = handler.read_pdf(saved_path)
    """
    
    def __init__(self, data_dir=None, session_id=None):
        """
        Initialize the DocumentHandler with optional custom data directory and session ID.
        
        Args:
            data_dir (str, optional): Custom directory path for storing documents.
                Defaults to environment variable DATA_STORAGE_PATH or a default path.
            session_id (str, optional): Custom session identifier. If not provided,
                generates a timestamp-based session ID with UUID suffix.
        
        Raises:
            DocumentPortalException: If initialization fails due to directory creation issues.
        
        Note:
            Creates the session directory structure automatically if it doesn't exist.
        """
        try:
            # Initialize logger for this class
            self.log = CustomLogger().get_logger(__name__)
            
            # Set data directory - use provided path, environment variable, or default
            self.data_dir = data_dir or os.getenv(
                "DATA_STORAGE_PATH",
                os.path.join(os.getcwd(), "data", "document_analysis")
            )
            
            # Generate session ID if not provided
            self.session_id = session_id or f"session_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
            
            # Create full session path for organizing files
            self.session_path = os.path.join(self.data_dir, self.session_id)
            
            # Ensure session directory exists
            os.makedirs(self.session_path, exist_ok=True)

            # Log successful initialization with session context for structured logging
            # session_id and session_path are included as separate JSON fields for easier debugging and session tracking
            self.log.info("PDFHandler initialized", session_id=self.session_id, session_path=self.session_path)


        except Exception as e:
            self.log.error(f"Error initializing DocumentHandler: {e}")
            raise DocumentPortalException("Error initializing DocumentHandler", e) from e
        

    def save_pdf(self, uploaded_file):
        """
        Save an uploaded PDF file to the session directory.
        
        Args:
            uploaded_file: File-like object with 'name' attribute and 'getbuffer()' method.
                Typically a StreamlitUploadedFile or similar upload handler object.
        
        Returns:
            str: Full path where the PDF file was saved.
        
        Raises:
            DocumentPortalException: If file is not a PDF or if saving fails.
        
        Note:
            Validates that the uploaded file is a PDF before saving.
            Saves the file with its original filename in the session directory.
        """
        try:
            # NOTE:
            # Extract filename from uploaded file using basename() for safety
            # uploaded_file.name might contain full path (e.g., "C:\Users\John\Documents\report.pdf")
            # os.path.basename() extracts only the filename part (e.g., "report.pdf")
            # This ensures clean, cross-platform compatible file paths
            # 
            # Examples:
            # uploaded_file.name = "document.pdf" → basename() = "document.pdf"
            # uploaded_file.name = "C:\Users\John\report.pdf" → basename() = "report.pdf"
            # uploaded_file.name = "/home/user/file.pdf" → basename() = "file.pdf"
            filename = os.path.basename(uploaded_file.name)
            
            # Validate file type - only PDFs are allowed
            if not filename.lower().endswith(".pdf"):
                raise DocumentPortalException("Invalid file type. Only PDFs are allowed.")

            # Create full save path within session directory
            save_path = os.path.join(self.session_path, filename)
            
            # NOTE:
            # Write file content to disk for permanent storage
            # WHY SAVE TO DISK?
            # 1. Uploaded files are temporary (in memory only) and will be lost when function ends
            # 2. We need permanent storage so other functions can access the file later
            # 3. Files should survive program restarts and be available for processing
            # 4. Without saving, the file disappears and can't be read by read_pdf() method
            # 5. Session-based organization requires files to be stored on disk
            with open(save_path, "wb") as f:

                # NOTE:
                # getbuffer() extracts the raw bytes from the uploaded file object
                # This gives us the actual file data (not just a reference) so we can save it to disk
                # Without getbuffer(), we would only have a file object reference, not the actual file content
                f.write(uploaded_file.getbuffer())

            # Log successful save operation
            self.log.info("PDF saved successfully", file=filename, save_path=save_path, session_id=self.session_id)
            
            return save_path
        
        except Exception as e:
            self.log.error(f"Error saving PDF: {e}")
            raise DocumentPortalException("Error saving PDF", e) from e

    def read_pdf(self, pdf_path: str) -> str:
        """
        Read and extract text content from a PDF file.
        
        Args:
            pdf_path (str): Full path to the PDF file to read.
        
        Returns:
            str: Extracted text content from all pages of the PDF.
                Each page is prefixed with a page number header.
        
        Raises:
            DocumentPortalException: If PDF reading fails (file not found, corrupted, etc.).
        
        Note:
            Uses PyMuPDF (fitz) for PDF text extraction.
            Each page is separated with a page number header for easy navigation.
            Logs the number of pages successfully processed.
        """
        try:
            text_chunks = []
            
            # Open PDF file using PyMuPDF
            with fitz.open(pdf_path) as doc:
                # Iterate through each page and extract text
                for page_num, page in enumerate(doc, start=1): # start=1 means to start index values from 1 instead of 0
                    # Extract text from current page and add page header
                    text_chunks.append(f"\n--- Page {page_num} ---\n{page.get_text()}")
            
            # Join all page texts into single string
            text = "\n".join(text_chunks)

            # Log successful read operation with page count
            self.log.info("PDF read successfully", pdf_path=pdf_path, session_id=self.session_id, pages=len(text_chunks))
            return text
            
        except Exception as e:
            self.log.error(f"Error reading PDF: {e}")
            raise DocumentPortalException("Error reading PDF", e) from e


# Test section for development and debugging
if __name__ == "__main__":
    """
    Test section for DocumentHandler functionality.
    
    This section allows direct testing of the DocumentHandler class
    by creating a dummy file object and testing save/read operations.
    """
    
    from pathlib import Path
    from io import BytesIO
    
    # Test PDF path - replace with actual PDF file for testing
    pdf_path = r"D:\\LLMOPs_Krish_Naik\\DocumentPortal\\data\\document_analysis\\NIPS-2017-attention-is-all-you-need-Paper.pdf"
    
    # Dummy file class to simulate uploaded file object
    class DummyFile:
        """
        Dummy file class to simulate uploaded file behavior for testing.
        
        Mimics the interface of StreamlitUploadedFile or similar upload handlers
        with 'name' attribute and 'getbuffer()' method.
        """
        def __init__(self, file_path):
            """
            Initialize dummy file with path.
            
            Args:
                file_path (str): Path to the file to simulate.
            """
            self.name = Path(file_path).name

            # _file_path signals that this attribute is "intended to be private" and should not be accessed directly outside the class.
            self._file_path = file_path
        
        def getbuffer(self):
            """
            Read file content as bytes.
            
            Returns:
                bytes: File content as bytes.
            """
            return open(self._file_path, "rb").read()
    
    # Create dummy PDF file object
    dummy_pdf = DummyFile(pdf_path)
    
    # Initialize document handler
    handler = DocumentHandler()
    
    try:
        # Test save operation
        saved_path = handler.save_pdf(dummy_pdf)
        print(f"PDF saved to: {saved_path}")
        
        # Test read operation
        content = handler.read_pdf(saved_path)
        print("PDF Content:")
        print(content[:1000])  # Print first 500 characters of the PDF content
        
    except Exception as e:
        print(f"Error during testing: {e}")
    
    