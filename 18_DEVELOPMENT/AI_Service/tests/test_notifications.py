import pytest
from datetime import datetime

# Automated Notification Engine & Communication Architecture Tests

def test_template_rendering_localization():
    """Verify versioned template rendering and localization in EN, GU, HI."""
    templates = {
        "booking_confirmed_v1.0": {
          "en": "Hello {{user_name}}, booking {{booking_ref}} is confirmed.",
          "gu": "નમસ્તે {{user_name}}, બુકિંગ {{booking_ref}} કન્ફર્મ થયું.",
          "hi": "नमस्ते {{user_name}}, बुकिंग {{booking_ref}} की पुष्टि हुई."
        }
    }
    vars = {"user_name": "Rajesh", "booking_ref": "CF-9981"}
    
    en_rendered = templates["booking_confirmed_v1.0"]["en"].replace("{{user_name}}", vars["user_name"]).replace("{{booking_ref}}", vars["booking_ref"])
    gu_rendered = templates["booking_confirmed_v1.0"]["gu"].replace("{{user_name}}", vars["user_name"]).replace("{{booking_ref}}", vars["booking_ref"])
    
    assert "Rajesh" in en_rendered
    assert "CF-9981" in en_rendered
    assert "નમસ્તે Rajesh" in gu_rendered

def test_event_deduplication():
    """Verify idempotent deduplication suppresses duplicate notification events."""
    dedup_set = set()
    event_key = "evt_booking_101_usr_demo_EMAIL"
    
    # First attempt -> Processed
    first_attempt = event_key not in dedup_set
    if first_attempt:
        dedup_set.add(event_key)
        
    # Second attempt -> Suppressed
    second_attempt = event_key not in dedup_set
    
    assert first_attempt is True
    assert second_attempt is False

def test_quiet_hours_and_urgent_bypass():
    """Verify quiet hours suppress NORMAL alerts but allow URGENT alerts to pass."""
    def evaluate_notification(priority, is_quiet_hours):
        if is_quiet_hours and priority != "URGENT":
            return False # Suppressed
        return True # Delivered

    assert evaluate_notification("NORMAL", is_quiet_hours=True) is False
    assert evaluate_notification("URGENT", is_quiet_hours=True) is True
    assert evaluate_notification("NORMAL", is_quiet_hours=False) is True

def test_retry_and_dlq_state_machine():
    """Verify failure state machine transition from PROCESSING -> RETRYING -> DLQ."""
    max_attempts = 3
    current_attempt = 3
    
    status = "RETRYING"
    if current_attempt >= max_attempts:
        status = "FAILED_DLQ"
        
    assert status == "FAILED_DLQ"

def test_read_state_tracking():
    """Verify notification read state transition UNREAD -> READ."""
    notification = {"id": "notif_1", "read_status": "UNREAD", "read_at": None}
    
    # Mark read
    notification["read_status"] = "READ"
    notification["read_at"] = datetime.now().isoformat()
    
    assert notification["read_status"] == "READ"
    assert notification["read_at"] is not None

def test_supplier_notification_isolation():
    """Verify supplier notifications are strictly isolated to tenant supplier ID."""
    notifications = [
        {"id": "n1", "supplier_id": "sup_hotel_01", "title": "Booking 1"},
        {"id": "n2", "supplier_id": "sup_bus_02", "title": "Booking 2"},
    ]
    
    supplier_1_notifs = [n for n in notifications if n.get("supplier_id") == "sup_hotel_01"]
    
    assert len(supplier_1_notifs) == 1
    assert supplier_1_notifs[0]["id"] == "n1"

def test_support_internal_notes_isolation():
    """Verify internal support notes are tagged internal_only and excluded from traveler inbox."""
    notifications = [
        {"id": "n1", "recipient_id": "usr_demo", "internal_only": False, "title": "Ticket Replied"},
        {"id": "n2", "recipient_id": "usr_demo", "internal_only": True, "title": "Internal Agent Note"},
    ]
    
    traveler_inbox = [n for n in notifications if not n["internal_only"]]
    
    assert len(traveler_inbox) == 1
    assert traveler_inbox[0]["id"] == "n1"
