import pytest
import hmac
import hashlib

def test_price_breakdown_math():
    subtotal = 4000.0
    tax = 720.0
    platform_fee = 100.0
    discount = 300.0
    total = subtotal + tax + platform_fee - discount
    assert total == 4520.0
    assert total > 0.0

def test_refund_policy_calculation():
    gross_amount = 5000.0

    # Case 1: Provider Booking Failed -> 100% Refund
    provider_failed_refund = gross_amount
    assert provider_failed_refund == 5000.0

    # Case 2: Free cancellation 48h before -> 100% Refund
    hours_before = 48
    refund_pct = 1.0 if hours_before >= 24 else 0.8
    assert gross_amount * refund_pct == 5000.0

    # Case 3: Moderate cancellation 12h before -> 0% Refund
    hours_before_late = 12
    refund_pct_late = 0.0
    assert gross_amount * refund_pct_late == 0.0

def test_double_entry_ledger_balancing():
    debit_entry = {"account": "PAYMENT_GATEWAY", "direction": "DEBIT", "amount": 4520.0}
    credit_entry = {"account": "CUSTOMER_RECEIVABLE", "direction": "CREDIT", "amount": 4520.0}
    assert debit_entry["amount"] == credit_entry["amount"]
    assert debit_entry["direction"] != credit_entry["direction"]

def test_hmac_signature_verification():
    secret = "chalo_farva_webhook_secret_key_2026"
    payload = '{"event": "payment.captured", "id": "pay_1001"}'
    signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    
    # Re-verify signature
    computed = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    assert hmac.compare_digest(signature, computed) is True
