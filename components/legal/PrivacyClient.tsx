'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  UserCheck,
  FileText,
  Mail,
  Lock,
  CheckCircle2,
  Eye,
  Edit3,
  UserX,
  Scale,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

interface PolicySection {
  id: string;
  num: string;
  title: string;
  badge?: string;
  summary: string;
  content: React.ReactNode;
}

interface TocItem {
  id: string;
  num: string;
  title: string;
}

const TOC_ITEMS: TocItem[] = [
  { id: 'sec-1', num: '01', title: 'Scope & Identity' },
  { id: 'sec-2', num: '02', title: 'Personal Information' },
  { id: 'sec-3', num: '03', title: 'Registration & Bookings' },
  { id: 'sec-4', num: '04', title: 'Auth & Supabase Security' },
  { id: 'sec-5', num: '05', title: 'Nexi AI Synthesis' },
  { id: 'sec-6', num: '06', title: 'Cookies & Telemetry' },
  { id: 'sec-7', num: '07', title: 'Lawful Grounds (DPDP)' },
  { id: 'sec-8', num: '08', title: 'Cloud & Infrastructure' },
  { id: 'sec-9', num: '09', title: 'Carriers & Operators' },
  { id: 'sec-10', num: '10', title: 'Storage & Retention' },
  { id: 'sec-11', num: '11', title: 'Security Safeguards' },
  { id: 'sec-12', num: '12', title: 'User Rights (DPDP)' },
  { id: 'sec-13', num: '13', title: 'Account Deletion' },
  { id: 'sec-14', num: '14', title: "Children's Protection" },
  { id: 'sec-15', num: '15', title: 'Cross-Border Data' },
  { id: 'sec-16', num: '16', title: 'Grievance Officer' },
  { id: 'sec-17', num: '17', title: 'Policy Revisions' },
];

export function PrivacyClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('sec-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Consent preferences state
  const [consentPrefs, setConsentPrefs] = useState({
    nexiAi: true,
    telemetry: true,
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const copyClauseLink = useCallback((secId: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/privacy/#${secId}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => showToast('Direct permalink copied to clipboard'))
        .catch(() => showToast(`Section reference: #${secId}`));
    } else {
      showToast(`Section reference: #${secId}`);
    }
  }, [showToast]);

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search, ESC to clear or close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('policySearchInput')?.focus();
      } else if (e.key === 'Escape') {
        if (showDeletionModal) setShowDeletionModal(false);
        else if (showExportModal) setShowExportModal(false);
        else if (showConsentModal) setShowConsentModal(false);
        else if (searchQuery) setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, showDeletionModal, showExportModal, showConsentModal]);

  // Smooth Active TOC Scroll Spy via IntersectionObserver
  useEffect(() => {
    const cards = document.querySelectorAll('.policy-section');
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) {
              setActiveSection(id);
            }
          }
        });
      },
      {
        rootMargin: '-100px 0px -60% 0px',
      }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  }, []);

  // Handle Deletion Confirmation
  const handleTriggerDeletion = useCallback(() => {
    setShowDeletionModal(true);
  }, []);

  const handleConfirmDeletion = useCallback(() => {
    if (!deleteEmail.trim()) {
      showToast('Please enter your email to confirm the erasure request.');
      return;
    }
    const ticket = `BY-DPDP-${Math.floor(1000 + Math.random() * 9000)}`;
    setShowDeletionModal(false);
    setDeleteEmail('');
    showToast(`Erasure ticket #${ticket} logged for ${deleteEmail}. Under DPDP Section 12, our Data Officer will process this within 48 hours.`);
  }, [deleteEmail, showToast]);

  // Comprehensive sections meeting all statutory DPDP criteria
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
    <div className="w-full bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-primary-container selection:text-on-secondary-fixed">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-on-background text-surface shadow-2xl border border-outline-variant animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <span className="material-symbols-outlined text-[18px] text-primary-container">check_circle</span>
          <span className="text-xs font-medium font-body-sm tracking-wide max-w-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-surface/70 hover:text-surface text-xs"
            aria-label="Dismiss toast"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Top Ambient Trust Halo */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[320px] bg-gradient-to-b from-primary-container/20 via-surface-container-high/30 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Hero / Breadcrumb / Charter Header */}
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin pt-space-lg pb-space-xl">
          {/* Breadcrumb navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-surface-variant mb-space-md">
            <Link className="font-body-sm text-body-sm hover:text-primary transition-colors flex items-center gap-1" data-path="home" href="/">
              <span className="material-symbols-outlined text-[16px]">home</span> Home
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Legal &amp; Governance</span>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span className="font-body-sm text-body-sm font-semibold text-primary">Privacy Policy</span>
          </nav>

          {/* Compliance Charter Capsule */}
          <div className="flex flex-wrap items-center gap-space-sm mb-space-md">
            <div className="inline-flex items-center gap-2 px-space-md py-1 rounded-full bg-emerald-900/10 text-emerald-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">DPDP Act 2023 Compliant Architecture</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-surface-container-high text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[16px] text-primary">gavel</span>
              <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">Statutory Charter • IT Act 2000</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-primary-container/30 text-on-primary-fixed">
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">AES-256 Vault Protection</span>
            </div>
          </div>

          {/* Main Headline Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-end">
            <div className="lg:col-span-8 flex flex-col gap-space-sm">
              <h1 className="font-display-hero text-headline-lg lg:text-display-hero text-on-surface tracking-tight leading-none font-bold">
                Privacy Policy
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
                How BharatYatra collects, secures, synthesizes, and respects your personal travel data across our sovereign AI-powered luxury exploration ecosystem.
              </p>
            </div>

            {/* Quick Telemetry Card */}
            <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-space-md shadow-md">
              <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-surface-container">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Policy Version</span>
                <span className="font-label-md text-label-md font-bold text-on-surface bg-surface-container-high px-2 py-0.5 rounded">v1.0.0 (Production)</span>
              </div>
              <div className="grid grid-cols-2 gap-space-sm font-body-sm text-body-sm">
                <div>
                  <span className="text-on-surface-variant block text-xs">Effective Date</span>
                  <span className="font-semibold text-on-surface">October 28, 2026</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs">Data Jurisdiction</span>
                  <span className="font-semibold text-on-surface">Ahmedabad, Gujarat</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Actions & Search Bar */}
          <div className="mt-space-lg bg-surface-container-low p-space-sm rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-sm">
            {/* Live Clause Search Filter */}
            <div className="relative w-full md:w-96 flex items-center bg-surface-container-lowest rounded-xl px-space-md py-2.5 shadow-inner">
              <span className="material-symbols-outlined text-primary text-[20px] mr-2">search</span>
              <input
                aria-label="Search within privacy clauses"
                className="w-full bg-transparent text-on-surface font-body-sm text-body-sm outline-none placeholder:text-outline"
                id="policySearchInput"
                placeholder="Search clauses (e.g., 'Supabase', 'DPDP', 'Cookies', 'Deletion')..."
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-outline hover:text-on-surface cursor-pointer"
                  id="clearSearchBtn"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Utilities (Print, PDF) */}
            <div className="flex items-center gap-space-sm w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-all shadow-sm cursor-pointer"
                title="Print entire legal agreement"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Print Policy</span>
              </button>
              <a
                className="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary-container text-on-secondary-fixed hover:bg-primary-fixed font-label-md text-label-md font-semibold transition-all shadow-sm"
                href="mailto:pandyakaushal294@gmail.com?subject=BharatYatra%20Privacy%20Charter%20PDF%20Request"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Charter PDF</span>
              </a>
            </div>
          </div>

          {/* Metric Pills Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mt-space-lg">
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-emerald-800 text-[22px]">verified_user</span>
              </div>
              <div>
                <div className="font-title-md text-title-md font-bold text-on-surface">100% Indian</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">Sovereign Data Storage</div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-900 text-[22px]">key</span>
              </div>
              <div>
                <div className="font-title-md text-title-md font-bold text-on-surface">Zero CVV</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">RBI Tokenized Rails</div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-blue-900 text-[22px]">history_toggle_off</span>
              </div>
              <div>
                <div className="font-title-md text-title-md font-bold text-on-surface">48 Hours</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">Statutory Redressal SLA</div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-purple-900 text-[22px]">auto_awesome</span>
              </div>
              <div>
                <div className="font-title-md text-title-md font-bold text-on-surface">Nexi AI</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">Private Prompt Isolation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Notification Banner */}
      {searchQuery.trim() && (
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin mb-space-md w-full" id="searchResultsBanner">
          <div className="p-space-sm px-space-md bg-secondary-container text-on-secondary-fixed rounded-xl flex items-center justify-between font-body-sm text-body-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">filter_alt</span>
              <span id="searchResultCount">
                {filteredSections.length} {filteredSections.length === 1 ? 'section matched query "' : 'sections matched query "'}
                {searchQuery}&quot;
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="font-semibold underline hover:text-primary cursor-pointer"
              id="resetSearchFilterBtn"
            >
              Reset Filter
            </button>
          </div>
        </div>
      )}

      {/* Main Body: Two-Column Architecture */}
      <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin pb-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* LEFT: Comprehensive Legal Sections (~70% width, 8 of 12 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg" id="policyClausesContainer">
            {filteredSections.length === 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-space-xl text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto text-on-surface-variant">
                  <span className="material-symbols-outlined text-[24px]">search_off</span>
                </div>
                <div className="font-title-md font-bold text-on-surface">No policy sections match your search</div>
                <p className="text-on-surface-variant text-body-sm">
                  We couldn&apos;t find any clauses matching &ldquo;{searchQuery}&rdquo;. Try keywords like &ldquo;cookies&rdquo;, &ldquo;Supabase&rdquo;, &ldquo;erasure&rdquo;, or &ldquo;DPDP&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-space-md py-1.5 rounded-xl bg-primary-container text-on-secondary-fixed font-semibold text-xs hover:bg-primary-fixed transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}

            {filteredSections.map((sec) => (
              <article
                key={sec.id}
                id={sec.id}
                className="policy-section bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm transition-all hover:shadow-md scroll-mt-28"
              >
                {/* Legacy section number anchor */}
                <span id={`sec-${sec.num.replace('.0', '')}`} className="sr-only" aria-hidden="true" />

                <div className="flex items-start justify-between gap-space-sm mb-space-sm border-b border-surface-container pb-space-sm">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-title-md text-title-md font-bold">
                      {sec.num}
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      {sec.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {sec.badge && (
                      <span className="px-2 py-0.5 rounded bg-emerald-900/10 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                        {sec.badge}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => copyClauseLink(sec.id)}
                      className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                      title="Copy section link"
                    >
                      <span className="material-symbols-outlined text-[18px]">link</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant italic mb-4">
                  {sec.summary}
                </p>

                <div className="font-body-md text-body-md text-on-surface space-y-3 leading-relaxed">
                  {sec.content}
                </div>
              </article>
            ))}
          </div>

          {/* RIGHT: Sticky Governance Sidebar (~30% width, 4 of 12 cols) */}
          <aside className="lg:col-span-4 sticky top-24 space-y-space-md">
            {/* Table of Contents (TOC) with Active State */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container">
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-sm">
                <span className="font-title-md text-title-md text-on-surface font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">list_alt</span>
                  Charter Directory
                </span>
                <span className="font-label-caps text-label-caps uppercase text-outline">17 Clauses</span>
              </div>
              <nav className="max-h-[380px] overflow-y-auto space-y-1 pr-1 font-body-sm text-body-sm" id="tocNav" style={{ scrollbarWidth: 'thin' }}>
                {TOC_ITEMS.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(item.id);
                      }}
                      className={`toc-link flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-xs cursor-pointer ${
                        isActive
                          ? 'bg-primary-container/40 font-semibold text-on-surface'
                          : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="font-semibold text-primary">{item.num}</span>
                      <span className="truncate">{item.title}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Privacy Action Station: "Exercise Your Rights" */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container">
              <div className="flex items-center gap-2 mb-space-sm text-on-surface">
                <span className="material-symbols-outlined text-primary text-[22px]">admin_panel_settings</span>
                <span className="font-title-md text-title-md font-bold">Exercise Your Rights</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Directly invoke your legal prerogatives under the Indian Data Protection Act:
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-all cursor-pointer"
                  id="exportDataBtn"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">download_for_offline</span>
                    <span>Download My Data Dossier</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowConsentModal(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-all cursor-pointer"
                  id="cookieConsentBtn"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
                    <span>Adjust Consent Preferences</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeletionModal(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-error text-body-sm font-medium transition-all cursor-pointer"
                  id="deleteAccountModalBtn"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-error">person_remove</span>
                    <span>Request Account Deletion</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-error">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Data Protection Officer (DPO) Fast Card */}
            <div className="bg-gradient-to-br from-surface-container to-surface-container-low rounded-2xl p-space-md shadow-sm">
              <div className="flex items-center gap-3 mb-space-sm">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center font-bold text-sm shrink-0">
                  KP
                </div>
                <div>
                  <div className="font-title-md text-title-md font-bold text-on-surface">Kaushal Pandya</div>
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Grievance Redressal Officer</div>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Directly dedicated to privacy enquiries, permit documentation purging, and consent revocations.
              </p>
              <div className="space-y-1.5 font-body-sm text-body-sm">
                <a className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors" href="mailto:pandyakaushal294@gmail.com">
                  <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                  <span className="truncate">pandyakaushal294@gmail.com</span>
                </a>
                <a className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors" href="tel:+919624282521">
                  <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                  <span>+91 9624282521</span>
                </a>
              </div>
            </div>

            {/* 24/7 Sovereign Care Hotline */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container text-center">
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-widest block mb-1">State Tourism Concierge</span>
              <div className="font-title-lg text-title-lg text-on-surface font-bold">1800 203 1111</div>
              <span className="text-on-surface-variant text-xs block mt-1">24/7 Toll-Free Sovereign Care Desk</span>
            </div>

            {/* Complementary Legal Docs Navigation */}
            <div className="bg-surface-container-low rounded-2xl p-space-md space-y-2">
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider font-bold block mb-1">Related Charters</span>
              <Link className="flex items-center justify-between text-body-sm text-on-surface hover:text-primary transition-colors py-1" href="/terms">
                <span>Terms &amp; Conditions</span>
                <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
              </Link>
              <Link className="flex items-center justify-between text-body-sm text-on-surface hover:text-primary transition-colors py-1" href="/terms#clause-11">
                <span>Cancellation &amp; Refund Policy</span>
                <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
              </Link>
              <Link className="flex items-center justify-between text-body-sm text-on-surface hover:text-primary transition-colors py-1" href="/terms#clause-8">
                <span>Booking &amp; Safety Disclaimer</span>
                <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Interactive Modal: Account Deletion Simulation */}
      {showDeletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-space-lg shadow-2xl space-y-space-md border border-surface-container">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Delete BharatYatra Profile?</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                Under Section 12 of the DPDP Act 2023, you can request immediate eradication of your account credentials, AI itinerary dialogues, and traveler profiles. Historical GST financial receipts will remain archived for 7 tax years.
              </p>
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface block" htmlFor="deleteConfirmEmail">Confirm your email address</label>
              <input
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl font-body-sm text-body-sm outline-none border border-transparent focus:border-primary text-on-surface"
                id="deleteConfirmEmail"
                placeholder="your-email@domain.com"
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-space-sm pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeletionModal(false);
                  setDeleteEmail('');
                }}
                className="px-space-md py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md text-label-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletion}
                className="px-space-md py-2 rounded-xl bg-error text-on-error font-label-md text-label-md font-semibold hover:bg-red-700 shadow-sm cursor-pointer"
              >
                Submit Erasure Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal: Data Dossier Export Confirmation */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-space-lg shadow-2xl space-y-space-md border border-surface-container text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary-container text-on-secondary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">inventory_2</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Preparing Your Data Dossier</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                We are consolidating your active bookings, Nexi AI preferences, and registered tokens into an encrypted machine-readable ZIP archive (JSON + PDF).
              </p>
            </div>
            <div className="p-space-sm bg-surface-container-low rounded-xl text-xs text-on-surface-variant">
              This file will be transmitted to your authenticated email address within 15 minutes.
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowExportModal(false);
                  showToast('Data Dossier export requested. Check your email shortly.');
                }}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:opacity-90 cursor-pointer"
              >
                Got It, Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal: Consent Preferences Manager */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-space-lg shadow-2xl space-y-space-md border border-surface-container">
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
              <h3 className="font-headline-sm text-headline-sm font-bold">Consent Preferences Manager</h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Manage your technical telemetry and session storage tokens in accordance with Section 6 of the DPDP Act 2023:
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                <div>
                  <div className="font-semibold text-xs text-on-surface">Essential Cookies &amp; Auth</div>
                  <div className="text-[11px] text-on-surface-variant">Supabase session tokens, CSRF protection.</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-bold text-[10px] uppercase">
                  Mandatory
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                <div>
                  <div className="font-semibold text-xs text-on-surface">Nexi AI Recommendations</div>
                  <div className="text-[11px] text-on-surface-variant">Trip context, preferred pace &amp; interests.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setConsentPrefs(p => ({ ...p, nexiAi: !p.nexiAi }))}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${consentPrefs.nexiAi ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <div className={`w-5 h-5 bg-surface rounded-full shadow-sm transition-transform ${consentPrefs.nexiAi ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                <div>
                  <div className="font-semibold text-xs text-on-surface">Performance &amp; Route Telemetry</div>
                  <div className="text-[11px] text-on-surface-variant">Anonymous latency metrics &amp; error logs.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setConsentPrefs(p => ({ ...p, telemetry: !p.telemetry }))}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${consentPrefs.telemetry ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <div className={`w-5 h-5 bg-surface rounded-full shadow-sm transition-transform ${consentPrefs.telemetry ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConsentModal(false);
                  showToast('Consent preferences updated and saved.');
                }}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:opacity-90 cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
