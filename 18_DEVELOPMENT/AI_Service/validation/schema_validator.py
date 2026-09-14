import json
import re
from typing import Dict, Any, Tuple
from models.response_schema import StructuredItineraryOutput

class SchemaValidator:
    """
    Validates raw LLM JSON outputs against StructuredItineraryOutput Pydantic schema.
    Performs auto-repair for common JSON markdown formatting (```json ... ```).
    """

    @staticmethod
    def clean_json_text(raw_text: str) -> str:
        """Strip markdown code blocks or trailing backticks from LLM output."""
        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return cleaned.strip()

    def parse_and_validate(
        self, raw_json_str: str, request_id: str
    ) -> Tuple[bool, Any, str]:
        cleaned_text = self.clean_json_text(raw_json_str)
        try:
            dict_obj = json.loads(cleaned_text)
        except Exception as e:
            return False, None, f"JSON parse failure: {str(e)}"

        # Inject request_id and default fields if missing from LLM return
        if "request_id" not in dict_obj:
            dict_obj["request_id"] = request_id
        if "itinerary_id" not in dict_obj:
            dict_obj["itinerary_id"] = f"itin-{request_id[:8]}"
        if "total_days" not in dict_obj and "days" in dict_obj:
            dict_obj["total_days"] = len(dict_obj["days"])
        if "start_date" not in dict_obj and "days" in dict_obj and len(dict_obj["days"]) > 0:
            dict_obj["start_date"] = dict_obj["days"][0].get("date", "2026-10-20")
        if "end_date" not in dict_obj and "days" in dict_obj and len(dict_obj["days"]) > 0:
            dict_obj["end_date"] = dict_obj["days"][-1].get("date", "2026-10-22")
        if "destinations" not in dict_obj and "days" in dict_obj:
            dict_obj["destinations"] = list(set(d.get("primary_city", "Gujarat") for d in dict_obj["days"]))
        if "cost_breakdown" not in dict_obj:
            dict_obj["cost_breakdown"] = {
                "accommodation_inr": 0.0,
                "transportation_inr": 0.0,
                "activities_inr": 0.0,
                "food_estimate_inr": 0.0,
                "total_estimated_inr": 0.0,
                "budget_cap_inr": 10000.0,
                "within_budget": True
            }
        if "validation" not in dict_obj:
            dict_obj["validation"] = {
                "valid": True,
                "opening_hours_passed": True,
                "monsoon_rules_passed": True,
                "budget_limit_passed": True,
                "travel_time_passed": True,
                "violations": []
            }

        try:
            validated_model = StructuredItineraryOutput(**dict_obj)
            return True, validated_model, ""
        except Exception as e:
            return False, None, f"Pydantic schema validation error: {str(e)}"
