import urllib.request
import urllib.error
import json

tables = [
  'user_profiles', 'user_trips', 'user_bookings', 'destinations',
  'travel_packages', 'travel_agencies', 'admin_destinations', 'admin_packages',
  'admin_inventory', 'admin_audit_logs', 'place_submissions', 'user_preferences',
  'community_contributions', 'community_photos', 'community_published_destinations',
  'community_rewards', 'user_notifications', 'notification_preferences'
]

url_base = 'https://uedmguvljhsvbndwkruz.supabase.co/rest/v1/'
key = 'sb_publishable_s-dMVkeMYG384Cyz9sO0cg_JkrRjbSV'

results = {}

for t in tables:
    u = f'{url_base}{t}?limit=1'
    req = urllib.request.Request(u, headers={'apikey': key, 'Authorization': f'Bearer {key}'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            code = resp.getcode()
            body = resp.read().decode('utf-8')
            results[t] = {'status': code, 'body': body}
            print(f'{t:35} : HTTP {code} OK - records: {body[:60]}')
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        results[t] = {'status': e.code, 'error': err_body}
        print(f'{t:35} : HTTP {e.code} - {err_body[:80]}')
    except Exception as e:
        results[t] = {'status': 'ERR', 'error': str(e)}
        print(f'{t:35} : EXCEPTION : {e}')

print('\nAudit Summary:')
ok_count = sum(1 for v in results.values() if v.get('status') == 200)
print(f'Total tables tested: {len(tables)}, Accessible: {ok_count}/{len(tables)}')
