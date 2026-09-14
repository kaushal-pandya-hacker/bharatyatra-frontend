# Incident Postmortems — Chalo Farva v1.1

**Incident Summary Log**:
- **Total P0 / P1 Incidents**: 0
- **Total P2 Incidents**: 1 (Resolved)
  - **INC-2026-09-08**: Temporary bus provider API response delay (3.2s latency spike).
  - **Root Cause**: Third-party bus aggregator server load during Sunday peak travel window.
  - **Resolution**: Enabled 1.5s local cache fallback and increased timeout buffer. Zero customer booking failures occurred.
