# Document Ingestion Module

This module handles the ingestion, processing, and storage of documents for the DocumentPortal system.

## Overview

The document ingestion module provides core functionality for:

1. Uploading and storing PDF, DOCX, and TXT files
2. Extracting text content from documents
3. Creating vector embeddings for RAG-based chat
4. Managing session-based isolation for multi-user support

## Key Components

### FaissManager

Manages FAISS vector index operations with idempotent document addition and metadata tracking.

```python
fm = FaissManager(index_dir=Path("faiss_index/session123"))
```

Features:
- Create new FAISS indices or load existing ones
- Add documents with duplicate detection
- Track document fingerprints to prevent duplicates
- Persist metadata alongside vector indices

### ChatIngestor

Handles the document ingestion pipeline for RAG-based chat functionality.

```python
ci = ChatIngestor(
    temp_base="data",
    faiss_base="faiss_index",
    use_session_dirs=True
)
```

Features:
- Save uploaded files with session isolation
- Process documents into chunks for embedding
- Create FAISS vector indices for retrieval
- Configure retriever with customizable parameters

### DocHandler

Provides utilities for PDF file handling with session-based isolation.

```python
dh = DocHandler()
saved_path = dh.save_pdf(file_object)
text = dh.read_pdf(saved_path)
```

Features:
- Session-based file storage
- PDF text extraction with page markers
- File validation and error handling

### DocumentComparator

Handles document comparison functionality with session-based isolation.

```python
dc = DocumentComparator()
ref_path, act_path = dc.save_uploaded_files(ref_file, act_file)
combined_text = dc.combine_documents()
```

Features:
- Save and manage comparison document pairs
- Combine documents with page markers for comparison
- Clean up old sessions to manage disk space

## Usage Examples

### Processing Documents for RAG

```python
# Initialize with session-based storage
ci = ChatIngestor(session_id="user123")

# Process uploaded files
ci.build_retriever(
    files=[file1, file2],
    chunk_size=1000,
    chunk_overlap=200,
    k=5
)

# Session ID for future reference
session_id = ci.session_id
```

### Document Text Extraction

```python
# Initialize handler
dh = DocHandler()

# Save uploaded PDF
saved_path = dh.save_pdf(file_object)

# Extract text with page markers
text = dh.read_pdf(saved_path)
```

## Configuration

The module uses these environment variables and settings:

- `UPLOAD_BASE`: Base directory for uploaded files (default: "data")
- `FAISS_BASE`: Base directory for FAISS indices (default: "faiss_index")
- `SESSION_RETENTION_DAYS`: Days to keep old sessions (default: 7)

These can be overridden through environment variables or constructor parameters.