"""
config_loader.py

Utility for loading YAML configuration files in the Document Portal project.
This helps keep settings (like model names, database info, etc.) separate from code,
so you can easily update them without changing the program itself.
"""
import yaml


def load_config(config_path: str = "config\config.yaml") -> dict:
    """
    Loads a YAML configuration file and returns its contents as a Python dictionary.

    Args:
        config_path (str): Path to the YAML config file. Defaults to 'config/config.yaml'.

    Returns:
        dict: The configuration data loaded from the YAML file.
    """
    # Open the YAML config file in read mode
    with open(config_path, "r") as file:
        # Parse the YAML file and load its contents into a Python dictionary
        config = yaml.safe_load(file)
    # Return the loaded configuration dictionary
    return config


# Example usage: Load the configuration when this file is run
load_config("config\config.yaml")
