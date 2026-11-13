with open('tailwind.config.ts', 'r', encoding='utf-8') as f:
    c = f.read()

target = "'on-primary': '#ffffff',"
replacement = """'on-primary': '#ffffff',
        diwali: {
          navy: '#102A56',
          blue: '#1769AA',
          teal: '#087E83',
          gold: '#F5BD4F',
          saffron: '#F28C28',
          cream: '#FFF9EF',
        },"""

if target in c and "diwali:" not in c:
    c = c.replace(target, replacement, 1)
    with open('tailwind.config.ts', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Added diwali colors to tailwind.config.ts")
else:
    print("Already exists or target not found")

