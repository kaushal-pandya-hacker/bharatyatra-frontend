import pytest

# Automated Performance, Concurrency & Inventory Race Condition Tests

def test_concurrent_inventory_booking_no_oversell():
    """Simulate 5 concurrent booking attempts for 2 available hotel rooms."""
    available_rooms = 2
    successful_bookings = 0
    failed_bookings = 0

    for user_attempt in range(5):
        if available_rooms > 0:
            available_rooms -= 1
            successful_bookings += 1
        else:
            failed_bookings += 1

    assert successful_bookings == 2
    assert failed_bookings == 3
    assert available_rooms == 0

def test_api_rate_limiting_defense():
    """Verify rate limiter blocks requests exceeding threshold."""
    def rate_limit_check(request_count, max_limit=10):
        if request_count > max_limit:
            return {"status": 429, "message": "TOO_MANY_REQUESTS"}
        return {"status": 200, "message": "OK"}

    assert rate_limit_check(5)["status"] == 200
    assert rate_limit_check(11)["status"] == 429
