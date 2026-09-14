# CHALO FARVA — DEVELOPMENT SETUP & ONBOARDING GUIDE v1.0

**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Target Audience**: Developers, QA Engineers, System Administrators

---

## 1. PREREQUISITES & ENVIRONMENT REQUIREMENTS

Ensure your local system has the following installed:
- **Node.js**: `v18.x` or `v20.x` LTS
- **Python**: `v3.12.x`
- **PostgreSQL**: `v15.x` or `v16.x` (or via Docker)
- **Redis**: `v7.x` (or via Docker)
- **Docker & Docker Compose**: Docker Desktop v4.x+

---

## 2. QUICK START (ONE-COMMAND CONTAINER STACK)

To launch the complete Chalo Farva microservices stack using Docker Compose:

```bash
# Clone and navigate to workspace root
cd "c:\Users\Pandya Kaushal\Desktop\Chalo Farva"

# Launch all services in background
docker-compose up -d --build

# Verify container status
docker-compose ps
```

### Exposed Services

| Subsystem | Local Access URL | Container Name |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:3000` | `chalofarva-frontend` |
| **Backend REST API** | `http://localhost:4000/api/v1` | `chalofarva-backend` |
| **Swagger API Specs** | `http://localhost:4000/api/docs` | `chalofarva-backend` |
| **AI Python Service** | `http://localhost:8000/api/v1/ai` | `chalofarva-ai-service` |
| **PostgreSQL Database**| `localhost:5432` | `chalofarva-postgres` |
| **Redis Cache** | `localhost:6379` | `chalofarva-redis` |

---

## 3. MANUAL LOCAL DEVELOPMENT SETUP

### Step A: Backend Setup (NestJS)

```bash
cd 18_DEVELOPMENT/Backend
cp .env.example .env

# Install dependencies
npm install

# Run database migrations & seed reference data
npx prisma migrate dev
npx prisma db seed

# Start NestJS in development mode
npm run start:dev
```

### Step B: AI Service Setup (Python FastAPI)

```bash
cd 18_DEVELOPMENT/AI_Service
cp .env.example .env

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Start FastAPI dev server
uvicorn main:app --reload --port 8000
```

### Step C: Frontend Setup (Next.js 14)

```bash
cd 18_DEVELOPMENT/Frontend
cp .env.example .env.local

# Install dependencies
npm install

# Start Next.js dev server
npm run dev
```

---

## 4. RUNNING TEST SUITES

### Python AI Service Test Suite (Pytest)

```bash
cd 18_DEVELOPMENT/AI_Service
python -m pytest tests/ -v
```

*Expected output*: `55 passed in 0.14s (100% pass rate)`.

---

## 5. DEMO STATE RESET

To reset presentation data back to pristine `v1.0` state:

```bash
cd 18_DEVELOPMENT/AI_Service
python demo_seed.py
```
