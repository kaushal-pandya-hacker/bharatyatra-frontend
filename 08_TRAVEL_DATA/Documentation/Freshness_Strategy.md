# Freshness Strategy Specification — Chalo Farva

## Data Freshness Statuses
- `FRESH`: Verified within last 90 days.
- `NEEDS_REVIEW`: Verification age between 90 and 180 days.
- `STALE`: Unverified for > 180 days.

Stale records are flagged and hidden from high-confidence AI recommendation prompts until re-verified.
