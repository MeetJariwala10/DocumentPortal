# API Documentation

This module provides the FastAPI application that serves as the backend for the DocumentPortal system.

## Overview

The API module integrates all DocumentPortal components and exposes endpoints for:

1. Document analysis
2. Document comparison
3. Document chat (RAG-based)
4. Web UI serving

## Endpoints

### Web UI

#### `GET /`

Serves the main web interface HTML page.

```
GET /
```

Response: HTML page with the DocumentPortal UI.

#### `GET /health`

Health check endpoint for monitoring and deployment verification.

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "document-portal"
}
```

### Document Analysis

#### `POST /analyze`

Analyze a PDF document using LLM to extract metadata and insights.

```
POST /analyze
Content-Type: multipart/form-data

file: [PDF file]
```

Response: JSON with document metadata and analysis.

```json
{
  "title": "Sample Document",
  "author": "John Doe",
  "date": "2023-05-15",
  "summary": "This document covers...",
  "keywords": ["topic1", "topic2"],
  "document_type": "research paper",
  "sections": ["Introduction", "Methodology", "Results"]
}
```

### Document Comparison

#### `POST /compare`

Compare two PDF documents to identify differences using LLM analysis.

```
POST /compare
Content-Type: multipart/form-data

reference: [PDF file]
actual: [PDF file]
```

Response: JSON with comparison results as table rows and session ID.

```json
{
  "rows": [
    {
      "page": 1,
      "changes": "Added paragraph about..."
    },
    {
      "page": 2,
      "changes": "Modified table data..."
    }
  ],
  "session_id": "abc123"
}
```

### Document Chat

#### `POST /chat/index`

Build or update a FAISS vector index for document chat functionality.

```
POST /chat/index
Content-Type: multipart/form-data

files: [PDF/DOCX/TXT files]
session_id: (optional)
use_session_dirs: true/false
chunk_size: 1000
chunk_overlap: 200
k: 5
```

Response: JSON with session ID and configuration parameters.

```json
{
  "session_id": "abc123",
  "k": 5,
  "use_session_dirs": true
}
```

#### `POST /chat/query`

Process a chat query using RAG (Retrieval-Augmented Generation).

```
POST /chat/query
Content-Type: multipart/form-data

query: "What does the document say about..."
session_id: "abc123"
use_session_dirs: true
k: 5
history: (optional JSON array of message objects)
```

Response: JSON with LLM-generated answer based on document context.

```json
{
  "answer": "Based on the document, ...",
  "session_id": "abc123",
  "k": 5,
  "engine": "LCEL-RAG"
}
```

## Integration

The API integrates these core components:

- `DocHandler`: Handles PDF file storage and retrieval
- `DocumentComparator`: Compares multiple documents
- `ChatIngestor`: Processes documents for RAG system
- `DocumentAnalyzer`: Analyzes document content using LLMs
- `DocumentComparatorLLM`: LLM-based document comparison
- `ConversationalRAG`: RAG-based document chat system

## Configuration

The API uses these environment variables:

- `FAISS_BASE`: Base directory for FAISS vector database (default: "faiss_index")
- `UPLOAD_BASE`: Base directory for uploaded files (default: "data")
- `FAISS_INDEX_NAME`: Index name for FAISS (default: "index")

## Running the API

Start the FastAPI server:

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8080 --reload
```

Access the web UI at `http://localhost:8080`.