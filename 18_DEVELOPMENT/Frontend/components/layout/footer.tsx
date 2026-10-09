'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Sparkles, MapPin, ShieldCheck, PhoneCall, Mail, Heart, ArrowRight } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Hide footer only on admin or supplier dashboard routes if desired
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/supplier') || pathname === '/checkout') {
    return null;
  }

  return (
    <footer className="w-full bg-[#0b1c30] text-slate-300 font-body-md border-t border-slate-800 pt-16 pb-12 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* TOP SECTION: Call to Action Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 text-primary-container text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gujarat-First AI Travel Engine</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-white tracking-tight">
              Ready to explore authentic Gujarat?
            </h3>
            <p className="text-sm text-slate-400 max-w-xl">
              &quot;Plan less. Coordinate less. Enjoy more.&quot; Synthesize a personalized itinerary with instant permits, stays &amp; transit.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/plan"
              className="px-6 py-3.5 rounded-xl bg-primary-container text-on-secondary-fixed font-bold text-sm hover:bg-primary-fixed transition-all shadow-lg flex items-center gap-2"
            >
              <span>Build AI Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/packages"
              className="px-6 py-3.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition-all border border-slate-700"
            >
              View Packages
            </Link>
          </div>
        </div>

        {/* MAIN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* BRAND COLUMN (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="BharatYatra Logo"
                className="h-11 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-xl font-heading font-bold tracking-tight text-white group-hover:text-primary-container transition-colors uppercase">
                  BHARAT YATRA
                </span>
                <span className="text-xs font-gujarati text-primary-container tracking-wide font-semibold">
                  ભારત યાત્રા • ભારતનું નંબર ૧ AI ટ્રાવેલ એન્જિન
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              BharatYatra is India&apos;s premier AI-native travel platform. Experience seamless end-to-end trip planning, verified hotel &amp; transit bookings, heritage trails, and real-time travel recommendations across India.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-400">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Ground Verified</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>100 Iconic Landmarks</span>
              </span>
            </div>
          </div>

          {/* COLUMN 1: Iconic Gujarat Landmarks */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Top Destinations
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/destinations" className="hover:text-primary-container transition-colors flex items-center justify-between">
                  <span>100 Landmarks Directory</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-container/20 text-primary-container font-mono">100</span>
                </Link>
              </li>
              <li><Link href="/destinations?district=Kutch" className="hover:text-primary-container transition-colors">Kutch &amp; White Rann</Link></li>
              <li><Link href="/destinations?district=Junagadh" className="hover:text-primary-container transition-colors">Sasan Gir Lion Safari</Link></li>
              <li><Link href="/destinations?district=Devbhumi+Dwarka" className="hover:text-primary-container transition-colors">Somnath &amp; Dwarka Temple</Link></li>
              <li><Link href="/destinations?district=Narmada" className="hover:text-primary-container transition-colors">Statue of Unity</Link></li>
              <li><Link href="/destinations?district=Ahmedabad" className="hover:text-primary-container transition-colors">Ahmedabad Heritage &amp; Sabarmati</Link></li>
              <li><Link href="/destinations?district=Patan" className="hover:text-primary-container transition-colors">Patan Rani Ki Vav (UNESCO)</Link></li>
              <li><Link href="/destinations?district=Dang" className="hover:text-primary-container transition-colors">Saputara Hill Station</Link></li>
            </ul>
          </div>

          {/* COLUMN 2: Travel Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Travel Services
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/plan" className="hover:text-primary-container transition-colors text-primary-container font-semibold">AI Trip Constructor</Link></li>
              <li><Link href="/packages" className="hover:text-primary-container transition-colors">Gujarat Tour Packages</Link></li>
              <li><Link href="/stays" className="hover:text-primary-container transition-colors">Hotels &amp; Heritage Haveli</Link></li>
              <li><Link href="/buses" className="hover:text-primary-container transition-colors">GSRTC Express Buses</Link></li>
              <li><Link href="/trains" className="hover:text-primary-container transition-colors">IRCTC Express Trains</Link></li>
              <li><Link href="/flights" className="hover:text-primary-container transition-colors">Flight Transfers</Link></li>
              <li><Link href="/restaurants" className="hover:text-primary-container transition-colors">Kathiyawadi Dining</Link></li>
              <li><Link href="/experiences" className="hover:text-primary-container transition-colors">Crafts &amp; Masterclasses</Link></li>
              <li><Link href="/map" className="hover:text-primary-container transition-colors">Interactive Route Map</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: Traveler & Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Traveler &amp; Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/my-trips" className="hover:text-primary-container transition-colors">My Saved Trips</Link></li>
              <li><Link href="/profile" className="hover:text-primary-container transition-colors">Traveler Profile</Link></li>
              <li><Link href="/notifications" className="hover:text-primary-container transition-colors">Travel Alerts</Link></li>
              <li><Link href="/login" className="hover:text-primary-container transition-colors">Client Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-primary-container transition-colors">Join BharatYatra</Link></li>
            </ul>
            <div className="pt-3 space-y-2">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Direct Contact &amp; Support</span>
                <a href="tel:+919624282521" className="text-xs font-bold text-white hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>+91 9624282521</span>
                </a>
                <a href="mailto:pandyakaushal294@gmail.com" className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">pandyakaushal294@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & CREDITS RIBBON */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 BHARAT YATRA. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline mx-0.5" /> for Gujarat Tourism
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-full text-xs text-slate-300 shadow-md">
            <span>Designed, Developed &amp; Produced by</span>
            <a
              href="https://nexiify.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors flex items-center gap-1"
            >
              <span>Nexiify</span>
              <span className="text-[11px] text-slate-400 font-mono">(nexiify.in)</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
