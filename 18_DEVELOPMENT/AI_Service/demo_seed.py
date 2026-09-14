"""
Chalo Farva — Demo State Reset & Dataset Seed Script v1.1
Provides idempotent demo data reset and verified Gujarat trip scenario data.
"""

import json
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("demo_seed")

# Verified Demo Trip Scenario: 4-Day Gujarat Trip from Ahmedabad
DEMO_TRIP_SCENARIO: Dict[str, Any] = {
    "trip_id": "TRIP-DEMO-2026-GUJ01",
    "status": "DEMO_ACTIVE",
    "origin": "Ahmedabad",
    "duration_days": 4,
    "travellers": 2,
    "budget": 25000.0,
    "estimated_cost": 21850.0,
    "currency": "INR",
    "destinations": ["Ahmedabad", "Vadodara", "Statue of Unity", "Dwarka", "Somnath"],
    "version": "v1.0",
    "days": [
        {
            "day": 1,
            "date": "2026-10-15",
            "title": "Heritage Arrival & Ahmedabad Explorations",
            "location": "Ahmedabad",
            "morning": "Sabarmati Ashram visit & Heritage Walk in Old City",
            "afternoon": "Lunch at Agashiye & visit Adalaj Stepwell",
            "evening": "Kankaria Lakefront promenade & Street Food at Manek Chowk",
            "hotel": "House of MG (Heritage Boutique Hotel, Ahmedabad)",
            "transport": "Private AC Cab (Ahmedabad local)",
            "estimated_day_cost": 4200.0
        },
        {
            "day": 2,
            "date": "2026-10-16",
            "title": "Vadodara Culture & World's Tallest Statue",
            "location": "Vadodara / Kevadia",
            "morning": "Express Highway drive to Laxmi Vilas Palace Vadodara",
            "afternoon": "Transfer to Statue of Unity (Kevadia), Viewing Gallery entry",
            "evening": "Glow Garden & Sound and Light Show at Statue of Unity",
            "hotel": "Fern Sardar Sarovar Resort (Kevadia)",
            "transport": "Express Bus / Private Transfer",
            "estimated_day_cost": 6800.0
        },
        {
            "day": 3,
            "date": "2026-10-17",
            "title": "Coastal Sacred Pilgrimage to Dwarka",
            "location": "Dwarka",
            "morning": "Scenic coastal route transit to Dwarka",
            "afternoon": "Check-in & Holy Dip at Gomti Ghat",
            "evening": "Dwarkadhish Temple Sandhya Aarti & Sunset at Sunset Point",
            "hotel": "Mercure Dwarka Resort",
            "transport": "GSRTC Volvo Express Bus",
            "estimated_day_cost": 5350.0
        },
        {
            "day": 4,
            "date": "2026-10-18",
            "title": "Jyotirlinga Darshan at Somnath & Departure",
            "location": "Somnath",
            "morning": "Nageshwar Jyotirlinga & Bet Dwarka Boat Excursion",
            "afternoon": "Coastal Highway drive to Somnath & Triveni Sangam",
            "evening": "Somnath Temple Laser Light Show & Transfer for Return Journey",
            "hotel": "Lords Inn Somnath (Day-use / Checkout)",
            "transport": "Private Cab / Express Bus",
            "estimated_day_cost": 5500.0
        }
    ],
    "bookings": {
        "hotels": [
            {"hotel_name": "House of MG", "city": "Ahmedabad", "status": "DEMO_CONFIRMED", "cost": 4200.0},
            {"hotel_name": "Fern Sardar Sarovar Resort", "city": "Kevadia", "status": "DEMO_CONFIRMED", "cost": 4800.0},
            {"hotel_name": "Mercure Dwarka", "city": "Dwarka", "status": "DEMO_CONFIRMED", "cost": 3900.0}
        ],
        "bus": [
            {"operator": "GSRTC Volvo Multi-Axle", "route": "Ahmedabad -> Vadodara", "seats": ["12A", "12B"], "status": "DEMO_CONFIRMED", "cost": 950.0},
            {"operator": "GSRTC Sleeper Express", "route": "Vadodara -> Dwarka", "seats": ["L4", "L5"], "status": "DEMO_CONFIRMED", "cost": 1800.0}
        ],
        "activities": [
            {"name": "Statue of Unity Express Entry & Viewing Gallery", "status": "DEMO_CONFIRMED", "cost": 2000.0},
            {"name": "Bet Dwarka Ferry & Temple Priority Pass", "status": "DEMO_CONFIRMED", "cost": 600.0},
            {"name": "Somnath Laser Light Show Premium Seating", "status": "DEMO_CONFIRMED", "cost": 400.0}
        ]
    },
    "payment_mode": "MOCK_SANDBOX",
    "is_demo": True
}

# Weather Disruption Adaptation Simulation Data (Day 3 Rain Event)
DEMO_ADAPTIVE_DISRUPTION: Dict[str, Any] = {
    "disruption_event": "WEATHER_WARNING",
    "affected_day": 3,
    "affected_location": "Dwarka / Bet Dwarka",
    "reason": "Heavy rainfall warning (45mm/hr) causing Bet Dwarka ferry suspension from 13:00 to 17:00",
    "original_item": "Bet Dwarka Boat Excursion & Ferry Transit",
    "recommended_replacement": {
        "title": "Indoor Rukmini Devi Temple & Dwarka Heritage Gallery Tour",
        "type": "INDOOR_HERITAGE",
        "time_slot": "14:00 - 16:30",
        "location": "Dwarka (Mainland)",
        "budget_impact": 0.0,
        "travel_time_impact": "-45 mins (No ferry wait time)",
        "safety_rating": "100% Safe (Indoor & Mainland Access)"
    },
    "updated_version": "v2.0"
}


def reset_demo_state() -> Dict[str, Any]:
    """Resets the demo trip state to pristine initial condition."""
    logger.info("Executing idempotent Demo State Reset...")
    demo_state = json.loads(json.dumps(DEMO_TRIP_SCENARIO))
    logger.info("Demo state reset successfully. Trip ID: %s", demo_state["trip_id"])
    return demo_state


def trigger_adaptive_demo_disruption(trip_state: Dict[str, Any]) -> Dict[str, Any]:
    """Applies a controlled weather disruption adaptation to the demo trip state."""
    logger.info("Triggering Adaptive AI Weather Disruption Demo...")
    updated_state = json.loads(json.dumps(trip_state))
    updated_state["version"] = DEMO_ADAPTIVE_DISRUPTION["updated_version"]
    updated_state["adaptive_alert"] = DEMO_ADAPTIVE_DISRUPTION
    
    # Update Day 3 activity safely
    for day in updated_state["days"]:
        if day["day"] == 3:
            day["afternoon"] = (
                f"[ADAPTED] {DEMO_ADAPTIVE_DISRUPTION['recommended_replacement']['title']} "
                f"(Replaced Bet Dwarka Ferry due to rain warning)"
            )
            day["title"] = "Coastal Sacred Pilgrimage to Dwarka (Weather Adapted v2.0)"
            
    updated_state["status"] = "DEMO_ADAPTED_V2"
    logger.info("Adaptive AI disruption applied. Trip version updated to v2.0")
    return updated_state


if __name__ == "__main__":
    state = reset_demo_state()
    print("Initial Demo State Version:", state["version"])
    adapted = trigger_adaptive_demo_disruption(state)
    print("Adapted Demo State Version:", adapted["version"])
