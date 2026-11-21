import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) — AI Planning, Bookings & Ground Travel | BharatYatra',
  description:
    'Find clear, authoritative answers to traveler questions about BharatYatra AI itinerary planning, instant booking vouchers, RBI-authorized payment security, temple darshan hours, and Rann of Kutch permits.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/faq/',
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | BharatYatra',
    description:
      'Clear answers to traveler questions about AI itineraries, bookings, cancellations, temple guidelines, and travel permits across India.',
    url: 'https://www.bharatyatra.in/faq/',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'BharatYatra Frequently Asked Questions',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions (FAQ) | BharatYatra',
    description:
      'Everything you need to know about AI planning, bookings, payment security, cancellations, and ground regulations.',
    images: ['/hero-bg.jpg'],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the BharatYatra AI trip planner work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our AI planner evaluates your preferred travel dates, pace (relaxed vs packed), party composition (solo, couple, family, senior citizens), and cultural interests. It calculates accurate transit times between destinations, factors in temple darshan hours and sanctuary permit quotas, and delivers a ground-verified day-by-day itinerary with verified hotel and transit options.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I customize an AI-generated itinerary after creation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Every generated itinerary is fully editable. You can swap hotels, adjust durations in each city, add specific landmarks from our 100 Landmark Directory, remove destinations, and recalculate the daily budget in real-time.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I receive my booking confirmation voucher?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Immediately upon successful payment authorization, a digital Booking Confirmation Voucher is issued. You will receive an instant email confirmation with your booking reference number (e.g., BY-BK-XXXX) and can access your voucher anytime under "My Bookings" in your traveler dashboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'What government identification is required for check-in?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All travelers must carry valid government-approved photo identification matching the names declared during booking. Accepted documents include Aadhaar Card, Passport, Voter ID, or Indian Driving License. Note that protected wildlife sanctuaries (such as Gir Forest Safari) require original physical IDs matching permit declarations.',
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods does BharatYatra support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We support all major Reserve Bank of India (RBI) authorized payment instruments, including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit and Debit Cards (Visa, Mastercard, RuPay), NetBanking across 50+ scheduled commercial banks, and EMI options on eligible cards.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long do refunds take to credit my account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Once an approved cancellation is processed by our audit desk, the refund is initiated to your original payment instrument within 24–48 hours. Banks typically credit the amount to your account in 5 to 7 business days. UPI refunds usually reflect within 24 to 48 hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are temple dress codes enforced in Gujarat and other pilgrimage destinations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Major spiritual shrines including Somnath Temple, Dwarkadhish Temple, and Palitana Jain Temples enforce traditional modest dress codes (no shorts, sleeveless tops, or western beachwear). Detailed dress code guidance is provided inside each destination profile in our 100 Landmark Directory.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I obtain the mandatory permit for Rann of Kutch (Dhordo)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Because the White Rann lies in a sensitive border region, all Indian and foreign visitors require an entry permit from the Gujarat Police / Forest Department. For visitors booking via BharatYatra, our travel guides outline the simple online permit process and on-arrival checkpost verification at Bhirandiyara.',
      },
    },
  ],
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
      name: 'FAQ',
      item: 'https://www.bharatyatra.in/faq/',
    },
  ],
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      {children}
    </>
  );
}
