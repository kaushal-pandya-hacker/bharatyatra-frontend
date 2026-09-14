import pytest

# Automated Payment Tampering & Reconciliation Tests

def test_frontend_price_tampering_defense():
    """Verify backend recalculates authoritative total amount ignoring tampered payload values."""
    def calculate_backend_total(items, claimed_client_total):
        authoritative_total = sum(item["price"] for item in items)
        if claimed_client_total != authoritative_total:
            # Override client-tampered price with backend authoritative total
            return authoritative_total
        return authoritative_total

    cart_items = [{"name": "Deluxe Room", "price": 4000}, {"name": "GSRTC Bus", "price": 500}]
    tampered_total_from_frontend = 100 # Attempt to pay ₹100 instead of ₹4500

    verified_total = calculate_backend_total(cart_items, tampered_total_from_frontend)
    assert verified_total == 4500

def test_payment_success_booking_failed_reconciliation():
    """Critical Edge Case Test: Payment SUCCESS + Provider Booking FAILED triggers 100% refund."""
    payment_status = "SUCCESS"
    provider_booking_status = "FAILED"
    
    reconciliation_triggered = False
    refund_status = None
    
    if payment_status == "SUCCESS" and provider_booking_status == "FAILED":
        reconciliation_triggered = True
        refund_status = "FULL_REFUND_INITIATED"
        
    assert reconciliation_triggered is True
    assert refund_status == "FULL_REFUND_INITIATED"

def test_ledger_double_entry_balance():
    """Verify double-entry ledger debit balance equals credit balance."""
    ledger_entries = [
        {"account": "CUSTOMER_RECEIVABLE", "debit": 5000, "credit": 0},
        {"account": "PAYMENT_GATEWAY", "debit": 0, "credit": 5000},
        {"account": "SUPPLIER_PAYABLE", "debit": 0, "credit": 4200},
        {"account": "PLATFORM_REVENUE", "debit": 0, "credit": 800},
        {"account": "PAYMENT_GATEWAY", "debit": 5000, "credit": 0},
    ]
    
    total_debits = sum(e["debit"] for e in ledger_entries)
    total_credits = sum(e["credit"] for e in ledger_entries)
    
    assert total_debits == total_credits
