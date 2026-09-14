# PROJECT RULES — CHALO FARVA

> **Mandatory engineering and documentation governance rules for all contributors and coding agents.**

---

## 📜 Core Governance Rules

### 1. Single Master Directory Constraint
- All project files, documentation, designs, and code MUST reside strictly under `c:\Users\Pandya Kaushal\Desktop\Chalo Farva`.
- Never create standalone project files directly on the Desktop or in arbitrary subfolders outside `Chalo Farva`.

### 2. File Naming & Versioning Discipline
- **Prohibited Filenames**: Never use names like `final`, `final2`, `latest`, `new`, `new_final`, `test123`, `temp_schema`, etc.
- **Mandatory Versioning**: Use formal semantic versioning: `v1.0`, `v1.1`, `v2.0` (e.g., `Chalo_Farva_PRD_v1.0.docx`, `Chalo_Farva_Database_Schema_v1.0.sql`).

### 3. Strict Separation of Concerns
- **Documentation**: Folders `00_PROJECT_MANAGEMENT` through `17_TESTING_QA`.
- **Application Source Code**: Isolated under `18_DEVELOPMENT/`.
- **Infrastructure & Deployment**: Isolated under `19_DEVOPS_DEPLOYMENT/`.
- **Archived / Deprecated Files**: Moved immediately to `99_ARCHIVE/`.

### 4. Non-Destructive Update Rule
- Never delete approved project assets or documentation without archiving.
- Major changes to requirements, architecture, or schemas must generate a new version document rather than overwriting existing baseline specifications.

### 5. Zero Secrets in Git
- Never check `.env` files, API keys, database credentials, or payment secrets into source control or markdown documents.
- Use `.env.example` templates and keep actual credentials in local secret stores.

### 6. Architectural Decision Logging
- Every major technical or product decision (e.g., choice of database, AI framework, payment gateway adapter) MUST be logged in [`DECISIONS.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/DECISIONS.md) following the Architecture Decision Record (ADR) format.

### 7. Requirement & Change Management
- Every functional requirement modification must update both [`PRD`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/01_PRD_REQUIREMENTS/PRD/) and [`CHANGELOG.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/CHANGELOG.md).

### 8. Database Migration Protocol
- Direct schema edits without migration scripts are strictly forbidden.
- Every schema change must include a matching versioned migration file in `05_DATABASE/Migrations/`.

### 9. API & AI Specification Integrity
- Every API endpoint change must update OpenAPI documentation in `06_API/`.
- Every change to AI prompts, guardrails, or system instructions must be tracked in `07_AI/`.

### 10. AI Safety & Validation Rule
- The AI engine is strictly prohibited from inventing real-world facts: live hotel/bus availability, ticket prices, weather conditions, opening hours, or booking confirmation numbers.
- All AI recommendations must pass deterministic validation against verified local database records.

### 11. Provider-Agnostic Adapter Pattern
- External service integrations (bus providers, hotel aggregators, payment gateways, map APIs) must interface through abstract adapter interfaces in `09_BOOKING/` to eliminate vendor lock-in.

### 12. Brand Integrity Rule
- The approved brand logo and banner residing in `02_BRAND_IDENTITY/Logo/Final/` and `02_BRAND_IDENTITY/Banner/Final/` are FINAL.
- Do not redesign or alter brand assets unless explicitly instructed by the product owner.

### 13. Financial Auditability
- All transactions, commission payouts, refunds, and adjustments must be recorded in an immutable ledger in `11_PAYMENTS_FINANCE/`.
- Card numbers or sensitive PCI data must NEVER touch Chalo Farva servers.

### 14. Document Metadata Standard
- Every document must include standard header metadata: `Title`, `Version`, `Date`, `Status`, `Author/Owner`, and `Related Documents`.

### 15. Continuous Status Syncing
- At the conclusion of any major engineering milestone, update [`PROJECT_STATUS.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/PROJECT_STATUS.md), [`TODO.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/TODO.md), and [`CHANGELOG.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/CHANGELOG.md).
