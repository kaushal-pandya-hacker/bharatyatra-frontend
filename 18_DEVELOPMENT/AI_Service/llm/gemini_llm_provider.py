import os
import json
from typing import Optional
from llm.llm_provider import LLMProvider
from llm.mock_llm_provider import DevelopmentMockLLMProvider

class GeminiLLMProvider(LLMProvider):
    """
    Real Google Gemini LLM provider for Chalo Farva.
    Uses google-generativeai library when GEMINI_API_KEY is available.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self._model = None
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"[GeminiLLMProvider] Warning configuring Gemini API: {e}")
                self._model = None

    def generate_json(self, system_prompt: str, user_prompt: str) -> str:
        if not self._model:
            print("[GeminiLLMProvider] GEMINI_API_KEY not configured or invalid. Falling back to DevelopmentMockLLMProvider.")
            fallback = DevelopmentMockLLMProvider()
            return fallback.generate_json(system_prompt, user_prompt)

        full_prompt = f"{system_prompt}\n\nUSER REQUEST:\n{user_prompt}\n\nOUTPUT FORMAT: Output ONLY valid JSON matching the specified schema."
        try:
            response = self._model.generate_content(
                full_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return response.text
        except Exception as e:
            print(f"[GeminiLLMProvider] Error calling Gemini API: {e}. Falling back to mock.")
            return DevelopmentMockLLMProvider().generate_json(system_prompt, user_prompt)
