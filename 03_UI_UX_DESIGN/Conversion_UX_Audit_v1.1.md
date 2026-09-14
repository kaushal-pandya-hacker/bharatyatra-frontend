# Conversion UX Audit v1.1 — Chalo Farva

**UI/UX Friction Analysis Across Customer Journey**  

---

## Screen Audit & Recommendations

1. **AI Planner Output Screen**:
   - *Friction*: Accept button required 2 taps inside a modal on mobile viewports.
   - *Fix (`EXP-001`)*: Introduced sticky 1-click "Accept & Continue to Checkout" bar at screen bottom.

2. **Checkout Screen**:
   - *Friction*: Order summary did not clearly separate taxes from platform fees on mobile.
   - *Fix (`EXP-003`)*: Added itemized budget summary modal displaying Stay, Transport, Taxes, and Fees transparently.

3. **Adaptive AI Alert Overlay**:
   - *Friction*: Full-screen modal interrupted trip navigation.
   - *Fix (`EXP-002`)*: Replaced full modal with interactive glassmorphic toast displaying 1-tap reroute options.
