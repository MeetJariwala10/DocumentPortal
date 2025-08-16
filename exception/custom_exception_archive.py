"""
custom_exception.py

Defines a custom exception class for the Document Portal project.
This helps provide more informative error messages, including file name,
line number, and a full traceback, making debugging easier.
"""
import sys
import traceback

from logger.custom_logger import CustomLogger  # Import the custom logger
logger = CustomLogger().get_logger(__file__)  # Create a logger for this file

class DocumentPortalException(Exception):
    """
    Custom exception for the Document Portal project.
    
    Captures detailed error information, including:
    - The file and line where the error occurred
    - The error message
    - The full traceback (call stack)
    This makes debugging and logging errors much easier.
    """
    def __init__(self, error_message, error_details: sys):
        # Extract the traceback object from the error details
        # exc_tb stands for "exception traceback" and is a traceback object that contains
        # information about the call stack at the point where the exception was raised.
        _, _, exc_tb = error_details.exc_info()
        
        # Get the filename where the error occurred
        self.file_name = exc_tb.tb_frame.f_code.co_filename
        
        # Get the line number where the error occurred
        self.lineno = exc_tb.tb_lineno
        
        # Store the error message as a string
        self.error_message = str(error_message)
        
        # Format the full traceback as a string for easier logging and debugging
        self.traceback_str = ''.join(traceback.format_exception(*error_details.exc_info())) 
        
    def __str__(self):
        """
        Returns a formatted string representation of the exception,
        including file name, line number, error message, and traceback.
        """
        return f"""
        Error in [{self.file_name}] at line [{self.lineno}]
        Message: {self.error_message}
        Traceback:
        {self.traceback_str}
        """
    
if __name__ == "__main__":
    try:
        # Simulate an error (division by zero)
        a = 1 / 0
        print(a)
    except Exception as e:
        
        # Create a DocumentPortalException with the error and system info
        app_exc = DocumentPortalException(e, sys)
        
        # Log the error using the custom logger
        logger.error(app_exc)
        
        # Raise the custom exception (will stop the program)
        raise app_exc