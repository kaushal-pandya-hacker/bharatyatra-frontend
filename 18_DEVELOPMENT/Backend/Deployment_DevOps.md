# Deployment & DevOps — Chalo Farva

## Containerization & Environment
- Target Environment: Node.js 18+ LTS / Docker containerization.
- Multi-stage Dockerfile bundling TypeScript build artifact into minimal Alpine runtime container.

## Health Monitoring
- Liveness Probe: `GET /health` returning 200 OK and DB pool status.
- Logging: Structured JSON logs emitted via Winston to standard output.
