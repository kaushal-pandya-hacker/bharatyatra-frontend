import os
import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models.request_schema import TripPlanningRequest
from models.response_schema import StructuredItineraryOutput, ConstraintValidationResult
from pipeline.planner_orchestrator import PlannerOrchestrator
from constraints.hard_constraint_engine import HardConstraintEngine

app = FastAPI(
    title="Chalo Farva AI Trip Planner Microservice",
    version="1.0.0",
    description="Python FastAPI service for AI-powered, constraint-validated Gujarat trip itineraries."
)

# Enable CORS for NestJS backend & Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = PlannerOrchestrator()
constraint_engine = HardConstraintEngine()

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "chalo-farva-ai-planner",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.post("/api/v1/ai/trip-plan", response_model=StructuredItineraryOutput)
def generate_trip_plan(request: TripPlanningRequest):
    """Generates a complete, verified, constraint-checked Gujarat itinerary."""
    try:
        plan = orchestrator.generate_plan(request)
        return plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate trip plan: {str(e)}"
        )

@app.post("/api/v1/ai/trip-plan/validate", response_model=ConstraintValidationResult)
def validate_trip_plan(days: list):
    """Validates an existing itinerary against hard constraints."""
    try:
        from models.response_schema import DayItinerary
        day_models = [DayItinerary(**d) for d in days]
        res = constraint_engine.validate_itinerary(day_models)
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation failed: {str(e)}"
        )

@app.post("/api/v1/ai/adaptive-reasoning")
def get_adaptive_reasoning(payload: dict):
    """Generates context-aware replacement recommendations for disrupted trip slots."""
    try:
        from pipeline.adaptive_reasoning import AdaptiveReasoningEngine
        engine = AdaptiveReasoningEngine()
        result = engine.generate_adaptive_alternatives(
            event_type=payload.get("event_type", "WEATHER_RAIN_RISK"),
            affected_slot=payload.get("affected_slot", {}),
            city=payload.get("city", "Ahmedabad"),
            user_interests=payload.get("user_interests", ["heritage"])
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Adaptive reasoning failure: {str(e)}"
        )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

