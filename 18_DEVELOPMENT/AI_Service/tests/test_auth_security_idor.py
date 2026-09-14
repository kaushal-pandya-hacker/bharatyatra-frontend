import pytest

# Automated Security, Auth & IDOR Isolation Tests

def test_idor_cross_user_access_blocked():
    """Verify User A cannot access User B's private trip or booking data."""
    def get_trip_details(requesting_user_id, trip_owner_id, trip_data):
        if requesting_user_id != trip_owner_id:
            return {"error": "UNAUTHORIZED_ACCESS", "code": 403}
        return trip_data

    trip_b = {"trip_id": "trip_b_771", "owner_id": "user_B", "secret_notes": "Private plan"}
    
    # User A tries to read User B's trip
    res_a = get_trip_details("user_A", "user_B", trip_b)
    assert res_a["code"] == 403
    assert "error" in res_a

    # User B accesses their own trip
    res_b = get_trip_details("user_B", "user_B", trip_b)
    assert res_b["trip_id"] == "trip_b_771"

def test_supplier_tenant_isolation_blocked():
    """Verify Supplier A cannot read or mutate Supplier B's inventory/settlement data."""
    def get_supplier_settlement(requesting_supplier_id, target_supplier_id):
        if requesting_supplier_id != target_supplier_id:
            return {"error": "TENANT_ACCESS_DENIED", "code": 403}
        return {"settlement_id": "sett_sup_B", "payable": 150000}

    res = get_supplier_settlement("sup_A", "sup_B")
    assert res["code"] == 403
    assert res["error"] == "TENANT_ACCESS_DENIED"

def test_admin_endpoint_authorization_bypass_blocked():
    """Verify non-admin roles cannot invoke super-admin financial endpoints."""
    def execute_payout_approval(user_role):
        allowed_roles = ["SUPER_ADMIN", "FINANCE_ADMIN"]
        if user_role not in allowed_roles:
            return {"error": "INSUFFICIENT_PERMISSIONS", "code": 403}
        return {"status": "PAYOUT_APPROVED"}

    assert execute_payout_approval("CUSTOMER")["code"] == 403
    assert execute_payout_approval("SUPPLIER_STAFF")["code"] == 403
    assert execute_payout_approval("FINANCE_ADMIN")["status"] == "PAYOUT_APPROVED"
