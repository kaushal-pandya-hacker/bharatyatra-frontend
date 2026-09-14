# Chalo Farva Master API Overview v1.0

## 1. Overview
The Chalo Farva API is a RESTful API service communicating over HTTPS using JSON request and response payloads.

## 2. API Endpoints Map
- `POST /api/v1/auth/login`: User Authentication
- `POST /api/v1/auth/register`: Account Registration
- `GET /api/v1/destinations`: Search 24 Gujarat destinations
- `GET /api/v1/destinations/:slug`: Destination details
- `POST /api/v1/ai/generate-itinerary`: Multi-day itinerary planner
- `POST /api/v1/ai/evaluate-reroute`: Adaptive AI re-routing engine
- `POST /api/v1/bookings`: Bus, Hotel, Activity & Package bookings
- `GET /api/v1/bookings/:id`: Retrieve booking details
- `POST /api/v1/payments/checkout`: Razorpay / UPI checkout initiation
- `POST /api/v1/payments/webhook`: Payment gateway webhook receiver

## 3. OpenAPI v3 Specification Location
The complete machine-readable OpenAPI spec is stored at:
[`Chalo_Farva_API_v1.0.yaml`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/06_API/OpenAPI/Chalo_Farva_API_v1.0.yaml)
