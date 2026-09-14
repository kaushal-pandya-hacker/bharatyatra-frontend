# AI TRIP PLANNER USER FLOW — CHALO FARVA

## 5-Step Conversational & Structured Wizard

```text
STEP 1: "Where do you want to go?"
  └── Inputs: Search city/circuit (e.g. Kutch Rann Utsav / Sasan Gir) or select "Surprise Me (Gujarat)".

STEP 2: "When are you travelling?"
  └── Inputs: Start Date & End Date picker, or quick options ("This Weekend", "3 Days in Nov").

STEP 3: "Who is travelling?"
  └── Inputs: Companion selector (Solo, Couple, Family with Kids, Group of Friends).

STEP 4: "What do you enjoy?"
  └── Inputs: Multi-select chips (Heritage, Wildlife, Spiritual, Beach, Food & Thali, Handicrafts).

STEP 5: "What's your approximate budget?"
  └── Inputs: Slider / Category selector (Budget: < ₹10k, Mid-Range: ₹10k-₹25k, Luxury: > ₹25k).
```

### Action: Click "GENERATE MY TRIP"
- UI displays skeleton loading state with micro-animation text: *"Consulting verified Gujarat travel catalog & calculating optimal routes..."*
- Redirects to generated dynamic itinerary view at `/trips/{id}`.
