import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IRCTC Train Connectivity & Station Guides — Gujarat & India | BharatYatra',
  description:
    'Plan Indian Railways and Vande Bharat express train connections across Ahmedabad Junction, Vadodara, Surat, Rajkot, Dwarka, and Somnath with verified schedules and live status.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/trains',
  },
  openGraph: {
    title: 'IRCTC Train Connectivity & Station Guides | BharatYatra',
    description:
      'Train schedules, Vande Bharat connectivity, and railway station guides for travelers in Gujarat and across India.',
    url: 'https://www.bharatyatra.in/trains',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'IRCTC Train Connectivity - BharatYatra',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function TrainsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TrainReservation',
    provider: {
      '@type': 'TravelAgency',
      name: 'BharatYatra',
      url: 'https://www.bharatyatra.in',
    },
    description:
      'Indian Railways transit guide and connection assistance for tourists traveling across India.',
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
        name: 'Train Guides',
        item: 'https://www.bharatyatra.in/trains',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
