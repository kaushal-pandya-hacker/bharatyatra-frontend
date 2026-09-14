# Deployment Specification — Chalo Farva

## Containerization
- **Dockerfile**: Multi-stage Alpine container build (`builder` -> `runner`).
- **Docker Compose**: Orchestrates `backend`, `postgres`, and `redis` containers (`docker-compose up -d`).

## Environment Variables Strategy
- Production secrets injected via environment secret manager (AWS Secrets Manager / Vault).
- Zero secrets committed to codebase repository.
