import type { Metadata } from 'next';
import PackageClient from './PackageClient';
import { ALL_INDIA_PACKAGES, IndiaPackage } from '@/data/india-packages.data';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  const dynamicSlugs = ALL_INDIA_PACKAGES
    .filter((pkg) => Boolean(pkg.slug))
    .map((pkg) => ({ slug: pkg.slug }));

  // Ensure default fallback legacy slugs are also available
  const fallbackSlugs = [
    { slug: 'gujarat-heritage-tour' },
    { slug: 'somnath-dwarka-spiritual' },
    { slug: 'rann-of-kutch-experience' },
    { slug: 'statue-of-unity-express' },
    { slug: 'gir-wildlife-safari' },
  ];

  const combined = [...fallbackSlugs, ...dynamicSlugs];
  const uniqueSlugs = Array.from(new Set(combined.map((item) => item.slug))).map((slug) => ({ slug }));
  return uniqueSlugs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pkg = ALL_INDIA_PACKAGES.find(
    (p: IndiaPackage) => p.slug === params.slug || p.id === params.slug || p.packageId === params.slug
  );

  const title = pkg?.title || pkg?.packageName || params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const description =
    pkg?.shortDescription ||
    pkg?.description ||
    `Experience the ${title} with BharatYatra. All-inclusive luxury resort stays, guided transport, transparent pricing, and instant AI customization.`;

  const canonicalUrl = `https://www.bharatyatra.in/packages/${params.slug}/`;
  const ogImage = pkg?.heroImageUrl || pkg?.coverImage || pkg?.image || '/hero-bg.jpg';

  return {
    title: `${title} Tour Package | BharatYatra`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} Tour Package | BharatYatra`,
      description,
      url: canonicalUrl,
      siteName: 'BharatYatra',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - BharatYatra Tour Package`,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} Tour Package | BharatYatra`,
      description,
      images: [ogImage],
    },
  };
}

export default function PackageDetailPage({ params }: Props) {
  const pkg = ALL_INDIA_PACKAGES.find(
    (p: IndiaPackage) => p.slug === params.slug || p.id === params.slug || p.packageId === params.slug
  );

  const title = pkg?.title || pkg?.packageName || params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const description =
    pkg?.shortDescription ||
    pkg?.description ||
    `Experience the ${title} with BharatYatra. All-inclusive luxury resort stays, guided transport, transparent pricing, and instant AI customization.`;

  const price = pkg?.startingPriceInr || pkg?.startingPrice || 9999;
  const duration = pkg?.durationDays ? `P${pkg.durationDays}D` : 'P5D';

  const tripJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['TouristTrip', 'Product'],
    name: title,
    description,
    touristType: pkg?.tourismType || 'Cultural & Heritage Tourism',
    duration,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `https://www.bharatyatra.in/packages/${params.slug}`,
      validFrom: '2026-01-01',
    },
    provider: {
      '@type': 'TravelAgency',
      name: 'BharatYatra',
      url: 'https://www.bharatyatra.in',
      telephone: '+91 79 4000 1234',
      email: 'namaste@bharatyatra.in',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.bharatyatra.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tour Packages',
        item: 'https://www.bharatyatra.in/packages',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `https://www.bharatyatra.in/packages/${params.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tripJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PackageClient />
    </>
  );
}
