import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.bharatyatra.in';

  // Strictly protected administrative, private user, authentication and API endpoints
  const privateDisallows = [
    '/admin/',
    '/admin',
    '/bharatyatra-ops/',
    '/bharatyatra-ops',
    '/supplier/',
    '/partner/',
    '/api/',
    '/my-trips/',
    '/trips/',
    '/checkout/',
    '/cart/',
    '/payment/',
    '/auth/',
    '/login',
    '/signup',
    '/register',
    '/dashboard/',
    '/profile/',
    '/expenses/',
    '/saved/',
  ];

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: privateDisallows,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: privateDisallows,
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: privateDisallows,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: privateDisallows,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: privateDisallows,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
