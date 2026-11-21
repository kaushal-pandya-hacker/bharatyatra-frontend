import re
import json

def verify_guide():
    path = '.next/server/app/guides/gujarat-travel-budget-7-day-guide.html'
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    canonical = re.findall(r'<link rel="canonical" href="([^"]+)"', html)
    title = re.findall(r'<title>([^<]+)</title>', html)
    meta_desc = re.findall(r'<meta name="description" content="([^"]+)"', html)
    og_title = re.findall(r'<meta property="og:title" content="([^"]+)"', html)
    og_url = re.findall(r'<meta property="og:url" content="([^"]+)"', html)
    schemas = re.findall(r'<script type="application/ld\+json">([^<]+)</script>', html)

    print("=" * 60)
    print("VERIFYING GUIDE 4 PRE-RENDERED PRODUCTION HTML")
    print("=" * 60)
    print(f"Title:         {title[0] if title else 'MISSING'}")
    print(f"Canonical:     {canonical[0] if canonical else 'MISSING'}")
    print(f"Description:   {meta_desc[0] if meta_desc else 'MISSING'}")
    print(f"OG Title:      {og_title[0] if og_title else 'MISSING'}")
    print(f"OG URL:        {og_url[0] if og_url else 'MISSING'}")
    print(f"Total Schemas: {len(schemas)}")

    for i, s in enumerate(schemas):
        try:
            data = json.loads(s)
            stype = data.get('@type', 'Unknown')
            print(f"  Schema #{i+1} [@type={stype}]: Valid JSON-LD")
            if stype == 'Article':
                print(f"    - Headline: {data.get('headline')[:60]}...")
                print(f"    - Author:   {data.get('author', {}).get('name')}")
                print(f"    - Publisher:{data.get('publisher', {}).get('name')}")
            elif stype == 'BreadcrumbList':
                items = data.get('itemListElement', [])
                print(f"    - Items:    {len(items)} breadcrumbs")
            elif stype == 'FAQPage':
                faqs = data.get('mainEntity', [])
                print(f"    - FAQs:     {len(faqs)} questions")
        except Exception as e:
            print(f"  Schema #{i+1}: Failed to parse JSON: {e}")

    print("=" * 60)

if __name__ == '__main__':
    verify_guide()
