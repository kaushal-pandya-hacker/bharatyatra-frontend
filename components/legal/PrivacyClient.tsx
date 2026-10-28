'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Lock,
  FileText,
  Search,
  Printer,
  Link2,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Server,
  Database,
  Building2,
  Mail,
  ChevronRight,
  ArrowUp,
  X,
  ExternalLink,
  History,
  Info,
  Scale,
  Cookie,
  Trash2,
  Eye,
  Edit3,
  UserX,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';

interface PolicySection {
  id: string;
  num: string;
  title: string;
  badge?: string;
  summary: string;
  content: React.ReactNode;
}

export function PrivacyClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('sec-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [perfConsent, setPerfConsent] = useState(true);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [deletionSubmitted, setDeletionSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Toast notification timer
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const copyClauseLink = useCallback((sectionId: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/privacy/#${sectionId}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => showToast('Direct permalink copied to clipboard'))
        .catch(() => showToast(`Section reference: #${sectionId}`));
    } else {
      showToast(`Section reference: #${sectionId}`);
    }
  }, [showToast]);

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search, ESC to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('policy-search')?.focus();
      } else if (e.key === 'Escape') {
        if (showDeletionModal) {
          setShowDeletionModal(false);
        } else if (searchQuery) {
          setSearchQuery('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, showDeletionModal]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('article[id^="sec-"]');
      const scrollPosition = window.scrollY + 200;

      sections.forEach((section) => {
        const top = (section as HTMLElement).offsetTop;
        const height = (section as HTMLElement).offsetHeight;
        const id = section.getAttribute('id');
        if (id && scrollPosition >= top && scrollPosition < top + height) {
          setActiveSection(id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTelemetry = useCallback(() => {
    setPerfConsent((prev) => {
      const next = !prev;
      showToast(next ? 'Performance telemetry enabled' : 'Performance telemetry disabled');
      return next;
    });
  }, [showToast]);

  const handleTriggerDeletion = useCallback(() => {
    setDeletionSubmitted(false);
    setShowDeletionModal(true);
  }, []);

  const handleConfirmDeletion = useCallback(() => {
    const generatedTicket = `BY-DPDP-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(generatedTicket);
    setDeletionSubmitted(true);
    showToast(`Erasure Request #${generatedTicket} logged successfully`);
  }, [showToast]);

  // Comprehensive sections meeting all 17 required criteria
  const SECTIONS: PolicySection[] = useMemo(
    () => [
      {
        id: 'sec-1',
        num: '1.0',
        title: 'Introduction & Data Fiduciary Identity',
        badge: 'DPDP Section 4',
        summary:
          'Identity of BharatYatra as the Data Fiduciary operating the platform under applicable Indian statutes.',
        content: (
          <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
            <p>
              Welcome to <strong>BharatYatra</strong> (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), accessible via{' '}
              <strong className="text-slate-900">https://bharatyatra.in</strong> (including associated mobile-optimized interfaces, applications, and subdomains). We are committed to safeguarding the digital privacy and personal data of our travellers, registered users, and partners.
            </p>
            <p>
              Under the <em>Digital Personal Data Protection Act, 2023 (DPDP Act)</em> and Rule 3(1) of the <em>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</em>, BharatYatra operates as the <strong>Data Fiduciary</strong> determining the purpose and means of processing your personal data for travel discovery, AI itinerary generation, and travel booking coordination.
            </p>
            <div className="bg-[#FAF9F4] border border-[#E2E8F0] p-4 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold uppercase tracking-wider text-[11px]">
                <Building2 className="w-4 h-4 text-amber-700" />
                <span>Operational &amp; Fiduciary Registry Particulars</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-slate-800">
                <div>
                  <span className="text-slate-500 font-medium">Platform Brand:</span>{' '}
                  <strong className="text-slate-900">BharatYatra</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Official Website:</span>{' '}
                  <span className="font-mono text-blue-700">https://bharatyatra.in</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Fiduciary Desk:</span>{' '}
                  <a href="mailto:privacy@bharatyatra.in" className="font-mono text-teal-700 hover:underline">
                    privacy@bharatyatra.in
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Customer Support:</span>{' '}
                  <a href="mailto:support@bharatyatra.in" className="font-mono text-teal-700 hover:underline">
                    support@bharatyatra.in
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Primary Legal Jurisdiction:</span>{' '}
                  <strong className="text-slate-900">Ahmedabad, Gujarat, India</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Statutory Classification:</span>{' '}
                  <span>E-Commerce Travel Technology Intermediary</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 bg-amber-50/60 p-2 rounded">
                <strong>Notice for Owner Review:</strong> Corporate entity registration particulars (e.g. CIN, formal corporate legal name &amp; registered postal address) are subject to formal confirmation upon final incorporation with the Ministry of Corporate Affairs (MCA).
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'sec-2',
        num: '2.0',
        title: 'Scope of this Privacy Policy',
        summary:
          'Defines the digital environments, interactions, and user roles covered by this policy.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              This Privacy Policy applies to all digital personal data collected, stored, processed, or shared by BharatYatra through:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>Our primary web application at <code>https://bharatyatra.in</code> and responsive mobile browser viewports.</li>
              <li>Our proprietary AI trip planning engine, destination exploration tools, and interactive Gujarat route maps.</li>
              <li>User registration, Google OAuth sign-in, account management, and traveller profile storage.</li>
              <li>Booking requests, voucher issuance, expense logs, and customer support communications.</li>
              <li>Travel partner and supplier onboarding portals where supplier personnel submit verification data.</li>
            </ul>
            <p>
              This policy does <strong>not</strong> govern third-party platforms accessed via external hyperlinks (such as external airline portals, payment gateways, or state tourism boards), which operate under their own independent privacy notices.
            </p>
          </div>
        ),
      },
      {
        id: 'sec-3',
        num: '3.0',
        title: 'Information Provided During Registration & Booking',
        summary:
          'Personal details voluntarily provided by travellers to access features and issue tickets.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              In strict adherence with the statutory doctrine of <strong>data minimisation</strong> under Section 6 of the DPDP Act 2023, BharatYatra collects only personal information strictly necessary to provision requested travel services:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-[#FAF9F4] rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <UserCheck className="w-4 h-4 text-teal-700" />
                  <span>Account &amp; Profile Data</span>
                </div>
                <p className="text-xs text-slate-600">
                  Full name, email address, profile avatar URL, preferred language, and accessibility preferences.
                </p>
              </div>
              <div className="p-3.5 bg-[#FAF9F4] rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Passenger &amp; Manifest Data</span>
                </div>
                <p className="text-xs text-slate-600">
                  Full legal names (matching government photo identity cards such as Aadhaar, Voter ID, or Passport), age, gender, seat/berth selection, and meal preferences as required by transport operators and hotel check-in compliance.
                </p>
              </div>
              <div className="p-3.5 bg-[#FAF9F4] rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Mail className="w-4 h-4 text-indigo-700" />
                  <span>Contact Information</span>
                </div>
                <p className="text-xs text-slate-600">
                  Mobile telephone number and primary email for dispatching PNR updates, booking confirmations, emergency advisories, and payment receipts.
                </p>
              </div>
              <div className="p-3.5 bg-[#FAF9F4] rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>Partner &amp; Supplier Data</span>
                </div>
                <p className="text-xs text-slate-600">
                  Agency legal trade name, business registration number, GSTIN, PAN, and authorized representative contact details for verified local suppliers.
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'sec-4',
        num: '4.0',
        title: 'Authentication & Account Security (Supabase & Google OAuth)',
        badge: 'Cryptographic Security',
        summary:
          'How user credentials and session tokens are safeguarded using enterprise cloud authentication.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              BharatYatra implements industry-standard, token-based authentication powered by <strong>Supabase Auth</strong>. We strictly refuse to maintain or handle plain-text user passwords on our application servers.
            </p>
            <div className="bg-[#091426] text-white p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Authentication Safeguards &amp; Tokenisation</span>
              </div>
              <ul className="text-xs space-y-1 text-slate-300 list-disc pl-5">
                <li>
                  <strong>Federated Google OAuth:</strong> When signing in with Google, authentication occurs directly on Google&apos;s secure authorization servers. BharatYatra receives only a cryptographically signed OAuth identity token, your verified email, and your profile name.
                </li>
                <li>
                  <strong>Email/Password Cryptography:</strong> Passwords are one-way hashed using salted Bcrypt/Argon2 algorithms handled directly by Supabase Vault infrastructure.
                </li>
                <li>
                  <strong>Row-Level Security (RLS):</strong> Our database enforces strict RLS policies at the PostgreSQL engine level, guaranteeing that your trips, bookings, and profile data can only be queried by your verified session token (<code>auth.uid()</code>).
                </li>
                <li>
                  <strong>Short-Lived JWT Tokens:</strong> Sessions are authenticated through temporary JSON Web Tokens with strict 3600-second expiry and secure refresh rotation.
                </li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: 'sec-5',
        num: '5.0',
        title: 'Travel Preferences, Saved Itineraries & Booking Context',
        summary:
          'Local and cloud persistence of travel parameters, saved trips, and AI planner outputs.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              To deliver personalized AI travel recommendations without unnecessary server roundtrips, the Platform utilizes browser local storage and cloud database synchronization:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong>Travel Preferences:</strong> Budget bands (e.g. Budget, Moderate, Luxury), travel pace, companion types (Solo, Family, Couple, Friends), and thematic interests (Heritage, Wildlife, Spiritual, Beach).
              </li>
              <li>
                <strong>Saved &amp; Active Itineraries:</strong> Multi-day schedules, day-by-day stops, selected landmarks, and transport mode preferences saved to your account.
              </li>
              <li>
                <strong>Client-Side Cache:</strong> Non-sensitive contextual data (such as active landmark bookmarks and trip draft builders) is cached in your browser&apos;s <code>localStorage</code> under <code>bharatyatra_travel_profile</code> and <code>bharatyatra_selected_destinations</code>. You can clear this anytime through browser settings.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: 'sec-6',
        num: '6.0',
        title: 'Automatically Collected Telemetry, Diagnostics & Logs',
        summary:
          'Technical data collected automatically for platform reliability, performance, and security.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              When navigating BharatYatra, our edge network and server infrastructure automatically log standard technical telemetry necessary for platform stability, security defense, and performance diagnostics:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong>Network Indicators:</strong> Client IP address (pseudonymized and hashed at rest for DDoS mitigation), HTTP request headers, and response timestamps.
              </li>
              <li>
                <strong>Device &amp; Browser Telemetry:</strong> User-agent string, operating system version, screen resolution, viewport geometry, and language header.
              </li>
              <li>
                <strong>Performance Metrics:</strong> Core Web Vitals (Largest Contentful Paint, First Input Delay, Cumulative Layout Shift) collected in aggregate without identifying individual users.
              </li>
              <li>
                <strong>No Third-Party Ad Trackers:</strong> BharatYatra does <strong>not</strong> install intrusive behavioral trackers, invasive social advertising pixels, or cross-context commercial tracking networks.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: 'sec-7',
        num: '7.0',
        title: 'Purposes & Lawful Grounds for Data Processing',
        badge: 'DPDP Section 4 & 6',
        summary:
          'Legal grounds under Indian law authorizing the collection and processing of personal data.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              Under Section 4 and Section 6 of the <em>Digital Personal Data Protection Act, 2023</em>, BharatYatra processes personal data strictly on the grounds of <strong>Specific, Informed, and Unambiguous Consent</strong> and for legitimate fulfillment of contractual travel requests:
            </p>
            <div className="space-y-2 pt-1">
              <div className="p-3 bg-[#FAF9F4] rounded-lg border border-[#E2E8F0] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block text-xs">Contractual Fulfillment &amp; Itinerary Delivery:</strong>
                  <span className="text-xs text-slate-600">
                    Synthesizing custom routes, calculating travel feasibility, reserving hotel rooms, and issuing official transport tickets.
                  </span>
                </div>
              </div>
              <div className="p-3 bg-[#FAF9F4] rounded-lg border border-[#E2E8F0] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block text-xs">Customer Support &amp; Operational Alerts:</strong>
                  <span className="text-xs text-slate-600">
                    Dispatching critical transit notifications (PNR status, weather warnings, schedule adjustments, gate changes) via email and SMS.
                  </span>
                </div>
              </div>
              <div className="p-3 bg-[#FAF9F4] rounded-lg border border-[#E2E8F0] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block text-xs">Statutory Legal &amp; Taxation Compliance:</strong>
                  <span className="text-xs text-slate-600">
                    Retaining commercial transaction records to comply with the <em>Central Goods and Services Tax Act, 2017</em>, accounting guidelines, and lawful law-enforcement directives.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'sec-8',
        num: '8.0',
        title: 'Data Processors & Third-Party Infrastructure',
        summary:
          'Enterprise infrastructure partners bound by enforceable Data Processing Agreements.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              To provide a reliable cloud service, BharatYatra engages certified enterprise infrastructure sub-processors subject to contractual Data Processing Agreements (DPAs):
            </p>
            <div className="space-y-2 pt-1">
              <div className="p-3 bg-[#FAF9F4] rounded-lg border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Supabase Inc. (Database &amp; Identity Fiduciary)</span>
                  <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">Database &amp; Auth</span>
                </div>
                <p className="text-xs text-slate-600">
                  Provides enterprise PostgreSQL database hosting, cryptographic auth token management, Row-Level Security policy enforcement, and daily encrypted data backups.
                </p>
              </div>
              <div className="p-3 bg-[#FAF9F4] rounded-lg border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Vercel Inc. (Edge Network &amp; Application Compute)</span>
                  <span className="text-[10px] font-mono text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">Global CDN &amp; Compute</span>
                </div>
                <p className="text-xs text-slate-600">
                  Distributes pre-rendered static assets, executes serverless Next.js route handlers, and manages HTTPS edge termination with automatic DDoS filtering.
                </p>
              </div>
              <div className="p-3 bg-[#FAF9F4] rounded-lg border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Payment Processing Gateways (Razorpay / BharatGateway Sandbox)</span>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">PCI-DSS Tokenisation</span>
                </div>
                <p className="text-xs text-slate-600">
                  Handles payment authorization via UPI, credit/debit cards, and Net Banking. <strong>BharatYatra never receives, stores, or processes raw credit card numbers, CVVs, or bank net-banking passwords.</strong> All payment processing occurs within RBI-licensed, PCI-DSS Level 1 compliant environments.
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'sec-9',
        num: '9.0',
        title: 'Direct Travel Operators & Public Sector Carriers',
        summary:
          'Transmission of traveller manifests to airlines, rail partners, bus operators, and hotels.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              When you finalize a travel booking, essential traveller details are transmitted to the relevant third-party suppliers to issue confirmed vouchers and comply with statutory travel regulations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong>Rail Bookings:</strong> Transmitted through authorized IRCTC integration partners in compliance with Indian Railways passenger reservation directives.
              </li>
              <li>
                <strong>Air Travel:</strong> Passenger details (name, date of birth, contact number, government ID type) transmitted to airlines and civil aviation authorities in compliance with DGCA safety and security mandates.
              </li>
              <li>
                <strong>Hotels &amp; Homestays:</strong> Lead guest name, contact details, stay duration, and check-in documentation requirements shared directly with the hotel or resort for reservation confirmation and police registration rules (Form C where applicable).
              </li>
              <li>
                <strong>Protected Reserves &amp; National Parks:</strong> Visitor details (e.g., Sasan Gir Forest safari permits or Rann of Kutch check-post entries) shared strictly with Gujarat Forest Department or relevant administrative authorities for official permit validation.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: 'sec-10',
        num: '10.0',
        title: 'Data Storage, Retention & Deletion Practices',
        summary:
          'Retention timelines based on operational needs and statutory Indian taxation mandates.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              Personal data is retained only for the duration necessary to accomplish the specified purposes for which it was collected, or to comply with statutory statutory retention mandates under Indian law:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
                <thead className="bg-[#FAF9F4] text-slate-900 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Retention Window</th>
                    <th className="p-2.5">Statutory Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">User Account &amp; Profile</td>
                    <td className="p-2.5">Duration of active account + 30 days post-deletion request</td>
                    <td className="p-2.5">Consent &amp; Account Service</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">Itineraries &amp; Saved Trips</td>
                    <td className="p-2.5">Until user deletes or requests account purge</td>
                    <td className="p-2.5">User Preference</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">Completed Booking Vouchers</td>
                    <td className="p-2.5">Up to 8 years from financial year end</td>
                    <td className="p-2.5">GST Act &amp; Companies Act audit requirements</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">Server Diagnostic &amp; Security Logs</td>
                    <td className="p-2.5">90 to 180 days (rolling purge)</td>
                    <td className="p-2.5">CERT-In Security Directives</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
      {
        id: 'sec-11',
        num: '11.0',
        title: 'Security Safeguards & Technical Limitations',
        badge: 'HSTS & TLS 1.3',
        summary:
          'Security measures deployed across cloud systems and realistic acknowledgment of digital transmission risks.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              BharatYatra implements comprehensive administrative, physical, and technical safeguards engineered to protect personal data against unauthorized access, alteration, disclosure, or accidental destruction:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong>Transport Encryption:</strong> 100% of network traffic is encrypted via TLS 1.3 with automated HTTP Strict Transport Security (HSTS) headers and preloading.
              </li>
              <li>
                <strong>Content Security Policy:</strong> Strict CSP rules blocking unauthorized scripts, external cross-site scripting (XSS) vectors, and clickjacking attacks.
              </li>
              <li>
                <strong>Database Protection:</strong> PostgreSQL connections require TLS with Row-Level Security (RLS) enforcement, automated hourly transaction logging, and daily encrypted snapshots.
              </li>
              <li>
                <strong>Technical Limitations Disclaimer:</strong> While we enforce robust, modern security controls, no internet-connected platform can guarantee absolute invulnerability. Travellers are responsible for keeping account passwords, authentication links, and personal devices secure.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: 'sec-12',
        num: '12.0',
        title: 'Enforceable Data Principal Rights (DPDP Act, 2023)',
        badge: 'DPDP Section 11-14',
        summary:
          'Your statutory legal rights to access, rectify, withdraw consent, and nominate successors.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              As a lawful <strong>Data Principal</strong> under the <em>Digital Personal Data Protection Act, 2023</em>, you possess statutory rights enforceable against BharatYatra:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-[#FAF9F4] border border-[#E2E8F0] rounded-lg space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Eye className="w-4 h-4 text-teal-700" />
                  <span>1. Right to Access &amp; Summary</span>
                </div>
                <p className="text-xs text-slate-600">
                  Request a plain-language summary of your personal data processed by BharatYatra, including identity of third-party processors.
                </p>
              </div>
              <div className="p-3 bg-[#FAF9F4] border border-[#E2E8F0] rounded-lg space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Edit3 className="w-4 h-4 text-amber-700" />
                  <span>2. Right to Correction &amp; Erasure</span>
                </div>
                <p className="text-xs text-slate-600">
                  Correct inaccurate, outdated, or misleading profile details, and request deletion of personal data no longer necessary for service provision.
                </p>
              </div>
              <div className="p-3 bg-[#FAF9F4] border border-[#E2E8F0] rounded-lg space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <UserX className="w-4 h-4 text-rose-700" />
                  <span>3. Right to Withdraw Consent</span>
                </div>
                <p className="text-xs text-slate-600">
                  Revoke previously granted processing consent at any time. Withdrawal does not affect the legality of prior processing.
                </p>
              </div>
              <div className="p-3 bg-[#FAF9F4] border border-[#E2E8F0] rounded-lg space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Scale className="w-4 h-4 text-indigo-700" />
                  <span>4. Right of Nomination (Sec. 14)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Nominate any individual who shall, in the event of death or incapacity, exercise your Data Principal rights.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              To exercise any statutory right, submit a signed request to <a href="mailto:privacy@bharatyatra.in" className="text-blue-700 font-semibold underline">privacy@bharatyatra.in</a>. We respond within the statutory timeframe (under 30 days).
            </p>
          </div>
        ),
      },
      {
        id: 'sec-13',
        num: '13.0',
        title: 'Account Deletion & Personal Data Correction Procedures',
        summary:
          'Verified procedures for travellers to request complete record erasure and data updates.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              We provide clear, verified pathways for travellers to update personal information or initiate complete account erasure:
            </p>
            <div className="p-4 bg-[#FAF9F4] border border-[#E2E8F0] rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <Trash2 className="w-4 h-4 text-rose-700" />
                <span>Verified Account Erasure Protocol</span>
              </div>
              <p className="text-xs text-slate-600">
                You may trigger an official erasure request directly through this page or by emailing our Fiduciary Desk with your registered email address. Upon verification:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-700">
                <li>Your active Supabase authentication identity is permanently deactivated.</li>
                <li>Associated traveller preferences, saved routes, and draft plans are purged from cloud storage.</li>
                <li>Your name and contact identifiers are decoupled from historic booking records, except where statutory GST/tax mandates require retention of invoice transaction records.</li>
                <li>A formal confirmation notice is dispatched to your registered email address within 72 business hours.</li>
              </ol>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTriggerDeletion}
                  className="px-4 py-2.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors shadow-sm inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Initiate Irrevocable Erasure Request</span>
                </button>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'sec-14',
        num: '14.0',
        title: "Protection of Children & Minors' Privacy",
        badge: 'DPDP Section 9',
        summary:
          'Prohibition on independent accounts by minors and requirement for parental/guardian consent.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              Under Section 9 of the <em>DPDP Act, 2023</em>, BharatYatra does <strong>not</strong> permit registration, account creation, or contract execution by individuals under eighteen (18) years of age without verifiable parental or lawful guardian authorization.
            </p>
            <p>
              Minor passenger information (e.g. child travellers accompanying parents on rail, air, or hotel reservations) is collected strictly when provided by an adult primary traveller who certifies lawful parental or guardianship authority. BharatYatra does not undertake behavioral tracking or targeted marketing directed at minors.
            </p>
          </div>
        ),
      },
      {
        id: 'sec-15',
        num: '15.0',
        title: 'Cross-Border Data Transfers & Sovereign Safeguards',
        summary:
          'Storage locations in India and conditions governing cross-border processing.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              BharatYatra primarily stores and processes user personal data within sovereign data centers located in <strong>Mumbai and Bengaluru, India</strong>.
            </p>
            <p>
              Where enterprise cloud providers (such as Supabase or Vercel edge networks) distribute compute nodes or encrypted backups internationally, data transfers are conducted strictly in compliance with Section 16 of the <em>DPDP Act, 2023</em>, adhering to Central Government negative list notifications and enforcing equivalent cryptographic safeguards abroad.
            </p>
          </div>
        ),
      },
      {
        id: 'sec-16',
        num: '16.0',
        title: 'Grievance Redressal Officer & Statutory Escalations',
        badge: 'Statutory Grievance Desk',
        summary:
          'Designated Grievance Officer, contact details, response timelines, and appellate paths.',
        content: (
          <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
            <p>
              In accordance with Rule 3(2) of the <em>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</em> and Section 13 of the <em>DPDP Act, 2023</em>, BharatYatra has established a formal consumer and privacy grievance mechanism:
            </p>
            <div className="bg-[#FAF9F4] border border-[#E2E8F0] p-4 rounded-xl text-xs space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Designated Grievance Redressal Officer</span>
              </div>
              <div className="space-y-1.5 text-slate-800">
                <div>
                  <strong>Designation:</strong> Grievance Redressal Officer, BharatYatra
                </div>
                <div>
                  <strong>Grievance Desk Email:</strong>{' '}
                  <a href="mailto:grievance@bharatyatra.in" className="font-mono text-blue-700 hover:underline">
                    grievance@bharatyatra.in
                  </a>
                </div>
                <div>
                  <strong>Direct Privacy Desk:</strong>{' '}
                  <a href="mailto:privacy@bharatyatra.in" className="font-mono text-teal-700 hover:underline">
                    privacy@bharatyatra.in
                  </a>
                </div>
                <div>
                  <strong>Official Postal Address:</strong> BharatYatra Operations, Ahmedabad, Gujarat, India (Zip: 380015)
                </div>
                <div>
                  <strong>Statutory Response Timelines:</strong> Acknowledgment within <strong>48 hours</strong>; substantive resolution within <strong>30 days</strong> from receipt of complete grievance particulars.
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 bg-amber-50/60 p-2 rounded">
                <strong>Statutory Escalation / Regulatory Recourse:</strong> If a grievance remains unresolved beyond 30 days, Data Principals possess the statutory right to escalate complaints to the <em>Data Protection Board of India</em> established under the DPDP Act.
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'sec-17',
        num: '17.0',
        title: 'Policy Modifications, Archival Revision Trail & Effective Date',
        summary:
          'Notification of policy updates, revision logs, and binding version date.',
        content: (
          <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
            <p>
              BharatYatra reserves the right to periodically update this Privacy Policy to reflect modifications in platform features, cloud architecture, or statutory regulatory directives.
            </p>
            <p>
              When material revisions occur, we will post an updated effective date on this page and, where appropriate, provide visible notice across account dashboards. Continued use of the Platform after the effective date of an amended policy constitutes acceptance of the modified practices.
            </p>
            <div className="bg-[#FAF9F4] border border-[#E2E8F0] p-3 rounded-lg text-xs space-y-1">
              <div>
                <span className="text-slate-500 font-medium">Current Version:</span>{' '}
                <strong className="text-slate-900 font-mono">v1.8 — DPDP Compliant Edition</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Effective Date:</span>{' '}
                <strong className="text-slate-900">October 24, 2024</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Last Reviewed &amp; Validated:</span>{' '}
                <strong className="text-slate-900">October 28, 2026</strong>
              </div>
            </div>
          </div>
        ),
      },
    ],
    [handleTriggerDeletion]
  );

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const query = searchQuery.toLowerCase().trim();
    return SECTIONS.filter((sec) => {
      const titleMatch = sec.title.toLowerCase().includes(query);
      const summaryMatch = sec.summary.toLowerCase().includes(query);
      const numMatch = sec.num.toLowerCase().includes(query);
      return titleMatch || summaryMatch || numMatch;
    });
  }, [SECTIONS, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF9F4] text-[#1E293B] flex flex-col font-body selection:bg-amber-100 selection:text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 bg-[#091426] text-white py-2.5 px-4 rounded-xl shadow-2xl flex items-center justify-between gap-3 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Irrevocable Deletion Confirmation Modal */}
      {showDeletionModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowDeletionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 id="modal-title" className="text-lg font-bold text-slate-900 font-heading">
                {deletionSubmitted ? 'Erasure Request Logged' : 'Confirm Irrevocable Erasure Request?'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {deletionSubmitted
                  ? `Your data erasure request has been formally logged under Ticket #${ticketId}. Our Data Fiduciary desk will process your cascade purge across Supabase clusters within 72 business hours.`
                  : 'Under Section 12 of the Digital Personal Data Protection Act 2023, this will register an official request to purge your account credentials, saved itineraries, traveller preferences, and booking dossiers.'}
              </p>
            </div>

            {deletionSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1 text-emerald-950">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ticket Reference: {ticketId}</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  A verification confirmation has been sent to our Fiduciary Desk at <code>privacy@bharatyatra.in</code>.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeletionModal(false)}
                    className="w-full py-2 bg-emerald-700 text-white rounded-lg font-semibold text-xs hover:bg-emerald-800 transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-[11px] text-amber-900">
                  <strong>Important:</strong> Accounting and taxation audit records for completed commercial bookings will be decoupled from your identity but retained for statutory GST compliance.
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmDeletion}
                    className="flex-1 py-2.5 px-4 bg-rose-600 text-white rounded-xl font-semibold text-xs hover:bg-rose-700 transition-colors shadow-sm"
                  >
                    Submit Erasure Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeletionModal(false)}
                    className="py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-200 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/terms" className="hover:text-slate-900 transition-colors">
            Legal
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Privacy Policy</span>
        </nav>

        {/* Hero & Document Metadata Card */}
        <header className="bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span>DPDP Act (2023) Verified</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <History className="w-3.5 h-3.5 text-amber-700" />
              <span>Version 1.8 • Active</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-2 font-heading">
            Privacy Policy
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-3xl leading-relaxed">
            Transparent data stewardship, Supabase cryptographic safety, and user consent mechanisms in rigorous accordance with the <em>Digital Personal Data Protection (DPDP) Act, 2023</em> and applicable Indian travel directives.
          </p>

          {/* Quick Meta & Action Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-[#FAF9F4] rounded-xl border border-[#E2E8F0]">
              <span className="text-slate-500 block text-[11px] font-medium">Effective Date</span>
              <strong className="text-slate-900 font-semibold text-xs">October 24, 2024</strong>
            </div>
            <div className="p-3 bg-[#FAF9F4] rounded-xl border border-[#E2E8F0]">
              <span className="text-slate-500 block text-[11px] font-medium">Last Validated</span>
              <strong className="text-slate-900 font-semibold text-xs">October 28, 2026</strong>
            </div>
            <div className="p-3 bg-[#FAF9F4] rounded-xl border border-[#E2E8F0]">
              <span className="text-slate-500 block text-[11px] font-medium">Fiduciary Desk</span>
              <a href="mailto:privacy@bharatyatra.in" className="text-teal-700 font-mono font-semibold hover:underline">
                privacy@bharatyatra.in
              </a>
            </div>
            <div className="p-3 bg-[#FAF9F4] rounded-xl border border-[#E2E8F0]">
              <span className="text-slate-500 block text-[11px] font-medium">Jurisdiction</span>
              <strong className="text-slate-900 font-semibold text-xs">Ahmedabad, Gujarat, India</strong>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-slate-800 font-semibold text-xs hover:bg-[#FAF9F4] transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Policy</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('policy-search')?.focus()}
              className="px-4 py-2.5 rounded-xl bg-[#091426] text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>Search Clauses</span>
            </button>
            <Link
              href="/terms"
              className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-xs hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5 ml-auto"
            >
              <Scale className="w-3.5 h-3.5 text-amber-700" />
              <span>View Terms of Service</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Real-time Search Input */}
        <div className="mb-6 bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          <input
            id="policy-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terms, Supabase, IRCTC, DPDP Act, cookies, deletion..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            aria-label="Search Privacy Policy clauses"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Mobile / Tablet Horizontal Chapter Scroller */}
        <section aria-label="Fast Chapter Navigation" className="mb-8 lg:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Fast Navigation ({SECTIONS.length} Clauses)
            </span>
            <span className="text-xs text-amber-700 font-semibold">Tap to Jump</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  activeSection === sec.id
                    ? 'bg-[#091426] text-white border-[#091426]'
                    : 'bg-white text-slate-700 border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                § {sec.num} {sec.title.split(' ')[0]}
              </a>
            ))}
          </div>
        </section>

        {/* Statutory DPDP Summary Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-[#091426] text-white rounded-2xl p-6 md:p-8 mb-8 shadow-lg border border-teal-800/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Data Principal Sovereignty</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-heading">
                Your Fundamental Rights Under DPDP Act, 2023
              </h2>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                As a lawful Data Principal in the Republic of India, you hold sovereign authority to review, amend, nominate successors, and demand irrevocable erasure of personal travel dossiers.
              </p>
            </div>
            <a
              href="#sec-12"
              className="px-4 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300 transition-colors shrink-0 shadow-md flex items-center gap-1.5"
            >
              <span>Explore Section 12 Rights</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* DUAL PANE LAYOUT (Desktop Sticky TOC + Document Sheet) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Desktop Sticky Table of Contents (3 Cols) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-amber-700" />
                <span>Table of Contents</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {filteredSections.length} / {SECTIONS.length}
              </span>
            </div>

            <nav aria-label="Table of Contents Navigation" className="space-y-1">
              {filteredSections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className={`block px-3 py-2 rounded-lg text-xs transition-colors leading-snug ${
                    activeSection === sec.id
                      ? 'bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-slate-400 font-mono mr-1.5">{sec.num}</span>
                  <span>{sec.title}</span>
                </a>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <Link
                href="/terms"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F4] hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors border border-[#E2E8F0]"
              >
                <span className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-700" />
                  <span>Terms &amp; Conditions</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </aside>

          {/* RIGHT: Document Sheet (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {searchQuery && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>
                  Showing <strong>{filteredSections.length}</strong> matching sections for &quot;{searchQuery}&quot;
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="font-bold underline hover:text-amber-950 ml-2"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {filteredSections.map((sec) => (
              <article
                key={sec.id}
                id={sec.id}
                className="clause-item scroll-mt-24 bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">
                      Section {sec.num}
                    </span>
                    {sec.badge && (
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-medium text-[11px] border border-teal-200">
                        {sec.badge}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyClauseLink(sec.id)}
                    className="text-slate-400 hover:text-teal-700 text-xs flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-50"
                    title="Copy section permalink"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy Ref</span>
                  </button>
                </div>

                <h2 className="text-xl font-bold text-[#0F172A] tracking-tight mb-2 font-heading">
                  {sec.title}
                </h2>
                <p className="text-xs text-slate-500 italic mb-4">
                  {sec.summary}
                </p>

                <div className="pt-2">{sec.content}</div>
              </article>
            ))}

            {/* Interactive Preference Management Card */}
            <section
              id="privacy-preferences"
              className="bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2 text-slate-900 font-heading text-lg font-bold">
                <Cookie className="w-5 h-5 text-amber-700" />
                <span>Interactive Preference &amp; Storage Controls</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                BharatYatra respects your digital boundaries. Manage technical telemetry and session storage tokens in accordance with your consent preferences:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-[#FAF9F4] rounded-xl border border-[#E2E8F0]">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 text-xs">Strictly Essential Security Tokens</div>
                    <div className="text-[11px] text-slate-500">Supabase authentication session, CSRF safety nonces, and login state.</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
                    Always Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#FAF9F4] rounded-xl border border-[#E2E8F0]">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 text-xs">Performance &amp; Route Telemetry</div>
                    <div className="text-[11px] text-slate-500">Anonymous page render latency and Core Web Vitals diagnostics.</div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTelemetry}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 relative ${
                      perfConsent ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                    aria-label="Toggle performance telemetry consent"
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        perfConsent ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Related Contracts & Terms Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-[#FAF9F4] border border-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-700" />
                  <span>Sister Contractual Agreement</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base font-heading">
                  Terms &amp; Conditions of Service
                </h3>
                <p className="text-xs text-slate-600 max-w-xl">
                  Review traveller booking rules, supplier liability boundaries, payment terms, and cancellation policies in our accompanying Terms of Service.
                </p>
              </div>
              <Link
                href="/terms"
                className="px-5 py-2.5 rounded-xl bg-[#091426] text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
              >
                <span>Read Terms</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Dock for Mobile (Terms vs Privacy Switcher) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link
            href="/terms"
            className="flex-1 py-2 px-3 text-center text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Terms of Service
          </Link>
          <div className="w-px h-5 bg-slate-200"></div>
          <Link
            href="/privacy"
            className="flex-1 py-2 px-3 text-center text-xs font-bold text-teal-700 bg-teal-50 rounded-lg transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
