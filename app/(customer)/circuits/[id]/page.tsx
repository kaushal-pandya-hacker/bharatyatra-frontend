import type { Metadata } from 'next';
import CircuitClient from './CircuitClient';

interface CircuitPageProps {
  params: { id: string };
}

const CIRCUIT_TITLES: Record<string, { title: string; description: string; duration: string; price: number }> = {
  'heritage-spiritual-circuit': {
    title: 'Saurashtra Sacred Heritage & Spiritual Temple Circuit',
    description: 'A 5-day sacred pilgrimage journey linking Somnath Jyotirlinga, Dwarkadhish Temple, and Girnar pilgrimage steps with verified coastal stays.',
    duration: 'P5D',
    price: 14800,
  },
  'saurashtra-temple-trail': {
    title: 'Saurashtra Sacred Temple Circuit',
    description: 'A 5-day spiritual circuit across Somnath Jyotirlinga, Dwarkadhish Temple, and Girnar ropeway with verified heritage stays.',
    duration: 'P5D',
    price: 14800,
  },
  'kutch-rann-circuit': {
    title: 'Kutch Rann Utsav & White Desert Cultural Circuit',
    description: 'A 4-day desert odyssey exploring White Rann salt flats, Nirona artisan Rogan art, and historic Bhuj havelis.',
    duration: 'P4D',
    price: 12500,
  },
  'kutch-rann-utsav': {
    title: 'Kutch Rann Utsav & Artisan Circuit',
    description: 'A 4-day cultural exploration featuring White Rann desert tents, Dhordo sunset, and Kutch artisan craft villages.',
    duration: 'P4D',
    price: 12500,
  },
  'wildlife-nature-circuit': {
    title: 'Gir Lion Wildlife & Nature Safari Circuit',
    description: 'A 4-day wildlife adventure with Asiatic Lion Jeep safaris in Gir National Park, Devalia Park, and coastal relaxation.',
    duration: 'P4D',
    price: 13900,
  },
  'gir-asiatic-lion-trail': {
    title: 'Gir Lion Wildlife & Coastal Circuit',
    description: 'A 4-day wildlife expedition across Gir Safari Zone, Devalia sanctuary, and Somnath coastal promenade.',
    duration: 'P4D',
    price: 13900,
  },
  'coastal-beach-circuit': {
    title: 'Gujarat Arabian Sea Coastal & Beach Circuit',
    description: 'A 4-day coastal retreat along Diu Island, Mandvi Vijay Vilas Palace, and Porbandar marine beaches.',
    duration: 'P4D',
    price: 11900,
  },
};

export function generateStaticParams() {
  return [
    { id: 'heritage-spiritual-circuit' },
    { id: 'saurashtra-temple-trail' },
    { id: 'kutch-rann-circuit' },
    { id: 'kutch-rann-utsav' },
    { id: 'wildlife-nature-circuit' },
    { id: 'gir-asiatic-lion-trail' },
    { id: 'coastal-beach-circuit' },
    { id: 'demo' },
  ];
}

export async function generateMetadata({ params }: CircuitPageProps): Promise<Metadata> {
  const data = CIRCUIT_TITLES[params.id] || {
    title: params.id
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') + ' Circuit',
    description: `Discover this curated travel circuit across Gujarat with verified transport, boutique hotel accommodations, and guided local experiences.`,
    duration: 'P4D',
    price: 12500,
  };

  const canonicalUrl = `https://www.bharatyatra.in/circuits/${params.id}/`;

  return {
    title: `${data.title} | BharatYatra`,
    description: data.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${data.title} | BharatYatra`,
      description: data.description,
      url: canonicalUrl,
      siteName: 'BharatYatra',
      images: [
        {
          url: '/somnath-temple-bg.jpg',
          width: 1200,
          height: 630,
          alt: `${data.title} - BharatYatra`,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} | BharatYatra`,
      description: data.description,
      images: ['/somnath-temple-bg.jpg'],
    },
  };
}

export default function CircuitDetailPage({ params }: CircuitPageProps) {
  const data = CIRCUIT_TITLES[params.id] || {
    title: params.id
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') + ' Circuit',
    description: `Curated multi-day travel circuit across Gujarat with verified transport, hotel stays, and cultural stops.`,
    duration: 'P4D',
    price: 12500,
  };

  const touristTripSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: data.title,
    description: data.description,
    url: `https://www.bharatyatra.in/circuits/${params.id}`,
    provider: {
      '@type': 'Organization',
      name: 'BharatYatra',
      url: 'https://www.bharatyatra.in/',
    },
    offers: {
      '@type': 'Offer',
      price: String(data.price),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `https://www.bharatyatra.in/circuits/${params.id}`,
    },
  };

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.bharatyatra.in/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Circuits',
        item: 'https://www.bharatyatra.in/circuits',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.title,
        item: `https://www.bharatyatra.in/circuits/${params.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(touristTripSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <CircuitClient />
    </>
  );
}
