"""
custom_logger.py

A simple, beginner-friendly custom logger utility for Python projects.
- Logs messages to both the console and a file.
- Uses structlog for structured, JSON-formatted logs.
- Each log entry includes a timestamp, log level, and custom fields.
- Designed for easy integ   ration and clear, readable logs for debugging and monitoring.
"""
import os
import logging
from datetime import datetime
import structlog

# CustomLogger class for structured logging (console + file, JSON format)
class CustomLogger:
    """
    CustomLogger sets up structured logging for your Python project.

    Features:
    - Logs to both a file (with a timestamped filename) and the console.
    - Uses structlog to format logs as JSON, making them easy to read and parse.
    - Each log entry includes a timestamp, log level, and your custom fields.
    - Suitable for beginners who want clear, modern logging in their projects.
    """
    def __init__(self, log_dir="logs"):
        # Ensure logs directory exists (creates if not present)
        self.logs_dir = os.path.join(os.getcwd(), log_dir)
        os.makedirs(self.logs_dir, exist_ok=True)

        # Create a log file with a unique timestamp in its name
        log_file = f"{datetime.now().strftime('%m_%d_%Y_%H_%M_%S')}.log"
        self.log_file_path = os.path.join(self.logs_dir, log_file)

    def get_logger(self, name=__file__):
        """
        Returns a structlog logger instance configured for both console and file output.

        Args:
            name (str): The name for the logger (usually __file__). Used to identify the source of logs.

        Returns:
            structlog.BoundLogger: A logger that outputs structured, JSON-formatted logs.
        """
        # Use the filename (or provided name) as the logger name
        logger_name = os.path.basename(name)

        # Set up a file handler to write logs to the log file (INFO level, JSON lines)
        file_handler = logging.FileHandler(self.log_file_path)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(logging.Formatter("%(message)s"))  # Raw JSON lines

        # Set up a console handler to print logs to the terminal (INFO level, JSON lines)
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(logging.Formatter("%(message)s"))

        # Configure the root logger to use both handlers (console and file)
        # - level=logging.INFO: Only log messages with INFO level or higher
        # - format="%(message)s": Output only the message (structlog will format as JSON)
        # - handlers=[console_handler, file_handler]: Send logs to both console and file
        logging.basicConfig(
            level=logging.INFO,
            format="%(message)s",  # Structlog will handle JSON rendering
            handlers=[console_handler, file_handler]
        )

        # Configure structlog for structured (JSON) logging
        # This sets up how log messages are processed and formatted:
        # - processors: List of functions that add info to each log (timestamp, level, etc.)
        # - logger_factory: Use standard library logger under the hood
        # - cache_logger_on_first_use: Speeds up repeated logger creation
        structlog.configure(
            processors=[
                structlog.processors.TimeStamper(fmt="iso", utc=True, key="timestamp"),  # Add ISO timestamp to each log
                structlog.processors.add_log_level,  # Add the log level (info, error, etc.)
                structlog.processors.EventRenamer(to="event"),  # Rename the main log message to 'event' in JSON
                structlog.processors.JSONRenderer()  # Output the log as a JSON object
            ],
            logger_factory=structlog.stdlib.LoggerFactory(),  # Use standard logging under the hood
            cache_logger_on_first_use=True,  # Cache for performance
        )

        # Return a structlog logger instance with the given name
        # This logger will use all the above settings and output structured logs
        return structlog.get_logger(logger_name)


# --- Usage Example ---
if __name__ == "__main__":
    # Create a logger instance for this file
    logger = CustomLogger().get_logger(__file__)
    # Log an info message (with extra fields)
    logger.info("User uploaded a file", user_id=123, filename="report.pdf")
    # Log an error message (with extra fields)
    logger.error("Failed to process PDF", error="File not found", user_id=123)