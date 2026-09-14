import re
from typing import Dict, Any, List
from models.request_schema import TripPlanningRequest

class IntentExtractor:
    """
    Parses user prompt and request body into normalized planner constraints.
    Prevents prompt injection by stripping un-sanitized instructions from natural text.
    """

    UNTRUSTED_INJECTION_KEYWORDS = [
        "ignore previous instructions",
        "system prompt",
        "override rules",
        "bypass budget",
        "free booking"
    ]

    def sanitize_prompt(self, prompt: str) -> str:
        if not prompt:
            return ""
        sanitized = prompt
        for keyword in self.UNTRUSTED_INJECTION_KEYWORDS:
            if re.search(re.escape(keyword), sanitized, re.IGNORECASE):
                print(f"[IntentExtractor] Security warning: Prompt injection pattern detected ('{keyword}'). Neutralizing.")
                sanitized = re.sub(re.escape(keyword), "[filtered]", sanitized, flags=re.IGNORECASE)
        return sanitized


    def extract_intent(self, request: TripPlanningRequest) -> Dict[str, Any]:
        clean_prompt = self.sanitize_prompt(request.prompt or "")
        
        # Derive primary interests if not explicitly given
        interests = list(request.interests)
        if not interests and clean_prompt:
            prompt_lower = clean_prompt.lower()
            if "lion" in prompt_lower or "safari" in prompt_lower or "wildlife" in prompt_lower:
                interests.append("wildlife")
            if "temple" in prompt_lower or "darshan" in prompt_lower or "aarti" in prompt_lower:
                interests.append("spiritual")
            if "statue" in prompt_lower or "unity" in prompt_lower or "sardar" in prompt_lower:
                interests.append("heritage")
            if "beach" in prompt_lower or "sea" in prompt_lower:
                interests.append("beach")
            if "rann" in prompt_lower or "kutch" in prompt_lower or "white desert" in prompt_lower:
                interests.append("culture")

        if not interests:
            interests = ["heritage", "sightseeing"]

        return {
            "sanitized_prompt": clean_prompt,
            "origin_city": request.locations.origin_city,
            "destinations": request.locations.destination_regions,
            "interests": interests,
            "pacing": request.pacing,
            "num_travelers": request.travelers.num_adults + request.travelers.num_children,
            "total_budget_inr": request.budget.total_budget_inr,
            "budget_category": request.budget.budget_category
        }
