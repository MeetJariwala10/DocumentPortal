"""
models.py

Defines data models for the Document Portal project using Pydantic.
These models help validate and structure data (such as document metadata)
across the application, making the code more reliable and easier to maintain.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union


class Metadata(BaseModel):
    """
    Metadata model for storing and validating document information.

    Fields:
        - Summary: List of summary sentences about the document.
        - Title: Title of the document.
        - Author: Author's name.
        - DateCreated: When the document was created.
        - LastModifiedDate: When the document was last modified.
        - Publisher: Publisher's name.
        - Language: Language of the document.
        - PageCount: Number of pages (can be an int or 'Not Available').
        - SentimentTone: Overall sentiment or tone of the document.
    """
    Summary: List[str] = Field(default_factory=list, description="Summary of the document")
    Title: str
    Author: str
    DateCreated: str   
    LastModifiedDate: str
    Publisher: str
    Language: str
    PageCount: Union[int, str]  # Can be "Not Available"
    SentimentTone: str
    