import urllib.request
import re
import json
import sys

urls = [
    'https://www.bharatyatra.in/guides/',
    'https://www.bharatyatra.in/guides/somnath-dwarka-pilgrimage-logistics-guide/',
    'https://www.bharatyatra.in/guides/gir-national-park-lion-safari-permits-guide/',
    'https://www.bharatyatra.in/guides/rann-of-kutch-bhirandiyara-permit-procedure/',
    'https://www.bharatyatra.in/guides/gujarat-travel-budget-7-day-guide/'
]

all_passed = True

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            code = resp.getcode()
            html = resp.read().decode('utf-8')
            
            title_match = re.search(r'<title>(.*?)</title>', html)
            canonical_match = re.search(r'<link rel="canonical" href="([^"]+)"', html)
            jsonld_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html)
            
            print('='*70)
            print(f'TARGET URL: {url}')
            print(f'HTTP STATUS: {code}')
            print(f'TITLE: {title_match.group(1) if title_match else "NONE"}')
            print(f'CANONICAL: {canonical_match.group(1) if canonical_match else "NONE"}')
            print(f'STRUCTURED DATA GRAPHS: {len(jsonld_matches)}')
            
            for i, jld in enumerate(jsonld_matches):
                try:
                    data = json.loads(jld)
                    print(f'  Graph {i+1} @type: {data.get("@type")}')
                except Exception as e:
                    print(f'  Graph {i+1} JSON parse error: {e}')
                    all_passed = False
                    
            if code != 200:
                all_passed = False
    except Exception as err:
        print(f'ERROR on {url}: {err}')
        all_passed = False

if all_passed:
    print('\nALL LIVE VERIFICATION CHECKS PASSED!')
else:
    print('\nONE OR MORE CHECKS FAILED!')
    sys.exit(1)
