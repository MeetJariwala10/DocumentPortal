import sys
import uuid
from pathlib import Path
import fitz
from datetime import datetime, timezone
from logger.custom_logger import CustomLogger
from exception.custom_exception import DocumentPortalException

class DocumentIngestion:
    """
    Handles saving, reading, and combining of PDFs for comparison with session-based versioning.
    """

    def __init__(self, base_dir: str = "data/document_compare", session_id=None):
        self.log = CustomLogger().get_logger(__name__)
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def delete_existing_files(self):
        """
        Deletes existing files at the specified paths.
        """
        try:
            if self.base_dir.exists() and self.base_dir.is_dir():
                for file in self.base_dir.iterdir():
                    file.unlink()
                    self.log.info("File deleted", path=str(file))
                self.log.info("Directory cleaned", directory=str(self.base_dir))
        except Exception as e:
            self.log.error("Error deleting existing files: {e}")
            raise DocumentIngestion("An error occurred while deleting existing files.", sys)

    def save_uploaded_files(self, reference_file, actual_file):
        """
        Saves uploaded files to a apecific directory.
        reference_file: The latest version of the file (updated or latest version)
        actual_file: The actual or base file (1st version)

        """
        try:
            self.delete_existing_files()
            self.log.info("Existing files are deleted")

            ref_path = self.base_dir / reference_file.name
            act_path = self.base_dir / actual_file.name
            
            if not reference_file.name.endswith(".pdf") or actual_file.name.endswith(".pdf"):
                raise ValueError("Only PDF files are allowed.") 
            
            with open(ref_path, "wb") as f:
                f.write(reference_file.get_buffer())

            with open(act_path, "wb") as f:
                f.write(actual_file.get_buffer())

            self.log.info("Files saved.", reference=str(ref_path), actual=str(act_path))

            return ref_path, act_path

        except Exception as e:
            self.log.error("Error saving PDF files: {e}")
            raise DocumentIngestion("Error saving files.", sys)


    def read_pdf(self, pdf_path: Path) -> str:
        """
        Reads a PDF file and extracts text from each page
        """
        try:
            with fitz.open(pdf_path) as doc:
                if doc.is_encrypted():
                    raise ValueError(f"PDF is encrypted {pdf_path.name}")
                
                all_text = []
                for page_num in range(doc.page_count):
                    page = doc.load_page(page_num)
                    text = page.get_text() # type: ignore

                    if text.strip():
                        all_text.append(f"\n --- Page {page_num + 1} --- \n{text}") 

            self.log.info("PDF read successfully", file=str(pdf_path), pages=len(all_text))
            return "\n".join(all_text)

        except Exception as e:
            self.log.error("Error reading PDF: {e}")
            raise DocumentIngestion("An error occurred while reading the PDF.", sys)

    def combine_documents(self):
        pass

    def clean_old_sessions(self):
        pass