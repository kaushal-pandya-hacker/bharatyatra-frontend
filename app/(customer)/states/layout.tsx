import type { Metadata } from 'next';
import { getAllStateFolderItems } from '@/lib/tourism/state-folder-loader';

export const metadata: Metadata = {
  title: 'All 36 States & Union Territories of India — Travel Guides | BharatYatra',
  description:
    'Explore comprehensive travel guides, verified tourist attractions, regional culture, official cover imagery, and curated tour packages for all 28 states and 8 union territories of India.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/states',
  },
  openGraph: {
    title: 'All 36 States & Union Territories of India — Travel Guides | BharatYatra',
    description:
      'Explore comprehensive travel guides, verified tourist attractions, and curated tour packages for all 28 states and 8 union territories of India.',
    url: 'https://www.bharatyatra.in/states',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Explore 36 States and Union Territories of India - BharatYatra',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All 36 States & Union Territories of India — Travel Guides',
    description: 'Explore verified tourist destinations and curated tour packages across all 36 States & UTs.',
    images: ['/hero-bg.jpg'],
  },
};

export default function StatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const folderStates = getAllStateFolderItems();

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'States and Union Territories of India Tourism Directory',
    description:
      'Comprehensive directory of all 28 States and 8 Union Territories of India with tourist attractions and travel information.',
    numberOfItems: folderStates.length,
    itemListElement: folderStates.map((state, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${state.name} Tourism`,
      url: `https://www.bharatyatra.in/states/${state.slug}`,
    })),
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
        name: 'States & Union Territories',
        item: 'https://www.bharatyatra.in/states',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
