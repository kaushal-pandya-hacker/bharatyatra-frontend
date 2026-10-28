'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Shield,
  Scale,
  Bot,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  HelpCircle,
  Mail,
  Phone,
  ChevronRight,
  ArrowUp,
  Printer,
  Compass,
  Lock,
  Building2,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';

interface SectionItem {
  id: string;
  num: number;
  title: string;
}

const SECTIONS: SectionItem[] = [
  { id: 'section-1', num: 1, title: 'Introduction and Acceptance of Terms' },
  { id: 'section-2', num: 2, title: 'About BharatYatra and Its Services' },
  { id: 'section-3', num: 3, title: 'Eligibility and Account Registration' },
  { id: 'section-4', num: 4, title: 'Account Security and User Responsibilities' },
  { id: 'section-5', num: 5, title: 'Accurate Personal, Traveller and Booking Information' },
  { id: 'section-6', num: 6, title: 'AI-Generated Itineraries, Recommendations and Limitations' },
  { id: 'section-7', num: 7, title: 'Travel Information Accuracy and Independent Verification' },
  { id: 'section-8', num: 8, title: 'Third-Party Travel Providers and Separate Terms' },
  { id: 'section-9', num: 9, title: 'Booking Requests, Confirmations and Availability' },
  { id: 'section-10', num: 10, title: 'Pricing, Taxes, Fees and Payment Processing' },
  { id: 'section-11', num: 11, title: 'Cancellations, Changes, Refunds and Disputes' },
  { id: 'section-12', num: 12, title: 'User Conduct and Prohibited Activities' },
  { id: 'section-13', num: 13, title: 'Intellectual Property and Permitted Use' },
  { id: 'section-14', num: 14, title: 'User-Submitted Content and Permissions' },
  { id: 'section-15', num: 15, title: 'Privacy and Reference to Privacy Policy' },
  { id: 'section-16', num: 16, title: 'Service Availability, Maintenance and Technical Limitations' },
  { id: 'section-17', num: 17, title: 'Limitation of Liability' },
  { id: 'section-18', num: 18, title: 'Indemnity' },
  { id: 'section-19', num: 19, title: 'Suspension and Termination of Accounts' },
  { id: 'section-20', num: 20, title: 'Consumer Complaints and Grievance Redressal' },
  { id: 'section-21', num: 21, title: 'Changes to the Terms' },
  { id: 'section-22', num: 22, title: 'Governing Law and Jurisdiction' },
  { id: 'section-23', num: 23, title: 'Contact Information and Support' },
  { id: 'section-24', num: 24, title: 'Effective Date and Last-Updated Date' },
];

export function TermsClient() {
  const [activeSection, setActiveSection] = useState<string>('section-1');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      // Identify currently visible section
      const scrollPosition = window.scrollY + 160;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(s.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(id);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen">
      {/* 1. HERO HEADER BANNER */}
      <section className="bg-gradient-to-b from-[#070e1e] via-[#0b1c30] to-[#0f2744] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-amber-300 font-semibold">Terms &amp; Conditions</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Legal &amp; Regulatory Framework</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight leading-tight">
                Terms &amp; Conditions
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Please review these Terms and Conditions carefully before exploring, constructing AI itineraries, or booking travel services through BharatYatra (<span className="text-amber-300 font-mono">bharatyatra.in</span>).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 shadow-sm"
                title="Print Terms for Offline Reference"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Copy</span>
              </button>
            </div>
          </div>

          {/* Quick Meta Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Effective Date</span>
                <strong className="text-white font-semibold">October 28, 2026</strong>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Jurisdiction</span>
                <strong className="text-white font-semibold">Republic of India</strong>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Applicable Court</span>
                <strong className="text-white font-semibold">Ahmedabad, Gujarat</strong>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Technology</span>
                <strong className="text-white font-semibold">AI Travel Aggregation</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ADVISORY CALLOUT FOR TRAVELERS & BUSINESS OWNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex items-start gap-3">
            <Bot className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-900 space-y-1">
              <strong className="font-bold text-amber-950 block text-sm">AI Planning Advisory</strong>
              <p className="leading-relaxed">
                BharatYatra generates dynamic travel itineraries using artificial intelligence. Itineraries, travel timings, monument opening hours, permit rules, and fare estimates are advisory and must be independently verified prior to travel.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-900 space-y-1">
              <strong className="font-bold text-blue-950 block text-sm">Third-Party Operator Relationship</strong>
              <p className="leading-relaxed">
                Transport carriers (trains, flights, state buses), hotels, and local experience vendors are independent third-party operators. Bookings are subject to the respective operator&apos;s conditions of carriage and property rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN SPLIT CONTENT: TABLE OF CONTENTS + TERMS BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* STICKY SIDEBAR: TABLE OF CONTENTS (Desktop) */}
          <aside className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Table of Contents
                  </h2>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  24 Clauses
                </span>
              </div>

              {/* Mobile Dropdown selector */}
              <div className="block lg:hidden">
                <label htmlFor="mobile-toc" className="sr-only">Jump to section</label>
                <select
                  id="mobile-toc"
                  aria-label="Jump to a specific section"
                  value={activeSection}
                  onChange={(e) => scrollToSection(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {SECTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.num}. {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop Scrollable List */}
              <nav aria-label="Table of contents" className="hidden lg:block max-h-[calc(100vh-220px)] overflow-y-auto pr-1 space-y-1 text-xs">
                {SECTIONS.map((s) => {
                  const isActive = activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => scrollToSection(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-start gap-2.5 font-medium ${
                        isActive
                          ? 'bg-amber-50 text-amber-900 font-bold border-l-4 border-amber-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`font-mono text-[11px] shrink-0 mt-0.5 ${isActive ? 'text-amber-700 font-bold' : 'text-slate-400'}`}>
                        {s.num.toString().padStart(2, '0')}
                      </span>
                      <span className="leading-snug">{s.title}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Direct Support Card */}
              <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase">Need Legal Assistance?</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  For legal inquiries or statutory notices, reach out to our legal and compliance desk:
                </p>
                <a
                  href="mailto:pandyakaushal294@gmail.com"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">pandyakaushal294@gmail.com</span>
                </a>
              </div>
            </div>
          </aside>

          {/* MAIN TERMS ARTICLES (8 Cols on lg) */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* SECTION 1 */}
            <article id="section-1" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  01
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Introduction and Acceptance of Terms
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  Welcome to <strong>BharatYatra</strong> (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), accessible via <strong>https://bharatyatra.in</strong> (and associated domains, subdomains, and web applications). These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement entered into between you (&quot;User&quot;, &quot;Traveller&quot;, &quot;Customer&quot;, or &quot;you&quot;) and the operating entity of BharatYatra.
                </p>
                <p>
                  By accessing, browsing, registering for an account, generating AI itineraries, saving trips, interacting with our travel assistants (including Nexi AI), or making booking requests through BharatYatra, you acknowledge that you have read, understood, and unconditionally agree to be bound by these Terms, together with our <strong>Privacy Policy</strong> and all applicable guidelines, rules, and statutory notifications issued from time to time under the laws of India.
                </p>
                <p className="p-3.5 rounded-xl bg-slate-50 border-l-4 border-amber-600 text-xs text-slate-700">
                  <strong>Important Notice:</strong> If you do not agree with any provision of these Terms, you must immediately discontinue your access to and use of the Platform.
                </p>
              </div>
            </article>

            {/* SECTION 2 */}
            <article id="section-2" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  02
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  About BharatYatra and Its Services
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  BharatYatra is an AI-powered travel discovery, personalization, and travel coordination technology platform designed to streamline travel exploration across India with an initial focus on authentic Gujarat circuits, heritage trails, and cultural experiences.
                </p>
                <p>Our digital platform provides:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li><strong>AI Travel Planner:</strong> Hyper-personalized travel itineraries synthesized via algorithmic preference matching.</li>
                  <li><strong>Landmark Directory:</strong> Ground-researched guides, historical summaries, and operational details for 100+ iconic landmarks and destinations.</li>
                  <li><strong>Booking Discovery &amp; Facilitation:</strong> Integration with third-party suppliers for hotel accommodations, express buses (e.g. GSRTC), express trains (IRCTC routing), flights, dining reservations, and curated local masterclasses.</li>
                  <li><strong>Nexi AI Assistant:</strong> Real-time travel assistant providing cultural recommendations, multilingual assistance, and itinerary adjustments.</li>
                </ul>
                <div className="p-3.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs leading-relaxed">
                  <strong>Technology Intermediary Status:</strong> BharatYatra operates strictly as an electronic technology platform and intermediary within the meaning of the <em>Information Technology Act, 2000</em>. Unless explicitly certified in writing for a specific licensed package, BharatYatra is not a direct carrier, airline, hotelier, or bus fleet owner.
                </div>
              </div>
            </article>

            {/* SECTION 3 */}
            <article id="section-3" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  03
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Eligibility and Account Registration
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  To be eligible to access BharatYatra or register an account, you represent and warrant that:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>You are at least <strong>18 years of age</strong> (or the age of majority in your jurisdiction) and possess full legal capacity to enter into a binding contract pursuant to the <em>Indian Contract Act, 1872</em>.</li>
                  <li>Minors (under 18 years) may only utilize the Platform under the active supervision of a parent or legal guardian who accepts these Terms on their behalf.</li>
                  <li>You are not barred from receiving travel or digital services under the laws of India or any applicable foreign jurisdiction.</li>
                  <li>All information submitted during registration (including name, email address, and mobile number) is truthful, accurate, and current.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 4 */}
            <article id="section-4" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  04
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Account Security and User Responsibilities
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  When registering with BharatYatra (whether through Google OAuth single sign-on or email verification), you are solely responsible for maintaining the confidentiality of your credentials and device access.
                </p>
                <p>
                  You agree to immediately notify BharatYatra via <a href="mailto:pandyakaushal294@gmail.com" className="text-amber-700 underline font-semibold">pandyakaushal294@gmail.com</a> upon discovering any unauthorized access, security incident, or compromised account credentials. You accept responsibility for all bookings, orders, and interactions conducted through your authenticated account until verified notification is received.
                </p>
              </div>
            </article>

            {/* SECTION 5 */}
            <article id="section-5" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  05
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Accurate Personal, Traveller and Booking Information
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  All passenger names, contact numbers, email addresses, age declarations, and identification details entered during itinerary planning or checkout must match exactly with valid Government-issued photo identification (such as Aadhaar, Passport, Voter ID, or Driving Licence).
                </p>
                <p>
                  Carriers, hotels, and protected wildlife reserves (including Sasan Gir Forest and Rann of Kutch check-posts) strictly cross-verify traveller identity against booking vouchers. BharatYatra is not liable for denied entry, boarding refusal, or cancellation charges arising from spelling errors, age discrepancies, or false representations provided by the user.
                </p>
              </div>
            </article>

            {/* SECTION 6 */}
            <article id="section-6" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  06
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  AI-Generated Itineraries, Recommendations and Limitations
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  BharatYatra incorporates state-of-the-art algorithmic models and generative artificial intelligence to synthesize custom trip plans, route estimations, dining recommendations, and multi-day circuits.
                </p>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Explicit Artificial Intelligence Limitations</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>AI outputs represent probabilistic planning suggestions, not guaranteed real-time guarantees.</li>
                    <li>Road conditions, seasonal river flow, monsoon washouts, local festivals, and unexpected municipal closures may alter recommended routes.</li>
                    <li>Travellers are strongly advised to independently verify temple darshan timings, museum weekly holidays, inner-line permit mandates, and ferry operational schedules.</li>
                    <li>BharatYatra does not warrant that AI itinerary outputs are error-free, complete, or suitable for every individual physical condition or travel circumstance.</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* SECTION 7 */}
            <article id="section-7" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  07
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Travel Information Accuracy and Independent Verification
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  While our editorial and research teams strive to maintain accurate, up-to-date landmark directory profiles across Gujarat and India, operational guidelines set by governmental bodies (such as Gujarat Tourism, Archaeological Survey of India, and Forest Department authorities) are subject to revision without prior notice.
                </p>
                <p>
                  Users bear sole responsibility for obtaining required entry permits (e.g. Dhordo Rann permit), adhering to cultural dress codes at sacred religious sites (such as Somnath, Dwarkadhish, and Palitana temples), and adhering to local environmental regulations.
                </p>
              </div>
            </article>

            {/* SECTION 8 */}
            <article id="section-8" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  08
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Third-Party Travel Providers and Separate Terms
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  When you reserve hotel rooms, bus seats, train tickets, domestic flights, or local cultural activities through BharatYatra, the contract of carriage or service is formed directly between you and the respective third-party service provider (&quot;Travel Provider&quot;).
                </p>
                <p>
                  Your booking is subject to the specific terms, conditions, check-in rules, baggage allowances, and tariff restrictions established by that Travel Provider. BharatYatra does not control the physical premises, transport vehicles, staff conduct, or on-ground service quality of independent operators.
                </p>
              </div>
            </article>

            {/* SECTION 9 */}
            <article id="section-9" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  09
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Booking Requests, Confirmations and Availability
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  Submitting a booking request or generating an itinerary does not constitute an immediate confirmed reservation. A booking is only legally confirmed when:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm">
                  <li>The applicable transaction payment has been successfully authorized and settled.</li>
                  <li>The respective Travel Provider has confirmed real-time inventory allocation.</li>
                  <li>BharatYatra has dispatched an official booking confirmation voucher containing a valid reference identifier (e.g. CF-BK-XXXXX).</li>
                </ol>
                <p>
                  In the rare event that inventory becomes unavailable between selection and payment settlement, the transaction will be cancelled and any debited funds will be refunded pursuant to Section 11.
                </p>
              </div>
            </article>

            {/* SECTION 10 */}
            <article id="section-10" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  10
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Pricing, Taxes, Fees and Payment Processing
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  All monetary values on BharatYatra are quoted in <strong>Indian Rupees (INR / ₹)</strong>. Pricing displays clearly delineate the base rate, applicable Goods and Services Tax (GST), and any statutory levies or platform convenience fees prior to final payment authorization.
                </p>
                <p>
                  Transactions are routed through Reserve Bank of India (RBI) authorized payment gateway partners (such as Razorpay, UPI rails, credit/debit cards, and scheduled commercial banks). BharatYatra does not store sensitive cardholder authentication data (CVV/PIN). You agree to comply with your issuing bank&apos;s multi-factor authentication (OTP/SMS) requirements.
                </p>
              </div>
            </article>

            {/* SECTION 11 */}
            <article id="section-11" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  11
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Cancellations, Changes, Refunds and Disputes
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  Cancellation eligibility, change windows, and applicable refund percentages are governed by the specific fare rules displayed at the time of purchase and the policies of the respective Travel Provider:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li><strong>Non-Refundable Fares:</strong> Certain promotional hotel bookings, festive packages (e.g. Rann Utsav peak dates), or discounted transit passes are strictly non-refundable once booked.</li>
                  <li><strong>Refund Processing:</strong> Approved refunds are credited exclusively back to the original source payment instrument within standard banking turnaround windows (typically 5 to 7 business days, depending on your issuing bank).</li>
                  <li><strong>Convenience &amp; Gateway Fees:</strong> Technology convenience fees or gateway surcharges incurred during initial transaction processing may be non-refundable unless cancellation resulted from a technical error on BharatYatra&apos;s part.</li>
                  <li><strong>Disputes:</strong> If you identify an erroneous debit or discrepancy, you must report it within 14 calendar days to <a href="mailto:pandyakaushal294@gmail.com" className="text-amber-700 underline font-semibold">pandyakaushal294@gmail.com</a> with complete transaction receipts.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 12 */}
            <article id="section-12" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  12
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  User Conduct and Prohibited Activities
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>You agree not to engage in any of the following prohibited activities:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>Making speculative, fraudulent, or false booking requests or blocking inventory without genuine intent to travel.</li>
                  <li>Using automated scraping, bots, crawlers, or algorithmic extraction tools to index or republish BharatYatra proprietary directory content.</li>
                  <li>Attempting to probe, scan, or breach platform security defenses, rate limit guards, API endpoints, or database structures.</li>
                  <li>Submitting defamatory, obscene, infringing, or illegal material through reviews, feedback forms, or chat interfaces.</li>
                  <li>Impersonating another individual, travel agent, or government official.</li>
                  <li>Reselling or commercializing BharatYatra AI trip construction plans without explicit commercial licensing.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 13 */}
            <article id="section-13" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  13
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Intellectual Property and Permitted Use
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  All content included on BharatYatra—including software code, text, graphics, landmark dossiers, photographs, logo marks, user interface design, audio elements, and algorithmic prompts—is the intellectual property of BharatYatra or its licensors and is protected by the <em>Copyright Act, 1957</em>, the <em>Trade Marks Act, 1999</em>, and international intellectual property treaties.
                </p>
                <p>
                  You are granted a limited, personal, non-exclusive, non-transferable, and revocable licence to access and view the Platform for personal, non-commercial travel planning purposes only.
                </p>
              </div>
            </article>

            {/* SECTION 14 */}
            <article id="section-14" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  14
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  User-Submitted Content and Permissions
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  When you submit reviews, travel tips, photos, or itinerary feedback to BharatYatra, you grant us a worldwide, perpetual, royalty-free, non-exclusive licence to publish, adapt, translate, and display such content in connection with the Platform&apos;s travel directory and community services.
                </p>
                <p>
                  You represent and warrant that you own or possess all requisite rights to the content you submit and that your submissions do not infringe any third-party privacy, publicity, or intellectual property rights.
                </p>
              </div>
            </article>

            {/* SECTION 15 */}
            <article id="section-15" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  15
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Privacy and Reference to Privacy Policy
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  Your privacy and the security of your personal data are paramount to BharatYatra. We process personal and booking data in compliance with applicable Indian data protection principles, including the <em>Information Technology Act, 2000</em> and the <em>Digital Personal Data Protection Act, 2023 (DPDP Act)</em>.
                </p>
                <p>
                  Please review our dedicated <strong>Privacy Policy</strong> for comprehensive details regarding how we collect, store, encrypt, and share information with verified booking partners. Our Privacy Policy is incorporated by reference into these Terms.
                </p>
              </div>
            </article>

            {/* SECTION 16 */}
            <article id="section-16" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  16
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Service Availability, Maintenance and Technical Limitations
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  BharatYatra strives to ensure continuous 24/7 service availability. However, digital services may be subject to scheduled maintenance, cloud infrastructure updates, telecommunication disruptions, or third-party global distribution system (GDS) API downtimes.
                </p>
                <p>
                  BharatYatra is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of uninterrupted uptime or immediate latency resolution during unexpected internet service failures.
                </p>
              </div>
            </article>

            {/* SECTION 17 */}
            <article id="section-17" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  17
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Limitation of Liability
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  To the maximum extent permitted under applicable Indian law (including the <em>Consumer Protection Act, 2019</em> and Section 73 of the <em>Indian Contract Act, 1872</em>):
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>BharatYatra shall not be liable for indirect, incidental, special, punitive, or consequential damages, including loss of profits, vacation time, missed connecting transit, or emotional distress.</li>
                  <li>BharatYatra is not liable for acts, omissions, delays, mechanical breakdowns, overbooking, strikes, or insolvencies of independent third-party carriers, hotels, or experience suppliers.</li>
                  <li>In any event, BharatYatra&apos;s aggregate liability arising out of or related to these Terms or your use of the Platform shall not exceed the convenience fee retained by BharatYatra for the specific transaction giving rise to the claim, or INR 1,000 (One Thousand Indian Rupees), whichever is higher.</li>
                  <li>Nothing in these Terms limits or excludes liability for death, personal injury, fraud, or gross negligence where such limitation is prohibited by statutory law.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 18 */}
            <article id="section-18" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  18
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Indemnity
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  To the extent permitted by law, you agree to defend, indemnify, and hold harmless BharatYatra, its affiliates, directors, officers, employees, and software maintainers from and against any claims, liabilities, damages, losses, and reasonable legal expenses arising out of:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>Your willful violation of these Terms or applicable statutory laws.</li>
                  <li>Your infringement of any third-party intellectual property or privacy right.</li>
                  <li>Fraudulent conduct or false passenger declarations made during booking.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 19 */}
            <article id="section-19" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  19
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Suspension and Termination of Accounts
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  BharatYatra reserves the right, in its sole discretion and without liability, to suspend, disable, or terminate user accounts or restrict access to the Platform upon reasonable belief of:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>Material breach of these Terms or suspected fraudulent activities.</li>
                  <li>Payment defaults, unauthorized chargeback initiations, or abusive usage.</li>
                  <li>Conduct detrimental to fellow travellers, suppliers, or the reputation of the Platform.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 20 */}
            <article id="section-20" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  20
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Consumer Complaints and Grievance Redressal
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  In accordance with the <em>Consumer Protection Act, 2019</em>, the <em>Consumer Protection (E-Commerce) Rules, 2020</em>, and the <em>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</em>, BharatYatra has established a formal consumer grievance redressal mechanism.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <h3 className="font-bold text-slate-900 text-sm">Designated Grievance Redressal Officer</h3>
                  <div className="space-y-1 font-mono text-[12px] text-slate-700">
                    <p><strong>Designation:</strong> Grievance Redressal Officer, BharatYatra</p>
                    <p><strong>Contact Email:</strong> <a href="mailto:pandyakaushal294@gmail.com" className="text-amber-700 underline">pandyakaushal294@gmail.com</a></p>
                    <p><strong>Support Telephone:</strong> <a href="tel:+919624282521" className="text-amber-700 underline">+91 9624282521</a></p>
                    <p><strong>Jurisdiction:</strong> Ahmedabad, Gujarat, India</p>
                    <p><strong>Response Timelines:</strong> Acknowledgment within 48 hours; resolution within 30 days from receipt of complete grievance particulars.</p>
                  </div>
                </div>
              </div>
            </article>

            {/* SECTION 21 */}
            <article id="section-21" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  21
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Changes to the Terms
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  BharatYatra reserves the right to amend, update, or replace any part of these Terms from time to time to accommodate platform advancements, new travel features, or statutory regulatory directives.
                </p>
                <p>
                  Any updates become effective immediately upon posting to this URL. The &quot;Last Updated&quot; date at the top and bottom of this document reflects the most recent revision. Your continued use of the Platform following published modifications constitutes your binding acceptance of the revised Terms.
                </p>
              </div>
            </article>

            {/* SECTION 22 */}
            <article id="section-22" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  22
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Governing Law and Jurisdiction
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p>
                  These Terms and any dispute, controversy, or claim arising out of or relating to your use of BharatYatra shall be governed by, interpreted, and construed exclusively in accordance with the substantive laws of the <strong>Republic of India</strong>, without giving effect to conflict of laws principles.
                </p>
                <p>
                  Subject to statutory consumer court jurisdictions where mandatory under the <em>Consumer Protection Act, 2019</em>, you agree that the competent civil courts situated at <strong>Ahmedabad, Gujarat, India</strong> shall possess exclusive territorial jurisdiction over any legal proceedings arising hereunder.
                </p>
              </div>
            </article>

            {/* SECTION 23 */}
            <article id="section-23" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  23
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Contact Information and Support
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4 pt-1">
                <p>
                  If you have questions, comments, or require assistance regarding these Terms, you may reach our administrative and support team through the following official channels:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Official Support Email</span>
                      <a href="mailto:pandyakaushal294@gmail.com" className="font-bold text-slate-900 hover:text-amber-700">
                        pandyakaushal294@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Customer Care Hotline</span>
                      <a href="tel:+919624282521" className="font-bold text-slate-900 hover:text-amber-700">
                        +91 9624282521
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* SECTION 24 */}
            <article id="section-24" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  24
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Effective Date and Last-Updated Date
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-2 pt-1">
                <p>
                  These Terms and Conditions are effective as of <strong>October 28, 2026</strong>.
                </p>
                <p className="text-xs text-slate-500">
                  Document Version: 1.0.0 (Pan-India &amp; Gujarat Travel Release).
                </p>
              </div>
            </article>

            {/* OWNER REVIEW CHECKLIST BLOCK */}
            <div className="p-6 rounded-2xl bg-slate-900 text-slate-300 border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Notice for Platform Owner &amp; Legal Review Checklist</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Before treating these terms as commercially final for enterprise contracts or venture financing, the business owner should complete the following verifications with qualified Indian legal counsel:
              </p>
              <ul className="text-xs space-y-1.5 text-slate-300 list-disc pl-5">
                <li>Formalize corporate entity name (e.g. Private Limited / LLP / Sole Proprietorship) once officially incorporated with the Ministry of Corporate Affairs (MCA).</li>
                <li>Designate physical postal address in Gujarat and statutory Corporate Identification Number (CIN) or GSTIN.</li>
                <li>Appoint an official Grievance Redressal Officer by name pursuant to the Consumer Protection (E-Commerce) Rules, 2020.</li>
                <li>Publish the corresponding separate Privacy Policy pursuant to the Digital Personal Data Protection Act, 2023.</li>
              </ul>
            </div>

          </main>
        </div>
      </div>

      {/* FLOATING SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-6 z-40 p-3 rounded-full bg-slate-900 text-white shadow-xl hover:bg-amber-600 transition-all border border-slate-700 focus:outline-hidden"
          title="Scroll to Top"
          aria-label="Scroll to top of terms page"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

