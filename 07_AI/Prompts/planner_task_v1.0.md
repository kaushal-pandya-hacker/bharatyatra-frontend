# Task Prompt Template: Trip Planning Request v1.0

```text
Generate a travel plan for Gujarat with the following specifications:

Dates: {start_date} to {end_date} ({total_days} Days)
Origin City: {origin_city}
Target Regions: {destination_regions}
Travelers: {num_adults} Adults, {num_children} Children ({traveler_type})
Budget Limit: INR {total_budget_inr} ({budget_category})
Transport Preference: {preferred_transport_mode}
Interests: {interests}
Pacing: {pacing}
Dietary Notes: {dietary_preferences}

USER SPECIAL REQUEST:
{sanitized_prompt}

Generate a day-by-day structured itinerary JSON.
```
