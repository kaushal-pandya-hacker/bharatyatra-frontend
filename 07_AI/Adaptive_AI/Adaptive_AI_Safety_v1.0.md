# CHALO FARVA — ADAPTIVE AI SAFETY & GUARDRAILS SPECIFICATION v1.0

**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Status**: `IMPLEMENTED`

---

## 1. FINANCIAL SAFETY GUARDRAILS

1. **Explicit User Authorization**: No booking cancellation, ticket modification, or payment transaction can occur without an explicit `[ACCEPT CHANGE]` click by the user.
2. **Double-Booking Prevention**: Decoupled state machine (`PAYMENT_SUCCESS != BOOKING_CONFIRMED`) ensures server-side validation before updating provider reservations.
3. **Refund Integrity**: Any refund resulting from a disruption follows deterministic refund rules enforced by the financial engine.

---

## 2. DATA PROVENANCE & TRANSPARENCY

All UI components in Chalo Farva render data origin tags:
- **`AI GENERATED`**: Explanations, suggested activity replacements, or customized tips.
- **`VERIFIED PLATFORM DATA`**: POI opening hours, ticket pricing, verified travel distances.
- **`LIVE PROVIDER DATA`**: GSRTC bus schedules, hotel room availability.

---

## 3. PROMPT INJECTION & UNTRUSTED DATA DEFENSES

1. **Input Sanitization**: External provider text, weather comments, or supplier notes are sanitized before inclusion in LLM prompt templates.
2. **System Prompt Hardening**: System instructions explicitly forbid the LLM from executing financial commands or overriding deterministic rules.
3. **Structured Pydantic Validation**: All LLM outputs are parsed into strict Pydantic schemas before returning to the frontend.
