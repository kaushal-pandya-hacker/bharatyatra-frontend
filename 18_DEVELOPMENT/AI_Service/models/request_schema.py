from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class DateRange(BaseModel):
    start_date: str = Field(..., description="ISO 8601 start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="ISO 8601 end date (YYYY-MM-DD)")

class LocationPreferences(BaseModel):
    origin_city: str = Field("Ahmedabad", description="Starting city in Gujarat")
    destination_regions: List[str] = Field(default_factory=lambda: ["Saurashtra", "Kutch"], description="Target regions or cities")

class TravelerDetails(BaseModel):
    num_adults: int = Field(2, ge=1)
    num_children: int = Field(0, ge=0)
    traveler_type: str = Field("family", description="family | solo | couple | friends | senior")
    accessibility_needs: List[str] = Field(default_factory=list, description="wheelchair, minimal_walking, etc.")

class BudgetConstraints(BaseModel):
    total_budget_inr: float = Field(..., gt=0, description="Total travel budget in INR")
    budget_category: str = Field("moderate", description="budget | moderate | luxury")
    max_hotel_price_per_night: Optional[float] = None
    preferred_transport_mode: str = Field("bus", description="bus | private_car | train | flight")

class TripPlanningRequest(BaseModel):
    request_id: str = Field(..., description="Unique UUID for tracing")
    user_id: str = Field(..., description="User UUID")
    prompt: Optional[str] = Field(None, description="Natural language prompt from user")
    date_range: DateRange
    locations: LocationPreferences
    travelers: TravelerDetails
    budget: BudgetConstraints
    interests: List[str] = Field(default_factory=list, description="wildlife, heritage, food, beach, spiritual, photography")
    pacing: str = Field("balanced", description="relaxed | balanced | fast_paced")
    dietary_preferences: List[str] = Field(default_factory=list, description="pure_veg, jain, non_veg, swaminarayan")
