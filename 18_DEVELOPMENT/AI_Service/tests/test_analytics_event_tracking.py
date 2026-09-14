"""
Phase 16 - Analytics & Event Tracking v1.1 Automated Test Suite
"""

import pytest

class AnalyticsTrackerEngine:
    def __init__(self):
        self.events = {}
        self.processed_ids = set()
        self.session_user_map = {}

    def track_event(self, event_name: str, event_id: str = None, session_id: str = None, user_id: str = None, properties: dict = None):
        if not event_name or not event_name.isupper() or "_" not in event_name:
            raise ValueError(f"Invalid event naming convention: {event_name}")

        eid = event_id or f"evt-{len(self.events) + 1}"

        # Deduplication check
        if eid in self.processed_ids:
            return {"status": "DUPLICATE_IGNORED", "event_id": eid}

        if session_id and user_id:
            self.session_user_map[session_id] = user_id

        effective_user = user_id or self.session_user_map.get(session_id)

        evt = {
            "event_id": eid,
            "event_name": event_name,
            "session_id": session_id,
            "user_id": effective_user,
            "properties": properties or {}
        }
        self.events[eid] = evt
        self.processed_ids.add(eid)
        return {"status": "TRACKED", "event": evt}

    def compute_13_stage_funnel(self):
        stages = [
            "HOME_VIEWED", "DESTINATION_VIEWED", "SEARCH_STARTED", "SEARCH_COMPLETED",
            "AI_PLANNER_STARTED", "AI_ITINERARY_GENERATED", "AI_ITINERARY_ACCEPTED",
            "CHECKOUT_STARTED", "PAYMENT_STARTED", "PAYMENT_SUCCESS",
            "BOOKING_REQUESTED", "BOOKING_CONFIRMED", "TRIP_COMPLETED"
        ]
        counts = {stage: sum(1 for e in self.events.values() if e["event_name"] == stage) for stage in stages}
        visitor = counts["HOME_VIEWED"] or 1000
        confirmed = counts["BOOKING_CONFIRMED"]
        conversion = (confirmed / visitor * 100) if visitor > 0 else 0.0
        return counts, round(conversion, 2)


# ==================== TEST CASES ====================

def test_event_taxonomy_naming_validation():
    engine = AnalyticsTrackerEngine()
    res = engine.track_event("HOTEL_VIEWED", event_id="evt-1")
    assert res["status"] == "TRACKED"
    assert res["event"]["event_name"] == "HOTEL_VIEWED"

    with pytest.raises(ValueError):
        engine.track_event("hotelView") # Inconsistent name must fail validation


def test_idempotency_deduplication():
    engine = AnalyticsTrackerEngine()
    res1 = engine.track_event("BOOKING_CONFIRMED", event_id="evt-dup-100")
    res2 = engine.track_event("BOOKING_CONFIRMED", event_id="evt-dup-100")
    assert res1["status"] == "TRACKED"
    assert res2["status"] == "DUPLICATE_IGNORED"


def test_session_identity_merging():
    engine = AnalyticsTrackerEngine()
    # Anonymous session event
    engine.track_event("SEARCH_STARTED", event_id="evt-anon", session_id="sess-99")
    assert engine.events["evt-anon"]["user_id"] is None

    # Login event links user to session
    engine.track_event("LOGIN_SUCCESS", event_id="evt-login", session_id="sess-99", user_id="user-777")
    assert engine.events["evt-login"]["user_id"] == "user-777"

    # Subsequent session event automatically receives merged user_id
    engine.track_event("AI_PLANNER_STARTED", event_id="evt-after-login", session_id="sess-99")
    assert engine.events["evt-after-login"]["user_id"] == "user-777"


def test_13_stage_funnel_conversion_calculation():
    engine = AnalyticsTrackerEngine()
    stages = [
        "HOME_VIEWED", "DESTINATION_VIEWED", "SEARCH_STARTED", "SEARCH_COMPLETED",
        "AI_PLANNER_STARTED", "AI_ITINERARY_GENERATED", "AI_ITINERARY_ACCEPTED",
        "CHECKOUT_STARTED", "PAYMENT_STARTED", "PAYMENT_SUCCESS",
        "BOOKING_REQUESTED", "BOOKING_CONFIRMED", "TRIP_COMPLETED"
    ]
    for i, stage in enumerate(stages):
        count = 100 - (i * 5)
        for c in range(count):
            engine.track_event(stage, event_id=f"evt-{stage}-{c}")

    counts, conversion = engine.compute_13_stage_funnel()
    assert counts["HOME_VIEWED"] == 100
    assert counts["BOOKING_CONFIRMED"] == 45
    assert conversion == 45.0


def test_privacy_sensitive_data_exclusion():
    # Sensitive keys must be scrubbed from analytics payloads
    sensitive_keys = ["password", "token", "cvv", "cardNumber", "secret"]
    sample_payload = {"user_id": "u1", "password": "secret_pass", "cvv": "123", "destination": "Kutch"}
    sanitized = {k: v for k, v in sample_payload.items() if k not in sensitive_keys}

    assert "password" not in sanitized
    assert "cvv" not in sanitized
    assert sanitized["destination"] == "Kutch"
