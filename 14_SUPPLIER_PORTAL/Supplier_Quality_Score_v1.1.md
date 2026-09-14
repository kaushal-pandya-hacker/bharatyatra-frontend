# Supplier Quality Score Specification v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.23.0  
**Date**: September 13, 2026  

---

## 1. Overview & Quality Scoring Philosophy

The Chalo Farva **Supplier Quality Score ($SQS$)** is a transparent, objective 0–100 index evaluated weekly for every onboarded supplier.

The score determines search ranking boost, badge eligibility (`VERIFIED_PREMIUM`), and admin review triggers.

---

## 2. Deterministic Quality Score Formula

$$SQS = \sum_{i=1}^{6} (W_i \times M_i)$$

| Metric ($i$) | Dimension Name | Weight ($W_i$) | Minimum Threshold | Scoring Calculation Logic |
|---|---|---|---|---|
| 1 | **Booking Success Rate ($M_1$)** | 0.35 | $\ge 95.0\%$ | $\frac{N_{\text{confirmed\_bookings}}}{N_{\text{attempted\_bookings}}} \times 100$ |
| 2 | **Availability Accuracy ($M_2$)** | 0.25 | $\ge 98.0\%$ | $100 - (20 \times N_{\text{out\_of\_stock\_failures}})$ |
| 3 | **Price Accuracy ($M_3$)** | 0.15 | $100.0\%$ | 0 points if price mismatch occurs during checkout; 100 otherwise. |
| 4 | **Low Cancellation Rate ($M_4$)** | 0.10 | $\le 2.0\%$ | $\max\left(0, 100 - (500 \times \text{Cancellation Rate})\right)$ |
| 5 | **Low Customer Complaints ($M_5$)** | 0.10 | $\le 1.0\%$ | $\max\left(0, 100 - (1000 \times \text{Complaint Rate})\right)$ |
| 6 | **Fast Support Response ($M_6$)** | 0.05 | $< 2.0 \text{ hrs}$ | $\min\left(100, \frac{120}{\text{Mean Response Mins}} \times 100\right)$ |

---

## 3. Sample Size & Confidence Thresholds

> [!IMPORTANT]
> **Sample Size Guard**: Suppliers with fewer than 10 completed bookings in a evaluation window are assigned a default neutral score of **80.0** with a `LOW_CONFIDENCE` tag to prevent statistical bias.

---

## 4. Quality Score Tiering

- **Tier 1 (Premium Verified)**: $SQS \ge 90.0$ | Receives search boost (+15%) and "Top Rated" badge.
- **Tier 2 (Standard Verified)**: $75.0 \le SQS < 90.0$ | Normal search placement.
- **Tier 3 (Under Watch)**: $60.0 \le SQS < 75.0$ | Search penalty (-20%); operational warning issued.
- **Tier 4 (Suspended)**: $SQS < 60.0$ | Automated suspension review triggered.
