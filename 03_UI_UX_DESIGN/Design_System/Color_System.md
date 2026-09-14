# COLOR SYSTEM SPECIFICATION — CHALO FARVA

**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## 1. Brand Palette Tokens

```css
:root {
  /* Brand Core Colors */
  --color-brand-primary: #FF6B35;       /* Rann Sunset Orange - Primary CTAs & Highlights */
  --color-brand-primary-hover: #E05522;
  --color-brand-secondary: #008080;     /* Gir Royal Teal - Verified Badges & Secondary Accents */
  --color-brand-secondary-hover: #006666;
  --color-brand-dark: #0A192F;          /* Somnath Deep Navy - Dark Mode Surfaces & Headers */
  --color-brand-light: #F4F1EA;         /* Kutch Soft Sand - Light Mode Background */
  --color-brand-gold: #FFC107;          /* Saurashtra Gold - Ratings & Special Highlights */

  /* Neutral Surface & Background Tokens */
  --color-bg-light: #FFFFFF;
  --color-bg-subtle: #F8F9FA;
  --color-bg-dark: #0A192F;
  --color-surface-glass-light: rgba(255, 255, 255, 0.75);
  --color-surface-glass-dark: rgba(10, 25, 47, 0.85);

  /* Typography Text Tokens */
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #94A3B8;
  --color-text-on-dark: #F8FAFC;

  /* Semantic Feedback Tokens */
  --color-success: #10B981;             /* Confirmed Booking / Approved Decision */
  --color-warning: #F59E0B;             /* Weather Warning / Delay Alert */
  --color-error: #EF4444;               /* Payment Failure / Cancellation */
  --color-info: #3B82F6;                /* AI Suggestion Pill */
}
```

---

## 2. Provenance Badge Color Map

- `[Verified Data]`: Background `rgba(0, 128, 128, 0.12)`, Text `#008080`, Border `#008080`
- `[Live Provider Availability]`: Background `rgba(16, 185, 129, 0.12)`, Text `#10B981`, Border `#10B981`
- `[AI Recommendation]`: Background `rgba(255, 107, 53, 0.12)`, Text `#FF6B35`, Border `#FF6B35`
