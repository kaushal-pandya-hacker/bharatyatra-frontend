import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.bharatyatra.com';

  const gujaratDestinations = [
    'ahmedabad',
    'vadodara',
    'surat',
    'rajkot',
    'gandhinagar',
    'dwarka',
    'somnath',
    'diu',
    'gir',
    'girnar',
    'kutch',
    'bhuj',
    'rann-of-kutch',
    'statue-of-unity',
    'saputara',
    'champaner-pavagadh',
    'patan',
    'modhera',
    'porbandar',
    'mandvi',
    'polo-forest',
    'nal-sarovar',
    'little-rann-of-kutch',
    'marine-national-park',
  ];

  const destinationUrls = gujaratDestinations.map((slug) => ({
    url: `${baseUrl}/destinations/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const mainPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/explore`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/destinations`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/plan`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/packages`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/stays`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/buses`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/trains`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/flights`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/restaurants`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/experiences`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/map`, priority: 0.7, changeFrequency: 'weekly' as const },
  ];

  return [
    ...mainPages.map((p) => ({
      ...p,
      lastModified: new Date(),
    })),
    ...destinationUrls,
  ];
}
