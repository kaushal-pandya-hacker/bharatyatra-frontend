from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TimeSlot(BaseModel):
    start_time: str = Field(..., description="HH:MM format 24h")
    end_time: str = Field(..., description="HH:MM format 24h")

class ActivityItem(BaseModel):
    activity_id: str
    name: str
    type: str = Field(..., description="sightseeing | dining | transit | hotel_checkin | activity")
    time_slot: TimeSlot
    location_name: str
    city: str
    latitude: float
    longitude: float
    cost_inr: float = Field(0.0, ge=0.0)
    provenance_type: str = Field("VERIFIED_DATA", description="VERIFIED_DATA | AI_GENERATED_RECOMMENDATION")
    notes: Optional[str] = None
    booking_required: bool = False

class DayItinerary(BaseModel):
    day_number: int
    date: str
    title: str
    summary: str
    primary_city: str
    activities: List[ActivityItem]
    estimated_daily_cost_inr: float
    total_travel_distance_km: float

class CostBreakdown(BaseModel):
    accommodation_inr: float = 0.0
    transportation_inr: float = 0.0
    activities_inr: float = 0.0
    food_estimate_inr: float = 0.0
    total_estimated_inr: float = 0.0
    budget_cap_inr: float = 0.0
    within_budget: bool = True

class ConstraintValidationResult(BaseModel):
    valid: bool
    opening_hours_passed: bool
    monsoon_rules_passed: bool
    budget_limit_passed: bool
    travel_time_passed: bool
    violations: List[str] = Field(default_factory=list)

class StructuredItineraryOutput(BaseModel):
    itinerary_id: str
    request_id: str
    title: str
    summary: str
    total_days: int
    start_date: str
    end_date: str
    destinations: List[str]
    days: List[DayItinerary]
    cost_breakdown: CostBreakdown
    validation: ConstraintValidationResult
    provenance_summary: Dict[str, int] = Field(
        default_factory=lambda: {"VERIFIED_DATA": 0, "AI_GENERATED_RECOMMENDATION": 0}
    )
