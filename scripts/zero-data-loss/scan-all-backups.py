import os
import json

backup_root = 'backups/db'
dirs = sorted(os.listdir(backup_root))

print(f"Total backup folders: {len(dirs)}\n")
print(f"{'Backup ID':60} | {'Total':6} | {'Users':5} | {'Trips':5} | {'Bookings':8} | {'Contrib':7} | Files")
print("-" * 110)

non_empty_backups = []

for d in dirs:
    dpath = os.path.join(backup_root, d)
    mpath = os.path.join(dpath, 'manifest.json')
    if os.path.exists(mpath):
        try:
            with open(mpath, 'r', encoding='utf-8') as f:
                m = json.load(f)
            rc = m.get('recordCounts', {})
            total = m.get('totalEntities', 0)
            users = rc.get('users', 0)
            trips = rc.get('trips', 0)
            bookings = rc.get('bookings', 0)
            contribs = rc.get('contributions', 0)
            file_count = len(m.get('fileList', []))
            
            print(f"{d:60} | {total:6} | {users:5} | {trips:5} | {bookings:8} | {contribs:7} | {file_count:2} files")
            non_empty_backups.append({
                'id': d,
                'total': total,
                'users': users,
                'trips': trips,
                'bookings': bookings,
                'manifest': m
            })
        except Exception as err:
            print(f"Error reading {d}: {err}")

print(f"\nTotal valid backups scanned: {len(non_empty_backups)}")
