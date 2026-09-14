# Booking Engine Architecture — Chalo Farva

## 1. Unified Multi-Vendor Booking Flow
Chalo Farva aggregates disparate travel services (Buses, Hotels, Packages, Activities) into a unified checkout transaction.

## 2. Supplier Adapter Model
- **Bus Booking Adapter**: Interfaces with GSRTC & private bus APIs for seat maps, ticket reservation, and cancellation.
- **Hotel Booking Adapter**: Interfaces with hotel channel managers for real-time room availability and pricing.
- **Provider Entity Mappings**: Maintains foreign mapping keys in database to ensure two-way sync stability.
