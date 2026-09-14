from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class LLMProvider(ABC):
    """
    Abstract interface for LLM calls in Chalo Farva AI Service.
    Supports real Gemini provider and Mock provider for offline development.
    """

    @abstractmethod
    def generate_json(self, system_prompt: str, user_prompt: str) -> str:
        """Generates a raw JSON string response from the LLM."""
        pass
