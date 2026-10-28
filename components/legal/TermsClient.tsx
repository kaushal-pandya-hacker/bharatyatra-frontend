'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

interface TocItem {
  clauseNum: number;
  id: string;
  shortTitle: string;
}

const TOC_ITEMS: TocItem[] = [
  {
    "clauseNum": 1,
    "id": "clause-1",
    "shortTitle": "01. Acceptance of Terms"
  },
  {
    "clauseNum": 2,
    "id": "clause-2",
    "shortTitle": "02. Services & Nexi AI"
  },
  {
    "clauseNum": 3,
    "id": "clause-3",
    "shortTitle": "03. Eligibility & Registration"
  },
  {
    "clauseNum": 4,
    "id": "clause-4",
    "shortTitle": "04. Account Security"
  },
  {
    "clauseNum": 5,
    "id": "clause-5",
    "shortTitle": "05. Traveller ID Accuracy"
  },
  {
    "clauseNum": 6,
    "id": "clause-6",
    "shortTitle": "06. AI Itinerary Limitations"
  },
  {
    "clauseNum": 7,
    "id": "clause-7",
    "shortTitle": "07. Verification & Permits"
  },
  {
    "clauseNum": 8,
    "id": "clause-8",
    "shortTitle": "08. Third-Party Providers"
  },
  {
    "clauseNum": 9,
    "id": "clause-9",
    "shortTitle": "09. Bookings & Confirmations"
  },
  {
    "clauseNum": 10,
    "id": "clause-10",
    "shortTitle": "10. Pricing, GST & RBI Gateway"
  },
  {
    "clauseNum": 11,
    "id": "clause-11",
    "shortTitle": "11. Refunds (5-7 Days)"
  },
  {
    "clauseNum": 12,
    "id": "clause-12",
    "shortTitle": "12. Prohibited Conduct"
  },
  {
    "clauseNum": 13,
    "id": "clause-13",
    "shortTitle": "13. Intellectual Property"
  },
  {
    "clauseNum": 14,
    "id": "clause-14",
    "shortTitle": "14. User-Submitted Content"
  },
  {
    "clauseNum": 15,
    "id": "clause-15",
    "shortTitle": "15. Privacy & DPDP 2023"
  },
  {
    "clauseNum": 16,
    "id": "clause-16",
    "shortTitle": "16. Availability & Downtime"
  },
  {
    "clauseNum": 17,
    "id": "clause-17",
    "shortTitle": "17. Limitation of Liability"
  },
  {
    "clauseNum": 18,
    "id": "clause-18",
    "shortTitle": "18. Indemnity"
  },
  {
    "clauseNum": 19,
    "id": "clause-19",
    "shortTitle": "19. Suspension & Termination"
  },
  {
    "clauseNum": 20,
    "id": "clause-20",
    "shortTitle": "20. Grievance Officer"
  },
  {
    "clauseNum": 21,
    "id": "clause-21",
    "shortTitle": "21. Changes to Terms"
  },
  {
    "clauseNum": 22,
    "id": "clause-22",
    "shortTitle": "22. Jurisdiction: Ahmedabad"
  },
  {
    "clauseNum": 23,
    "id": "clause-23",
    "shortTitle": "23. Contact & Channels"
  },
  {
    "clauseNum": 24,
    "id": "clause-24",
    "shortTitle": "24. Effective Date & Notes"
  }
];

export function TermsClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClauseId, setActiveClauseId] = useState('clause-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const copyClauseLink = useCallback((clauseId: string, clauseNum: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/terms/#${clauseId}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => showToast(`Direct permalink to Clause ${clauseNum} copied to clipboard`))
        .catch(() => showToast(`Direct reference: #${clauseId}`));
    } else {
      showToast(`Direct reference: #${clauseId}`);
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
        document.getElementById('clause-search-input')?.focus();
      } else if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Smooth Active TOC Scroll Spy via IntersectionObserver
  useEffect(() => {
    const cards = document.querySelectorAll('.clause-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) {
              setActiveClauseId(id);
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

  const scrollToClause = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveClauseId(id);
    }
  }, []);

  // Search matching logic
  const normalizedQuery = searchQuery.trim().toLowerCase();
  
  const clauseMatches = useMemo(() => {
    const matches: Record<string, boolean> = {};
    const clauseSearchIndex: Record<string, string> = {
      'clause-1': "introduction and acceptance of terms  01 introduction and acceptance of terms link welcome to bharatyatra (\"platform\", \"we\", \"us\", or \"our\"), accessible via https://bharatyatra.in and associated domains, subdomains, mobile-responsive interfaces, and micro-applications. these terms and conditions (\"terms\") constitute an electronic record in terms of the information technology act, 2000 and the rules thereunder, forming a legally binding contractual covenant entered into between you (\"user\", \"traveller\", \"customer\", or \"you\") and the operating entity of bharatyatra. by accessing, browsing, registering for an account, generating ai itineraries, saving trips, interacting with our travel assistants (including nexi ai), or making booking requests through bharatyatra, you acknowledge that you have read, understood, and unconditionally agree to be bound by these terms, together with our integrated privacy policy and all applicable statutory rules and notifications issued under the laws of india. gavel important notice: if you do not agree with any provision of these terms or cannot satisfy legal contracting capacity, you must immediately discontinue your access to and use of the platform. ",
      'clause-2': "about bharatyatra and its services  02 about bharatyatra and its services link bharatyatra is an advanced travel discovery, personalization, and journey coordination technology ecosystem engineered to streamline authentic exploration across india, with an elevated initial repository centered on the cultural, natural, and spiritual circuits of gujarat. auto_awesome ai travel planner hyper-personalized travel itineraries synthesized algorithmically based on pace, interest, seasonality, and party composition. account_balance 100+ landmark directory ground-researched guides, historical summaries, operational hours, and darshan etiquettes for iconic indian monuments. airplane_ticket booking facilitation integration facilitation for heritage hotels, gsrtc luxury express buses, irctc routing, airlines, and artisan masterclasses. smart_toy nexi ai assistant real-time companion providing cultural etiquette cues, multilingual phrasing, and situational transit suggestions. technology intermediary status: bharatyatra operates strictly as an electronic technology platform and intermediary within the statutory definition of the information technology act, 2000 . unless explicitly certified in writing for a specific licensed package, bharatyatra is neither a direct carrier, airline, hotelier, nor fleet operator. ",
      'clause-3': "eligibility and account registration  03 eligibility and account registration link to be eligible to access bharatyatra or register an account, you represent and warrant that: you are at least 18 years of age (or the age of majority in your jurisdiction) and possess full legal capacity to enter into a binding contract pursuant to the indian contract act, 1872 . minors (individuals under 18 years) may only utilize the platform under the active supervision and explicit consent of a parent or legal guardian who accepts these terms on their behalf. you are not barred from receiving travel or digital services under the laws of india or any applicable foreign jurisdiction. all information submitted during registration (including legal name, email address, and mobile number) is truthful, accurate, and kept updated. ",
      'clause-4': "account security and user responsibilities  04 account security and user responsibilities link when registering with bharatyatra (whether through google oauth single sign-on or direct email authentication), you are solely responsible for safeguarding the credentials and authenticated tokens of your device. you agree to notify bharatyatra immediately via pandyakaushal294@gmail.com upon discovering any unauthorized entry, credential breach, or suspicious activity. you remain entirely liable for all activities, booking requests, and transactions initiated under your verified session until written notification has been formally delivered to our security desk. ",
      'clause-5': "accurate personal, traveller and booking information  05 accurate personal, traveller and booking information link all passenger names, contact numbers, email addresses, age declarations, and identification numbers entered during itinerary planning or checkout must match exactly with valid government-issued photo identification (such as aadhaar card, passport, voter id, or indian driving licence ). carriers, hotels, and protected wildlife sanctuaries (including sasan gir forest lion safari and rann of kutch border check-posts) strictly cross-verify traveller identity against booking vouchers. bharatyatra shall not be held liable for denied entry, boarding refusal, or cancellation charges arising from spelling errors, age discrepancies, or false representations provided by the user. ",
      'clause-6': "ai-generated itineraries, recommendations and limitations  06 ai-generated itineraries, recommendations and limitations link bharatyatra incorporates state-of-the-art algorithmic models and generative artificial intelligence to synthesize custom trip plans, route estimations, dining recommendations, and multi-day circuits. explicit artificial intelligence limitations: ai outputs represent probabilistic planning suggestions, not guaranteed real-time schedules. road conditions, seasonal river flow, monsoon washouts, local festivals, and unexpected municipal closures may alter recommended routes. travellers are strongly advised to independently verify temple darshan timings, museum weekly holidays, inner-line permit mandates, and ferry operational schedules. bharatyatra does not warrant that ai itinerary outputs are error-free, complete, or suitable for every individual physical condition or travel circumstance. ",
      'clause-7': "travel information accuracy and independent verification  07 travel information accuracy and independent verification link while our editorial and research teams strive to maintain accurate, up-to-date landmark directory profiles across gujarat and india, operational guidelines set by governmental bodies (such as gujarat tourism, archaeological survey of india, and forest department authorities) are subject to revision without prior notice. users bear sole responsibility for obtaining required entry permits (e.g. dhordo rann permit), adhering to cultural dress codes at sacred religious sites (such as somnath, dwarkadhish, and palitana temples), and adhering to local environmental regulations. ",
      'clause-8': "third-party travel providers and separate terms  08 third-party travel providers and separate terms link when you reserve hotel rooms, bus seats, train tickets, domestic flights, or local cultural activities through bharatyatra, the contract of carriage or hospitality service is formed directly between you and the respective third-party service provider (\"travel provider\"). your booking is subject to the specific terms, conditions, check-in rules, baggage allowances, and tariff restrictions established by that travel provider. bharatyatra does not control the physical premises, transport vehicles, staff conduct, or on-ground service quality of independent operators. ",
      'clause-9': "booking requests, confirmations and availability  09 booking requests, confirmations and availability link submitting a booking request or generating an itinerary does not constitute an immediate confirmed reservation. a booking is only legally confirmed when: the applicable transaction payment has been successfully authorized and settled. the respective travel provider has confirmed real-time inventory allocation. bharatyatra has dispatched an official booking confirmation voucher containing a valid reference identifier (e.g., by-cf-xxxxx ). in the rare event that inventory becomes unavailable between selection and payment settlement, the transaction will be cancelled and any debited funds will be refunded pursuant to section 11. ",
      'clause-10': "pricing, taxes, fees and payment processing  10 pricing, taxes, fees and payment processing link all monetary values on bharatyatra are quoted in indian rupees (inr / ₹) . pricing displays clearly delineate the base rate, applicable goods and services tax (gst: 12% or 18% as statutory), and any statutory levies or platform convenience fees prior to final payment authorization. transactions are routed through reserve bank of india (rbi) authorized payment gateway partners (such as razorpay, upi rails, credit/debit cards, and scheduled commercial banks). bharatyatra does not store sensitive cardholder authentication data (cvv/pin). you agree to comply with your issuing bank's multi-factor authentication (otp/sms) requirements. ",
      'clause-11': "cancellations, changes, refunds and disputes  11 cancellations, changes, refunds and disputes link cancellation eligibility, change windows, and applicable refund percentages are governed by the specific fare rules displayed at the time of purchase and the policies of the respective travel provider: non-refundable fares certain promotional hotel stays, festive dates (e.g. rann utsav peak full moon dates), and special transit passes are strictly non-refundable once issued. 5–7 banking days approved refunds are credited exclusively back to the original source payment instrument within standard banking turnaround windows. convenience &amp; gateway fees: technology convenience fees or gateway surcharges incurred during initial transaction processing are non-refundable unless cancellation resulted directly from a technical failure attributable to bharatyatra. disputed debits must be reported within 14 calendar days to pandyakaushal294@gmail.com . ",
      'clause-12': "user conduct and prohibited activities  12 user conduct and prohibited activities link you agree not to engage in any of the following prohibited activities: making speculative, fraudulent, or false booking requests or hoarding inventory without genuine intent to travel. using automated scraping, bots, crawlers, or algorithmic extraction tools to index or republish bharatyatra proprietary directory content. attempting to probe, scan, or breach platform security defenses, rate limit guards, api endpoints, or database structures. submitting defamatory, obscene, infringing, or illegal material through reviews, feedback forms, or chat interfaces. impersonating another individual, travel agent, or government official. reselling or commercializing bharatyatra ai trip construction plans without explicit commercial licensing. ",
      'clause-13': "intellectual property and permitted use  13 intellectual property and permitted use link all content included on bharatyatra—including software code, text, graphics, landmark dossiers, photographs, logo marks, user interface design, audio elements, and algorithmic prompts—is the intellectual property of bharatyatra or its licensors and is protected by the copyright act, 1957 , the trade marks act, 1999 , and international intellectual property conventions. you are granted a limited, personal, non-exclusive, non-transferable, and revocable licence to access and view the platform for personal, non-commercial travel planning purposes only. ",
      'clause-14': "user-submitted content and permissions  14 user-submitted content and permissions link when you submit reviews, travel tips, photos, or itinerary feedback to bharatyatra, you grant us a worldwide, perpetual, royalty-free, non-exclusive licence to publish, adapt, translate, and display such content across our platform ecosystem. you represent and warrant that you own or possess all requisite rights to the content you submit and that your submissions do not infringe any third-party privacy, publicity, or intellectual property rights. ",
      'clause-15': "privacy and reference to privacy policy  15 privacy and reference to privacy policy link your privacy and the security of your personal data are paramount to bharatyatra. we process personal and booking data in compliance with applicable indian data protection principles, including the information technology act, 2000 and the digital personal data protection act, 2023 (dpdp act) . read the full privacy policy review how personal identifiers, booking records, and ai prompts are encrypted and retained. view policy arrow_forward ",
      'clause-16': "service availability, maintenance and technical limitations  16 service availability, maintenance and technical limitations link bharatyatra strives to ensure continuous 24/7 platform availability. however, digital services may be subject to scheduled maintenance, cloud infrastructure updates, telecommunication disruptions, or third-party global distribution system (gds) api downtimes. bharatyatra is provided on an \"as is\" and \"as available\" basis without warranties of uninterrupted uptime or immediate latency resolution during unexpected internet backbone outages. ",
      'clause-17': "limitation of liability  17 limitation of liability link to the maximum extent permitted under applicable indian law (including the consumer protection act, 2019 and section 73 of the indian contract act, 1872 ): bharatyatra shall not be liable for indirect, incidental, special, punitive, or consequential damages, including loss of profits, vacation time, missed connecting transit, or emotional distress. bharatyatra is not liable for acts, omissions, delays, mechanical breakdowns, overbooking, strikes, or insolvencies of independent third-party carriers, hotels, or experience suppliers. in any event, bharatyatra's aggregate liability arising out of or related to these terms or your use of the platform shall not exceed the convenience fee retained by bharatyatra for the specific transaction giving rise to the claim, or inr 1,000 (one thousand indian rupees), whichever is higher. nothing in these terms limits or excludes liability for death, personal injury, fraud, or gross negligence where such limitation is prohibited by statutory law. ",
      'clause-18': "indemnity  18 indemnity link to the extent permitted by law, you agree to defend, indemnify, and hold harmless bharatyatra, its affiliates, directors, officers, employees, and software maintainers from and against any claims, liabilities, damages, losses, and reasonable legal expenses arising out of: your willful violation of these terms or applicable statutory laws. your infringement of any third-party intellectual property or privacy right. fraudulent conduct or false passenger declarations made during booking. ",
      'clause-19': "suspension and termination of accounts  19 suspension and termination of accounts link bharatyatra reserves the right, in its sole discretion and without liability, to suspend, disable, or terminate user accounts or restrict access to the platform upon reasonable belief of: material breach of these terms or suspected fraudulent activities. payment defaults, unauthorized chargeback initiations, or abusive usage of automated agents. conduct detrimental to fellow travellers, suppliers, or the operational integrity of the platform. ",
      'clause-20': "consumer complaints and grievance redressal  20 consumer complaints and grievance redressal link in accordance with the consumer protection act, 2019 , the consumer protection (e-commerce) rules, 2020 , and the information technology (intermediary guidelines and digital media ethics code) rules, 2021 , bharatyatra has established a formal consumer grievance redressal mechanism. shield_person designated grievance redressal officer designation grievance redressal officer, bharatyatra contact email pandyakaushal294@gmail.com support telephone +91 9624282521 jurisdiction office ahmedabad, gujarat, india schedule response timelines: acknowledgment within 48 hours ; final resolution within 30 days of complete grievance particulars. ",
      'clause-21': "changes to the terms  21 changes to the terms link bharatyatra reserves the right to amend, update, or replace any part of these terms from time to time to accommodate platform advancements, new travel features, or statutory regulatory directives. any updates become effective immediately upon posting to this url. the \"last updated\" date reflects the most recent revision. your continued use of the platform following published modifications constitutes your binding acceptance of the revised terms. ",
      'clause-22': "governing law and jurisdiction  22 governing law and jurisdiction link these terms and any dispute, controversy, or claim arising out of or relating to your use of bharatyatra shall be governed by, interpreted, and construed exclusively in accordance with the substantive laws of the republic of india , without giving effect to conflict of laws principles. subject to statutory consumer court jurisdictions where mandatory under the consumer protection act, 2019 , you agree that the competent civil courts situated at ahmedabad, gujarat, india shall possess exclusive territorial jurisdiction over any legal proceedings arising hereunder. ",
      'clause-23': "contact information and support  23 contact information and support link if you have questions, comments, or require assistance regarding these terms, you may reach our administrative and support team through the following official channels: alternate_email official support email pandyakaushal294@gmail.com ring_volume customer care hotline +91 9624282521 ",
      'clause-24': "effective date and last-updated date  24 effective date and last-updated date link these terms and conditions are effective as of october 28, 2026 . document version: 1.0.0 (pan-india &amp; gujarat travel release) . fact_check notice for platform owner &amp; legal review checklist before treating these terms as commercially final for enterprise contracts or venture financing, the business owner should complete the following verifications with qualified indian legal counsel: formalize corporate entity name (e.g., private limited / llp / sole proprietorship) once officially incorporated with the ministry of corporate affairs (mca). designate physical registered postal address in gujarat and statutory corporate identification number (cin) or gstin. appoint an official grievance redressal officer by name pursuant to the consumer protection (e-commerce) rules, 2020. publish the corresponding separate privacy policy pursuant to the digital personal data protection act, 2023. ",
    };

    let count = 0;
    for (const id in clauseSearchIndex) {
      const isMatch = !normalizedQuery || clauseSearchIndex[id].includes(normalizedQuery);
      matches[id] = isMatch;
      if (isMatch) count++;
    }
    return { matches, count };
  }, [normalizedQuery]);

  const visibleCount = clauseMatches.count;
  const totalCount = 24;

  return (
    <div className="w-full bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col justify-between">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-on-background text-surface shadow-2xl border border-outline-variant animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <span className="material-symbols-outlined text-[18px] text-primary-container">check_circle</span>
          <span className="text-xs font-medium font-body-sm tracking-wide">{toastMessage}</span>
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

      <div className="flex flex-col w-full">
        {/* Top Document Header & Hero Canvas */}
        <div className="w-full bg-surface-container-low/70 py-space-xl px-margin-mobile lg:px-margin">
          <div className="max-w-[1440px] mx-auto flex flex-col gap-space-lg">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
              <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1" data-path="home">
                <span className="material-symbols-outlined text-[16px]">home</span>
                Home
              </Link>
              <span className="material-symbols-outlined text-[14px] opacity-40">chevron_right</span>
              <span className="text-on-surface-variant">Legal &amp; Governance</span>
              <span className="material-symbols-outlined text-[14px] opacity-40">chevron_right</span>
              <span className="text-on-surface font-semibold">Terms &amp; Conditions</span>
            </nav>

            {/* Main Document Title Block */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
              <div className="flex flex-col gap-space-sm max-w-3xl">
                <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary-container/25 text-on-primary-container font-label-caps text-label-caps uppercase tracking-widest w-fit">
                  <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                  LEGAL &amp; REGULATORY FRAMEWORK • BHARAT YATRA
                </div>
                <h1 className="font-display-hero text-headline-lg lg:text-display-hero text-on-surface tracking-tight leading-tight">
                  Terms &amp; Conditions
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  Please review these Terms and Conditions carefully before exploring, constructing AI itineraries, or booking travel services through BharatYatra (<span className="font-semibold text-on-surface">bharatyatra.in</span>).
                </p>
              </div>

              {/* Action Tools Bar */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-space-sm shrink-0">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-highest hover:bg-surface-container font-label-lg text-label-lg text-on-surface shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print Copy
                </button>
                <a
                  className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary-container text-on-secondary-fixed hover:bg-primary-fixed font-label-lg text-label-lg font-semibold shadow-sm transition-all"
                  href="mailto:pandyakaushal294@gmail.com?subject=Request%20Legal%20PDF%20Dossier%20BharatYatra"
                >
                  <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                  PDF Dossier
                </a>
              </div>
            </div>

            {/* Regulatory Metadata Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md p-space-md rounded-2xl bg-surface-container-lowest shadow-sm">
              <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low/50">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Effective Date</span>
                <span className="font-title-md text-title-md text-on-surface font-bold">October 28, 2026</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant opacity-80">Version 1.0.0</span>
              </div>
              <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low/50">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Jurisdiction</span>
                <span className="font-title-md text-title-md text-on-surface font-bold">Republic of India</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant opacity-80">Contract Act, 1872</span>
              </div>
              <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low/50">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Applicable Court</span>
                <span className="font-title-md text-title-md text-on-surface font-bold">Ahmedabad, Gujarat</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant opacity-80">Exclusive Territorial</span>
              </div>
              <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low/50">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Tech Status</span>
                <span className="font-title-md text-title-md text-on-surface font-bold">IT Act Intermediary</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant opacity-80">Section 79 Compliant</span>
              </div>
            </div>

            {/* In-Document Search & Key Statutory Callouts */}
            <div className="flex flex-col gap-space-md">
              {/* Live Instant Search Bar */}
              <div className="relative w-full rounded-2xl bg-surface-container-lowest p-space-xs shadow-sm flex items-center gap-space-sm border border-transparent focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <div className="w-12 h-12 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[24px]">search</span>
                </div>
                <input
                  aria-label="Search clauses"
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                  id="clause-search-input"
                  placeholder="Search within all 24 statutory clauses (e.g., refund, cancel, AI, Aadhaar, payment)..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span
                  className="hidden sm:inline-flex items-center px-space-sm py-space-xs rounded-full bg-surface-container text-on-surface font-label-md text-label-md shrink-0 whitespace-nowrap"
                  id="search-result-counter"
                >
                  {searchQuery.trim() ? `${visibleCount} of ${totalCount} matching` : `${totalCount} clauses active`}
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant cursor-pointer transition-colors"
                    id="clear-search-btn"
                    title="Clear Search"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>

              {/* Two Critical Advisory Banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex items-start gap-space-md p-space-lg rounded-2xl bg-primary-container/20 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-secondary-fixed shrink-0">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">AI Planning Advisory</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      BharatYatra generates dynamic itineraries using artificial intelligence. Timings, monument darshan hours, permits, and fare estimates are advisory and must be independently verified prior to travel.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-space-md p-space-lg rounded-2xl bg-secondary-container/30 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-on-secondary-fixed text-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">Independent Operator Relationship</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Carriers (GSRTC, IRCTC, domestic airlines), hotels, and local experience guilds operate independently. Bookings are subject to respective conditions of carriage and property rules.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Body Content: Two-Column Editorial Grid */}
        <div className="w-full max-w-[1440px] mx-auto px-margin-mobile lg:px-margin py-space-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {/* LEFT COLUMN: All 24 Statutory Clauses (~70%) */}
            <div className="lg:col-span-8 flex flex-col gap-space-xl" id="clauses-container">
              {visibleCount === 0 && (
                <div className="p-space-xl rounded-2xl bg-surface-container-lowest text-center flex flex-col items-center gap-space-md shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[24px]">search_off</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-title-md text-title-md text-on-surface font-bold">No matching clauses found</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      No legal terms or provisions matched &ldquo;{searchQuery}&rdquo;. Try keywords like &ldquo;refund&rdquo;, &ldquo;booking&rdquo;, &ldquo;liability&rdquo;, &ldquo;AI&rdquo;, or &ldquo;court&rdquo;.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-space-md py-space-xs rounded-xl bg-primary-container text-on-secondary-fixed font-label-md text-label-md font-semibold hover:bg-primary-fixed transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Clause 01 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-1'] ? 'flex' : 'none' }} id="clause-1">
<span id="section-1" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">01</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Introduction and Acceptance of Terms</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-1', '01')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 01">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              Welcome to <strong className="text-on-surface">BharatYatra</strong> ("Platform", "we", "us", or "our"), accessible via <a className="text-primary font-semibold underline underline-offset-4" href="https://bharatyatra.in">https://bharatyatra.in</a> and associated domains, subdomains, mobile-responsive interfaces, and micro-applications. These Terms and Conditions ("Terms") constitute an electronic record in terms of the <em className="text-on-surface">Information Technology Act, 2000</em> and the rules thereunder, forming a legally binding contractual covenant entered into between you ("User", "Traveller", "Customer", or "you") and the operating entity of BharatYatra.
            </p>
<p>
              By accessing, browsing, registering for an account, generating AI itineraries, saving trips, interacting with our travel assistants (including Nexi AI), or making booking requests through BharatYatra, you acknowledge that you have read, understood, and unconditionally agree to be bound by these Terms, together with our integrated <strong className="text-on-surface">Privacy Policy</strong> and all applicable statutory rules and notifications issued under the laws of India.
            </p>
<div className="p-space-md rounded-xl bg-error-container/20 text-on-surface font-body-sm text-body-sm flex items-start gap-space-sm">
<span className="material-symbols-outlined text-error text-[20px] shrink-0">gavel</span>
<p>
<strong className="font-semibold text-error">Important Notice:</strong> If you do not agree with any provision of these Terms or cannot satisfy legal contracting capacity, you must immediately discontinue your access to and use of the Platform.
              </p>
</div>
</div>
</article>

              {/* Clause 02 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-2'] ? 'flex' : 'none' }} id="clause-2">
<span id="section-2" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">02</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">About BharatYatra and Its Services</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-2', '02')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 02">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              BharatYatra is an advanced travel discovery, personalization, and journey coordination technology ecosystem engineered to streamline authentic exploration across India, with an elevated initial repository centered on the cultural, natural, and spiritual circuits of Gujarat.
            </p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md my-space-xs">
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
<span className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                  AI Travel Planner
                </span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Hyper-personalized travel itineraries synthesized algorithmically based on pace, interest, seasonality, and party composition.</p>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
<span className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
                  100+ Landmark Directory
                </span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Ground-researched guides, historical summaries, operational hours, and darshan etiquettes for iconic Indian monuments.</p>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
<span className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">airplane_ticket</span>
                  Booking Facilitation
                </span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Integration facilitation for heritage hotels, GSRTC luxury express buses, IRCTC routing, airlines, and artisan masterclasses.</p>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
<span className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
                  Nexi AI Assistant
                </span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Real-time companion providing cultural etiquette cues, multilingual phrasing, and situational transit suggestions.</p>
</div>
</div>
<p>
<strong className="text-on-surface">Technology Intermediary Status:</strong> BharatYatra operates strictly as an electronic technology platform and intermediary within the statutory definition of the <em className="text-on-surface">Information Technology Act, 2000</em>. Unless explicitly certified in writing for a specific licensed package, BharatYatra is neither a direct carrier, airline, hotelier, nor fleet operator.
            </p>
</div>
</article>

              {/* Clause 03 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-3'] ? 'flex' : 'none' }} id="clause-3">
<span id="section-3" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">03</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Eligibility and Account Registration</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-3', '03')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 03">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>To be eligible to access BharatYatra or register an account, you represent and warrant that:</p>
<ul className="flex flex-col gap-space-xs pl-space-md list-disc text-on-surface-variant">
<li>You are at least <strong className="text-on-surface">18 years of age</strong> (or the age of majority in your jurisdiction) and possess full legal capacity to enter into a binding contract pursuant to the <em className="text-on-surface">Indian Contract Act, 1872</em>.</li>
<li>Minors (individuals under 18 years) may only utilize the Platform under the active supervision and explicit consent of a parent or legal guardian who accepts these Terms on their behalf.</li>
<li>You are not barred from receiving travel or digital services under the laws of India or any applicable foreign jurisdiction.</li>
<li>All information submitted during registration (including legal name, email address, and mobile number) is truthful, accurate, and kept updated.</li>
</ul>
</div>
</article>

              {/* Clause 04 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-4'] ? 'flex' : 'none' }} id="clause-4">
<span id="section-4" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">04</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Account Security and User Responsibilities</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-4', '04')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 04">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              When registering with BharatYatra (whether through Google OAuth single sign-on or direct email authentication), you are solely responsible for safeguarding the credentials and authenticated tokens of your device.
            </p>
<p>
              You agree to notify BharatYatra immediately via <a className="text-primary font-semibold underline underline-offset-4" href="mailto:pandyakaushal294@gmail.com">pandyakaushal294@gmail.com</a> upon discovering any unauthorized entry, credential breach, or suspicious activity. You remain entirely liable for all activities, booking requests, and transactions initiated under your verified session until written notification has been formally delivered to our security desk.
            </p>
</div>
</article>

              {/* Clause 05 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-5'] ? 'flex' : 'none' }} id="clause-5">
<span id="section-5" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">05</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Accurate Personal, Traveller and Booking Information</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-5', '05')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 05">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              All passenger names, contact numbers, email addresses, age declarations, and identification numbers entered during itinerary planning or checkout must match exactly with valid Government-issued photo identification (such as <strong className="text-on-surface">Aadhaar Card, Passport, Voter ID, or Indian Driving Licence</strong>).
            </p>
<p>
              Carriers, hotels, and protected wildlife sanctuaries (including Sasan Gir Forest Lion Safari and Rann of Kutch border check-posts) strictly cross-verify traveller identity against booking vouchers. BharatYatra shall not be held liable for denied entry, boarding refusal, or cancellation charges arising from spelling errors, age discrepancies, or false representations provided by the user.
            </p>
</div>
</article>

              {/* Clause 06 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-6'] ? 'flex' : 'none' }} id="clause-6">
<span id="section-6" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">06</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">AI-Generated Itineraries, Recommendations and Limitations</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-6', '06')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 06">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              BharatYatra incorporates state-of-the-art algorithmic models and generative artificial intelligence to synthesize custom trip plans, route estimations, dining recommendations, and multi-day circuits.
            </p>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
<span className="font-label-lg text-label-lg text-on-surface font-semibold">Explicit Artificial Intelligence Limitations:</span>
<ul className="list-disc pl-space-md flex flex-col gap-1 text-on-surface-variant font-body-sm text-body-sm">
<li>AI outputs represent probabilistic planning suggestions, not guaranteed real-time schedules.</li>
<li>Road conditions, seasonal river flow, monsoon washouts, local festivals, and unexpected municipal closures may alter recommended routes.</li>
<li>Travellers are strongly advised to independently verify temple darshan timings, museum weekly holidays, inner-line permit mandates, and ferry operational schedules.</li>
<li>BharatYatra does not warrant that AI itinerary outputs are error-free, complete, or suitable for every individual physical condition or travel circumstance.</li>
</ul>
</div>
</div>
</article>

              {/* Clause 07 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-7'] ? 'flex' : 'none' }} id="clause-7">
<span id="section-7" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">07</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Travel Information Accuracy and Independent Verification</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-7', '07')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 07">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              While our editorial and research teams strive to maintain accurate, up-to-date landmark directory profiles across Gujarat and India, operational guidelines set by governmental bodies (such as Gujarat Tourism, Archaeological Survey of India, and Forest Department authorities) are subject to revision without prior notice.
            </p>
<p>
              Users bear sole responsibility for obtaining required entry permits (e.g. Dhordo Rann permit), adhering to cultural dress codes at sacred religious sites (such as Somnath, Dwarkadhish, and Palitana temples), and adhering to local environmental regulations.
            </p>
</div>
</article>

              {/* Clause 08 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-8'] ? 'flex' : 'none' }} id="clause-8">
<span id="section-8" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">08</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Third-Party Travel Providers and Separate Terms</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-8', '08')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 08">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              When you reserve hotel rooms, bus seats, train tickets, domestic flights, or local cultural activities through BharatYatra, the contract of carriage or hospitality service is formed directly between you and the respective third-party service provider ("Travel Provider").
            </p>
<p>
              Your booking is subject to the specific terms, conditions, check-in rules, baggage allowances, and tariff restrictions established by that Travel Provider. BharatYatra does not control the physical premises, transport vehicles, staff conduct, or on-ground service quality of independent operators.
            </p>
</div>
</article>

              {/* Clause 09 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-9'] ? 'flex' : 'none' }} id="clause-9">
<span id="section-9" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">09</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Booking Requests, Confirmations and Availability</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-9', '09')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 09">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              Submitting a booking request or generating an itinerary does not constitute an immediate confirmed reservation. A booking is only legally confirmed when:
            </p>
<ol className="list-decimal pl-space-md flex flex-col gap-1 text-on-surface-variant">
<li>The applicable transaction payment has been successfully authorized and settled.</li>
<li>The respective Travel Provider has confirmed real-time inventory allocation.</li>
<li>BharatYatra has dispatched an official booking confirmation voucher containing a valid reference identifier (e.g., <code className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-xs">BY-CF-XXXXX</code>).</li>
</ol>
<p>
              In the rare event that inventory becomes unavailable between selection and payment settlement, the transaction will be cancelled and any debited funds will be refunded pursuant to Section 11.
            </p>
</div>
</article>

              {/* Clause 10 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-10'] ? 'flex' : 'none' }} id="clause-10">
<span id="section-10" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">10</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Pricing, Taxes, Fees and Payment Processing</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-10', '10')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 10">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              All monetary values on BharatYatra are quoted in <strong className="text-on-surface">Indian Rupees (INR / ₹)</strong>. Pricing displays clearly delineate the base rate, applicable Goods and Services Tax (GST: 12% or 18% as statutory), and any statutory levies or platform convenience fees prior to final payment authorization.
            </p>
<p>
              Transactions are routed through Reserve Bank of India (RBI) authorized payment gateway partners (such as Razorpay, UPI rails, credit/debit cards, and scheduled commercial banks). BharatYatra does not store sensitive cardholder authentication data (CVV/PIN). You agree to comply with your issuing bank's multi-factor authentication (OTP/SMS) requirements.
            </p>
</div>
</article>

              {/* Clause 11 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-11'] ? 'flex' : 'none' }} id="clause-11">
<span id="section-11" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">11</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Cancellations, Changes, Refunds and Disputes</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-11', '11')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 11">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              Cancellation eligibility, change windows, and applicable refund percentages are governed by the specific fare rules displayed at the time of purchase and the policies of the respective Travel Provider:
            </p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
<span className="font-title-md text-title-md text-on-surface font-semibold">Non-Refundable Fares</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Certain promotional hotel stays, festive dates (e.g. Rann Utsav peak full moon dates), and special transit passes are strictly non-refundable once issued.</p>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
<span className="font-title-md text-title-md text-on-surface font-semibold">5–7 Banking Days</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Approved refunds are credited exclusively back to the original source payment instrument within standard banking turnaround windows.</p>
</div>
</div>
<p>
<strong className="text-on-surface">Convenience &amp; Gateway Fees:</strong> Technology convenience fees or gateway surcharges incurred during initial transaction processing are non-refundable unless cancellation resulted directly from a technical failure attributable to BharatYatra. Disputed debits must be reported within 14 calendar days to <a className="text-primary font-semibold underline underline-offset-4" href="mailto:pandyakaushal294@gmail.com">pandyakaushal294@gmail.com</a>.
            </p>
</div>
</article>

              {/* Clause 12 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-12'] ? 'flex' : 'none' }} id="clause-12">
<span id="section-12" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">12</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">User Conduct and Prohibited Activities</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-12', '12')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 12">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>You agree not to engage in any of the following prohibited activities:</p>
<ul className="list-disc pl-space-md flex flex-col gap-space-xs text-on-surface-variant">
<li>Making speculative, fraudulent, or false booking requests or hoarding inventory without genuine intent to travel.</li>
<li>Using automated scraping, bots, crawlers, or algorithmic extraction tools to index or republish BharatYatra proprietary directory content.</li>
<li>Attempting to probe, scan, or breach platform security defenses, rate limit guards, API endpoints, or database structures.</li>
<li>Submitting defamatory, obscene, infringing, or illegal material through reviews, feedback forms, or chat interfaces.</li>
<li>Impersonating another individual, travel agent, or government official.</li>
<li>Reselling or commercializing BharatYatra AI trip construction plans without explicit commercial licensing.</li>
</ul>
</div>
</article>

              {/* Clause 13 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-13'] ? 'flex' : 'none' }} id="clause-13">
<span id="section-13" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">13</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Intellectual Property and Permitted Use</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-13', '13')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 13">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              All content included on BharatYatra—including software code, text, graphics, landmark dossiers, photographs, logo marks, user interface design, audio elements, and algorithmic prompts—is the intellectual property of BharatYatra or its licensors and is protected by the <em className="text-on-surface">Copyright Act, 1957</em>, the <em className="text-on-surface">Trade Marks Act, 1999</em>, and international intellectual property conventions.
            </p>
<p>
              You are granted a limited, personal, non-exclusive, non-transferable, and revocable licence to access and view the Platform for personal, non-commercial travel planning purposes only.
            </p>
</div>
</article>

              {/* Clause 14 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-14'] ? 'flex' : 'none' }} id="clause-14">
<span id="section-14" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">14</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">User-Submitted Content and Permissions</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-14', '14')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 14">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              When you submit reviews, travel tips, photos, or itinerary feedback to BharatYatra, you grant us a worldwide, perpetual, royalty-free, non-exclusive licence to publish, adapt, translate, and display such content across our platform ecosystem.
            </p>
<p>
              You represent and warrant that you own or possess all requisite rights to the content you submit and that your submissions do not infringe any third-party privacy, publicity, or intellectual property rights.
            </p>
</div>
</article>

              {/* Clause 15 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-15'] ? 'flex' : 'none' }} id="clause-15">
<span id="section-15" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">15</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Privacy and Reference to Privacy Policy</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-15', '15')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 15">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              Your privacy and the security of your personal data are paramount to BharatYatra. We process personal and booking data in compliance with applicable Indian data protection principles, including the <em className="text-on-surface">Information Technology Act, 2000</em> and the <em className="text-on-surface">Digital Personal Data Protection Act, 2023 (DPDP Act)</em>.
            </p>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
<div className="flex flex-col gap-1">
<span className="font-title-md text-title-md text-on-surface font-semibold">Read the Full Privacy Policy</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Review how personal identifiers, booking records, and AI prompts are encrypted and retained.</p>
</div>
<a className="inline-flex items-center gap-1.5 px-space-md py-space-sm rounded-xl bg-surface-container-highest hover:bg-surface-container font-label-lg text-label-lg text-on-surface font-semibold shrink-0 transition-all" data-path="privacy-policy" href="#">
<span>View Policy</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>
</article>

              {/* Clause 16 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-16'] ? 'flex' : 'none' }} id="clause-16">
<span id="section-16" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">16</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Service Availability, Maintenance and Technical Limitations</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-16', '16')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 16">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              BharatYatra strives to ensure continuous 24/7 platform availability. However, digital services may be subject to scheduled maintenance, cloud infrastructure updates, telecommunication disruptions, or third-party global distribution system (GDS) API downtimes.
            </p>
<p>
              BharatYatra is provided on an "as is" and "as available" basis without warranties of uninterrupted uptime or immediate latency resolution during unexpected internet backbone outages.
            </p>
</div>
</article>

              {/* Clause 17 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-17'] ? 'flex' : 'none' }} id="clause-17">
<span id="section-17" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">17</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Limitation of Liability</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-17', '17')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 17">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              To the maximum extent permitted under applicable Indian law (including the <em className="text-on-surface">Consumer Protection Act, 2019</em> and Section 73 of the <em className="text-on-surface">Indian Contract Act, 1872</em>):
            </p>
<ul className="list-disc pl-space-md flex flex-col gap-space-xs text-on-surface-variant">
<li>BharatYatra shall not be liable for indirect, incidental, special, punitive, or consequential damages, including loss of profits, vacation time, missed connecting transit, or emotional distress.</li>
<li>BharatYatra is not liable for acts, omissions, delays, mechanical breakdowns, overbooking, strikes, or insolvencies of independent third-party carriers, hotels, or experience suppliers.</li>
<li>In any event, BharatYatra's aggregate liability arising out of or related to these Terms or your use of the Platform shall not exceed the convenience fee retained by BharatYatra for the specific transaction giving rise to the claim, or INR 1,000 (One Thousand Indian Rupees), whichever is higher.</li>
<li>Nothing in these Terms limits or excludes liability for death, personal injury, fraud, or gross negligence where such limitation is prohibited by statutory law.</li>
</ul>
</div>
</article>

              {/* Clause 18 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-18'] ? 'flex' : 'none' }} id="clause-18">
<span id="section-18" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">18</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Indemnity</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-18', '18')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 18">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              To the extent permitted by law, you agree to defend, indemnify, and hold harmless BharatYatra, its affiliates, directors, officers, employees, and software maintainers from and against any claims, liabilities, damages, losses, and reasonable legal expenses arising out of:
            </p>
<ul className="list-disc pl-space-md flex flex-col gap-1 text-on-surface-variant">
<li>Your willful violation of these Terms or applicable statutory laws.</li>
<li>Your infringement of any third-party intellectual property or privacy right.</li>
<li>Fraudulent conduct or false passenger declarations made during booking.</li>
</ul>
</div>
</article>

              {/* Clause 19 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-19'] ? 'flex' : 'none' }} id="clause-19">
<span id="section-19" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">19</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Suspension and Termination of Accounts</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-19', '19')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 19">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              BharatYatra reserves the right, in its sole discretion and without liability, to suspend, disable, or terminate user accounts or restrict access to the Platform upon reasonable belief of:
            </p>
<ul className="list-disc pl-space-md flex flex-col gap-1 text-on-surface-variant">
<li>Material breach of these Terms or suspected fraudulent activities.</li>
<li>Payment defaults, unauthorized chargeback initiations, or abusive usage of automated agents.</li>
<li>Conduct detrimental to fellow travellers, suppliers, or the operational integrity of the Platform.</li>
</ul>
</div>
</article>

              {/* Clause 20 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-20'] ? 'flex' : 'none' }} id="clause-20">
<span id="section-20" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">20</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Consumer Complaints and Grievance Redressal</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-20', '20')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 20">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              In accordance with the <em className="text-on-surface">Consumer Protection Act, 2019</em>, the <em className="text-on-surface">Consumer Protection (E-Commerce) Rules, 2020</em>, and the <em className="text-on-surface">Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</em>, BharatYatra has established a formal consumer grievance redressal mechanism.
            </p>
{/* Grievance Officer Box */}
<div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col gap-space-sm">
<div className="flex items-center gap-space-xs text-primary">
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
<span className="font-title-md text-title-md font-semibold text-on-surface">Designated Grievance Redressal Officer</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
<div className="flex flex-col gap-0.5">
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Designation</span>
<span className="font-body-md text-body-md font-semibold text-on-surface">Grievance Redressal Officer, BharatYatra</span>
</div>
<div className="flex flex-col gap-0.5">
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Contact Email</span>
<a className="font-body-md text-body-md text-primary font-semibold underline underline-offset-4" href="mailto:pandyakaushal294@gmail.com">pandyakaushal294@gmail.com</a>
</div>
<div className="flex flex-col gap-0.5">
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Support Telephone</span>
<a className="font-body-md text-body-md text-on-surface font-semibold hover:text-primary transition-colors" href="tel:+919624282521">+91 9624282521</a>
</div>
<div className="flex flex-col gap-0.5">
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Jurisdiction Office</span>
<span className="font-body-md text-body-md text-on-surface">Ahmedabad, Gujarat, India</span>
</div>
</div>
<div className="pt-space-xs flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
<span>Response Timelines: Acknowledgment within <strong className="text-on-surface">48 hours</strong>; final resolution within <strong className="text-on-surface">30 days</strong> of complete grievance particulars.</span>
</div>
</div>
</div>
</article>

              {/* Clause 21 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-21'] ? 'flex' : 'none' }} id="clause-21">
<span id="section-21" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">21</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Changes to the Terms</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-21', '21')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 21">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              BharatYatra reserves the right to amend, update, or replace any part of these Terms from time to time to accommodate platform advancements, new travel features, or statutory regulatory directives.
            </p>
<p>
              Any updates become effective immediately upon posting to this URL. The "Last Updated" date reflects the most recent revision. Your continued use of the Platform following published modifications constitutes your binding acceptance of the revised Terms.
            </p>
</div>
</article>

              {/* Clause 22 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-22'] ? 'flex' : 'none' }} id="clause-22">
<span id="section-22" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">22</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Governing Law and Jurisdiction</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-22', '22')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 22">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              These Terms and any dispute, controversy, or claim arising out of or relating to your use of BharatYatra shall be governed by, interpreted, and construed exclusively in accordance with the substantive laws of the <strong className="text-on-surface">Republic of India</strong>, without giving effect to conflict of laws principles.
            </p>
<p>
              Subject to statutory consumer court jurisdictions where mandatory under the <em className="text-on-surface">Consumer Protection Act, 2019</em>, you agree that the competent civil courts situated at <strong className="text-on-surface">Ahmedabad, Gujarat, India</strong> shall possess exclusive territorial jurisdiction over any legal proceedings arising hereunder.
            </p>
</div>
</article>

              {/* Clause 23 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-23'] ? 'flex' : 'none' }} id="clause-23">
<span id="section-23" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">23</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Contact Information and Support</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-23', '23')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 23">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              If you have questions, comments, or require assistance regarding these Terms, you may reach our administrative and support team through the following official channels:
            </p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm my-space-xs">
<a className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center gap-space-sm" href="mailto:pandyakaushal294@gmail.com">
<span className="material-symbols-outlined text-primary text-[24px]">alternate_email</span>
<div className="flex flex-col">
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Official Support Email</span>
<span className="font-body-md text-body-md font-semibold text-on-surface">pandyakaushal294@gmail.com</span>
</div>
</a>
<a className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center gap-space-sm" href="tel:+919624282521">
<span className="material-symbols-outlined text-primary text-[24px]">ring_volume</span>
<div className="flex flex-col">
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Customer Care Hotline</span>
<span className="font-body-md text-body-md font-semibold text-on-surface">+91 9624282521</span>
</div>
</a>
</div>
</div>
</article>

              {/* Clause 24 */}
              <article className="clause-card flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm scroll-mt-28" style={{ display: clauseMatches.matches['clause-24'] ? 'flex' : 'none' }} id="clause-24">
<span id="section-24" className="sr-only" aria-hidden="true" />
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-space-xs rounded-lg bg-surface-container font-label-caps text-label-caps text-primary font-bold">24</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Effective Date and Last-Updated Date</h2>
</div>
<button type="button" onClick={() => copyClauseLink('clause-24', '24')} className="text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Copy permalink to Clause 24">
<span className="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
<div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-space-sm leading-relaxed">
<p>
              These Terms and Conditions are effective as of <strong className="text-on-surface">October 28, 2026</strong>.
            </p>
<p className="font-body-sm text-body-sm text-on-surface-variant">
              Document Version: <span className="font-semibold text-on-surface">1.0.0 (Pan-India &amp; Gujarat Travel Release)</span>.
            </p>
{/* Platform Owner & Legal Review Checklist Box */}
<div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col gap-space-sm mt-space-sm">
<div className="flex items-center gap-space-xs text-primary">
<span className="material-symbols-outlined text-[20px]">fact_check</span>
<span className="font-title-md text-title-md font-semibold text-on-surface">Notice for Platform Owner &amp; Legal Review Checklist</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
                Before treating these terms as commercially final for enterprise contracts or venture financing, the business owner should complete the following verifications with qualified Indian legal counsel:
              </p>
<ul className="list-disc pl-space-md flex flex-col gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
<li>Formalize corporate entity name (e.g., Private Limited / LLP / Sole Proprietorship) once officially incorporated with the Ministry of Corporate Affairs (MCA).</li>
<li>Designate physical registered postal address in Gujarat and statutory Corporate Identification Number (CIN) or GSTIN.</li>
<li>Appoint an official Grievance Redressal Officer by name pursuant to the Consumer Protection (E-Commerce) Rules, 2020.</li>
<li>Publish the corresponding separate Privacy Policy pursuant to the Digital Personal Data Protection Act, 2023.</li>
</ul>
</div>
</div>
</article>

            </div>

            {/* RIGHT COLUMN: Sticky Sidebar Navigation & Legal Concierge (~30%) */}
            <aside className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-28">
              {/* Table of Contents Card */}
              <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md max-h-[calc(100vh-140px)] overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">toc</span>
                    <span className="font-title-md text-title-md text-on-surface font-bold">Table of Contents</span>
                  </div>
                  <span className="font-label-caps text-label-caps uppercase px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant">24 Clauses</span>
                </div>

                {/* Scrollable Jump Links List */}
                <nav className="flex flex-col gap-1 overflow-y-auto pr-space-xs text-on-surface-variant text-body-sm font-body-sm" id="toc-nav" style={{ scrollbarWidth: 'thin' }}>
                  {TOC_ITEMS.map((item) => {
                    const isActive = activeClauseId === item.id;
                    const numPadded = item.clauseNum < 10 ? `0${item.clauseNum}` : `${item.clauseNum}`;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        data-clause={item.clauseNum}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToClause(item.id);
                        }}
                        className={`toc-link flex items-center justify-between p-space-xs rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-primary-container/30 text-on-surface font-semibold'
                            : 'hover:bg-surface-container hover:text-on-surface'
                        }`}
                      >
                        <span className="truncate">{item.shortTitle}</span>
                        <span className="text-xs opacity-50 font-mono">{numPadded}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Need Legal Assistance Quick Help Card */}
              <div className="p-space-lg rounded-2xl bg-inverse-surface text-inverse-on-surface flex flex-col gap-space-md shadow-md">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">support_agent</span>
                  <span className="font-title-md text-title-md font-semibold text-on-secondary">Need Legal Assistance?</span>
                </div>
                <p className="font-body-sm text-body-sm opacity-90 leading-relaxed">
                  For statutory consumer notices, IP claims, or official compliance matters, communicate with our designated compliance desk:
                </p>
                <div className="flex flex-col gap-space-xs text-body-sm font-body-sm">
                  <a className="flex items-center gap-space-xs text-primary-container hover:underline break-all" href="mailto:pandyakaushal294@gmail.com">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    pandyakaushal294@gmail.com
                  </a>
                  <a className="flex items-center gap-space-xs text-on-secondary hover:text-primary-container transition-colors" href="tel:+919624282521">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    +91 9624282521
                  </a>
                  <div className="flex items-center gap-space-xs opacity-75">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    Ahmedabad, Gujarat, India
                  </div>
                </div>
              </div>

              {/* Quick Legal Navigation Links */}
              <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Related Legal Dossiers</span>
                <div className="flex flex-col gap-1">
                  <Link className="p-space-xs rounded-lg bg-surface-container text-primary font-label-lg text-label-lg font-semibold flex items-center justify-between" href="/terms">
                    <span>Terms &amp; Conditions</span>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  </Link>
                  <Link className="p-space-xs rounded-lg hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors flex items-center justify-between" href="/privacy">
                    <span>Privacy Policy</span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
                  </Link>
                  <Link className="p-space-xs rounded-lg hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors flex items-center justify-between" href="/terms#clause-11">
                    <span>Cancellation &amp; Refund Policy</span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
                  </Link>
                  <Link className="p-space-xs rounded-lg hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors flex items-center justify-between" href="/terms#clause-8">
                    <span>Booking &amp; Safety Disclaimer</span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
                  </Link>
                </div>
              </div>

            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
