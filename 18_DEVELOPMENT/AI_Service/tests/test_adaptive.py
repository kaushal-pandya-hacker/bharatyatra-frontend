import pytest
from pipeline.adaptive_reasoning import AdaptiveReasoningEngine

def test_adaptive_reasoning_rain_alternative():
    engine = AdaptiveReasoningEngine()
    affected_slot = {"title": "Sabarmati Riverfront Boating & Walk", "category": "BOATING", "estimated_cost": 100.0}
    res = engine.generate_adaptive_alternatives(
        event_type="RAIN_ALERT",
        affected_slot=affected_slot,
        city="Ahmedabad",
        user_interests=["heritage", "museum"]
    )
    assert res["trigger_event"] == "RAIN_ALERT"
    assert res["recommended_alternative"]["type"].startswith("indoor_")
    assert "indoor alternative" in res["reason_explanation"]
    assert res["cost_difference_inr"] >= 0.0

def test_adaptive_reasoning_fallback_candidates():
    engine = AdaptiveReasoningEngine()
    affected_slot = {"title": "Gir Lion Safari Trail 3", "category": "SAFARI", "estimated_cost": 800.0}
    res = engine.generate_adaptive_alternatives(
        event_type="HEAVY_RAIN_WARNING",
        affected_slot=affected_slot,
        city="Gir Somnath"
    )
    assert res["confidence"] == "HIGH"
    assert len(res["all_candidates"]) > 0
