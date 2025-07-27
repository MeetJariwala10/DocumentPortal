# DocumentPortal Project Notes

## Overview
A local development and cloud-deployable project for document analysis, comparison, and chat-based interactions with single or multiple documents.

## Features
- **Document Analysis:** Analyze any document.
- **Document Comparison:** Compare two or more documents.
- **Single Document Chat:** Interact conversationally with a single document.
- **Multi-Document Chat:** Chat with multiple different documents at once.

## Setup & Installation
1. Clone the repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. (Optional) Install as a local package for development:
   ```bash
   pip install -e .
   ```
   - The `-e .` flag installs the project in editable mode.
4. Check installed packages:
   ```bash
   pip list
   ```
   - You should see an entry like:
     ```
     Package        Version Editable project location
     -------------- ------- -----------------------------------
     DocumentPortal 0.1     D:\LLMOPs Krish Naik\DocumentPortal
     pip            25.1
     setuptools     78.1.1
     wheel          0.45.1
     ```

## Packaging Notes
- Use `setup.py` to convert the project into a package.
- Only folders containing an `__init__.py` file are included in the package.
- Packages are reusable projects made by other developers.

## Project Requirements
- **LLM Model:** (e.g., groq, openai, gemini, claude, huggingface, ollama)
- **Embedding Model:** (e.g., huggingface, openai, gemini)
- **Vector Database:** (In-memory, on-disk, or cloud-based DB)

## Additional Notes
- `.gitkeep` is used to keep empty folders in version control (GitHub ignores empty folders).
- `.gitignore` is used to exclude files/folders from version control.
- AWS Secret Manager can be used for managing secrets securely.
- For configuration both `.yaml` and `.json` can be used