# Backup & Restore Runbook v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## Backup Verification & Restore Steps
1. Locate latest encrypted backup archive in `/var/backups/chalo_farva/`:
   ```bash
   ls -la /var/backups/chalo_farva/
   ```
2. Execute automated restore script against isolated staging database:
   ```bash
   ./19_DEVOPS_DEPLOYMENT/Backups/db-restore.sh /var/backups/chalo_farva/db_backup_20260913_120000.sql.gz.enc
   ```
3. Run verification queries checking table counts across 54+ PostgreSQL tables.
