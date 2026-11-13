for path in ['components/layout/header.tsx', '18_DEVELOPMENT/Frontend/components/layout/header.tsx']:
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    old = 'focus:outline-hidden'
    new = 'outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-none'
    if old in c:
        c = c.replace(old, new)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"Patched {path}")
    else:
        print(f"Pattern not found in {path}")

