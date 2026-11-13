import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("Starting BharatYatra Google Brand Identity SEO updates...")

# 1. Update app/layout.tsx and 18_DEVELOPMENT/Frontend/app/layout.tsx
layout_files = ['app/layout.tsx', '18_DEVELOPMENT/Frontend/app/layout.tsx']

for p in layout_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    # Ensure icons configuration in metadata
    if 'icons:' not in content:
        icons_block = """  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
"""
        # insert before twitter:
        content = content.replace("  twitter: {", icons_block + "  twitter: {")

    # Ensure site in twitter metadata
    if "site: '@bharatyatra'" not in content:
        content = content.replace("creator: '@bharatyatra',", "creator: '@bharatyatra',\n    site: '@bharatyatra',")

    # Update jsonLdWebsite
    old_website_pattern = re.compile(r"const jsonLdWebsite = \{.*?\};", re.DOTALL)
    new_json_ld_website = """const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BharatYatra',
  alternateName: 'Bharat Yatra',
  url: 'https://www.bharatyatra.in/',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.bharatyatra.in/explore?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};"""
    content = old_website_pattern.sub(new_json_ld_website, content)

    # Update jsonLdOrganization
    old_org_pattern = re.compile(r"const jsonLdOrganization = \{.*?\};", re.DOTALL)
    new_json_ld_org = """const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BharatYatra',
  url: 'https://www.bharatyatra.in/',
  logo: 'https://www.bharatyatra.in/logo.png',
  description: 'AI-native pan-India travel and tourism platform offering adaptive itinerary planning, hotel and transit reservations, and heritage cultural discovery across 36 States and Union Territories.',
  sameAs: [
    'https://www.instagram.com/bharat.yatra29',
    'https://twitter.com/bharatyatra',
  ],
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Gujarat',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+919624282521',
    contactType: 'customer support',
    areaServed: 'IN',
    availableLanguage: ['en', 'gu', 'hi'],
  },
};"""
    content = old_org_pattern.sub(new_json_ld_org, content)

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {p}")

# 2. Update app/page.tsx and 18_DEVELOPMENT/Frontend/app/page.tsx
page_files = ['app/page.tsx', '18_DEVELOPMENT/Frontend/app/page.tsx']
for p in page_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    # Ensure icons configuration in page metadata if not present
    if 'icons:' not in content:
        icons_block = """  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
"""
        content = content.replace("  twitter: {", icons_block + "  twitter: {")

    if "site: '@bharatyatra'" not in content:
        content = content.replace("creator: '@bharatyatra',", "creator: '@bharatyatra',\n    site: '@bharatyatra',")

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {p}")

print("Brand Identity SEO updates applied successfully.")

