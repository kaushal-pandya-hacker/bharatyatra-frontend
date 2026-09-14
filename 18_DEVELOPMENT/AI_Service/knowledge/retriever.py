import json
import os
from typing import List, Dict, Any, Optional

class KnowledgeRetriever:
    """
    Retriever for verified travel facts from 08_TRAVEL_DATA/Knowledge_Base.
    Ensures that LLM generated plans ground their facts in verified data.
    """
    def __init__(self, kb_path: Optional[str] = None):
        if not kb_path:
            # Default relative path from AI_Service root
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            kb_path = os.path.join(base_dir, "..", "..", "08_TRAVEL_DATA", "Knowledge_Base", "normalized_facts.json")
        
        self.kb_path = os.path.abspath(kb_path)
        self.facts: List[Dict[str, Any]] = []
        self._load_facts()

    def _load_facts(self) -> None:
        if os.path.exists(self.kb_path):
            try:
                with open(self.kb_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.facts = data.get("normalizedFacts", [])
            except Exception as e:
                print(f"[KnowledgeRetriever] Warning loading facts from {self.kb_path}: {e}")
                self.facts = []
        else:
            print(f"[KnowledgeRetriever] Warning: file not found at {self.kb_path}")
            self.facts = []

    def get_facts_for_destination(self, entity_id: str) -> List[Dict[str, Any]]:
        return [f for f in self.facts if f.get("entityId") == entity_id]

    def get_all_verified_facts(self) -> List[Dict[str, Any]]:
        return self.facts

    def query_facts_by_keyword(self, query: str) -> List[Dict[str, Any]]:
        query_lower = query.lower()
        results = []
        for fact in self.facts:
            content = fact.get("factContent", "").lower()
            entity = fact.get("entityId", "").lower()
            if query_lower in content or query_lower in entity:
                results.append(fact)
        return results
