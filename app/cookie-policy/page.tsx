import type { Metadata } from 'next';
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy | BharatYatra',
  description:
    'Official BharatYatra Cookie Policy — Detailed explanations of cookies, local storage, analytics beacons, and user consent management.',
  alternates: {
    canonical: 'https://bharatyatra.in/cookie-policy/',
  },
};

const SECTIONS: LegalSection[] = [
  {
    id: 'what-are-cookies',
    number: '01',
    title: 'What Are Cookies & Local Storage',
    content: (
      <>
        <p>
          Cookies and modern web storage mechanisms (such as localStorage and sessionStorage) are small data files placed on your browser or device when you interact with BharatYatra (https://bharatyatra.in). They allow our platform to remember your language preferences, active session tokens, itinerary drafts, and destination filters.
        </p>
      </>
    ),
  },
  {
    id: 'categories',
    number: '02',
    title: 'Categories of Cookies Used',
    content: (
      <>
        <div className="space-y-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-[#102B4E] mb-1">1. Strictly Necessary (Essential) Cookies</h4>
            <p className="text-xs">
              Essential for authentication, secure checkout sessions, CSRF security, and route navigation. Disabling these will prevent portal login and booking completion.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-[#102B4E] mb-1">2. Functional &amp; Preference Cookies</h4>
            <p className="text-xs">
              Remember your customized itinerary drafts, currency preference (INR), chosen state filters, and accessibility preferences (font scaling, high contrast).
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-[#102B4E] mb-1">3. Analytics &amp; Performance Cookies</h4>
            <p className="text-xs">
              Collect aggregated, anonymized metrics on page load latency, popular destination lookups, and feature engagement to help optimize platform stability.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'managing-cookies',
    number: '03',
    title: 'Managing & Disabling Cookies',
    content: (
      <>
        <p>
          You have full control over cookie preferences through your web browser settings (Chrome, Safari, Firefox, Edge). You can choose to block all cookies or receive notifications when cookies are dispatched. Please note that blocking essential cookies may disrupt authentication sessions and booking capabilities.
        </p>
      </>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      badge="Data Privacy &amp; Storage"
      version="1.0"
      lastUpdated="November 2026"
      description="Understanding how BharatYatra utilizes essential session cookies, local storage, and analytical beacons to safeguard and personalize your travel planning."
      sections={SECTIONS}
    />
  );
}

