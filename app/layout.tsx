import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { AuthProvider } from '@/lib/auth/auth-context';
import { BookingGuardProvider } from '@/components/booking/BookingGuardProvider';

export const viewport: Viewport = {
  themeColor: '#0A1128',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bharatyatra.com'),
  title: {
    default: 'BharatYatra — India\'s #1 AI Travel & Itinerary Planner',
    template: '%s | BharatYatra — India AI Travel',
  },
  description: 'Plan less. Coordinate less. Enjoy more. Experience India with BharatYatra — AI-powered hyper-personalized itineraries, verified hotel & transit bookings, heritage trails, and real-time travel recommendations.',
  keywords: [
    'India Travel',
    'BharatYatra',
    'India AI Trip Planner',
    'India Tourism',
    'Pan India Travel Platform',
    'Heritage Tourism India',
    'State & UT Travel Guide',
    'India Flight & Train Bookings',
  ],
  authors: [{ name: 'BharatYatra', url: 'https://www.bharatyatra.com' }],
  creator: 'BharatYatra',
  publisher: 'BharatYatra Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
        alt: 'BharatYatra India AI Travel Platform',
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BharatYatra',
  url: 'https://www.bharatyatra.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.bharatyatra.com/explore?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'BharatYatra',
  url: 'https://www.bharatyatra.com',
  logo: 'https://www.bharatyatra.com/logo.png',
  description: 'Gujarat-first AI-native travel platform providing end-to-end trip planning, hotel & transport booking, and heritage exploration.',
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Gujarat',
    addressCountry: 'IN',
  },
  telephone: '+919624282521',
  email: 'pandyakaushal294@gmail.com',
  priceRange: '₹₹',
};

import { AccessibilityProvider } from '@/lib/accessibility/accessibility-context';
import { AccessibilityModal } from '@/components/accessibility/AccessibilityModal';

import { DestinationSelectionProvider } from '@/lib/tourism/destination-selection-context';
import GlobalDestinationSelectionBar from '@/components/travel/GlobalDestinationSelectionBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Hanken+Grotesk:ital,wght@0,300..900;1,300..900&family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Gujarati:wght@400;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-surface text-on-surface font-body-md antialiased selection:bg-farva-gold-sahara selection:text-farva-navy-deep">
        <AccessibilityProvider>
          <AuthProvider>
            <BookingGuardProvider>
              <DestinationSelectionProvider>
                <Header />
                <main className="flex-1 pb-16 md:pb-0">{children}</main>
                <Footer />
                <MobileBottomNav />
                <GlobalDestinationSelectionBar />
                <AccessibilityModal />
              </DestinationSelectionProvider>
            </BookingGuardProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}

