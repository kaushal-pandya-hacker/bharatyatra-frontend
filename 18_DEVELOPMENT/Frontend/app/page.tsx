import type { Metadata } from 'next';
import HomePageClient from '@/components/home/HomePageClient';
import { AppGate } from '@/components/auth/AppGate';

export const metadata: Metadata = {
  title: 'BharatYatra — India\'s #1 AI Travel & Itinerary Planner',
  description: 'Plan less. Coordinate less. Enjoy more. Experience India with BharatYatra — AI-powered hyper-personalized itineraries, verified hotel & transit bookings, heritage trails, and real-time travel recommendations.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BharatYatra — India\'s #1 AI Travel & Itinerary Planner',
    description: 'Plan less. Coordinate less. Enjoy more. Explore India with AI itineraries, live bookings, and iconic landmarks.',
    url: 'https://www.bharatyatra.com',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'BharatYatra - India AI Travel Platform',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BharatYatra — India\'s #1 AI Travel Platform',
    description: 'Plan less. Coordinate less. Enjoy more. Adaptive AI trip planner for India.',
    images: ['/hero-bg.jpg'],
    creator: '@bharatyatra',
  },
};

export default function Page() {
  return (
    <AppGate>
      <HomePageClient />
    </AppGate>
  );
}
