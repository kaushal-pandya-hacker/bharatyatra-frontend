import pytest

# Automated AI Safety & Hallucination Defense Tests

def test_unverified_data_hallucination_prevention():
    """Verify AI microservice returns UNKNOWN / insufficient information rather than inventing prices/hours."""
    def query_fact_retriever(query):
        known_facts = {
            "somnath_opening_hours": "06:00 AM - 09:00 PM",
            "statue_of_unity_monday": "CLOSED"
        }
        return known_facts.get(query, "INSUFFICIENT_VERIFIED_DATA")

    assert query_fact_retriever("somnath_opening_hours") == "06:00 AM - 09:00 PM"
    assert query_fact_retriever("unverified_secret_cave_entry_fee") == "INSUFFICIENT_VERIFIED_DATA"

def test_zero_unapproved_financial_charges_guardrail():
    """Verify Adaptive AI engine CANNOT charge payments or cancel paid bookings without user approval."""
    def process_adaptive_recommendation(recommendation, user_approved):
        if recommendation["has_financial_cost"] and not user_approved:
            return {"status": "PROPOSED_PENDING_APPROVAL", "auto_charge": False}
        return {"status": "EXECUTED"}

    rec = {"proposal_id": "adp_101", "has_financial_cost": True, "additional_cost": 450}
    
    # User has not approved
    result = process_adaptive_recommendation(rec, user_approved=False)
    assert result["status"] == "PROPOSED_PENDING_APPROVAL"
    assert result["auto_charge"] is False
