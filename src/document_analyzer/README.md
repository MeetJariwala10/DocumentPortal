# Document Analyzer Module

This module provides functionality for analyzing PDF documents and extracting structured metadata using LLMs.

## Overview

The document analyzer module enables users to:

1. Upload a PDF document
2. Extract text content from the document
3. Use LLM to analyze the document and extract structured metadata
4. Return results in a structured JSON format

## Key Components

### DocumentAnalyzer

Analyzes documents using a pre-trained model and extracts structured metadata.

```python
analyzer = DocumentAnalyzer()
result = analyzer.analyze_document(document_text)
```

Features:
- Automatically logs all actions
- Uses LLM for document analysis
- Implements structured output parsing with Pydantic models
- Handles error recovery with OutputFixingParser

## Integration with Document Ingestion

The analyzer module works with the `DocHandler` class from the document ingestion module, which handles:

- Session-based file storage
- PDF text extraction

## Usage Example

```python
from src.document_analyzer.data_analysis import DocumentAnalyzer
from src.document_ingestion.data_ingestion import DocHandler
from utils.document_ops import read_pdf_via_handler

# Initialize document handler for file operations
dh = DocHandler()

# Save the uploaded PDF and get its path
saved_path = dh.save_pdf(file_object)

# Extract text content from the PDF
text = read_pdf_via_handler(dh, saved_path)

# Initialize document analyzer with LLM
analyzer = DocumentAnalyzer()

# Analyze document and get structured metadata
result = analyzer.analyze_document(text)

# Access metadata fields
print(f"Title: {result.get('title')}")
print(f"Author: {result.get('author')}")
print(f"Summary: {result.get('summary')}")
```

## How It Works

1. **Document Upload**: A PDF is uploaded through the API.

2. **Text Extraction**: The `DocHandler` extracts text from the PDF.

3. **LLM Analysis**: The extracted text is sent to an LLM with a specialized prompt for document analysis.

4. **Structured Output**: The LLM generates a structured JSON response containing metadata fields.

5. **Result Parsing**: The JSON is parsed using a Pydantic model to ensure proper structure.

## Metadata Structure

The analyzer extracts the following metadata fields (defined in `model/models.py`):

- **title**: Document title
- **author**: Document author(s)
- **date**: Publication or creation date
- **summary**: Brief summary of the document content
- **keywords**: Key topics or terms from the document
- **document_type**: Type of document (e.g., research paper, report, manual)
- **sections**: Main sections or chapters in the document

## Configuration

The module uses the LLM configuration from `config/config.yaml`, which supports multiple providers:

```yaml
llm:
  groq:
    provider: "groq"
    model_name: "deepseek-r1-distill-llama-70b"
    temperature: 0
    max_output_tokens: 2048

  google:
    provider: "google"
    model_name: "gemini-2.0-flash"
    temperature: 0
    max_output_tokens: 2048
```

The model is loaded through the `ModelLoader` utility, which selects the appropriate provider based on available API keys and configuration.