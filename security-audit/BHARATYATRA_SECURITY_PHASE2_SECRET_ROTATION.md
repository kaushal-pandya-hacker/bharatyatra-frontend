# BHARATYATRA SECURITY PHASE 2 — CREDENTIAL ROTATION RUNBOOK
## Manual Secret Rotation & Revocation Protocol for Authorized Operators

- **Target System**: BharatYatra Production Infrastructure
- **Audience**: Authorized Platform Operations & Security Leads
- **Document Classification**: Highly Confidential Operational Runbook
- **Rule**: NO ACTUAL PRODUCTION SECRET VALUES ARE STORED OR EXPOSED IN THIS RUNBOOK.

---

## 1. Executive Context

During the Phase 1 Security Audit and Phase 2 remediation, several hardcoded fallback credentials and default secrets were discovered in version control.

> [!WARNING]
> Removing a secret or fallback string from source code does **NOT** invalidate secrets that may already have been exposed or deployed. 
> Authorized operations personnel must manually rotate and revoke all potentially compromised credentials across staging and production environments following the prioritized protocol below.

---

## 2. Inventory of Potentially Compromised Credentials by Category

| Category | Identifier / Variable Name | Risk Level | Original Exposure Mechanism | Impact if Unrotated |
| :--- | :--- | :--- | :--- | :--- |
| **Backend JWT Signing Secret** | `JWT_SECRET` | **CRITICAL** | Hardcoded string in 5 backend files (`chalo_farva_default_jwt_secret_key_32chars`) | Anyone with repository history can forge arbitrary JWTs with any user ID or role. |
| **Super Admin Password** | `ADMIN_BOOTSTRAP_PASSWORD` | **CRITICAL** | Hardcoded default string (`BharatYatraAdmin2026!`) in bootstrap routine | Direct takeover of backend administrative dashboard and user records. |
| **Operations Admin Key** | `ADMIN_SECRET_KEY` / `x-admin-key` | **HIGH** | Static evaluation/admin token fallbacks | Bypass of partner API controls and administrative endpoints. |
| **Supabase Database Credentials** | `DATABASE_URL` / `directUrl` | **HIGH** | Fallback PostgreSQL connection strings in `env.ts` / Prisma schema | Direct access to relational tables if database port is exposed to the internet. |
| **Supabase Service Role Key** | `SUPABASE_SERVICE_ROLE_KEY` | **CRITICAL** | Presence in staging environment files | Total bypass of Supabase Row Level Security (RLS) across all tables. |
| **Razorpay API Keys** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | **HIGH** | Staging / mock credentials | Unauthorized refund triggers or financial ledger tampering. |

---

## 3. Prioritized Manual Rotation Protocol

### Priority 1: Backend `JWT_SECRET` (Immediate)
1. **Generate New Secret**:
   Generate a high-entropy 64-byte cryptographic secret:
   ```bash
   openssl rand -hex 32
   ```
2. **Inject into Production Environment**:
   - Store the generated value in your cloud secrets manager (e.g. AWS Secrets Manager, HashiCorp Vault, or Vercel Environment Variables).
   - Set `JWT_SECRET` to this value.
3. **Session Invalidation**:
   - Deploy the new secret to the backend cluster.
   - When the backend reboots with the new `JWT_SECRET`, **all previously issued JWT tokens signed with the old secret will fail signature verification**.
   - Users will receive HTTP 401 and must re-authenticate. This safely terminates any forged or legacy tokens.

---

### Priority 2: Administrator Accounts & Bootstrap Password (Immediate)
1. **Inspect Existing Admin Accounts**:
   Connect to the production database via a secure bastion host and check existing admins:
   ```sql
   SELECT id, username, email, role, "createdAt" FROM "AdminUser";
   ```
2. **Update Password for Existing Admins**:
   - For every existing admin user, trigger a mandatory password reset via `changePassword()` or issue a cryptographically random bcrypt hash:
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('NEW_STRONG_OPERATOR_PASSWORD_MIN_24_CHARS', 10).then(console.log);"
   ```
   ```sql
   UPDATE "AdminUser" SET "passwordHash" = '<NEW_BCRYPT_HASH>' WHERE username = 'bharatyatra_admin';
   ```
3. **Revoke Active Admin Sessions**:
   Invalidate all active sessions across all admin users:
   ```sql
   DELETE FROM "AdminSession";
   ```
4. **Disable / Unset Bootstrap Credentials**:
   Remove `ADMIN_BOOTSTRAP_PASSWORD` and `ADMIN_BOOTSTRAP_USERNAME` from production environment configurations. The codebase now recognizes existing database admin accounts and does not require bootstrap variables during regular operations.

---

### Priority 3: Supabase Service Role Key & Database Password (Within 24 Hours)
1. **Rotate Supabase JWT Secret / Service Role Key**:
   - Navigate to **Supabase Dashboard -> Project Settings -> API**.
   - Under **JWT Settings**, generate a new JWT Secret.
   - Note: This invalidates all active Supabase user sessions and rotates the `service_role` key.
   - Immediately update `SUPABASE_SERVICE_ROLE_KEY` in the backend and frontend server environment.
2. **Rotate Database Password**:
   - Navigate to **Supabase Dashboard -> Project Settings -> Database**.
   - Click **Reset database password**.
   - Generate a strong, 32-character password.
   - Update `DATABASE_URL` in backend production configurations (`postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require`).

---

### Priority 4: Razorpay Payment Secrets (Within 48 Hours)
1. **Log in to Razorpay Dashboard**:
   - Navigate to **Settings -> API Keys**.
2. **Generate New Key Pair**:
   - Click **Generate Key**. Select the option to retain the old key for 24 hours (grace period) to allow in-flight checkouts to settle.
3. **Update Production Environment**:
   - Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in production configuration.
4. **Revoke Old Key**:
   - After 24 hours, click **Deactivate Old Key** in the Razorpay Dashboard.

---

## 4. Verification Checklist for Operator

- [ ] New `JWT_SECRET` injected into production environment (minimum 32 characters, high entropy).
- [ ] Backend deployed and verified starting successfully without errors.
- [ ] Old JWT tokens confirmed rejected (HTTP 401).
- [ ] `AdminSession` table cleared of legacy sessions.
- [ ] `ADMIN_BOOTSTRAP_PASSWORD` removed from production runtime configuration.
- [ ] Supabase Service Role key rotated and updated.
- [ ] Payment gateway keys rotated with dual-key transition window.
- [ ] No secret values committed to Git or printed in application logs.
