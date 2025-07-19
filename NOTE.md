### **Project = Development (local) + Deployment (cloud -> AWS, Azure, GCP)**

1. Analysis of any document 
2. Compare documents
3. Talk to single document
4. Talk with multiple different document


- `.gitkeep` is used if there is empt folder. Because github don't push empty folders. so need to keep .gitkeep temporary in empty folders.
- `.gitignore` is used to ignore any folder while pushing code to github
- AWS Secret Manager
- `pip install -e .`
- `-e .` is for local package
- `pip list`
- Package is a project made by other developers that we can use it. 
- Using `setup.py` we can convert our project to package.
- Those folders will be considered in package that are initialized with `__init__.py`
- After installing `pip install -r requirements.txt` then `pip list`, you will see `DocumentPortal           0.1         D:\LLMOPs Krish Naik\DocumentPortal`

`
Package        Version Editable project location
-------------- ------- -----------------------------------
DocumentPortal 0.1     D:\LLMOPs Krish Naik\DocumentPortal
pip            25.1
setuptools     78.1.1
wheel          0.45.1
`

### Minimum requirement for this project 
1. LLM model (groq, openai, gemini, claude, huggingface, ollama)
2. Embedding model (Huggingface, openai, gemini)
3. Vector Database (In Memory DB, On Disk DB, Cloud based DB)