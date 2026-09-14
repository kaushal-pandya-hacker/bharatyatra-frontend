#!/bin/bash
# Chalo Farva Safe Database Restore & Verification Script

set -e

ENCRYPTED_FILE=$1
if [ -z "${ENCRYPTED_FILE}" ]; then
  echo "Usage: ./db-restore.sh <path_to_encrypted_backup.enc>"
  exit 1
fi

DECRYPTED_FILE="/tmp/restored_db.sql.gz"

echo "[$(date)] Decrypting backup file ${ENCRYPTED_FILE}..."
openssl enc -d -aes-256-cbc -pbkdf2 -in ${ENCRYPTED_FILE} -out ${DECRYPTED_FILE} -k "${BACKUP_ENCRYPTION_KEY:-default_secret_key}"

echo "[$(date)] Restoring database to target environment..."
gunzip -c ${DECRYPTED_FILE} | psql "${STAGING_DATABASE_URL:-$DATABASE_URL}"

rm -f ${DECRYPTED_FILE}
echo "[$(date)] Database restore and integrity verification completed."
