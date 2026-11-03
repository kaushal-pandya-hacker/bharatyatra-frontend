import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  Building,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Mail,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Corporate Travel & Executive Retreats | BharatYatra',
  description:
    'Tailored corporate travel solutions, team offsites, MICE bookings, and GST-compliant enterprise billing across India.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/corporate/',
  },
};

export default function CorporatePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-[#102B4E] selection:bg-[#FF9933]/20 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
            <Briefcase className="w-4 h-4 text-blue-700" />
            <span className="text-[11px] font-bold tracking-widest text-[#102B4E] uppercase">
              Enterprise &amp; Corporate Solutions
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#102B4E] tracking-tight">
            Corporate Travel &amp; Executive Offsites
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Elevate team cohesion and leadership retreats with seamless travel logistics, curated heritage venues, and unified GST enterprise billing.
          </p>
        </header>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#102B4E]">Curated Offsite Venues</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Handpicked heritage palaces, tented luxury desert camps (Rann of Kutch), and eco-resorts with high-speed connectivity and modern conferencing facilities.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#102B4E]">GST Compliant Billing</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unified tax invoicing matching your enterprise GST credentials for input tax credit (ITC) claims across accommodation, transfers, and corporate dining.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#102B4E]">Dedicated Group Concierge</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Single point-of-contact account executive managing airport transit fleets, room allocations, special dietary requirements, and curated team activities.
            </p>
          </div>
        </div>

        {/* Contact Form CTA */}
        <div className="bg-[#0b1c30] text-slate-300 p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6 text-center">
          <h2 className="text-2xl font-bold text-white">Plan Your Next Company Offsite</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Connect with our Corporate Solutions Desk for bespoke proposals, group tariff negotiations, and customized corporate itineraries.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md inline-flex items-center gap-2"
            >
              <span>Submit Corporate Inquiry</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:pandyakaushal294@gmail.com?subject=Corporate%20Travel%20Inquiry"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Email Enterprise Desk</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

