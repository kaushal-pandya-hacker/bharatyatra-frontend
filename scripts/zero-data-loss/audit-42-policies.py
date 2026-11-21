import re
import json

with open('supabase/migrations/20261120_production_permanent_persistence_schema.sql', 'r', encoding='utf-8') as f:
    sql_text = f.read()

# Pattern for CREATE POLICY
# Handles DO $$ BEGIN ... CREATE POLICY ... END $$;
policy_pattern = re.compile(
    r'CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+public\.(\w+)\s+(?:FOR\s+(\w+)\s+)?(?:TO\s+([\w,\s]+)\s+)?USING\s*\((.*?)\)(?:\s+WITH\s+CHECK\s*\((.*?)\))?;',
    re.DOTALL | re.IGNORECASE
)

policies = []

for match in policy_pattern.finditer(sql_text):
    name = match.group(1).strip()
    table = match.group(2).strip()
    cmd = (match.group(3) or 'ALL').strip().upper()
    roles = (match.group(4) or 'PUBLIC').strip()
    using_clause = match.group(5).strip() if match.group(5) else ''
    check_clause = match.group(6).strip() if match.group(6) else ''
    
    policies.append({
        'name': name,
        'table': table,
        'command': cmd,
        'roles': roles,
        'using': using_clause,
        'with_check': check_clause
    })

# Also dynamic loop for service role
# EXECUTE format('CREATE POLICY "Service role full access on %I" ON public.%I FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'');', tbl, tbl);
tables_in_dynamic_loop = [
    'user_profiles', 'user_trips', 'user_bookings', 'user_preferences',
    'user_saved_destinations', 'user_search_history', 'user_notifications',
    'destinations', 'travel_packages', 'travel_agencies',
    'admin_destinations', 'admin_packages', 'admin_inventory', 'admin_audit_logs',
    'place_submissions', 'contributor_rewards', 'published_destinations', 'destination_reviews'
]

for tbl in tables_in_dynamic_loop:
    policies.append({
        'name': f'Service role full access on {tbl}',
        'table': tbl,
        'command': 'ALL',
        'roles': 'service_role (via USING)',
        'using': "auth.role() = 'service_role'",
        'with_check': "auth.role() = 'service_role'"
    })

print(f"Total Policies Audited: {len(policies)}")

security_gaps = []

for p in policies:
    name = p['name']
    tbl = p['table']
    cmd = p['command']
    using = p['using']
    check = p['with_check']
    
    # Check 1: Cross-table subqueries in RLS that can cause 42501 permission denied
    if 'user_profiles' in using and tbl != 'user_profiles':
        security_gaps.append({
            'type': 'CROSS_TABLE_RLS_SUBQUERY_PERMISSION_ERROR',
            'severity': 'HIGH',
            'policy': name,
            'table': tbl,
            'issue': f"Policy uses subquery against user_profiles ('{using[:60]}...'). Since anon has no SELECT on user_profiles, any anon SELECT on {tbl} errors out with PG:42501 permission denied instead of filtering rows.",
            'remediation': "Create a SECURITY DEFINER helper function `public.is_admin()` or split policy into separate INSERT/UPDATE/DELETE policies so SELECT queries by anon do not evaluate the user_profiles subquery."
        })
        
    # Check 2: USING (true) on sensitive admin tables
    if using.strip() == 'true' and 'admin' in tbl:
        security_gaps.append({
            'type': 'UNRESTRICTED_ACCESS_ON_ADMIN_TABLE',
            'severity': 'CRITICAL',
            'policy': name,
            'table': tbl,
            'issue': f"Policy '{name}' on {tbl} uses USING (true) which allows unrestricted access.",
            'remediation': "Restrict with proper role check or status column filter."
        })

    # Check 3: Missing WITH CHECK on INSERT/UPDATE/ALL policies
    if cmd in ('INSERT', 'ALL') and not check and 'Service role' not in name:
        security_gaps.append({
            'type': 'MISSING_WITH_CHECK_CLAUSE',
            'severity': 'MEDIUM',
            'policy': name,
            'table': tbl,
            'issue': f"Policy '{name}' on {tbl} for {cmd} has USING clause but no WITH CHECK clause. An attacker could potentially insert rows that violate the USING condition.",
            'remediation': "Add matching WITH CHECK clause."
        })

print("\n--- IDENTIFIED SECURITY GAPS ---")
print(json.dumps(security_gaps, indent=2))
