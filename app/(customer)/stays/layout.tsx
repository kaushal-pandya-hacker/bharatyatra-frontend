import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hotel & Resort Stays in Gujarat & India — Verified Heritage Bookings | BharatYatra',
  description:
    'Book verified heritage havelis, luxury desert tent camps, 5-star seaside resorts, and authentic homestays across Gujarat and India with transparent pricing and zero hidden fees.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/stays',
  },
  openGraph: {
    title: 'Hotel & Resort Stays in Gujarat & India | BharatYatra',
    description:
      'Book verified heritage havelis, luxury desert tent camps, and beachfront resorts across Gujarat and India.',
    url: 'https://www.bharatyatra.in/stays',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Verified Heritage & Luxury Stays in India - BharatYatra',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function StaysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingReservation',
    provider: {
      '@type': 'TravelAgency',
      name: 'BharatYatra',
      url: 'https://www.bharatyatra.in',
    },
    description:
      'Verified heritage hotels, desert resort camps, beach resorts, and pilgrimage guest stays across India.',
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
        name: 'Stays & Hotels',
        item: 'https://www.bharatyatra.in/stays',
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
