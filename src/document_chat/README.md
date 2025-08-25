# Document Chat Module

This module provides RAG (Retrieval-Augmented Generation) based chat functionality for interacting with document content.

## Overview

The document chat module enables users to:

1. Upload multiple documents (PDF, DOCX, TXT)
2. Process and index documents for semantic search
3. Ask questions about document content
4. Receive contextually relevant answers based on document information

## Key Components

### ConversationalRAG

Implements LCEL-based Conversational RAG with lazy retriever initialization.

```python
rag = ConversationalRAG(session_id="abc")
rag.load_retriever_from_faiss(index_path="faiss_index/abc", k=5)
answer = rag.invoke("What is...?", chat_history=[])
```

Features:
- Loads retriever from FAISS vector store
- Implements question contextualization for follow-up questions
- Maintains conversation history for context
- Uses LangChain Expression Language (LCEL) for the RAG pipeline

## Integration with Document Ingestion

The chat module works closely with the `ChatIngestor` class from the document ingestion module, which handles:

- Document processing and chunking
- Vector embedding creation
- FAISS index building and persistence

## Usage Example

```python
from src.document_chat.retrieval import ConversationalRAG
from src.document_ingestion.data_ingestion import ChatIngestor

# Step 1: Process documents and build index
ci = ChatIngestor(session_id="user123")
ci.build_retriever(
    files=[file1, file2],
    chunk_size=1000,
    chunk_overlap=200,
    k=5
)

# Step 2: Initialize RAG system with the created index
rag = ConversationalRAG(session_id=ci.session_id)
rag.load_retriever_from_faiss(
    index_path=f"faiss_index/{ci.session_id}",
    k=5,
    index_name="index"
)

# Step 3: Ask questions and get answers
chat_history = []
query = "What are the main points in the document?"
answer = rag.invoke(query, chat_history=chat_history)
print(answer)

# Step 4: Ask follow-up questions with history
chat_history.append({"role": "human", "content": query})
chat_history.append({"role": "ai", "content": answer})
follow_up = "Can you elaborate on the second point?"
answer2 = rag.invoke(follow_up, chat_history=chat_history)
print(answer2)
```

## How It Works

1. **Document Indexing**:
   - Documents are uploaded and processed by `ChatIngestor`
   - Text is extracted and split into chunks
   - Chunks are embedded and stored in a FAISS vector index

2. **Question Processing**:
   - User query is received with optional chat history
   - If chat history exists, the query is contextualized
   - Query is embedded and used to search the vector index

3. **Answer Generation**:
   - Most relevant document chunks are retrieved
   - Retrieved context and query are sent to LLM
   - LLM generates a response based on the context

## Configuration

The module uses these configurations from `config/config.yaml`:

```yaml
embedding_model:
  provider: "google"
  model_name: "models/text-embedding-004"

retriever:
  top_k: 10

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

The models are loaded through the `ModelLoader` utility, which selects the appropriate provider based on available API keys and configuration.