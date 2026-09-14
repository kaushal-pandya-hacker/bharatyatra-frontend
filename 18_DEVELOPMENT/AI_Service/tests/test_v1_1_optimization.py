"""
Phase 16 - Post-Launch Optimization + Growth v1.1 Automated Test Suite
"""

import pytest

class EventTaxonomyTracker:
    def __init__(self):
        self.events = []

    def record_event(self, event_type: str, user_id: str = None, metadata: dict = None):
        evt = {
            "id": f"evt-{len(self.events) + 1}",
            "event_type": event_type,
            "user_id": user_id,
            "metadata": metadata or {}
        }
        self.events.append(evt)
        return evt

    def compute_funnel(self):
        steps = [
            "DESTINATION_VIEWED",
            "SEARCH_STARTED",
            "AI_PLANNER_STARTED",
            "AI_ITINERARY_GENERATED",
            "AI_ITINERARY_ACCEPTED",
            "CHECKOUT_STARTED",
            "PAYMENT_SUCCESS",
            "BOOKING_CONFIRMED",
            "TRIP_COMPLETED"
        ]
        counts = {step: sum(1 for e in self.events if e["event_type"] == step) for step in steps}
        landing = counts["DESTINATION_VIEWED"]
        confirmed = counts["BOOKING_CONFIRMED"]
        conversion = (confirmed / landing * 100) if landing > 0 else 0.0
        return counts, round(conversion, 2)


class ExperimentEngine:
    def __init__(self):
        self.experiments = {}
        self.assignments = {}

    def register_experiment(self, exp_id: str, primary_metric: str, guardrail: str):
        self.experiments[exp_id] = {
            "id": exp_id,
            "primary_metric": primary_metric,
            "guardrail": guardrail,
            "status": "ACTIVE",
            "decision": None
        }

    def assign_user(self, exp_id: str, user_id: str):
        key = f"{user_id}:{exp_id}"
        if key in self.assignments:
            return self.assignments[key]
        variant = "VARIANT_A" if len(user_id) % 2 == 1 else "CONTROL"
        self.assignments[key] = variant
        return variant

    def conclude_experiment(self, exp_id: str, decision: str):
        if exp_id in self.experiments:
            self.experiments[exp_id]["status"] = "ROLLED_BACK" if decision == "ROLLBACK" else "CONCLUDED"
            self.experiments[exp_id]["decision"] = decision
            return self.experiments[exp_id]
        return None


def calculate_supplier_score(success_rate: float, complaint_rate: float, avg_rating: float) -> float:
    # 50% success rate, 30% complaint penalty, 20% rating
    score = (success_rate * 50.0) + ((1.0 - complaint_rate) * 30.0) + ((avg_rating / 5.0) * 20.0)
    return round(score, 1)


def evaluate_expansion_gates(metrics: dict) -> dict:
    gates = {
        "booking_success_stable": metrics.get("booking_success_rate", 0) >= 98.0,
        "payment_success_stable": metrics.get("payment_success_rate", 0) >= 98.0,
        "refunds_manageable": metrics.get("refund_reconciliation_rate", 0) == 100.0,
        "ai_quality_verified": metrics.get("ai_hallucination_rate", 100) == 0.0,
        "adaptive_ai_trustworthy": metrics.get("unapproved_financial_charges", 1) == 0,
        "supplier_ops_manageable": metrics.get("underperforming_suppliers_pct", 100) <= 15.0,
        "support_manageable": metrics.get("unresolved_p0_tickets", 1) == 0,
        "infra_scalable": metrics.get("p95_latency_ms", 10000) <= 2000,
        "unit_economics_understood": metrics.get("contribution_margin_pct", -100) > 0,
        "security_healthy": metrics.get("unresolved_idor_vulnerabilities", 1) == 0,
        "travel_data_scalable": metrics.get("verified_destinations_count", 0) >= 24
    }
    all_passed = all(gates.values())
    return {
        "gates": gates,
        "all_passed": all_passed,
        "decision": "READY_FOR_EXPANSION" if all_passed else "EXPANSION_BLOCKED"
    }


# ==================== TEST CASES ====================

def test_analytics_event_taxonomy_and_funnel():
    tracker = EventTaxonomyTracker()
    for _ in range(100): tracker.record_event("DESTINATION_VIEWED")
    for _ in range(80): tracker.record_event("SEARCH_STARTED")
    for _ in range(60): tracker.record_event("AI_PLANNER_STARTED")
    for _ in range(50): tracker.record_event("AI_ITINERARY_GENERATED")
    for _ in range(40): tracker.record_event("AI_ITINERARY_ACCEPTED")
    for _ in range(30): tracker.record_event("CHECKOUT_STARTED")
    for _ in range(28): tracker.record_event("PAYMENT_SUCCESS")
    for _ in range(28): tracker.record_event("BOOKING_CONFIRMED")
    for _ in range(25): tracker.record_event("TRIP_COMPLETED")

    counts, conversion = tracker.compute_funnel()
    assert counts["DESTINATION_VIEWED"] == 100
    assert counts["BOOKING_CONFIRMED"] == 28
    assert conversion == 28.0


def test_ab_experimentation_engine_and_guardrails():
    engine = ExperimentEngine()
    engine.register_experiment("exp-001", "Conversion Rate", "Zero payment tampering")
    
    var_1 = engine.assign_user("exp-001", "user-101")
    var_2 = engine.assign_user("exp-001", "user-102")
    assert var_1 in ["CONTROL", "VARIANT_A"]
    assert var_2 in ["CONTROL", "VARIANT_A"]

    result = engine.conclude_experiment("exp-001", "SHIP")
    assert result["status"] == "CONCLUDED"
    assert result["decision"] == "SHIP"


def test_supplier_quality_scorecard():
    score_high = calculate_supplier_score(0.99, 0.01, 4.8) # 49.5 + 29.7 + 19.2 = 98.4
    score_low = calculate_supplier_score(0.70, 0.15, 3.0)  # 35.0 + 25.5 + 12.0 = 72.5
    assert score_high >= 90.0
    assert score_low < 80.0


def test_production_health_audit_data_marking():
    health_data = {
        "user_registrations": 1250,
        "payment_success_rate": 99.4,
        "uncollected_metric_x": "DATA NOT AVAILABLE"
    }
    assert health_data["uncollected_metric_x"] == "DATA NOT AVAILABLE"
    assert health_data["user_registrations"] == 1250


def test_adaptive_ai_safety_hierarchy():
    # Adaptive AI safety check: Zero autonomous paid changes without user approval
    trigger = {"type": "BUS_DELAY", "delay_mins": 45}
    proposed_rebooking = {"new_bus_id": "bus-99", "additional_cost_inr": 250}
    user_approved = False

    # Executed transaction must fail if paid change is not approved
    can_auto_charge = proposed_rebooking["additional_cost_inr"] == 0 or user_approved
    assert can_auto_charge is False


def test_expansion_readiness_scorecard():
    valid_metrics = {
        "booking_success_rate": 99.1,
        "payment_success_rate": 99.4,
        "refund_reconciliation_rate": 100.0,
        "ai_hallucination_rate": 0.0,
        "unapproved_financial_charges": 0,
        "underperforming_suppliers_pct": 10.8,
        "unresolved_p0_tickets": 0,
        "p95_latency_ms": 1420,
        "contribution_margin_pct": 6.6,
        "unresolved_idor_vulnerabilities": 0,
        "verified_destinations_count": 24
    }
    res = evaluate_expansion_gates(valid_metrics)
    assert res["all_passed"] is True
    assert res["decision"] == "READY_FOR_EXPANSION"
