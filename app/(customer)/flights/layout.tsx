import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Domestic Flights & Airport Connectivity — Gujarat & India | BharatYatra',
  description:
    'Find and book domestic flights connecting Ahmedabad (SVP International Airport), Rajkot Hirasar, Surat, Vadodara, and Bhuj with major Indian metros and tourist destinations.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/flights',
  },
  openGraph: {
    title: 'Domestic Flights & Airport Connectivity | BharatYatra',
    description:
      'Seamless airport connections and domestic flight guides for travelers across Gujarat and India.',
    url: 'https://www.bharatyatra.in/flights',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Domestic Flights and Airport Connectivity - BharatYatra',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function FlightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FlightReservation',
    provider: {
      '@type': 'TravelAgency',
      name: 'BharatYatra',
      url: 'https://www.bharatyatra.in',
    },
    description:
      'Flight search, domestic airline booking coordination, and airport transfer guides for India travel.',
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
        name: 'Flights',
        item: 'https://www.bharatyatra.in/flights',
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
