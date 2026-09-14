#!/bin/bash
# Chalo Farva Automated Database Backup Script
# Frequency: Every 6 Hours | Retention: 30 Days | Encryption: AES-256

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/chalo_farva"
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"
ENCRYPTED_FILE="${BACKUP_FILE}.enc"

mkdir -p ${BACKUP_DIR}

echo "[$(date)] Initiating PostgreSQL production database backup..."
pg_dump "${DATABASE_URL}" | gzip > ${BACKUP_FILE}

echo "[$(date)] Encrypting backup archive..."
openssl enc -aes-256-cbc -salt -pbkdf2 -in ${BACKUP_FILE} -out ${ENCRYPTED_FILE} -k "${BACKUP_ENCRYPTION_KEY:-default_secret_key}"
rm -f ${BACKUP_FILE}

echo "[$(date)] Pruning backups older than 30 days..."
find ${BACKUP_DIR} -name "db_backup_*.enc" -mtime +30 -exec rm -f {} \;

echo "[$(date)] Database backup completed successfully: ${ENCRYPTED_FILE}"
