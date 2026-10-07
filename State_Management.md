# STATE MANAGEMENT ARCHITECTURE — BHARAT YATRA

1. **Server State**: Managed via Next.js Server Components and fetch caching / revalidation tags.
2. **Client State**: Scoped locally to React component state (`useState`, `useReducer`) for wizard steps, modal visibility, and seat selection.
3. **Global UI State**: Lightweight React Context / Zustand for active user session and shopping cart basket.
