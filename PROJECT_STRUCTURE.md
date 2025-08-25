# DocumentPortal Project Structure

This document provides an overview of the project structure and explains what each folder and code component does.

## Root Directory

- `api/`: Contains the FastAPI application that serves as the backend
- `config/`: Configuration files for the project
- `exception/`: Custom exception handling
- `logger/`: Logging utilities
- `model/`: Data models and schemas
- `prompt/`: LLM prompts
- `src/`: Core functionality modules
- `static/`: Static assets (CSS, JS)
- `templates/`: HTML templates
- `utils/`: Utility functions
- `tests/`: Test cases

## Core Modules

### API (`api/`)

- `main.py`: The main FastAPI application that integrates all components and exposes endpoints for document analysis, comparison, and chat functionality.

### Configuration (`config/`)

- `config.yaml`: Centralized configuration for the project, including settings for FAISS database, embedding models, retriever parameters, and LLM providers.

### Exception Handling (`exception/`)

- `__init__.py`: Package initialization
- `custom_exception.py`: Custom exception classes for the project
- `custom_exception_archive.py`: Archive of older exception handling code

### Logging (`logger/`)

- `__init__.py`: Package initialization and global logger setup
- `custom_logger.py`: Custom logging implementation

### Models (`model/`)

- `models.py`: Pydantic models for data validation and structured output parsing

### Prompts (`prompt/`)

- `__init__.py`: Package initialization
- `prompt_library.py`: Collection of prompts for different LLM tasks

### Source Code (`src/`)

#### Document Analyzer (`src/document_analyzer/`)

- `__init__.py`: Package initialization
- `data_analysis.py`: Contains the `DocumentAnalyzer` class for extracting structured metadata from documents using LLMs

#### Document Chat (`src/document_chat/`)

- `__init__.py`: Package initialization
- `retrieval.py`: Contains the `ConversationalRAG` class for RAG-based document chat functionality

#### Document Comparison (`src/document_compare/`)

- `__init__.py`: Package initialization
- `document_comparator.py`: Contains the `DocumentComparatorLLM` class for LLM-based document comparison

#### Document Ingestion (`src/document_ingestion/`)

- `__init__.py`: Package initialization
- `data_ingestion.py`: Contains classes for document processing, including `FaissManager`, `ChatIngestor`, `DocHandler`, and `DocumentComparator`

### Static Assets (`static/`)

- `style.css`: CSS styles for the web UI

### Templates (`templates/`)

- `index.html`: Main HTML template for the web UI with tabs for document analysis, comparison, and chat

### Utilities (`utils/`)

- `__init__.py`: Package initialization
- `config_loader.py`: Utilities for loading configuration
- `document_ops.py`: Document operation utilities
- `file_io.py`: File I/O utilities
- `model_loader.py`: Utilities for loading LLM and embedding models

### Tests (`tests/`)

- `__init__.py`: Package initialization
- `test_routes.py`: API route tests
- `test_unit_cases.py`: Unit tests

## Other Files

- `.dockerignore`: Files to exclude from Docker builds
- `.github/workflows/`: GitHub Actions workflows for CI/CD
- `.gitignore`: Files to exclude from Git
- `Dockerfile`: Docker configuration for containerization
- `NOTE.md`: Development notes
- `README.md`: Main project documentation
- `infrastructure/`: Infrastructure as code files
- `notebook/`: Jupyter notebooks for experiments
- `pyproject.toml`: Python project configuration
- `requirements.txt`: Python dependencies
- `setup.py`: Package setup script
- `streamlit.py`: Streamlit application (alternative UI)
- `test.py`: Test script
- `versions.py`: Version information

## Data Flow

### Document Analysis Flow

1. User uploads a PDF through the `/analyze` endpoint
2. `DocHandler` saves the PDF and extracts text
3. `DocumentAnalyzer` uses LLM to extract structured metadata
4. Results are returned as JSON

### Document Comparison Flow

1. User uploads two PDFs through the `/compare` endpoint
2. `DocumentComparator` saves the PDFs and combines them
3. `DocumentComparatorLLM` uses LLM to analyze differences
4. Results are returned as a table

### Document Chat Flow

1. User uploads documents through the `/chat/index` endpoint
2. `ChatIngestor` processes documents and builds a FAISS index
3. User sends a query through the `/chat/query` endpoint
4. `ConversationalRAG` retrieves relevant chunks and generates a response
5. Answer is returned to the user