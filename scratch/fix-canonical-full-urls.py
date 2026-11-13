paths = [
    'app/(customer)/destinations/page.tsx',
    '18_DEVELOPMENT/Frontend/app/(customer)/destinations/page.tsx',
    'app/(customer)/explore/page.tsx',
    '18_DEVELOPMENT/Frontend/app/(customer)/explore/page.tsx',
    'app/(customer)/packages/page.tsx',
    '18_DEVELOPMENT/Frontend/app/(customer)/packages/page.tsx',
]

for p in paths:
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace("canonical: '/destinations',", "canonical: 'https://www.bharatyatra.in/destinations',")
    c = c.replace("canonical: '/explore',", "canonical: 'https://www.bharatyatra.in/explore',")
    c = c.replace("canonical: '/packages',", "canonical: 'https://www.bharatyatra.in/packages',")
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Updated", p)

