import json
from llm.llm_provider import LLMProvider

class DevelopmentMockLLMProvider(LLMProvider):
    """
    Mock LLM provider for unit testing & offline development.
    Returns deterministic, valid Gujarat travel itinerary JSON responses.
    """

    def generate_json(self, system_prompt: str, user_prompt: str) -> str:
        # Mock structured itinerary response matching response_schema.py
        mock_output = {
            "title": "Gujarat Heritage & Spiritual Tour",
            "summary": "A balanced 3-day exploration of Ahmedabad, Statue of Unity, and Somnath Temple.",
            "days": [
                {
                    "day_number": 1,
                    "date": "2026-10-20",
                    "title": "Ahmedabad Heritage Walk & Sabarmati Ashram",
                    "summary": "Explore UNESCO World Heritage City of Ahmedabad.",
                    "primary_city": "Ahmedabad",
                    "total_travel_distance_km": 25.0,
                    "estimated_daily_cost_inr": 800.0,
                    "activities": [
                        {
                            "activity_id": "act-sabarmati-ashram",
                            "name": "Sabarmati Ashram Visit",
                            "type": "sightseeing",
                            "time_slot": {"start_time": "09:00", "end_time": "11:00"},
                            "location_name": "Sabarmati Ashram",
                            "city": "Ahmedabad",
                            "latitude": 23.0605,
                            "longitude": 72.5807,
                            "cost_inr": 0.0,
                            "provenance_type": "VERIFIED_DATA",
                            "notes": "Peaceful historic sanctuary of Mahatma Gandhi.",
                            "booking_required": False
                        },
                        {
                            "activity_id": "act-adalaj-stepwell",
                            "name": "Adalaj Stepwell Exploration",
                            "type": "sightseeing",
                            "time_slot": {"start_time": "14:00", "end_time": "16:00"},
                            "location_name": "Adalaj Stepwell",
                            "city": "Gandhinagar",
                            "latitude": 23.1667,
                            "longitude": 72.5801,
                            "cost_inr": 50.0,
                            "provenance_type": "VERIFIED_DATA",
                            "notes": "5-story deep Indo-Islamic architectural masterpiece.",
                            "booking_required": False
                        }
                    ]
                },
                {
                    "day_number": 2,
                    "date": "2026-10-21",
                    "title": "Statue of Unity & Kevadia Marvels",
                    "summary": "Marvel at the world's tallest statue and surrounding eco-tourism attractions.",
                    "primary_city": "Kevadia",
                    "total_travel_distance_km": 195.0,
                    "estimated_daily_cost_inr": 1500.0,
                    "activities": [
                        {
                            "activity_id": "dest-statue-of-unity",
                            "name": "Statue of Unity Viewing Gallery",
                            "type": "sightseeing",
                            "time_slot": {"start_time": "09:30", "end_time": "13:00"},
                            "location_name": "Statue of Unity",
                            "city": "Kevadia",
                            "latitude": 21.8380,
                            "longitude": 73.7191,
                            "cost_inr": 380.0,
                            "provenance_type": "VERIFIED_DATA",
                            "notes": "182-meter monumental tribute to Sardar Vallabhbhai Patel.",
                            "booking_required": True
                        },
                        {
                            "activity_id": "act-valley-of-flowers",
                            "name": "Valley of Flowers & Cactus Garden",
                            "type": "sightseeing",
                            "time_slot": {"start_time": "15:00", "end_time": "17:30"},
                            "location_name": "Kevadia Eco Park",
                            "city": "Kevadia",
                            "latitude": 21.8410,
                            "longitude": 73.7150,
                            "cost_inr": 100.0,
                            "provenance_type": "VERIFIED_DATA",
                            "notes": "Lush botanical gardens along Narmada River.",
                            "booking_required": False
                        }
                    ]
                },
                {
                    "day_number": 3,
                    "date": "2026-10-22",
                    "title": "Somnath Temple Mahapuja & Arabian Sea Coast",
                    "summary": "Sacred pilgrimage visit to the first Jyotirlinga.",
                    "primary_city": "Somnath",
                    "total_travel_distance_km": 280.0,
                    "estimated_daily_cost_inr": 600.0,
                    "activities": [
                        {
                            "activity_id": "dest-somnath",
                            "name": "Somnath Temple Evening Aarti & Sound Show",
                            "type": "sightseeing",
                            "time_slot": {"start_time": "18:30", "end_time": "20:30"},
                            "location_name": "Somnath Temple",
                            "city": "Somnath",
                            "latitude": 20.8880,
                            "longitude": 70.4012,
                            "cost_inr": 0.0,
                            "provenance_type": "VERIFIED_DATA",
                            "notes": "Divinely atmospheric seaside temple with nightly light show.",
                            "booking_required": False
                        }
                    ]
                }
            ]
        }
        return json.dumps(mock_output)
