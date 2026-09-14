from typing import List, Dict, Any
from models.request_schema import BudgetConstraints
from models.response_schema import DayItinerary, CostBreakdown

class BudgetEngine:
    """
    Deterministic financial engine that computes exact trip cost breakdowns
    and enforces hard budget limits without LLM hallucination.
    """

    # Category average estimates per night/day in INR
    CATEGORY_ACCOMMODATION_PER_NIGHT = {
        "budget": 1500.0,
        "moderate": 3500.0,
        "luxury": 8500.0
    }

    ESTIMATED_DAILY_FOOD_PER_PERSON = {
        "budget": 500.0,
        "moderate": 1000.0,
        "luxury": 2500.0
    }

    ESTIMATED_TRANSPORT_PER_KM = {
        "bus": 2.5,
        "train": 2.0,
        "private_car": 14.0,
        "flight": 25.0
    }

    def calculate_cost_breakdown(
        self,
        days: List[DayItinerary],
        budget_constraints: BudgetConstraints,
        num_travelers: int
    ) -> CostBreakdown:
        total_days = len(days)
        nights = max(1, total_days - 1)

        # 1. Activities Cost (Sum of all verified activity costs)
        activities_inr = sum(
            act.cost_inr for day in days for act in day.activities
        )

        # 2. Total travel distance & transport cost
        total_distance_km = sum(day.total_travel_distance_km for day in days)
        transport_rate = self.ESTIMATED_TRANSPORT_PER_KM.get(
            budget_constraints.preferred_transport_mode.lower(), 5.0
        )
        transportation_inr = round(total_distance_km * transport_rate, 2)

        # 3. Accommodation cost
        nightly_rate = budget_constraints.max_hotel_price_per_night or self.CATEGORY_ACCOMMODATION_PER_NIGHT.get(
            budget_constraints.budget_category.lower(), 3500.0
        )
        accommodation_inr = round(nights * nightly_rate, 2)

        # 4. Food estimate
        daily_food_rate = self.ESTIMATED_DAILY_FOOD_PER_PERSON.get(
            budget_constraints.budget_category.lower(), 1000.0
        )
        food_estimate_inr = round(total_days * daily_food_rate * num_travelers, 2)

        # 5. Total
        total_estimated = round(activities_inr + transportation_inr + accommodation_inr + food_estimate_inr, 2)
        within_budget = total_estimated <= budget_constraints.total_budget_inr

        return CostBreakdown(
            accommodation_inr=accommodation_inr,
            transportation_inr=transportation_inr,
            activities_inr=activities_inr,
            food_estimate_inr=food_estimate_inr,
            total_estimated_inr=total_estimated,
            budget_cap_inr=budget_constraints.total_budget_inr,
            within_budget=within_budget
        )
