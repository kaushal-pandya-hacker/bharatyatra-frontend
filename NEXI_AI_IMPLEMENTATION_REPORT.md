# NEXI AI Customer Support Implementation Report

**Document Version:** 1.0.0  
**Project:** BharatYatra NEXI AI Customer Support Upgrade  
**Target System:** `18_DEVELOPMENT/Backend` (NestJS)  
**Date:** October 21, 2026  
**Status:** Verification Passed (33/33 Tests Passing)  

---

## 1. Executive Summary

This engineering effort upgraded the BharatYatra NEXI chatbot from a purely static, hardcoded rule engine into an enterprise-grade, multilingual AI customer-support system equipped with:
1. **Server-Side LLM Integration (`NexiGeminiProvider`)**: Direct, zero-dependency REST integration with Google Gemini (`gemini-1.5-flash`), with bounded token budgets, 7-second timeouts, sliding-window rate limiting, and seamless offline fallbacks.
2. **Verified Knowledge Retrieval (`NexiKnowledgeService`)**: Versioned, dated, source-referenced policy grounding covering GSRTC/private bus cancellations, HotelBeds hotel policies, IRCTC train rules, payment double-debit reconciliation SLAs, luggage/boarding guidelines, and verified Gujarat landmark facts.
3. **Four-Tier Security & Privacy Architecture**:
   - Financial air-gap (payment execution attempts strictly blocked and redirected to `/checkout`).
   - Prompt injection defense (blocks override attempts and protects internal tokens).
   - Admin panel access isolation.
   - Cross-user booking authorization guards (prevents IDOR attacks on booking references).
4. **Resilient Multilingual Support**: Gujarati, Hindi, English, and Hinglish transliterations.
5. **Human Escalation Preservation**: Generates tracked `OperationalTask` tickets (`TKT-2026-XXXXXX`) with 2-4 hour response SLAs.

---

## 2. Inventory of Modified & Created Files

| File Path | Action | Description |
| :--- | :--- | :--- |
| `18_DEVELOPMENT/Backend/src/nexi/knowledge/nexi-knowledge.service.ts` | **Created** | Ingestion & retrieval engine for versioned policies and destination facts with provenance badges. |
| `18_DEVELOPMENT/Backend/src/nexi/knowledge/nexi-knowledge.service.spec.ts` | **Created** | Unit test suite (6 tests) covering policy retrieval, passage formatting, and supplier distinction. |
| `18_DEVELOPMENT/Backend/src/nexi/llm/nexi-gemini.provider.ts` | **Created** | Server-side Gemini adapter with rate limiting (20 req/min), timeouts (7000ms), system prompt loading, and fallback. |
| `18_DEVELOPMENT/Backend/src/nexi/llm/nexi-gemini.provider.spec.ts` | **Created** | Unit test suite (5 tests) covering mocking, token limits, rate limiting, and network timeout handling. |
| `18_DEVELOPMENT/Backend/src/nexi/nexi.service.ts` | **Updated** | Integrated knowledge grounding, Gemini LLM calls, cross-user booking ID authorization checks, and deterministic fallbacks. |
| `18_DEVELOPMENT/Backend/src/nexi/nexi.module.ts` | **Updated** | Registered `NexiKnowledgeService` and `NexiGeminiProvider` in NestJS dependency injection. |
| `18_DEVELOPMENT/Backend/src/nexi/nexi.service.spec.ts` | **Updated** | Expanded unit test suite (22 tests) covering cross-user authorization guards, grounded AI responses, and provider outage fallback. |
| `07_AI/System_Instructions/NEXI_CUSTOMER_SUPPORT_AI.md` | **Registered** | Official 12-section system prompt governing identity, tone, source-of-truth priority, and safety limits. |

---

## 3. Architecture & Data Flow

```
[Customer Browser / App]
         │
         ▼
[Frontend: NexiChatFloating.tsx]
         │  (POST /api/v1/nexi/chat)
         ▼
[NestJS: NexiController.chat] (OptionalJwtAuthGuard)
         │
         ▼
[NexiService.processChatMessage]
         ├── 1. Language Detection (gu, hi, en, Hinglish)
         ├── 2. Security Firewall 1: Payment Hard-Block (Redirect to /checkout)
         ├── 3. Security Firewall 2: Admin Panel Access Isolation
         ├── 4. Security Firewall 3: Prompt Injection / System Override Block
         ├── 5. Security Firewall 4: Cross-User Booking ID Ownership Guard
         │
         ├── 6. High-Priority Operational Routing:
         │      ├── Human Escalation -> Logs OperationalTask (TKT-2026-XXXXXX)
         │      ├── Payment Reconciliation -> Verifies status in DB, warns NOT to pay again
         │      ├── Refund Workflow -> Evaluates supplier cancellation policy & quote
         │      └── Trip Modification -> Updates itinerary version
         │
         └── 7. Dynamic Inquiry Resolution:
                ├── NexiKnowledgeService.retrieveRelevantKnowledge(query)
                │      └── Inverted token matching over versioned policies
                ├── NexiGeminiProvider.generateCustomerSupportReply()
                │      ├── Rate limit check (20 calls/min)
                │      ├── System instructions loaded from 07_AI
                │      └── Gemini 1.5 Flash REST API (timeout: 7000ms)
                └── Resilience Fallback:
                       └── If Gemini is unavailable, returns verified deterministic templates
```

---

## 4. Environment Variables Configuration

| Variable | Default Value | Server/Client | Purpose |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | *(Set in server `.env`)* | **Server-Only** | Google Generative AI API credential. Never exposed to browser or client bundles. |
| `GEMINI_MODEL` | `gemini-1.5-flash` | **Server-Only** | Configurable LLM model identifier (supports `gemini-1.5-pro`, `gemini-1.5-flash`, etc.). |
| `AI_TIMEOUT_MS` | `7000` | **Server-Only** | Request timeout in milliseconds before triggering graceful fallback. |
| `AI_MAX_TOKENS` | `600` | **Server-Only** | Maximum output generation token budget to prevent verbosity and manage costs. |
| `DATABASE_URL` | `postgresql://...` | **Server-Only** | PostgreSQL connection string for Prisma ORM. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` | **Client & Server** | Backend base URL for chat and operational endpoints. |

---

## 5. Security & Privacy Safeguards

1. **Financial Air-Gap**: Chatbot is prevented by code from executing payments, collecting CVVs, or prompting for UPI PINs. Any query containing payment execution phrasing is intercepted and provided with a deep-link to BharatYatra's verified payment gateway.
2. **Cross-User Data Protection (IDOR Prevention)**: Customer-provided booking references (`BK-`, `BUS-`, `HTL-`, `TRN-`, `ORD-`) are validated against database ownership (`booking.userId === session.userId`). Queries for unauthorized bookings return an explicit 403 authorization boundary message.
3. **Prompt Injection & Secret Masking**: Queries instructing NEXI to *"ignore previous instructions"* or *"system override"* are blocked before reaching any LLM. API keys and system prompts are never returned in responses.
4. **Input & History Bounding**: Customer inputs are bounded to 1,000 characters. Conversation context passed to LLM is capped at the last 6 messages (3 conversation turns) to eliminate prompt injection via context stuffing.

---

## 6. Automated Test Verification Results

All tests run via Jest in `18_DEVELOPMENT/Backend`:

```
PASS src/nexi/knowledge/nexi-knowledge.service.spec.ts (6 tests)
  NexiKnowledgeService
    √ should initialize with verified documents (3 ms)
    √ should retrieve bus cancellation policy for bus refund query
    √ should retrieve hotel cancellation policy for hotel booking query
    √ should retrieve payment reconciliation policy for deducted money query (1 ms)
    √ should format grounding passages for LLM with version and source
    √ should return safe message when query is empty (1 ms)

PASS src/nexi/llm/nexi-gemini.provider.spec.ts (5 tests)
  NexiGeminiProvider Unit Tests
    √ should be defined and initialize with default model (5 ms)
    √ should fall back gracefully when API key is missing (2 ms)
    √ should call Gemini endpoint with structured prompt and return response (1 ms)
    √ should handle timeout or fetch network error with fallback (1 ms)
    √ should enforce sliding-window rate limit after 20 rapid calls (1 ms)

PASS src/nexi/nexi.service.spec.ts (22 tests)
  NexiService Unit, Security & Customer Support Tests
    √ should be defined
    √ should build user context for authenticated user
    √ HUMAN ESCALATION: should log support ticket for "talk to support team"
    √ ACCOUNT SUPPORT: should provide password reset guidance for "forgot password"
    √ LUGGAGE POLICY: should provide luggage guidelines for "baggage policy for bus"
    √ PAYMENT RECOVERY: should handle "hi paid the money for bus but this is not conform"
    √ PAYMENT RECOVERY: should handle "payment issues" query
    √ REFUND WORKFLOW: should process "i want the refund" and evaluate eligibility
    √ REFUND WORKFLOW: should handle already REFUNDED booking
    √ PAYMENT RECOVERY: should warn user NOT to pay again when payment is pending verification
    √ MULTILINGUAL PAYMENT RECOVERY: should respond in Gujarati for "Mara paisa kapai gaya pan ticket nathi aavi"
    √ GUEST CHAT ACCESS: should process message gracefully for guest users (null userId)
    √ PAYMENT HARD BLOCK: should refuse payment execution request and redirect to secure payment UI
    √ ADMIN HARD BLOCK: should refuse admin panel requests via customer NEXI AI
    √ should answer upcoming trip query from real user context
    √ should answer booking query from real user context
    √ MULTILINGUAL: should respond in Gujarati when user asks in Gujarati
    √ MULTILINGUAL: should respond in Hindi when user asks in Hindi
    √ TRIP MODIFY: should process conversational modification instructions
    √ CROSS-USER AUTHORIZATION GUARD: should deny inspection of another user's booking reference
    √ GROUNDED AI GENERATION: should return Gemini response when available
    √ AI TIMEOUT / OUTAGE FALLBACK: should fallback gracefully when Gemini is down

Test Suites: 3 passed, 3 total
Tests:       33 passed, 33 total
Snapshots:   0 total
Time:        7.292 s
```

---

## 7. Production Build Verification

The NestJS backend was compiled using `npm run build`:
- Compiler: `@nestjs/cli` + TypeScript 5.4.5
- Destination: `18_DEVELOPMENT/Backend/dist`
- Status: **0 compile errors, 0 type errors, clean build**.
- Live Daemon Verification: Running on `http://localhost:4000/api/v1` with verified HTTP 200 OK responses.

---

## 8. Known Limitations & Unverified Capabilities

1. **pgvector PostgreSQL Extension (Unverified / Not Enabled)**:  
   The active PostgreSQL datasource in `schema.prisma` does not declare `postgresqlExtensions` or pgvector. To maintain zero environment disruption, knowledge retrieval is currently performed via the in-process hybrid search service (`NexiKnowledgeService`).
2. **Python AI Trip Planner Microservice (Offline)**:  
   The secondary Python microservice at port 8001 remains offline on disk. All NEXI chat operations have been made completely independent of this microservice.
3. **Live External Supplier Booking Modification**:  
   Live GSRTC ticket cancellation via third-party webhooks is currently mock/database-driven. Real-time cancellation requests create `OperationalTask` tickets for manual review when the automated refund rule requires manual operator sign-off.
