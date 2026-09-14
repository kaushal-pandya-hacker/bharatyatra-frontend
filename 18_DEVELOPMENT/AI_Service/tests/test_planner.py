import pytest
from models.request_schema import (
    TripPlanningRequest, DateRange, LocationPreferences,
    TravelerDetails, BudgetConstraints
)
from pipeline.planner_orchestrator import PlannerOrchestrator
from constraints.hard_constraint_engine import HardConstraintEngine
from llm.mock_llm_provider import DevelopmentMockLLMProvider

def test_planner_orchestrator_mock():
    mock_provider = DevelopmentMockLLMProvider()
    orchestrator = PlannerOrchestrator(llm_provider=mock_provider)

    req = TripPlanningRequest(
        request_id="test-req-001",
        user_id="usr-123",
        prompt="Explore Statue of Unity and Somnath temple with family",
        date_range=DateRange(start_date="2026-10-20", end_date="2026-10-22"),
        locations=LocationPreferences(origin_city="Ahmedabad", destination_regions=["Kevadia", "Somnath"]),
        travelers=TravelerDetails(num_adults=2, num_children=1, traveler_type="family"),
        budget=BudgetConstraints(total_budget_inr=25000.0, budget_category="moderate", preferred_transport_mode="bus"),
        interests=["heritage", "spiritual"],
        pacing="balanced"
    )

    plan = orchestrator.generate_plan(req)
    assert plan.request_id == "test-req-001"
    assert len(plan.days) == 3
    assert plan.cost_breakdown.total_estimated_inr > 0
    assert plan.validation.valid is True

def test_monsoon_closure_validation():
    engine = HardConstraintEngine()
    from models.response_schema import DayItinerary, ActivityItem, TimeSlot

    # Attempt to visit Gir National Park in July (Monsoon season)
    july_day = DayItinerary(
        day_number=1,
        date="2026-07-10",
        title="Gir Wildlife Safari",
        summary="Safari in Gir National Park",
        primary_city="Gir Somnath",
        estimated_daily_cost_inr=1000.0,
        total_travel_distance_km=50.0,
        activities=[
            ActivityItem(
                activity_id="dest-gir-national-park",
                name="Gir National Park Lion Safari",
                type="sightseeing",
                time_slot=TimeSlot(start_time="06:00", end_time="09:00"),
                location_name="Gir Forest",
                city="Gir Somnath",
                latitude=21.12,
                longitude=70.82,
                cost_inr=800.0
            )
        ]
    )

    res = engine.validate_itinerary([july_day])
    assert res.valid is False
    assert res.monsoon_rules_passed is False
    assert len(res.violations) > 0
    assert "CLOSED for monsoon" in res.violations[0]
