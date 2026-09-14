from datetime import datetime
from typing import List, Dict, Any, Tuple
from models.response_schema import DayItinerary, ConstraintValidationResult, ActivityItem

class HardConstraintEngine:
    """
    Deterministic rule engine that validates opening hours, monsoon closures, 
    daily travel limits, and closed days. Zero LLM math.
    """
    
    # Static database of known hard rules for Gujarat travel
    MONSOON_CLOSURES = [
        {
            "entity_id": "dest-gir-national-park",
            "name": "Gir National Park",
            "start_mm_dd": (6, 16), # June 16
            "end_mm_dd": (10, 15),  # Oct 15
            "reason": "Annual monsoon breeding season closure"
        }
    ]

    CLOSED_DAYS = [
        {
            "entity_id": "dest-statue-of-unity",
            "name": "Statue of Unity",
            "closed_weekday": 0, # Monday (0 in python datetime.weekday())
            "reason": "Closed on Mondays for weekly maintenance"
        }
    ]

    def validate_itinerary(self, days: List[DayItinerary]) -> ConstraintValidationResult:
        violations: List[str] = []
        opening_hours_passed = True
        monsoon_rules_passed = True
        travel_time_passed = True

        for day in days:
            day_date_str = day.date
            try:
                dt = datetime.strptime(day_date_str, "%Y-%m-%d")
            except ValueError:
                # If date format isn't YYYY-MM-DD, try parsing or default
                dt = datetime.now()

            month_day = (dt.month, dt.day)
            weekday = dt.weekday()

            # Check total travel distance per day (cap at 350 km per day for safety)
            if day.total_travel_distance_km > 350.0:
                travel_time_passed = False
                violations.append(f"Day {day.day_number}: Daily travel distance ({day.total_travel_distance_km:.1f} km) exceeds maximum limit of 350 km.")

            for act in day.activities:
                act_id_lower = act.activity_id.lower()
                act_name_lower = act.name.lower()

                # 1. Check Monsoon Closures
                for closure in self.MONSOON_CLOSURES:
                    if closure["name"].lower() in act_name_lower or closure["entity_id"].lower() in act_id_lower:
                        start_m, start_d = closure["start_mm_dd"]
                        end_m, end_d = closure["end_mm_dd"]
                        
                        # Date range check
                        in_monsoon = False
                        if start_m < end_m:
                            in_monsoon = (start_m, start_d) <= month_day <= (end_m, end_d)
                        else: # Spans end of year
                            in_monsoon = month_day >= (start_m, start_d) or month_day <= (end_m, end_d)

                        if in_monsoon:
                            monsoon_rules_passed = False
                            violations.append(
                                f"Day {day.day_number} ({day_date_str}): '{act.name}' is CLOSED for monsoon ({closure['reason']})."
                            )

                # 2. Check Closed Days
                for closed_rule in self.CLOSED_DAYS:
                    if closed_rule["name"].lower() in act_name_lower or closed_rule["entity_id"].lower() in act_id_lower:
                        if weekday == closed_rule["closed_weekday"]:
                            opening_hours_passed = False
                            violations.append(
                                f"Day {day.day_number} ({day_date_str}): '{act.name}' is CLOSED on Mondays for weekly maintenance."
                            )

        valid = opening_hours_passed and monsoon_rules_passed and travel_time_passed

        return ConstraintValidationResult(
            valid=valid,
            opening_hours_passed=opening_hours_passed,
            monsoon_rules_passed=monsoon_rules_passed,
            budget_limit_passed=True, # Validated by BudgetEngine separately
            travel_time_passed=travel_time_passed,
            violations=violations
        )
