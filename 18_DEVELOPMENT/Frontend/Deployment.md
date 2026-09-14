# DEPLOYMENT & CI/CD SPECIFICATION — CHALO FARVA

1. **Deployment Target**: Vercel / AWS Amplify / Docker Containerized Node.js.
2. **CI/CD Pipeline Stages**:
   - Stage 1: `npm run lint` & `npm run type-check`
   - Stage 2: Unit component tests
   - Stage 3: Next.js production build (`npm run build`)
   - Stage 4: Deployment to Staging / Production
