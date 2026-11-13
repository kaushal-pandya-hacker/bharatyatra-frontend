import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("Starting BharatYatra canonical URL and SEO audit fixes...")

# 1. Update app/layout.tsx and 18_DEVELOPMENT/Frontend/app/layout.tsx
layout_files = ['app/layout.tsx', '18_DEVELOPMENT/Frontend/app/layout.tsx']
for p in layout_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    # metadataBase
    content = content.replace("new URL('https://www.bharatyatra.com')", "new URL('https://www.bharatyatra.in')")
    
    # authors url
    content = re.sub(
        r"authors:\s*\[\{\s*name:\s*'BharatYatra',\s*url:\s*'https://www\.bharatyatra\.(?:com|in)'\s*\}\]",
        "authors: [{ name: 'BharatYatra', url: 'https://www.bharatyatra.in' }]",
        content
    )
    
    # canonical
    content = re.sub(
        r"alternates:\s*\{\s*canonical:\s*'/'\s*\}",
        "alternates: {\n    canonical: 'https://www.bharatyatra.in/',\n  }",
        content
    )

    # openGraph url
    content = re.sub(
        r"(openGraph:\s*\{[^}]*?url:\s*)'https://www\.bharatyatra\.(?:com|in)/?'",
        r"\1'https://www.bharatyatra.in/'",
        content
    )

    # jsonLd urls
    content = content.replace("url: 'https://www.bharatyatra.com'", "url: 'https://www.bharatyatra.in'")
    content = content.replace("target: 'https://www.bharatyatra.com/explore?q={search_term_string}'", "target: 'https://www.bharatyatra.in/explore?q={search_term_string}'")
    content = content.replace("logo: 'https://www.bharatyatra.com/logo.png'", "logo: 'https://www.bharatyatra.in/logo.png'")

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {p}")

# 2. Update app/page.tsx and 18_DEVELOPMENT/Frontend/app/page.tsx
page_files = ['app/page.tsx', '18_DEVELOPMENT/Frontend/app/page.tsx']
for p in page_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    # alternates.canonical -> https://www.bharatyatra.in/
    content = re.sub(
        r"alternates:\s*\{\s*canonical:\s*'[^']+'\s*\}",
        "alternates: {\n    canonical: 'https://www.bharatyatra.in/',\n  }",
        content
    )

    # openGraph.url -> https://www.bharatyatra.in/
    content = re.sub(
        r"(openGraph:\s*\{[^}]*?url:\s*)'https://www\.bharatyatra\.(?:com|in)/?'",
        r"\1'https://www.bharatyatra.in/'",
        content
    )

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {p}")

# 3. Update app/robots.ts and 18_DEVELOPMENT/Frontend/app/robots.ts
robot_files = ['app/robots.ts', '18_DEVELOPMENT/Frontend/app/robots.ts']
for p in robot_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('https://www.bharatyatra.com/sitemap.xml', 'https://www.bharatyatra.in/sitemap.xml')
    content = content.replace('https://bharatyatra.in/sitemap.xml', 'https://www.bharatyatra.in/sitemap.xml')

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {p}")

# 4. Update app/sitemap.ts and 18_DEVELOPMENT/Frontend/app/sitemap.ts
sitemap_files = ['app/sitemap.ts', '18_DEVELOPMENT/Frontend/app/sitemap.ts']
for p in sitemap_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(r"const baseUrl = 'https?://[^']+';", "const baseUrl = 'https://www.bharatyatra.in';", content)
    content = re.sub(r"\{\s*url:\s*baseUrl,\s*priority:\s*1\.0", "{ url: `${baseUrl}/`, priority: 1.0", content)

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {p}")

# 5. Update app/(customer)/destinations/page.tsx
dest_files = ['app/(customer)/destinations/page.tsx', '18_DEVELOPMENT/Frontend/app/(customer)/destinations/page.tsx']
for p in dest_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(
        r"alternates:\s*\{\s*canonical:\s*'[^']+'\s*\}",
        "alternates: {\n    canonical: 'https://www.bharatyatra.in/destinations',\n  }",
        content
    )
    content = content.replace("url: 'https://www.bharatyatra.com/destinations'", "url: 'https://www.bharatyatra.in/destinations'")
    content = content.replace("url: 'https://bharatyatra.in/destinations'", "url: 'https://www.bharatyatra.in/destinations'")

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {p}")

# 6. Update app/(customer)/explore/page.tsx
explore_files = ['app/(customer)/explore/page.tsx', '18_DEVELOPMENT/Frontend/app/(customer)/explore/page.tsx']
for p in explore_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(
        r"alternates:\s*\{\s*canonical:\s*'[^']+'\s*\}",
        "alternates: {\n    canonical: 'https://www.bharatyatra.in/explore',\n  }",
        content
    )
    content = content.replace("url: 'https://www.bharatyatra.com/explore'", "url: 'https://www.bharatyatra.in/explore'")
    content = content.replace("url: 'https://bharatyatra.in/explore'", "url: 'https://www.bharatyatra.in/explore'")

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {p}")

# 7. Update app/(customer)/packages/page.tsx
pkg_files = ['app/(customer)/packages/page.tsx', '18_DEVELOPMENT/Frontend/app/(customer)/packages/page.tsx']
for p in pkg_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(
        r"alternates:\s*\{\s*canonical:\s*'[^']+'\s*\}",
        "alternates: {\n    canonical: 'https://www.bharatyatra.in/packages',\n  }",
        content
    )
    content = content.replace("url: 'https://www.bharatyatra.com/packages'", "url: 'https://www.bharatyatra.in/packages'")
    content = content.replace("url: 'https://bharatyatra.in/packages'", "url: 'https://www.bharatyatra.in/packages'")

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {p}")

# 8. Update app/(customer)/destinations/[id]/page.tsx
dest_id_files = ['app/(customer)/destinations/[id]/page.tsx', '18_DEVELOPMENT/Frontend/app/(customer)/destinations/[id]/page.tsx']
for p in dest_id_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('https://bharatyatra.com/destinations/${destination.slug}', 'https://www.bharatyatra.in/destinations/${destination.slug}')
    content = content.replace('https://bharatyatra.in/destinations/${destination.slug}', 'https://www.bharatyatra.in/destinations/${destination.slug}')

    # Check if generateMetadata exists, if not add it
    if 'export async function generateMetadata' not in content:
        import_stmt = "import type { Metadata } from 'next';\n"
        if "import type { Metadata }" not in content and "import { Metadata }" not in content:
            content = import_stmt + content

        metadata_func = """
export async function generateMetadata({ params }: DestinationDetailPageProps): Promise<Metadata> {
  const destination = await fetchDestinationFromApi(params.id);
  if (!destination) {
    return {
      title: 'Destination | BharatYatra',
    };
  }
  const title = `${destination.name} Travel Guide | BharatYatra`;
  const description = destination.description || destination.shortDescription || destination.tagline || `Explore ${destination.name} tourist attractions, tour packages, and travel guides.`;
  const canonicalUrl = `https://www.bharatyatra.in/destinations/${destination.slug || params.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'BharatYatra',
      locale: 'en_IN',
      type: 'website',
    },
  };
}
"""
        # insert before export default async function DestinationDetailPage
        target = "export default async function DestinationDetailPage"
        content = content.replace(target, metadata_func + "\n" + target)

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {p}")

# 9. Update app/(customer)/states/[slug]/page.tsx
states_files = ['app/(customer)/states/[slug]/page.tsx', '18_DEVELOPMENT/Frontend/app/(customer)/states/[slug]/page.tsx']
for p in states_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('https://bharatyatra.com/states/${slug}', 'https://www.bharatyatra.in/states/${slug}')
    content = content.replace('https://bharatyatra.in/states/${slug}', 'https://www.bharatyatra.in/states/${slug}')

    # Update generateMetadata to include alternates.canonical and openGraph
    if 'alternates:' not in content:
        old_meta_return = """  return {
    title: `${stateName} Tourism — ${placesCount} Official Places, Cover & Itineraries | BharatYatra`,
    description: `Discover all ${placesCount} tourist destinations, attractions, official state cover image, and tour packages for ${stateName}, India.`,
  };"""
        # Try both em-dash and regular replacement
        pattern = re.compile(r"return\s*\{\s*title:\s*`\$\{stateName\}[^`]+`,\s*description:\s*`[^`]+`,\s*\};", re.DOTALL)
        match = pattern.search(content)
        if match:
            new_meta_return = """const canonicalUrl = `https://www.bharatyatra.in/states/${params.slug}`;

  return {
    title: `${stateName} Tourism | BharatYatra`,
    description: `Discover all ${placesCount} tourist destinations, attractions, official state cover image, and tour packages for ${stateName}, India.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${stateName} Tourism | BharatYatra`,
      description: `Discover all ${placesCount} tourist destinations, attractions, and tour packages for ${stateName}, India.`,
      url: canonicalUrl,
      siteName: 'BharatYatra',
      locale: 'en_IN',
      type: 'website',
    },
  };"""
            content = content[:match.start()] + new_meta_return + content[match.end():]

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {p}")

# 10. Update all policy pages under app/
policy_files = [
    'app/about/page.tsx',
    'app/booking-policy/page.tsx',
    'app/cancellation-policy/page.tsx',
    'app/careers/page.tsx',
    'app/cookie-policy/page.tsx',
    'app/corporate/page.tsx',
    'app/disclaimer/page.tsx',
    'app/grievance-redressal/page.tsx',
    'app/help/page.tsx',
    'app/press/page.tsx',
    'app/privacy/page.tsx',
    'app/refund-policy/page.tsx',
    'app/terms/page.tsx',
]

for p in policy_files:
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('https://bharatyatra.in/', 'https://www.bharatyatra.in/')
    content = content.replace('https://bharatyatra.com/', 'https://www.bharatyatra.in/')

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {p}")

# 11. Update middleware.ts for apex and .com domain redirection
if os.path.exists('middleware.ts'):
    with open('middleware.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    old_redirect = """  // Canonical apex domain redirect to www.bharatyatra.in (HTTP 308 permanent redirect)
  if (host === 'bharatyatra.in') {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://www.bharatyatra.in');
    return NextResponse.redirect(targetUrl, 308);
  }"""

    new_redirect = """  const host = (request.headers.get('host') || request.nextUrl.hostname || '').replace(/:\d+$/, '').toLowerCase();

  // Canonical apex domain and legacy domain redirect to www.bharatyatra.in (HTTP 308 permanent redirect)
  if (host === 'bharatyatra.in' || host === 'bharatyatra.com' || host === 'www.bharatyatra.com') {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://www.bharatyatra.in');
    return NextResponse.redirect(targetUrl, 308);
  }"""

    if old_redirect in content:
        content = content.replace(old_redirect, new_redirect)
        with open('middleware.ts', 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ Updated middleware.ts")
    else:
        # Regex replacement if whitespace differs
        pattern = re.compile(r"// Canonical apex domain redirect to www\.bharatyatra\.in.*?return NextResponse\.redirect\(targetUrl, 308\);\s*\}", re.DOTALL)
        if pattern.search(content):
            content = pattern.sub(new_redirect.strip(), content)
            with open('middleware.ts', 'w', encoding='utf-8') as f:
                f.write(content)
            print("✅ Updated middleware.ts (regex)")
        else:
            print("⚠️ Could not match redirect in middleware.ts")

print("\nAll canonical fixes applied successfully.")
