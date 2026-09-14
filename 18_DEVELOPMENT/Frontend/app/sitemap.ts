import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.chalofarva.com';

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

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-planner`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/packages`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...destinationUrls,
  ];
}
