import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/supplier/', '/api/', '/my-trips/'],
      },
    ],
    sitemap: 'https://www.bharatyatra.com/sitemap.xml',
  };
}
