# CUSTOMER USER FLOWS — CHALO FARVA

## Flow 1: New User Onboarding & Registration
1. User opens App / Website $\rightarrow$ Homepage Hero.
2. Clicks "Sign In / Register" $\rightarrow$ Modal overlay.
3. Enters Mobile Number $\rightarrow$ Receives 6-digit OTP via SMS.
4. Enters OTP $\rightarrow$ Systems verifies against `/api/v1/auth/otp/verify`.
5. Prompts initial profile preferences (Language: English/Gujarati/Hindi, Food: Veg/Jain).
6. Redirects to active Homepage or AI Planner.

## Flow 2: Destination Discovery & Filter
1. User clicks "Explore Destinations" in Header / Bottom Bar.
2. Filters by Region (Kutch, Saurashtra, Central, South, North) and Category (Heritage, Wildlife, Spiritual, Beach).
3. Selects Destination Card (e.g., "Bhuj") $\rightarrow$ Navigates to `/destinations/bhuj`.
4. Views geotagged attractions, nearby hotels, recommended local food, and optimal visit duration.
5. Clicks "Plan Trip to Bhuj" $\rightarrow$ Passes destination parameter to AI Trip Planner wizard.
