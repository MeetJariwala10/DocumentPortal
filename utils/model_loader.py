"""
model_loader.py

Utility for loading machine learning models (embeddings and LLMs) for the Document Portal project.
- Loads configuration and environment variables.
- Provides methods to load embedding models and large language models (LLMs) based on config.
- Handles errors and logs important steps for easier debugging.
"""
import os
import sys
from dotenv import load_dotenv
from utils.config_loader import load_config
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
# from langchain_openai import ChatOpenAI
from logger.custom_logger import CustomLogger
from exception.custom_exception import DocumentPortalException

log = CustomLogger().get_logger(__name__)  # Create a logger for this module

class ModelLoader:
    """
    Utility class to load embedding models and LLMs for the Document Portal project.

    - Loads configuration and validates required environment variables (API keys).
    - Provides methods to load embedding models and LLMs based on the config file.
    - Handles errors and logs each step for easier debugging and maintenance.
    """
    
    def __init__(self):
        # Load environment variables from a .env file (if present)
        load_dotenv()
        # Validate that required API keys are present
        self._validate_env()
        # Load configuration from YAML file
        self.config = load_config()
        # Log the loaded configuration keys
        log.info("Configuration loaded successfully", config_keys=list(self.config.keys()))
        
    def _validate_env(self):
        """
        Validate necessary environment variables.
        Ensure API keys exist.
        """
        required_vars = [
            "GOOGLE_API_KEY",
            "GROQ_API_KEY"
        ]

        # Collect API keys from environment variables
        self.api_keys = {key: os.getenv(key) for key in required_vars}
        
        # Find any missing API keys
        missing = [k for k, v in self.api_keys.items() if not v]
        
        if missing:
            # Log and raise a custom exception if any keys are missing
            log.error("Missing environment variables", missing_vars=missing)
            raise DocumentPortalException("Missing environment variables", sys)
        
        # Log which API keys are available
        log.info("Environment variables validated", available_keys=[k for k in self.api_keys if self.api_keys[k]])
        
    def load_embeddings(self):
        """
        Load and return the embedding model.
        """
        try:
            log.info("Loading embedding model...")
            # Get the embedding model name from the config
            model_name = self.config["embedding_model"]["model_name"]
            # Return the GoogleGenerativeAIEmbeddings instance
            return GoogleGenerativeAIEmbeddings(model=model_name)
        except Exception as e:
            # Log and raise a custom exception if loading fails
            log.error("Error loading embedding model", error=str(e))
            raise DocumentPortalException("Failed to load embedding model", sys)
        
    def load_llm(self):
        """
        Load and return the LLM model.
        """
        # Load LLM dynamically based on provider in config
        llm_block = self.config["llm"]

        log.info("Loading LLM...")
        
        # Get the provider key from environment or default to 'groq'
        provider_key = os.getenv("LLM_PROVIDER", "groq")  # Default groq
        if provider_key not in llm_block:
            # Log and raise error if provider is not found in config
            log.error("LLM provider not found in config", provider_key=provider_key)
            raise ValueError(f"Provider '{provider_key}' not found in config")

        # Get the configuration for the selected provider
        llm_config = llm_block[provider_key]
        provider = llm_config.get("provider")
        model_name = llm_config.get("model_name")
        temperature = llm_config.get("temperature", 0.2)
        max_tokens = llm_config.get("max_output_tokens", 2048)
        
        # Log the LLM loading parameters
        log.info("Loading LLM", provider=provider, model=model_name, temperature=temperature, max_tokens=max_tokens)

        # Load the appropriate LLM based on the provider
        if provider == "google":
            llm = ChatGoogleGenerativeAI(
                model = model_name,
                temperature = temperature,
                max_output_tokens = max_tokens
            )
            return llm

        elif provider == "groq":
            llm = ChatGroq(
                model = model_name,
                api_key = self.api_keys["GROQ_API_KEY"],
                temperature = temperature,
            )
            return llm
            
        # elif provider == "openai":
        #     return ChatOpenAI(
        #         model=model_name,
        #         api_key=self.api_keys["OPENAI_API_KEY"],
        #         temperature=temperature,
        #         max_tokens=max_tokens
        #     )
        else:
            # Log and raise error if provider is unsupported
            log.error("Unsupported LLM provider", provider=provider)
            raise ValueError(f"Unsupported LLM provider: {provider}")
        
    
    
if __name__ == "__main__":
    
    loader = ModelLoader()  # Create an instance of ModelLoader
    
    # Test embedding model loading
    embeddings = loader.load_embeddings()
    print(f"Embedding Model Loaded: {embeddings}")    
    
    # Test embedding a sample query
    result = embeddings.embed_query("Hello, how are you?")
    print(f"Embedding Result: {result}")

    # Test LLM loading based on YAML config
    llm = loader.load_llm()
    print(f"LLM Loaded: {llm}")
    
    # Test invoking the LLM with a sample prompt
    result = llm.invoke("Hello, how are you?")
    print(f"LLM Result: {result.content}")