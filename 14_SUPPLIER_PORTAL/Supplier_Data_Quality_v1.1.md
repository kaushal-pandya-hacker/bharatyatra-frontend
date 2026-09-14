# Supplier Data Quality v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.23.0  
**Date**: September 13, 2026  

---

## 1. Overview & Data Sanitization Rules

This document specifies automated data quality validation rules enforced on all supplier-provided metadata, inventory listings, amenities, operating hours, and location coordinates.

---

## 2. Automated Validation Rules Matrix

| Data Field | Validation Rule / Check | Error Handling Action |
|---|---|---|
| **Geographic Coordinates** | `latitude` $\in [20.0, 24.8]$ (Gujarat bounds) & `longitude` $\in [68.1, 74.5]$ | Rejects invalid coordinates; blocks listing. |
| **Business Name & Title** | Min 3 chars, max 100 chars, no HTML/script tags | Sanitizes HTML tags; caps length. |
| **GSTIN Number** | 15-character alphanumeric regex (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`) | Hard validation error on onboarding form. |
| **Contact Phone Number** | 10-digit Indian mobile number (`^[6-9]\d{9}$`) | Requires OTP verification before saving. |
| **Operating Hours** | Valid `HH:MM` format; opening time < closing time | Rejects invalid time ranges. |
| **Room / Seat Pricing** | Positive integer in paise ($>0$); maximum threshold cap | Blocks negative or ₹0 prices. |
| **Property Images** | JPEG/PNG/WebP, min $1024 \times 768$ px, max 10MB file size | Resizes & optimizes via CDN pipeline. |

---

## 3. Data Freshness & Stale Inventory Policy

- **Freshness Window**: Inventory & pricing must be updated or re-confirmed every 7 days.
- **Stale Listing Warning**: Listings not updated within 7 days receive a `STALE_DATA_WARNING` tag. If un-updated for 14 days, live listing is suspended until re-verified.
