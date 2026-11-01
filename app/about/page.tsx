import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  ShieldCheck,
  Compass,
  Award,
  Users,
  Heart,
  ArrowRight,
  Globe2,
} from 'lucide-react';
import { AshokaChakraIcon } from '@/components/qr/AshokaChakraIcon';

export const metadata: Metadata = {
  title: 'About Us — India\'s Premier AI Travel Platform | BharatYatra',
  description:
    'Learn about BharatYatra — our mission, technology innovation, cultural heritage focus, and pan-India travel ecosystem.',
  alternates: {
    canonical: 'https://bharatyatra.in/about/',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-[#102B4E] selection:bg-[#FF9933]/20 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
            <AshokaChakraIcon size={14} color="#000080" />
            <span className="text-[11px] font-bold tracking-widest text-[#102B4E] uppercase">
              About BharatYatra
            </span>
            <AshokaChakraIcon size={14} color="#000080" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#102B4E] tracking-tight">
            Crafting the Future of Travel across India
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            BharatYatra is India&apos;s premier AI-native travel ecosystem, blending deep cultural insight, 100% ground-verified route intelligence, and seamless multi-modal bookings into a unified journey companion.
          </p>
        </header>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="mission">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#102B4E]">Our Mission</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To liberate travelers from fragmented planning and disjointed bookings. We empower every traveler with hyper-personalized AI itineraries, transparent local pricing, and trusted cultural access across India&apos;s ancient heritage circuits and vibrant modern destinations.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#102B4E]">The AI Innovation</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Unlike generic trip generators, our Nexi AI planner respects local reality: temple darshan schedules, seasonal wildlife migration, regional festivals, monsoon conditions, and authentic culinary heritage—delivering itineraries that actually work in real life.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#102B4E]">What Sets BharatYatra Apart</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Ground-verified authenticity backed by robust engineering.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-sm text-[#102B4E]">100 Iconic Landmarks Directory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Exhaustively curated dossiers detailing historical provenance, UNESCO heritage status, etiquette rules, and precise accessibility timings.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-sm text-[#102B4E]">Unified Multi-Modal Booking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless booking coordination across heritage hotels, GSRTC luxury express buses, IRCTC train links, domestic flights, and local artisan experiences.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-sm text-[#102B4E]">Empowered Local Partners</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct integration with regional travel agencies, certified guides, and homestay hosts, ensuring local communities benefit directly from sustainable tourism.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Box */}
        <div className="bg-[#0b1c30] text-white p-8 sm:p-10 rounded-3xl border border-slate-800 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Experience India Intelligently?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Design a custom, ground-verified itinerary tailored to your pace, budget, and travel companions in under 60 seconds.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              <span>Launch AI Planner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors"
            >
              <span>Connect with Our Team</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

