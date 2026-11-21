import { MetadataRoute } from 'next';
import { GUJARAT_DESTINATIONS } from '@/lib/data/destinations';
import { getAllStateFolderItems } from '@/lib/tourism/state-folder-loader';
import { ALL_INDIA_PACKAGES } from '@/data/india-packages.data';
import { GEO_GUIDES_DATA } from '@/lib/guides/guides-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.bharatyatra.in';
  const now = new Date();

  // 1. Core Platform & Discovery Pages (Canonical with Trailing Slash)
  const mainPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/explore/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/destinations/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/packages/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/states/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/plan/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/circuits/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/stays/`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/experiences/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/restaurants/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/buses/`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/trains/`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/flights/`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/map/`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about/`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/contact/`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/help/`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/booking-policy/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/cancellation-policy/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/refund-policy/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/cookie-policy/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/disclaimer/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/grievance-redressal/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 2. All 36 States & Union Territories of India
  let stateUrls: MetadataRoute.Sitemap = [];
  try {
    const states = getAllStateFolderItems();
    stateUrls = states.map((s) => ({
      url: `${baseUrl}/states/${s.slug}/`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));
  } catch {}

  // 3. Iconic Destinations
  const destinationSlugs = new Set<string>();
  GUJARAT_DESTINATIONS.forEach((d) => {
    if (d.slug) destinationSlugs.add(d.slug);
  });

  // Common high-traffic landmark slugs
  const commonLandmarks = [
    'ahmedabad', 'vadodara', 'surat', 'rajkot', 'gandhinagar',
    'dwarka', 'somnath', 'diu', 'gir', 'girnar', 'kutch', 'bhuj',
    'rann-of-kutch', 'statue-of-unity', 'saputara', 'champaner-pavagadh',
    'patan', 'modhera', 'porbandar', 'mandvi', 'polo-forest',
    'nal-sarovar', 'little-rann-of-kutch', 'marine-national-park',
    'taj-mahal', 'varanasi-ghats', 'jaipur-city-palace', 'hampi-ruins',
    'alleppey-backwaters', 'leh-ladakh', 'goa-beaches', 'mysore-palace'
  ];
  commonLandmarks.forEach((s) => destinationSlugs.add(s));

  const destinationUrls: MetadataRoute.Sitemap = Array.from(destinationSlugs).map((slug) => ({
    url: `${baseUrl}/destinations/${slug}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 4. Tour Packages
  const packageSlugs = new Set<string>();
  if (Array.isArray(ALL_INDIA_PACKAGES)) {
    ALL_INDIA_PACKAGES.forEach((p) => {
      if (p.slug) packageSlugs.add(p.slug);
    });
  }
  // Ensure primary package slugs exist
  [
    'gujarat-heritage-tour',
    'somnath-dwarka-spiritual',
    'rann-of-kutch-experience',
    'statue-of-unity-express',
    'gir-wildlife-safari',
  ].forEach((s) => packageSlugs.add(s));

  const packageUrls: MetadataRoute.Sitemap = Array.from(packageSlugs).map((slug) => ({
    url: `${baseUrl}/packages/${slug}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 5. Cultural Circuits
  const circuitIds = [
    'heritage-spiritual-circuit',
    'kutch-rann-circuit',
    'wildlife-nature-circuit',
    'coastal-beach-circuit',
    'kutch-rann-utsav',
    'saurashtra-temple-trail',
    'gir-asiatic-lion-trail',
  ];
  const circuitUrls: MetadataRoute.Sitemap = circuitIds.map((id) => ({
    url: `${baseUrl}/circuits/${id}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  // 6. Authoritative Travel & Logistics Guides (GEO Cornerstone Articles)
  const guideUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/guides/`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    ...Object.values(GEO_GUIDES_DATA).map((g) => ({
      url: g.canonicalUrl,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
  ];

  return [
    ...mainPages,
    ...stateUrls,
    ...destinationUrls,
    ...packageUrls,
    ...circuitUrls,
    ...guideUrls,
  ];
}
