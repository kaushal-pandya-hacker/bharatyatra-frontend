# Itinerary UX Optimization v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.21.0  
**Date**: September 13, 2026  

---

## 1. Overview & UX Vision

The Itinerary UX Optimization v1.1 improves how travel plans are presented, customized, and confirmed on Chalo Farva across mobile, tablet, and desktop devices.

The design priority is **Clarity, Visual Elegance, and Effortless Editing** without visual clutter or horizontal scroll overflows.

---

## 2. Key Interface Components & Enhancements

```
+-------------------------------------------------------------------+
|  [Day 1]  [Day 2]  [Day 3]  | Pace: BALANCED | Budget: ₹24,500   |
+-------------------------------------------------------------------+
| 08:30 - Departure from Ahmedabad Hub                              |
|   ├── Transit: 1h 45m via Private Cab                             |
|                                                                   |
| 10:15 - Adalaj Stepwell Sightseeing                               |
|   ├── Recommended Stay: 1h 30m | Entry: ₹25 (VERIFIED)          |
|   └── [Swap Activity]  [Remove]                                   |
|                                                                   |
| 12:30 - Lunch at Agashiye (Gujarati Thali)                       |
|   └── Estimated Cost: ₹900/person (ESTIMATE)                      |
+-------------------------------------------------------------------+
| Map Preview | Live Weather: 29°C Sunny | 1-Click Accept Itinerary CTA|
+-------------------------------------------------------------------+
```

### 2.1 Timeline & Day Navigation
- **Top Day Switcher**: Clean segmented control allowing instant switching between Day 1, Day 2, etc.
- **Micro-Animations**: Smooth fade-in transitions when switching days or expanding activity detail cards.
- **Provenience Badges**: Visual pill indicators clearly labeling data source (`VERIFIED`, `LIVE PRICE`, `ESTIMATE`, `AI SUGGESTION`).

### 2.2 Inline Editing & Activity Swap
- **Targeted Regeneration Controls**: Every item features lightweight `[Swap]` and `[Remove]` buttons.
- **Instant Replacement Modal**: Displays top 3 contextually filtered alternatives satisfying timing and budget limits.

### 2.3 Transparent Budget Breakdown
- **Visual Breakdown Card**: Interactive accordion detailing Stay, Transit, Tickets, Food, Taxes, and Platform Fee in clear integer amounts.
- **Live vs Estimated Toggle**: Clear distinction preventing pricing surprises during checkout.

---

## 3. Responsive & Mobile Optimization

- **Mobile Viewports (375px – 430px)**: Vertical stack layout with sticky bottom bar containing total price and **Accept & Book Itinerary** button.
- **Touch Targets**: All interactive elements (Day tabs, Swap buttons, Expand toggles) have minimum $44 \times 44 \text{ px}$ hit areas.
- **Zero Horizontal Overflow**: All flex containers wrap cleanly with dynamic padding.

---

## 4. Accessibility (WCAG 2.1 AA)

- Contrast ratio $\ge 4.5:1$ for all text elements against dark/light background tokens.
- Full keyboard tab navigation support for interactive timeline items.
- Screen reader ARIA tags (`aria-label`, `aria-expanded`, `role="tablist"`).
