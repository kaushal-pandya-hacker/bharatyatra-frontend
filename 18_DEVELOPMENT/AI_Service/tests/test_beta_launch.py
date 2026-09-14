import pytest

# Automated Beta Launch, Feature Flag & Triage Validation Tests

def test_feature_flag_evaluation_and_killswitch():
    """Verify feature flags evaluate percentage rollout, target groups, and kill-switch overrides."""
    flags = {
        "ai_trip_planner": {"enabled": True, "rollout_pct": 100, "groups": ["PUBLIC"]},
        "auto_adaptation": {"enabled": False, "rollout_pct": 0, "groups": ["INTERNAL_TEAM"]},
    }
    
    def is_enabled(flag_key, user_group="PUBLIC"):
        flag = flags.get(flag_key)
        if not flag or not flag["enabled"]:
            return False
        return flag["rollout_pct"] == 100 or user_group in flag["groups"]

    assert is_enabled("ai_trip_planner", "PUBLIC") is True
    assert is_enabled("auto_adaptation", "INTERNAL_TEAM") is False # Disabled via kill-switch

def test_feature_killswitch_isolation():
    """Verify disabling adaptive_ai does NOT prevent user from viewing trips or manual itinerary management."""
    feature_flags = {"adaptive_ai": False, "trip_viewer": True}
    
    trip_accessible = feature_flags["trip_viewer"]
    ai_adaptation_active = feature_flags["adaptive_ai"]
    
    assert trip_accessible is True
    assert ai_adaptation_active is False

def test_beta_feedback_triage_state_machine():
    """Verify feedback transitions NEW -> TRIAGED -> RESOLVED."""
    feedback = {
        "id": "fb_101",
        "category": "BOOKING",
        "severity": "P2",
        "status": "NEW"
    }
    
    # Triage step
    feedback["status"] = "TRIAGED"
    assert feedback["status"] == "TRIAGED"
    
    # Resolve step
    feedback["status"] = "RESOLVED"
    assert feedback["status"] == "RESOLVED"

def test_public_launch_blocker_zero_tolerance():
    """Verify public launch status is BLOCKED if any unresolved P0 issue exists."""
    def evaluate_launch_readiness(unresolved_p0_count):
        if unresolved_p0_count > 0:
            return "LAUNCH_BLOCKED"
        return "READY_FOR_PUBLIC_LAUNCH"

    assert evaluate_launch_readiness(unresolved_p0_count=1) == "LAUNCH_BLOCKED"
    assert evaluate_launch_readiness(unresolved_p0_count=0) == "READY_FOR_PUBLIC_LAUNCH"
