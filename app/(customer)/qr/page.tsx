import type { Metadata, Viewport } from 'next';
import { SmartQrLandingClient } from '@/components/qr/SmartQrLandingClient';

export const viewport: Viewport = {
  themeColor: '#FF9933',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'BharatYatra — Official Smart QR Portal | Your Journey Starts Here',
  description:
    'One scan. Endless possibilities. Explore incredible destinations, discover verified packages, build your AI itinerary, or partner with BharatYatra.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/qr/',
  },
  openGraph: {
    title: 'BharatYatra — Official Smart QR Portal',
    description:
      'Discover India. Travel Better. Access the AI Trip Planner, destination guides, curated tour packages, and travel partner ecosystem.',
    url: 'https://www.bharatyatra.in/qr/',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'BharatYatra Smart QR Landing Portal',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BharatYatra — Official Smart QR Portal',
    description: 'Discover India. Travel Better. Access AI itinerary planning and verified tour circuits.',
    images: ['/hero-bg.jpg'],
    creator: '@bharatyatra',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SmartQrPage() {
  return <SmartQrLandingClient />;
}
