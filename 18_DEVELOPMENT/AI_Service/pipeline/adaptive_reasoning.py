from typing import List, Dict, Any, Optional

class AdaptiveReasoningEngine:
    """
    Generates intelligent alternative recommendations when an active trip slot is disrupted
    by weather, closures, or transit delays. Explains changes clearly without exposing LLM chain-of-thought.
    """

    INDOOR_ALTERNATIVE_CATALOG = [
        {
            "activity_id": "alt-science-city-ahmedabad",
            "name": "Gujarat Science City & Aquatic Gallery",
            "city": "Ahmedabad",
            "type": "indoor_sightseeing",
            "cost_inr": 200.0,
            "provenance_type": "VERIFIED_DATA",
            "notes": "Fully indoor futuristic exhibits and world-class aquarium, perfect for rainy days."
        },
        {
            "activity_id": "alt-uparkot-fort-museum",
            "name": "Uparkot Fort Historic Museum & Buddhist Caves",
            "city": "Junagadh",
            "type": "indoor_heritage",
            "cost_inr": 100.0,
            "provenance_type": "VERIFIED_DATA",
            "notes": "Sheltered historic monument and subterranean Buddhist caves."
        },
        {
            "activity_id": "alt-calico-museum",
            "name": "Calico Museum of Textiles",
            "city": "Ahmedabad",
            "type": "indoor_museum",
            "cost_inr": 0.0,
            "provenance_type": "VERIFIED_DATA",
            "notes": "Premier textile museum displaying centuries of royal Gujarati fabrics."
        }
    ]

    def generate_adaptive_alternatives(
        self,
        event_type: str,
        affected_slot: Dict[str, Any],
        city: str,
        user_interests: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        user_interests = user_interests or ["heritage", "culture"]

        # Filter indoor alternatives matching city or region
        city_lower = city.lower()
        candidates = [
            item for item in self.INDOOR_ALTERNATIVE_CATALOG
            if item["city"].lower() == city_lower or city_lower in ["gujarat", "saurashtra"]
        ]

        if not candidates:
            candidates = self.INDOOR_ALTERNATIVE_CATALOG

        top_candidate = candidates[0]

        # Generate structured explanation
        reason_explanation = (
            f"Outdoor activity '{affected_slot.get('title', 'Sightseeing')}' in {city} is impacted by {event_type.replace('_', ' ').lower()}. "
            f"Recommending '{top_candidate['name']}' as a verified indoor alternative."
        )

        return {
            "trigger_event": event_type,
            "affected_slot": affected_slot.get("title", "Outdoor Activity"),
            "recommended_alternative": top_candidate,
            "all_candidates": candidates,
            "cost_difference_inr": max(0.0, top_candidate["cost_inr"] - float(affected_slot.get("estimated_cost", 0.0))),
            "reason_code": event_type,
            "reason_explanation": reason_explanation,
            "confidence": "HIGH"
        }
