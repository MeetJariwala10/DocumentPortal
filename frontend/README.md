# Document Portal Frontend

This is the React frontend for the Document Portal application, integrated with the FastAPI backend.

## Features

- **Document Analysis**: Extract structured metadata from PDF documents
- **Document Comparison**: Compare two PDFs and identify differences
- **Document Chat**: Chat with your documents using RAG (Retrieval-Augmented Generation)

## Setup and Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Integration with FastAPI Backend

The frontend is configured to work with the FastAPI backend. To run the complete application:

1. Start the FastAPI backend:
   ```bash
   # From the project root directory
   uvicorn api.main:app --host 0.0.0.0 --port 8080 --reload
   ```

2. Start the React frontend:
   ```bash
   # From the frontend directory
   npm run dev
   ```

3. Access the application at:
   ```
   http://localhost:5173
   ```

## API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

- `/analyze` - Document analysis
- `/compare` - Document comparison
- `/chat/index` - Build document chat index
- `/chat/query` - Query documents

The Vite development server is configured to proxy these API requests to the FastAPI backend running on port 8080.

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and other assets
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Page layout components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application component
│   ├── App.css           # Application styles
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```
