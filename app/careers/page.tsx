import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Rocket,
  Code2,
  MapPin,
  HeartHandshake,
  Users,
  Mail,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers at BharatYatra — Build the Future of Indian Travel',
  description:
    'Join the team building India\'s premier AI-native travel platform. Explore open engineering, product, and operations roles.',
  alternates: {
    canonical: 'https://bharatyatra.in/careers/',
  },
};

export default function CareersPage() {
  const roles = [
    {
      title: 'Senior Full-Stack Engineer (Next.js & Node.js)',
      department: 'Engineering',
      location: 'Hybrid • Ahmedabad / Remote',
      desc: 'Architect high-throughput travel booking flows, real-time telemetry pipelines, and responsive traveler interfaces.',
    },
    {
      title: 'AI / ML Engineer (Itinerary & Geographic Models)',
      department: 'AI & Data Intelligence',
      location: 'Hybrid • Remote',
      desc: 'Build recommendation algorithms, route optimization heuristics, and multi-modal transit scheduling models.',
    },
    {
      title: 'Ground Operations & Supplier Network Lead',
      department: 'Operations & Partnerships',
      location: 'Gujarat (Dwarka / Ahmedabad)',
      desc: 'Onboard and verify local transport operators, heritage homestays, and regional tourism service providers.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-[#102B4E] selection:bg-[#FF9933]/20 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
            <Rocket className="w-4 h-4 text-amber-600" />
            <span className="text-[11px] font-bold tracking-widest text-[#102B4E] uppercase">
              Join Our Mission
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#102B4E] tracking-tight">
            Build the Future of Indian Travel
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            We are engineering technology that brings millions of travelers closer to India&apos;s heritage, natural wonders, and cultural roots with absolute trust.
          </p>
        </header>

        {/* Culture / Value points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-[#102B4E]">Mission-Driven Impact</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every line of code directly supports regional Indian hospitality, local artisans, and cultural preservation.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-[#102B4E]">High Engineering Standards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Modern Next.js App Router, rigorous TypeScript, edge computing, and real-time transit telemetry.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-[#102B4E]">Autonomous Culture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We value clarity, speed, craftsmanship, and senior developer discipline over bureaucratic rituals.
            </p>
          </div>
        </div>

        {/* Open Roles */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#102B4E]">Open Positions</h2>
          <div className="space-y-3">
            {roles.map((role, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2 hover:border-[#102B4E]/30 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-base text-[#102B4E]">{role.title}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                    {role.location}
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-600 block">{role.department}</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Application CTA */}
        <div className="bg-[#0b1c30] text-slate-300 p-8 sm:p-10 rounded-3xl border border-slate-800 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white">Don&apos;t See Your Exact Role?</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            We are always eager to connect with talented engineers, designers, and travel technologists. Send your resume and GitHub/portfolio to:
          </p>
          <div className="pt-2">
            <a
              href="mailto:pandyakaushal294@gmail.com?subject=Job%20Application%20at%20BharatYatra"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              <Mail className="w-4 h-4" />
              <span>Email Your Profile (pandyakaushal294@gmail.com)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
