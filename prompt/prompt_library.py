"""
prompt_library.py

Defines prompt templates for use with language models in the Document Portal project.
These templates help instruct the AI assistant on how to analyze and summarize documents,
and ensure the output is in a specific, structured format (like JSON).
"""
# Prepare prompt template
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("""
You are a highly capable assistant trained to analyze and summarize documents.
Return ONLY valid JSON matching the exact schema below.

{format_instructions}

Analyze this document:
{document_text}
""")