import sys

paths = [
    'app/page.tsx',
    '18_DEVELOPMENT/Frontend/app/page.tsx',
    'app/layout.tsx',
    '18_DEVELOPMENT/Frontend/app/layout.tsx',
]

for p in paths:
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()
    old = "canonical: '/',"
    new = "canonical: 'https://www.bharatyatra.in/',"
    if old in c:
        c = c.replace(old, new)
        with open(p, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"Updated {p}")
    else:
        print(f"Old pattern not found in {p}")

