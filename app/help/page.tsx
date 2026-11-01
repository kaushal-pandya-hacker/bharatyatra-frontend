import type { Metadata } from 'next';
import Link from 'next/link';
import {
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  Search,
  BookOpen,
  CreditCard,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { AshokaChakraIcon } from '@/components/qr/AshokaChakraIcon';

export const metadata: Metadata = {
  title: 'Help Centre & Traveler Support | BharatYatra',
  description:
    'BharatYatra Help Centre — Guides, booking assistance, cancellation support, and direct contact options for travelers.',
  alternates: {
    canonical: 'https://bharatyatra.in/help/',
  },
};

export default function HelpPage() {
  const categories = [
    {
      icon: Calendar,
      title: 'Booking & Itinerary Planning',
      desc: 'How to plan trips with AI, modify itineraries, manage passenger details, and confirm reservations.',
      link: '/faq#booking',
    },
    {
      icon: CreditCard,
      title: 'Payments & Refunds',
      desc: 'Understanding payment gateways, UPI, 5–7 banking day refunds, and failed transaction auto-reversals.',
      link: '/refund-policy',
    },
    {
      icon: AlertTriangle,
      title: 'Cancellations & Changes',
      desc: 'Cancellation policies across hotels, bus services, flights, safari permits, and force majeure events.',
      link: '/cancellation-policy',
    },
    {
      icon: BookOpen,
      title: 'Travel Guides & Permits',
      desc: 'Sanctuary inner-line permits, temple darshan dress codes, weather advisories, and monument schedules.',
      link: '/destinations',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-[#102B4E] selection:bg-[#FF9933]/20 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span className="text-[11px] font-bold tracking-widest text-[#102B4E] uppercase">
              BharatYatra Help Centre
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#102B4E] tracking-tight">
            How Can We Assist Your Journey?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Find answers to common travel queries, review step-by-step guidance, or connect directly with our support concierge.
          </p>
        </header>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href={cat.link}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#102B4E]/40 hover:shadow-md transition-all group block space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#102B4E] group-hover:bg-[#102B4E] group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-[#102B4E] flex items-center justify-between">
                  <span>{cat.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {cat.desc}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Quick Contact Box */}
        <div className="bg-[#0b1c30] text-slate-300 p-8 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Need Live Human Assistance?</h2>
            <p className="text-xs text-slate-400 mt-1">Our operations concierge desk is available 7 days a week.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Direct Hotline</span>
              <a href="tel:+919624282521" className="text-base font-bold text-white hover:text-amber-400 block">
                +91 96242 82521
              </a>
              <span className="text-[11px] text-slate-400 block">Daily 08:00 AM - 10:00 PM IST</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp Concierge</span>
              <a
                href="https://wa.me/919624282521"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-emerald-400 hover:underline block"
              >
                Chat on WhatsApp
              </a>
              <span className="text-[11px] text-slate-400 block">Average reply: &lt; 15 mins</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Support</span>
              <a href="mailto:pandyakaushal294@gmail.com" className="text-sm font-bold text-white hover:text-amber-400 block truncate">
                pandyakaushal294@gmail.com
              </a>
              <span className="text-[11px] text-slate-400 block">Guaranteed 24-hr reply</span>
            </div>
          </div>
        </div>

        {/* Additional links */}
        <div className="text-center text-xs text-slate-500 pt-2">
          <span>Looking for policies? Read our </span>
          <Link href="/cancellation-policy" className="text-blue-700 underline font-semibold mx-1">Cancellation Policy</Link>
          <span>and</span>
          <Link href="/refund-policy" className="text-blue-700 underline font-semibold mx-1">Refund Policy</Link>.
        </div>
      </div>
    </div>
  );
}

