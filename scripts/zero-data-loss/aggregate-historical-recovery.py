import os
import json

backup_root = 'backups/db'
dirs = sorted(os.listdir(backup_root))

all_profiles = {}
all_trips = {}
all_bookings = {}
all_preferences = {}

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
                
            # Profiles
            for item in data.get('profiles', []):
                p = item[1] if isinstance(item, list) else item
                if p and 'id' in p:
                    pid = p['id']
                    if pid not in all_profiles or parse_iso(p.get('updatedAt') or p.get('updated_at')) > parse_iso(all_profiles[pid].get('updatedAt') or all_profiles[pid].get('updated_at')):
                        all_profiles[pid] = p

            # Trips
            for item in data.get('trips', []):
                t = item[1] if isinstance(item, list) else item
                if t and 'id' in t:
                    tid = t['id']
                    if tid not in all_trips or parse_iso(t.get('updatedAt') or t.get('updated_at')) > parse_iso(all_trips[tid].get('updatedAt') or all_trips[tid].get('updated_at')):
                        all_trips[tid] = t

            # Bookings
            for item in data.get('bookings', []):
                b = item[1] if isinstance(item, list) else item
                if b and 'id' in b:
                    bid = b['id']
                    if bid not in all_bookings or parse_iso(b.get('updatedAt') or b.get('updated_at')) > parse_iso(all_bookings[bid].get('updatedAt') or all_bookings[bid].get('updated_at')):
                        all_bookings[bid] = b

        except Exception as e:
            pass

print("=== DE-DUPLICATED HISTORICAL RECOVERY AGGREGATION ===")
print(f"Unique Recovered Profiles : {len(all_profiles)}")
print(f"Unique Recovered Trips    : {len(all_trips)}")
print(f"Unique Recovered Bookings : {len(all_bookings)}")

# Inspect sample recovered trips
print("\nSample Recovered Trips:")
for tid, trip in list(all_trips.items())[:5]:
    dest = trip.get('destination') or trip.get('destination_city') or 'India'
    user = trip.get('userId') or trip.get('user_id')
    print(f"  - Trip [{tid}]: Destination: {dest:20} | User: {user} | Title: {trip.get('title')}")
