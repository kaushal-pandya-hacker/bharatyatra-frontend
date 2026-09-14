# Marketplace Commission & Commercials Engine v1.0

## 1. Commercial Structure
Platform earns revenue via category-based marketplace commission:
- **Hotels**: 12% percentage commission.
- **Buses (GSRTC/Private)**: 8% percentage commission.
- **Activities & Tours**: 15% percentage commission.
- **Restaurants**: 10% percentage commission.

## 2. Payout Formula
$$\text{PlatformCommission} = \text{GrossValue} \times \text{CommissionRate}$$
$$\text{TaxOnCommission} = \text{PlatformCommission} \times 0.18 \quad (\text{GST 18\%})$$
$$\text{NetSupplierPayout} = \text{GrossValue} - \text{PlatformCommission} - \text{TaxOnCommission}$$
