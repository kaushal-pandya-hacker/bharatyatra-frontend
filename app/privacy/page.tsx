import type { Metadata } from 'next';
import { PrivacyClient } from '@/components/legal/PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | BharatYatra',
  description:
    'Official Privacy Policy for BharatYatra — Transparent data stewardship, Supabase cryptographic safety, and user consent mechanisms under the Digital Personal Data Protection (DPDP) Act, 2023.',
  alternates: {
    canonical: 'https://bharatyatra.in/privacy/',
  },
  openGraph: {
    title: 'Privacy Policy | BharatYatra',
    description:
      'Official Privacy Policy for BharatYatra — Transparent data stewardship, Supabase cryptographic safety, and user consent mechanisms under the Digital Personal Data Protection (DPDP) Act, 2023.',
    url: 'https://bharatyatra.in/privacy/',
    siteName: 'BharatYatra',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | BharatYatra',
    description:
      'Official Privacy Policy for BharatYatra — Transparent data stewardship, Supabase cryptographic safety, and user consent mechanisms under the Digital Personal Data Protection (DPDP) Act, 2023.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
