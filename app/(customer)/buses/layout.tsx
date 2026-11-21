import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GSRTC & Luxury Express Bus Bookings — Gujarat Routes & Schedules | BharatYatra',
  description:
    'Book verified GSRTC Volvo AC sleepers, Gurjarnagri express, and inter-city tourist buses connecting Ahmedabad, Somnath, Dwarka, Surat, Bhuj, and Rajkot.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/buses',
  },
  openGraph: {
    title: 'GSRTC & Luxury Express Bus Bookings | BharatYatra',
    description:
      'Verified GSRTC Volvo sleeper and inter-city tourist bus booking across Gujarat and neighboring states.',
    url: 'https://www.bharatyatra.in/buses',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'GSRTC & Express Bus Booking - BharatYatra',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function BusesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BusReservation',
    provider: {
      '@type': 'TravelAgency',
      name: 'BharatYatra',
      url: 'https://www.bharatyatra.in',
    },
    description:
      'Official route intelligence and booking integration for GSRTC and premium tourist bus coaches across India.',
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
        name: 'Bus Bookings',
        item: 'https://www.bharatyatra.in/buses',
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
