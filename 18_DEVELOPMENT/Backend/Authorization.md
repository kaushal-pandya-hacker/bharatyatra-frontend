# Authorization — Chalo Farva

## Role-Based Access Control (RBAC)
Supported Roles:
1. `CUSTOMER`: Access to own trips, bookings, AI planner.
2. `SUPPLIER`: Vendor portal access with strict tenant isolation (Supplier A cannot access Supplier B's data).
3. `ADMIN`: Platform administration, user management, and operational monitoring.
4. `SUPPORT`: Customer support ticket resolution.
5. `OPERATIONS`: Fulfillment tracking.
6. `FINANCE`: Settlement ledgers and refund processing.
7. `CONTENT_MANAGER`: Destination and attraction content updates.
