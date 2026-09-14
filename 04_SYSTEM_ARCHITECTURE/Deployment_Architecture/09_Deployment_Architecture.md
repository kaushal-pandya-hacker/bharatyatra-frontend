# Deployment Architecture — Chalo Farva

## Cloud Infrastructure Topology
- **Frontend App Router**: Deployed to Vercel / AWS ECS Container Cluster with Edge Caching.
- **Backend API Services**: AWS ECS Fargate / DigitalOcean Kubernetes App Cluster.
- **Database Layer**: Managed PostgreSQL (AWS RDS / DigitalOcean Managed DB) with Read Replicas and Automated Nightly Backups.
- **Cache Layer**: Managed Redis cluster.
