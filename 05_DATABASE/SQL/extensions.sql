-- =============================================================================
-- CHALO FARVA — POSTGRESQL EXTENSIONS
-- Version: v1.0.0
-- Description: Required PostgreSQL extensions for UUID generation and GIS.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Trigram search indexing for search autosuggestion
