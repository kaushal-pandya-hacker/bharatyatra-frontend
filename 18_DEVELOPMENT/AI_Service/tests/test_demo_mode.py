"""
Chalo Farva — Demo Mode Automated Test Suite v1.1
Validates presentation journey, demo data integrity, budget math, sandbox payment flag, and adaptive AI weather disruption versioning.
"""

import pytest
from demo_seed import reset_demo_state, trigger_adaptive_demo_disruption, DEMO_TRIP_SCENARIO, DEMO_ADAPTIVE_DISRUPTION


def test_demo_state_reset_integrity():
    """Verify that demo reset returns a pristine demo state object."""
    state = reset_demo_state()
    assert state["trip_id"] == "TRIP-DEMO-2026-GUJ01"
    assert state["is_demo"] is True
    assert state["payment_mode"] == "MOCK_SANDBOX"
    assert state["version"] == "v1.0"
    assert len(state["days"]) == 4
    assert state["origin"] == "Ahmedabad"


def test_demo_budget_math():
    """Verify that total estimated costs stay within user budget (₹25,000)."""
    state = reset_demo_state()
    total_day_costs = sum(day["estimated_day_cost"] for day in state["days"])
    assert total_day_costs == 21850.0
    assert total_day_costs <= state["budget"]
    assert state["budget"] == 25000.0


def test_demo_sandbox_booking_safety():
    """Verify that demo bookings are explicitly marked as DEMO_CONFIRMED and sandbox."""
    state = reset_demo_state()
    assert state["payment_mode"] == "MOCK_SANDBOX"
    for hotel in state["bookings"]["hotels"]:
        assert hotel["status"] == "DEMO_CONFIRMED"
    for bus in state["bookings"]["bus"]:
        assert bus["status"] == "DEMO_CONFIRMED"
    for activity in state["bookings"]["activities"]:
        assert activity["status"] == "DEMO_CONFIRMED"


def test_adaptive_ai_weather_disruption_demo():
    """Verify that weather disruption updates trip version from v1.0 to v2.0 and replaces affected activity."""
    initial_state = reset_demo_state()
    assert initial_state["version"] == "v1.0"
    
    adapted_state = trigger_adaptive_demo_disruption(initial_state)
    assert adapted_state["version"] == "v2.0"
    assert adapted_state["status"] == "DEMO_ADAPTED_V2"
    assert "adaptive_alert" in adapted_state
    assert adapted_state["adaptive_alert"]["disruption_event"] == "WEATHER_WARNING"
    
    # Check Day 3 afternoon activity adaptation
    day_3 = next(day for day in adapted_state["days"] if day["day"] == 3)
    assert "[ADAPTED]" in day_3["afternoon"]
    assert "Indoor Rukmini Devi Temple" in day_3["afternoon"]


def test_idempotent_demo_reset_after_adaptation():
    """Verify that reset_demo_state reverts adapted v2.0 back to v1.0 cleanly."""
    initial_state = reset_demo_state()
    adapted_state = trigger_adaptive_demo_disruption(initial_state)
    assert adapted_state["version"] == "v2.0"
    
    reset_state = reset_demo_state()
    assert reset_state["version"] == "v1.0"
    assert "adaptive_alert" not in reset_state
    assert reset_state["status"] == "DEMO_ACTIVE"
