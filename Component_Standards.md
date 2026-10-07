# COMPONENT DESIGN STANDARDS — BHARAT YATRA

1. **Accessibility Mandatory**: All interactive primitives must support `aria-label`, visible focus outline, and keyboard navigation.
2. **Prop Interface Export**: Every component file must export its props interface (e.g. `export interface ButtonProps`).
3. **Tailwind Merging**: Use `cn()` helper utility to allow seamless class overriding without CSS conflicts.
