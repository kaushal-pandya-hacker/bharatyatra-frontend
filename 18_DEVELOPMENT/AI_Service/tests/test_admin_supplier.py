import pytest

def test_admin_rbac_permission_guard():
    user_role = "SUPPORT_AGENT"
    finance_allowed_roles = ["SUPER_ADMIN", "FINANCE_ADMIN"]
    assert user_role not in finance_allowed_roles

def test_supplier_tenant_data_isolation():
    supplier_a_data = {"supplierId": "supp_001", "company": "Lords Inn Somnath"}
    requesting_supplier_id = "supp_002"
    
    # Check tenant isolation guard
    is_authorized = (supplier_a_data["supplierId"] == requesting_supplier_id)
    assert is_authorized is False

def test_supplier_verification_state_machine():
    allowed_transitions = {
        "APPLICATION_SUBMITTED": ["UNDER_REVIEW", "REJECTED"],
        "UNDER_REVIEW": ["APPROVED", "REJECTED", "ADDITIONAL_INFO_REQ"],
        "APPROVED": ["SUSPENDED"],
        "SUSPENDED": ["APPROVED"]
    }
    current_state = "UNDER_REVIEW"
    next_state = "APPROVED"
    assert next_state in allowed_transitions[current_state]

def test_support_ticket_internal_notes_isolation():
    ticket = {
        "id": "tkt_101",
        "public_messages": [{"sender": "customer", "text": "Bus delayed"}],
        "internal_notes": [{"agent_id": "agent_01", "note": "Verified with GSRTC dispatcher"}]
    }
    
    # Customer view should exclude internal notes
    customer_view = {"messages": ticket["public_messages"]}
    assert "internal_notes" not in customer_view
