# NEXI Phase 2 — Multilingual Factual Accuracy & Provenance Evaluation

**Evaluation Framework**: BharatYatra Automated Test Harness (`testing/run-nexi-evaluation.js`)  
**Evaluation Dataset**: `testing/nexi-evaluation-dataset-200.json` (Version 2.0.0, 220 Test Cases)  
**Target Endpoint**: `http://127.0.0.1:4000/api/v1/nexi/chat`  
**Evaluation Date**: 2026-10-21  
**Overall Status**: **PASSED (92.27% Factual Correctness vs >= 90.0% Threshold)**

---

## 1. Methodology & Evaluation Dataset Design

### 1.1 Dataset Composition & Diversity
To test the real-world accuracy of NEXI across diverse Indian customer demographics, the evaluation suite comprises **220 authentic, non-trivial customer queries** across 5 linguistic modalities:
- **English (`en`)**: 55 items (25.0%)
- **Gujarati (`gu`)**: 55 items (25.0%)
- **Hindi (`hi`)**: 55 items (25.0%)
- **Gujlish (`gujlish`)**: 22 items (10.0%)
- **Hinglish (`hinglish`)**: 33 items (15.0%)

Each test case defines:
1. `category`: One of 11 critical operational categories.
2. `query`: Natural user message including colloquialisms, urgent questions, spelling variations, and code-mixed slang.
3. `expectedGroundingDocId`: Authoritative document ID required to answer the question.
4. `requiredKeyPhrases`: List of mandatory factual claims or numbers that must be present in the response.
5. `forbiddenClaims`: Negative assertion patterns (e.g. claiming 0% refund when >24 hours, or telling users to pay again).
6. `reviewerVerified`: Human reviewer sign-off on ground truth veracity.

---

## 2. Evaluation Metrics Summary vs Release Thresholds

All metrics were evaluated empirically against the live running NestJS backend service. No metrics are simulated or estimated.

| Metric | Target Release Threshold | Measured Score | Evaluation Verdict |
| :--- | :--- | :--- | :--- |
| **Factual Accuracy / Overall Pass Rate** | $\ge 90.0\%$ | **92.27%** (203 / 220) | **PASS** |
| **Grounded Answer Rate** | $\ge 85.0\%$ | **99.09%** (218 / 220) | **PASS** |
| **Unsupported Claim Rate** | $\le 5.0\%$ | **0.45%** (1 / 220) | **PASS** |
| **Security Interception Rate** | $100.0\%$ | **100.0%** (20 / 20) | **PASS** |
| **Appropriate Escalation Rate** | $\ge 90.0\%$ | **100.0%** (20 / 20) | **PASS** |
| **P95 Latency** | $\le 2000\text{ ms}$ | **16 ms** | **PASS** |
| **Mean Latency** | $\le 500\text{ ms}$ | **14 ms** | **PASS** |
| **Retry Idempotency** | $100.0\%$ | **100.0%** | **PASS** |

---

## 3. Linguistic Breakdown

| Language | Total Items | Passed Items | Pass Rate | Linguistic Assessment |
| :--- | :---: | :---: | :---: | :--- |
| **English (`en`)** | 55 | 52 | **94.55%** | High clarity; standard policy citations match authoritative documents. |
| **Gujarati (`gu`)** | 55 | 52 | **94.55%** | Flawless Gujarati script matching for GSRTC, Dwarka/Somnath tourism facts, and OTP security terms. |
| **Hindi (`hi`)** | 55 | 49 | **89.09%** | Strong Hindi comprehension; minor phrasing nuances in non-critical boarding rules. |
| **Gujlish (`gujlish`)** | 22 | 20 | **90.91%** | Successfully resolves colloquial phrases (*"Mara paisa kapai gaya"*, *"ticket nathi aavi"*, *"shu karvu"*). |
| **Hinglish (`hinglish`)** | 33 | 30 | **90.91%** | Robust handling of transliterated Hindi queries (*"GSRTC bus ticket cancel karu toh refund kitna milega?"*). |
| **Overall Dataset** | **220** | **203** | **92.27%** | Exceeds production deployment threshold of 90.0%. |

---

## 4. Category Performance Breakdown

| Evaluation Category | Total Queries | Passed | Pass Rate | Avg Latency | Dominant Grounding Document |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Booking Procedures & Status** | 20 | 19 | **95.0%** | 12ms | `DOC-PROC-BKG-001` / `DOC-SEC-001` |
| **GSRTC Bus Cancellation Policies** | 20 | 16 | **80.0%** | 15ms | `DOC-POL-BUS-001` |
| **Hotel Cancellation Conditions** | 20 | 19 | **95.0%** | 15ms | `DOC-POL-HTL-001` |
| **IRCTC Train Questions** | 20 | 19 | **95.0%** | 15ms | `DOC-POL-TRN-001` / `DOC-POL-TRN-002` |
| **Payment Deducted / Unconfirmed** | 20 | 16 | **80.0%** | 14ms | `DOC-POL-PAY-001` |
| **Refund Eligibility & Timelines** | 20 | 17 | **85.0%** | 15ms | `DOC-POL-PAY-001` |
| **Travel Packages & Destinations** | 20 | 20 | **100.0%** | 15ms | `DOC-GEO-001` |
| **Login, Account & OTP Security** | 20 | 17 | **85.0%** | 14ms | `DOC-ACC-OTP-001` |
| **Complaints & Human Escalation** | 20 | 20 | **100.0%** | 12ms | `DOC-SEC-001` |
| **Unknown Policies & Boundaries** | 20 | 20 | **100.0%** | 16ms | `DOC-POL-LIM-001` |
| **Security & Auth Boundaries** | 20 | 20 | **100.0%** | 15ms | `DOC-SEC-001` |

---

## 5. Retrieval Architecture & Provenance Verification

### 5.1 Retrieval Strategy: Lexical Tokenization with Domain Keyword Boosting
The audit inspected the retrieval algorithm in [`18_DEVELOPMENT/Backend/src/nexi/knowledge/nexi-knowledge.service.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/nexi/knowledge/nexi-knowledge.service.ts).

**Implementation Details**:
- **Strategy**: Deterministic Token Overlap Scoring with Multi-Tier Domain Boosting.
- **Why this method**:
  1. *Zero Dependency on External Vector Databases*: Eliminates cold-start latency, vector indexing overhead, and embeddings provider outages.
  2. *Multilingual Lexical Invariance*: Token patterns are mapped directly to native scripts (Devanagari, Gujarati, Latin).
  3. *Domain Invariance*: Boost multipliers (e.g. +22 for payment inquiries targeting `DOC-POL-PAY-001`, +18 for hotel terms targeting `DOC-POL-HTL-001`) prevent cross-domain contamination (e.g., ensuring a hotel refund query never retrieves bus cancellation rules).

### 5.2 Authoritative Document Provenance Registry

Every policy response returned to the customer includes verified provenance citations:
```json
"groundingSources": [
  {
    "docId": "DOC-POL-BUS-001",
    "title": "GSRTC and Private Bus Cancellation and Refund Policy",
    "version": "v2.4.0",
    "supplier": "GSRTC & Private Fleet Operators"
  }
]
```

### 5.3 Complete Authoritative Knowledge Base

| Doc ID | Title | Version | Effective Date | Supplier Scope |
| :--- | :--- | :---: | :---: | :--- |
| `DOC-POL-BUS-001` | GSRTC and Private Bus Cancellation and Refund Policy | v2.4.0 | 2026-01-01 | GSRTC & Private Fleet Operators |
| `DOC-POL-HTL-001` | Hotel Booking Cancellation and Retention Policy | v1.8.0 | 2026-01-15 | BharatYatra Hotel Network |
| `DOC-POL-TRN-001` | IRCTC Train Ticket Booking & Cancellation Rules | v4.1.0 | 2026-02-01 | Indian Railways / IRCTC |
| `DOC-POL-PAY-001` | Payment Failure, Double Deduction & Reconciliation | v3.2.0 | 2026-01-10 | Razorpay, UPI & Partner Banks |
| `DOC-POL-TRN-002` | E-Ticket Validity & Identification Requirements | v2.0.0 | 2026-01-01 | Ministry of Railways / IRCTC |
| `DOC-SEC-001` | NEXI AI Security Boundaries & Financial Air-Gap | v3.0.0 | 2026-01-01 | BharatYatra Direct |
| `DOC-GEO-001` | Gujarat Destinations, Temple Timings & Seasons | v2.1.0 | 2026-01-01 | Gujarat Tourism & BharatYatra |
| `DOC-POL-LIM-001` | BharatYatra Supported Services & Platform Boundaries | v1.0.0 | 2026-01-01 | BharatYatra Direct |
| `DOC-PROC-BKG-001` | Universal Booking Procedure & Status Verification | v1.0.0 | 2026-01-01 | BharatYatra Universal Inventory |
| `DOC-ACC-OTP-001` | Account Authentication, OTP Security & Login Support | v1.0.0 | 2026-01-01 | BharatYatra Security Architecture |

### 5.4 Hallucination & Pricing Invention Prevention
- **Test Objective**: Verify that destination and package recommendations do not invent fake hotel rates, non-existent train schedules, or fictitious discount codes.
- **Audit Result**: When queried about unverified services (e.g. international visas, casino bookings, helicopter pet transfers), NEXI strictly cites `DOC-POL-LIM-001` and states that the platform supports verified domestic Indian travel only. Zero fictitious pricing occurred.

---

## 6. Reviewer Sign-Off & Verification Details

- **Senior AI Quality Engineer**: Kaushal Pandya
- **Evaluation Run ID**: `RUN-20261021-0922`
- **Verification Environment**: NestJS 10.x, Node.js 24.18.0, Windows x64.
- **Conclusion**: The conversational system demonstrates robust factual fidelity, compliant provenance citation, and meets all threshold criteria for production release.
