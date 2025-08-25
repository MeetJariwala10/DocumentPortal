# DocumentPortal

A comprehensive document processing platform with analysis, comparison, and chat capabilities powered by LLMs and RAG.

[![Document Portal](https://img.shields.io/badge/Document-Portal-blue)](https://github.com/yourusername/DocumentPortal)

## 🌟 Features

- **Document Analysis**: Extract structured metadata from PDF documents using LLMs
- **Document Comparison**: Compare two PDFs and identify differences with LLM-powered analysis
- **Document Chat**: Chat with your documents using RAG (Retrieval-Augmented Generation)
- **Web UI**: Clean and intuitive interface with responsive design
- **API**: FastAPI backend with well-documented endpoints
- **Production-Ready**: Optimized build process and routing configuration

## 📋 Requirements

- Python 3.10+
- Dependencies listed in `requirements.txt`

## 🚀 Quick Start

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/DocumentPortal.git
   cd DocumentPortal
   ```

2. Create and activate a conda environment:
   ```bash
   conda create -p ./env python=3.10 -y
   conda activate ./env
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Configuration

1. Set up your API keys in a `.env` file:
   ```
   GROQ_API_KEY=your_groq_api_key
   GOOGLE_API_KEY=your_google_api_key
   ```

2. Customize settings in `config/config.yaml` if needed.

### Running the Application

1. Start the FastAPI server:
   ```bash
   uvicorn api.main:app --host 0.0.0.0 --port 8080 --reload
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## 🏗️ Project Structure

```
├── api/                # FastAPI application
│   ├── main.py         # Main API entry point
│   └── src/            # Backend modules
│       ├── document_analyzer/     # Document analysis
│       ├── document_chat/         # RAG-based document chat
│       ├── document_compare/      # Document comparison
│       └── document_ingestion/    # Document ingestion pipeline
├── config/             # Configuration files
├── exception/          # Custom exception handling
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── layouts/    # Page layouts
│   │   ├── pages/      # Main application pages
│   │   └── services/   # API service functions
│   ├── public/         # Static assets
│   └── index.html      # HTML entry point
├── logger/             # Logging utilities
├── model/              # Data models and schemas
├── prompt/             # LLM prompts
├── static/             # Static assets (CSS, JS)
├── templates/          # HTML templates
├── utils/              # Utility functions
└── tests/              # Test cases
```

## 📚 Documentation

Detailed documentation for each module is available in their respective directories:

- [Document Ingestion](./src/document_ingestion/README.md)
- [Document Comparison](./src/document_compare/README.md)
- [Document Analysis](./src/document_analyzer/README.md)
- [API Documentation](./api/README.md)

## 🧪 Testing

Run tests using pytest:

```bash
pytest tests/
```

## 🚀 Recent Improvements

### Frontend

- **Reusable Components**: Created common components to reduce code duplication
  - `LoadingButton`: Prevents UI shifting during loading states
  - `FileUploadButton`: Centralizes file upload logic
- **Custom Hooks**: Added hooks for API interactions
  - `useApi`: Manages loading, error, and response states
- **Routing Fixes**: Improved routing with proper handling of page refreshes
- **Build Optimizations**:
  - Consolidated API proxies
  - Configured build output and sourcemaps
  - Added manual chunking for better performance
- **UI Improvements**:
  - Added custom 404 page
  - Updated favicon and document title

### Backend

- **API Organization**: Reorganized routes with `/api` prefix
- **Error Handling**: Improved with detailed error messages
- **API Interceptors**: Added for consistent behavior

## 🐳 Docker

Build and run with Docker:

```bash
docker build -t document-portal .
docker run -p 8080:8080 document-portal
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.