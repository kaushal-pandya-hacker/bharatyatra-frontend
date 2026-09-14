# Standardized Event Taxonomy Specification v1.1 — Chalo Farva

All event names strictly follow the **`OBJECT_ACTION`** uppercase format.

---

## 1. Event Taxonomy Catalog (50 Standardized Events)

### Account Domain
1. `USER_REGISTERED`: Customer account registered.
2. `LOGIN_SUCCESS`: Successful authentication.
3. `LOGIN_FAILED`: Failed login attempt.
4. `LOGOUT`: User logged out.
5. `PROFILE_UPDATED`: User profile or preference updated.

### Discovery Domain
6. `HOME_VIEWED`: Homepage landing rendered.
7. `DESTINATION_VIEWED`: Individual Gujarat destination hub page viewed.
8. `DESTINATION_SEARCHED`: Destination query executed.
9. `SEARCH_STARTED`: Search bar focused / query initiated.
10. `SEARCH_COMPLETED`: Search results returned.
11. `SEARCH_FILTER_APPLIED`: Search filter updated (budget, dates, category).
12. `SEARCH_SORT_CHANGED`: Search sort criteria modified.

### AI Domain
13. `AI_PLANNER_STARTED`: AI trip planner interface opened.
14. `AI_PLANNER_SUBMITTED`: Traveler prompt submitted to AI microservice.
15. `AI_ITINERARY_GENERATED`: AI itinerary successfully synthesized.
16. `AI_ITINERARY_VIEWED`: Generated itinerary opened.
17. `AI_ITINERARY_EDITED`: User manually modified itinerary item.
18. `AI_ITINERARY_REGENERATED`: User requested full itinerary re-synthesis.
19. `AI_ITINERARY_ACCEPTED`: User accepted itinerary.
20. `AI_ITINERARY_REJECTED`: User rejected itinerary.

### Trip Domain
21. `TRIP_CREATED`: Trip record initialized in database.
22. `TRIP_UPDATED`: Trip details modified.
23. `TRIP_SAVED`: Trip saved to user account.
24. `TRIP_SHARED`: Trip share link or PDF generated.
25. `TRIP_COMPLETED`: Traveler completed trip.
26. `TRIP_CANCELLED`: Trip cancelled by traveler.

### Hotel Domain
27. `HOTEL_SEARCH_STARTED`: Hotel availability search query launched.
28. `HOTEL_SEARCH_COMPLETED`: Hotel search results loaded.
29. `HOTEL_VIEWED`: Hotel detail modal/page viewed.
30. `HOTEL_SELECTED`: Hotel room option selected for checkout.

### Bus Domain
31. `BUS_SEARCH_STARTED`: Bus seat search query launched.
32. `BUS_SEARCH_COMPLETED`: Bus search results returned.
33. `BUS_VIEWED`: Bus operator & seat layout viewed.
34. `BUS_SELECTED`: Bus seat option selected for checkout.

### Checkout Domain
35. `CHECKOUT_STARTED`: Checkout flow initiated.
36. `CHECKOUT_VIEWED`: Order summary page viewed.
37. `CHECKOUT_ABANDONED`: User navigated away from checkout.

### Payment Domain
38. `PAYMENT_STARTED`: Razorpay payment modal rendered.
39. `PAYMENT_SUCCESS`: Payment captured successfully (Authoritative).
40. `PAYMENT_FAILED`: Payment attempt failed.
41. `PAYMENT_VERIFICATION_FAILED`: HMAC signature verification failed.

### Booking Domain
42. `BOOKING_REQUESTED`: Vendor reservation API call initiated.
43. `BOOKING_PENDING`: Vendor reservation waiting confirmation.
44. `BOOKING_CONFIRMED`: Vendor confirmation received (Authoritative).
45. `BOOKING_FAILED`: Vendor confirmation failed.
46. `BOOKING_CANCEL_REQUESTED`: Traveler requested booking cancellation.
47. `BOOKING_CANCELLED`: Booking status updated to cancelled.

### Refunds Domain
48. `REFUND_REQUESTED`: Refund workflow initiated.
49. `REFUND_PENDING`: Refund processing via gateway.
50. `REFUND_COMPLETED`: Gateway refund completed & ledger balanced.
