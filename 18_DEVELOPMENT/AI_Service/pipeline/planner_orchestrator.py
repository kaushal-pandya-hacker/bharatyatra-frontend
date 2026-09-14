import uuid
from typing import Dict, Any, Optional
from models.request_schema import TripPlanningRequest
from models.response_schema import StructuredItineraryOutput
from pipeline.intent_extractor import IntentExtractor
from knowledge.retriever import KnowledgeRetriever
from optimization.route_optimizer import RouteOptimizer
from constraints.hard_constraint_engine import HardConstraintEngine
from pipeline.budget_engine import BudgetEngine
from validation.schema_validator import SchemaValidator
from llm.llm_provider import LLMProvider
from llm.gemini_llm_provider import GeminiLLMProvider
from llm.mock_llm_provider import DevelopmentMockLLMProvider

class PlannerOrchestrator:
    """
    Central Orchestrator combining LLM generation with deterministic rules,
    verified knowledge retrieval, route optimization, and financial budget caps.
    """

    def __init__(self, llm_provider: Optional[LLMProvider] = None):
        self.intent_extractor = IntentExtractor()
        self.knowledge_retriever = KnowledgeRetriever()
        self.route_optimizer = RouteOptimizer()
        self.constraint_engine = HardConstraintEngine()
        self.budget_engine = BudgetEngine()
        self.schema_validator = SchemaValidator()
        self.llm_provider = llm_provider or GeminiLLMProvider()

    def generate_plan(self, request: TripPlanningRequest) -> StructuredItineraryOutput:
        # 1. Intent Extraction & Sanitization
        intent = self.intent_extractor.extract_intent(request)

        # 2. Knowledge Base Fact Retrieval
        verified_facts = self.knowledge_retriever.get_all_verified_facts()
        facts_summary_str = "\n".join(
            f"- {f.get('entityId')}: {f.get('factContent')} (Source: {f.get('provenanceBadge')})"
            for f in verified_facts
        )

        # 3. Route Optimization
        optimized_destinations = self.route_optimizer.optimize_city_sequence(
            intent["origin_city"], intent["destinations"]
        )

        # 4. Construct System Prompt & Task Prompt for LLM
        system_prompt = f"""You are the Chalo Farva AI Travel Planner v1.0, an expert Gujarat travel architect.
You generate realistic, structured day-by-day travel itineraries.

STRICT RULES:
1. Ground your facts in the following VERIFIED KNOWLEDGE BASE:
{facts_summary_str}
2. Respect opening hours and monsoon closures mentioned in verified facts.
3. Keep day travel distances logical and sequential without geographic backtracking.
4. Output MUST be valid JSON matching the StructuredItineraryOutput schema.
"""

        user_prompt = f"""Generate a travel plan with:
- Start Date: {request.date_range.start_date} to {request.date_range.end_date}
- Origin: {intent['origin_city']}
- Optimized Sequence: {', '.join(optimized_destinations)}
- Traveler Count: {intent['num_travelers']} ({request.travelers.traveler_type})
- Interests: {', '.join(intent['interests'])}
- Budget Cap: INR {intent['total_budget_inr']} ({intent['budget_category']})
- Pacing: {intent['pacing']}
- User Notes: {intent['sanitized_prompt']}
"""

        # 5. LLM Call
        raw_llm_output = self.llm_provider.generate_json(system_prompt, user_prompt)

        # 6. Schema Validation & Parsing
        success, itinerary_obj, err_msg = self.schema_validator.parse_and_validate(
            raw_llm_output, request.request_id
        )

        if not success or not itinerary_obj:
            print(f"[PlannerOrchestrator] Schema validation error: {err_msg}. Falling back to mock generator.")
            mock = DevelopmentMockLLMProvider()
            raw_llm_output = mock.generate_json(system_prompt, user_prompt)
            _, itinerary_obj, _ = self.schema_validator.parse_and_validate(
                raw_llm_output, request.request_id
            )

        # 7. Deterministic Hard Constraint Engine Validation
        validation_result = self.constraint_engine.validate_itinerary(itinerary_obj.days)

        # 8. Deterministic Budget Engine Calculation
        cost_breakdown = self.budget_engine.calculate_cost_breakdown(
            itinerary_obj.days, request.budget, intent["num_travelers"]
        )

        # Sync validation result with budget pass check
        validation_result.budget_limit_passed = cost_breakdown.within_budget
        if not cost_breakdown.within_budget:
            validation_result.valid = False
            validation_result.violations.append(
                f"Total estimated cost (INR {cost_breakdown.total_estimated_inr}) exceeds budget cap of INR {cost_breakdown.budget_cap_inr}."
            )

        # 9. Provenance Audit Summary
        verified_count = 0
        ai_recommendation_count = 0
        for day in itinerary_obj.days:
            for act in day.activities:
                if act.provenance_type == "VERIFIED_DATA":
                    verified_count += 1
                else:
                    ai_recommendation_count += 1

        # Final Assembly
        itinerary_obj.cost_breakdown = cost_breakdown
        itinerary_obj.validation = validation_result
        itinerary_obj.provenance_summary = {
            "VERIFIED_DATA": verified_count,
            "AI_GENERATED_RECOMMENDATION": ai_recommendation_count
        }

        return itinerary_obj
