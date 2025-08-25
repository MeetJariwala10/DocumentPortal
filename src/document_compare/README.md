# Document Comparison Module

This module provides functionality for comparing two PDF documents and identifying differences using LLM-powered analysis.

## Overview

The document comparison module enables users to:

1. Upload two PDF documents (reference and actual)
2. Process and combine the documents for comparison
3. Use LLM to analyze differences between the documents
4. Present results in a structured, page-by-page format

## Key Components

### DocumentComparatorLLM

Handles the LLM-based comparison of documents, processing the combined text and returning structured results.

```python
comparator = DocumentComparatorLLM()
results_df = comparator.compare_documents(combined_text)
```

Features:
- Loads appropriate LLM based on configuration
- Uses structured output parsing with Pydantic models
- Handles error recovery with OutputFixingParser
- Returns results as a pandas DataFrame for easy display

## Integration with Document Ingestion

The comparison module works closely with the `DocumentComparator` class from the document ingestion module, which handles:

- Session-based file storage
- PDF text extraction
- Document combination with page markers

## Usage Example

```python
from src.document_compare.document_comparator import DocumentComparatorLLM
from src.document_ingestion.data_ingestion import DocumentComparator

# Initialize document handler for file operations
dc = DocumentComparator()

# Save uploaded files and get their paths
ref_path, act_path = dc.save_uploaded_files(reference_file, actual_file)

# Combine documents into structured format for comparison
combined_text = dc.combine_documents()

# Initialize LLM-based document comparator
comparator = DocumentComparatorLLM()

# Perform comparison analysis
results_df = comparator.compare_documents(combined_text)

# Access results (pandas DataFrame)
for _, row in results_df.iterrows():
    print(f"Page {row['page']}: {row['changes']}")
```

## How It Works

1. **Document Upload**: Two PDFs are uploaded - a reference (original) document and an actual (new) document.

2. **Text Extraction**: The `DocumentComparator` extracts text from both PDFs with page markers.

3. **Document Combination**: The texts are combined in a structured format that preserves page boundaries.

4. **LLM Analysis**: The combined text is sent to an LLM with a specialized prompt for document comparison.

5. **Structured Output**: The LLM generates a structured JSON response that identifies differences on each page.

6. **Result Formatting**: The JSON is parsed into a pandas DataFrame for easy display and manipulation.

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