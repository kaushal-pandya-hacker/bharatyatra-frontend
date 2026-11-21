import os
import json
from datetime import datetime

# 1. Gather all historical user profiles, trips, bookings
backup_root = 'backups/db'
dirs = sorted(os.listdir(backup_root))

all_profiles = {}
all_trips = {}
all_bookings = {}

def parse_iso(ts):
    if not ts:
        return ""
    return str(ts)

for d in dirs:
    p_file = os.path.join(backup_root, d, 'persistent_user_store.json')
    if os.path.exists(p_file):
        try:
            with open(p_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            for item in data.get('profiles', []):
                p = item[1] if isinstance(item, list) else item
                if p and 'id' in p:
                    pid = p['id']
                    if pid not in all_profiles or parse_iso(p.get('updatedAt') or p.get('updated_at')) > parse_iso(all_profiles[pid].get('updatedAt') or all_profiles[pid].get('updated_at')):
                        all_profiles[pid] = p
            for item in data.get('trips', []):
                t = item[1] if isinstance(item, list) else item
                if t and 'id' in t:
                    tid = t['id']
                    if tid not in all_trips or parse_iso(t.get('updatedAt') or t.get('updated_at')) > parse_iso(all_trips[tid].get('updatedAt') or all_trips[tid].get('updated_at')):
                        all_trips[tid] = t
            for item in data.get('bookings', []):
                b = item[1] if isinstance(item, list) else item
                if b and 'id' in b:
                    bid = b['id']
                    if bid not in all_bookings or parse_iso(b.get('updatedAt') or b.get('updated_at')) > parse_iso(all_bookings[bid].get('updatedAt') or all_bookings[bid].get('updated_at')):
                        all_bookings[bid] = b
        except:
            pass

target_store = 'data/persistent_user_store.json'
with open(target_store, 'r', encoding='utf-8') as f:
    current = json.load(f)

# Ensure Map structures or lists are handled
current['profiles'] = list(all_profiles.values())
current['trips'] = list(all_trips.values())
current['bookings'] = list(all_bookings.values())
current['lastUpdated'] = datetime.utcnow().isoformat() + 'Z'

with open(target_store, 'w', encoding='utf-8') as f:
    json.dump(current, f, indent=2)

print("SUCCESS: Restored data/persistent_user_store.json:")
print(f"  Profiles: {len(current['profiles'])}")
print(f"  Trips:    {len(current['trips'])}")
print(f"  Bookings: {len(current['bookings'])}")
