# CHALO FARVA — LOCAL DOCKER SETUP & OPERATIONAL GUIDE v1.0

**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Target Audience**: Developers, QA Engineers, Operations Lead

---

## 1. PREREQUISITES

- **Docker Desktop**: v4.x or higher with WSL2/Linux Engine enabled
- **Docker Compose**: v2.x or higher
- **System Memory**: Minimum 4GB RAM allocated to Docker Engine

---

## 2. EXPOSED LOCAL SERVICES MATRIX

| Subsystem / Service | Access URL | Port | Container Name | Health Check Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:3000` | 3000 | `chalo_farva_frontend` | `http://localhost:3000` |
| **Backend REST API** | `http://localhost:4000/api/v1` | 4000 | `chalo_farva_backend` | `http://localhost:4000/api/v1/health` |
| **Swagger Documentation**| `http://localhost:4000/api/v1/docs`| 4000 | `chalo_farva_backend` | `http://localhost:4000/api/v1/docs` |
| **AI Python Microservice**| `http://localhost:8000` | 8000 | `chalo_farva_ai` | `http://localhost:8000/health` |
| **PostgreSQL Database**| `localhost:5432` | 5432 | `chalo_farva_postgres` | `pg_isready` |
| **Redis Cache & Queue**| `localhost:6379` | 6379 | `chalo_farva_redis` | `redis-cli ping` |

---

## 3. COMMANDS TO LAUNCH STACK

### Step 1: Validate Compose Configuration
```bash
docker compose config
```

### Step 2: Build All Service Containers
```bash
docker compose build
```

### Step 3: Launch Containers in Detached Mode
```bash
docker compose up -d
```

### Step 4: Verify Service Status & Health
```bash
docker compose ps
```

### Step 5: Stop Services
```bash
docker compose down
```

---

## 4. END-TO-END VERIFICATION FLOW

```
[ FRONTEND ] (http://localhost:3000)
    │
    ▼ (HTTP REST API)
[ BACKEND API ] (http://localhost:4000/api/v1)
    │
    ├──► [ POSTGRESQL DB ] (5432)
    ├──► [ REDIS CACHE ] (6379)
    │
    ▼ (HTTP REST API)
[ FASTAPI AI SERVICE ] (http://localhost:8000)
```

---

## 5. TROUBLESHOOTING & COMMON FIXES

1. **`package-lock.json not found`**: Updated Dockerfiles to copy `package.json` and use `npm install --legacy-peer-deps`.
2. **Next.js Standalone Build Missing**: Added `output: 'standalone'` to `18_DEVELOPMENT/Frontend/next.config.mjs`.
3. **Database Migration Sync**: Run `docker exec -it chalo_farva_backend npx prisma migrate dev` if DB tables require update.
