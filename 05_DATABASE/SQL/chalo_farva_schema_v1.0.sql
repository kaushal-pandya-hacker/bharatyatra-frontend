-- =============================================================================
-- CHALO FARVA — MASTER REPRODUCIBLE SCHEMA RUNNER (v1.0)
-- Description: Executes all modular DDL scripts in strict dependency order.
-- =============================================================================

\i extensions.sql
\i enums.sql
\i tables.sql
\i constraints.sql
\i indexes.sql
\i triggers.sql
\i views.sql

SELECT 'Chalo Farva Database Schema v1.0 executed successfully.' AS build_status;
