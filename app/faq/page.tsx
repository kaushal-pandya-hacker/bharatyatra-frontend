'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: 'PLANNING' | 'BOOKINGS' | 'PAYMENTS' | 'GROUND';
}

const FAQS: FaqItem[] = [
  {
    category: 'PLANNING',
    q: 'How does the BharatYatra AI trip planner work?',
    a: 'Our AI planner evaluates your preferred travel dates, pace (relaxed vs packed), party composition (solo, couple, family, senior citizens), and cultural interests. It calculates accurate transit times between destinations, factors in temple darshan hours and sanctuary permit quotas, and delivers a ground-verified day-by-day itinerary with verified hotel and transit options.',
  },
  {
    category: 'PLANNING',
    q: 'Can I customize an AI-generated itinerary after creation?',
    a: 'Yes! Every generated itinerary is fully editable. You can swap hotels, adjust durations in each city, add specific landmarks from our 100 Landmark Directory, remove destinations, and recalculate the daily budget in real-time.',
  },
  {
    category: 'BOOKINGS',
    q: 'How do I receive my booking confirmation voucher?',
    a: 'Immediately upon successful payment authorization, a digital Booking Confirmation Voucher is issued. You will receive an instant email confirmation with your booking reference number (e.g., BY-BK-XXXX) and can access your voucher anytime under "My Bookings" in your traveler dashboard.',
  },
  {
    category: 'BOOKINGS',
    q: 'What government identification is required for check-in?',
    a: 'All travelers must carry valid government-approved photo identification matching the names declared during booking. Accepted documents include Aadhaar Card, Passport, Voter ID, or Indian Driving License. Note that protected wildlife sanctuaries (such as Gir Forest Safari) require original physical IDs matching permit declarations.',
  },
  {
    category: 'PAYMENTS',
    q: 'What payment methods does BharatYatra support?',
    a: 'We support all major Reserve Bank of India (RBI) authorized payment instruments, including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit and Debit Cards (Visa, Mastercard, RuPay), NetBanking across 50+ scheduled commercial banks, and EMI options on eligible cards.',
  },
  {
    category: 'PAYMENTS',
    q: 'How long do refunds take to credit my account?',
    a: 'Once an approved cancellation is processed by our audit desk, the refund is initiated to your original payment instrument within 24–48 hours. Banks typically credit the amount to your account in 5 to 7 business days. UPI refunds usually reflect within 24 to 48 hours.',
  },
  {
    category: 'GROUND',
    q: 'Are temple dress codes enforced in Gujarat and other pilgrimage destinations?',
    a: 'Yes. Major spiritual shrines including Somnath Temple, Dwarkadhish Temple, and Palitana Jain Temples enforce traditional modest dress codes (no shorts, sleeveless tops, or western beachwear). Detailed dress code guidance is provided inside each destination profile in our 100 Landmark Directory.',
  },
  {
    category: 'GROUND',
    q: 'How do I obtain the mandatory permit for Rann of Kutch (Dhordo)?',
    a: 'Because the White Rann lies in a sensitive border region, all Indian and foreign visitors require an entry permit from the Gujarat Police / Forest Department. For visitors booking via BharatYatra, our travel guides outline the simple online permit process and on-arrival checkpost verification at Bhirandiyara.',
  },
];

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filtered = FAQS.filter((f) => {
    if (selectedCategory !== 'ALL' && f.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-[#102B4E] selection:bg-[#FF9933]/20 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span className="text-[11px] font-bold tracking-widest text-[#102B4E] uppercase">
              Frequently Asked Questions
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#102B4E] tracking-tight">
            Clear Answers to Traveler Questions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about AI planning, bookings, payment security, cancellations, and ground regulations.
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search queries (e.g. refund, permits, dress code)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102B4E] shadow-2xs"
              />
            </div>
          </div>
        </header>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'ALL', label: 'All Questions' },
            { id: 'PLANNING', label: 'AI Planning' },
            { id: 'BOOKINGS', label: 'Bookings & Vouchers' },
            { id: 'PAYMENTS', label: 'Payments & Refunds' },
            { id: 'GROUND', label: 'Ground Guidelines' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#102B4E] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filtered.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-[#102B4E]">
                    {item.q}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="bg-[#0b1c30] text-slate-300 p-8 rounded-3xl border border-slate-800 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Have a Specific Question Not Listed Here?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Our traveler concierge is on standby to assist with custom trip routing, group inquiries, or emergency travel support.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              Contact Operations Desk
            </Link>
            <a
              href="https://wa.me/919624282521"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
