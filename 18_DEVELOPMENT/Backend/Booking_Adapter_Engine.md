# Booking Adapter Engine — Chalo Farva

## Overview
The Booking Adapter Engine abstracts third-party bus (e.g. GSRTC), hotel, and activity booking providers into standardized internal interfaces.

## Mapping Table Architecture
Provider entity associations are persisted in PostgreSQL:
```sql
CREATE TABLE provider_entity_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id),
    internal_entity_type VARCHAR(50) NOT NULL,
    internal_entity_id UUID NOT NULL,
    external_provider_entity_id VARCHAR(255) NOT NULL,
    sync_status VARCHAR(50) NOT NULL DEFAULT 'SYNCED',
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
