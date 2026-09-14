# Unit Economics Model v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.25.0  
**Date**: September 13, 2026  
**Author**: FinOps Architect & Lead Data Analyst  

---

## 1. Executive Summary & Financial Definitions

This document details the unit economics per booking and per user on Chalo Farva.

### Core Definitions
- **Gross Merchandise Value (GMV)**: Total customer checkout transaction value including taxes and fees.
- **Net Platform Revenue**: $\text{Commission Revenue} + \text{Platform Fee} - \text{Discounts}$.
- **Contribution Margin ($CM$)**: $\text{Net Platform Revenue} - \text{Variable Gateway Cost} - \text{AI Token Cost} - \text{Notification Cost}$.

---

## 2. Unit Economics Breakdown (Per Average Booking)

```
Average Order Value (AOV / GMV):                   ₹12,450.00
─────────────────────────────────────────────────────────────
  ├── Supplier Payable (85.5%):                    ₹10,644.75
  ├── Platform Gross Revenue (14.5% Commission):    ₹1,805.25
  │     ├── Payment Gateway Fee (1.2%):              -₹149.40
  │     ├── AI Token Cost per Itinerary:               -₹1.45
  │     ├── SMS / WhatsApp Alert Cost:                 -₹0.42
  │     └── Server Compute Variable Cost:              -₹1.85
  ───────────────────────────────────────────────────────────
  └── NET CONTRIBUTION MARGIN (CM):                 ₹1,652.13 (13.27% of GMV)
```

---

## 3. Customer Lifetime Value (LTV) Model

- **Average Customer Lifespan**: 24 months (estimated).
- **Average Bookings per User per Year**: 2.4 bookings.
- **Annual Contribution Margin per User**: $2.4 \times ₹1,652.13 = \mathbf{₹3,965.11}$.
- **Estimated 2-Year LTV**: **₹7,930.22** per active user.
