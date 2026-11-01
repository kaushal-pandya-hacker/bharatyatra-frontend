'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  MapPin,
  ShieldCheck,
  PhoneCall,
  Mail,
  Heart,
  ChevronDown,
  ChevronUp,
  Instagram,
  MessageSquare,
  Clock,
  Building2,
  Sparkles,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { SMART_QR_CONFIG } from '@/lib/config/smart-qr-config';

export function Footer() {
  const pathname = usePathname();
  const cleanPath = pathname ? pathname.replace(/\/+$/, '') : '';

  // Mobile accordion state (collapsed by default on small screens)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    explore: false,
    services: false,
    support: false,
    company: false,
    legal: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Hide footer on admin, supplier, checkout, and trip command center routes
  if (
    cleanPath.startsWith('/admin') ||
    cleanPath.startsWith('/supplier') ||
    cleanPath === '/checkout' ||
    (cleanPath !== '/trips' && cleanPath.startsWith('/trips/'))
  ) {
    return null;
  }

  return (
    <footer className="w-full bg-[#081528] text-slate-300 font-sans border-t border-slate-800/90 pt-16 pb-12 relative overflow-hidden selection:bg-[#FF9933]/20">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* ================================================================== */}
        {/* MAIN NAVIGATION GRID                                                */}
        {/* ================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* SECTION A: ABOUT BHARATYATRA (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="BharatYatra Logo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors uppercase">
                  BHARAT YATRA
                </span>
                <span className="text-[11px] font-gujarati text-amber-400 tracking-wide font-semibold">
                  ભારત યાત્રા • ભારતનું નંબર ૧ AI ટ્રાવેલ એન્જિન
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              BharatYatra is India&apos;s premier AI-native travel technology platform. Experience intelligent end-to-end itinerary planning, 100% ground-verified route maps, multi-modal transport bookings, and authentic heritage exploration across all Indian States and Union Territories.
            </p>

            {/* Verified Capabilities Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Ground Verified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>100 Iconic Landmarks</span>
              </span>
            </div>

            {/* Social Channels */}
            <div className="pt-2 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href={SMART_QR_CONFIG.social.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-pink-400 hover:border-pink-500/50 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={SMART_QR_CONFIG.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${SMART_QR_CONFIG.contact.email}`}
                  className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
                  aria-label="Email Concierge"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* SECTION B: EXPLORE INDIA (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('explore')}
              className="w-full flex items-center justify-between text-left md:pointer-events-none pb-1 border-b border-slate-800 md:border-b-0"
              aria-expanded={openSections.explore}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Explore India
              </h4>
              <span className="md:hidden text-slate-400">
                {openSections.explore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            <ul className={`space-y-2 text-xs ${openSections.explore ? 'block' : 'hidden md:block'}`}>
              <li><Link href="/destinations" className="hover:text-amber-400 transition-colors">100 Landmarks Directory</Link></li>
              <li><Link href="/states" className="hover:text-amber-400 transition-colors">All States &amp; UTs</Link></li>
              <li><Link href="/states/gujarat" className="hover:text-amber-400 transition-colors">Gujarat Tourism</Link></li>
              <li><Link href="/destinations?category=heritage" className="hover:text-amber-400 transition-colors">Heritage Monuments</Link></li>
              <li><Link href="/destinations?category=religious" className="hover:text-amber-400 transition-colors">Pilgrimage &amp; Temples</Link></li>
              <li><Link href="/destinations?category=hill-stations" className="hover:text-amber-400 transition-colors">Hill Stations</Link></li>
              <li><Link href="/destinations?category=beach" className="hover:text-amber-400 transition-colors">Beaches &amp; Coastlines</Link></li>
              <li><Link href="/destinations?category=wildlife" className="hover:text-amber-400 transition-colors">Wildlife &amp; Lion Safari</Link></li>
              <li><Link href="/smart-travel-guide" className="hover:text-amber-400 transition-colors">Smart Travel Guides</Link></li>
            </ul>
          </div>

          {/* SECTION C: TRAVEL SERVICES (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('services')}
              className="w-full flex items-center justify-between text-left md:pointer-events-none pb-1 border-b border-slate-800 md:border-b-0"
              aria-expanded={openSections.services}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Travel Services
              </h4>
              <span className="md:hidden text-slate-400">
                {openSections.services ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            <ul className={`space-y-2 text-xs ${openSections.services ? 'block' : 'hidden md:block'}`}>
              <li>
                <Link href="/trips" className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1">
                  <span>AI Trip Planner</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </Link>
              </li>
              <li><Link href="/packages" className="hover:text-amber-400 transition-colors">Curated Tour Packages</Link></li>
              <li><Link href="/stays" className="hover:text-amber-400 transition-colors">Hotels &amp; Heritage Stays</Link></li>
              <li><Link href="/buses" className="hover:text-amber-400 transition-colors">GSRTC Express Buses</Link></li>
              <li><Link href="/trains" className="hover:text-amber-400 transition-colors">IRCTC Train Transfers</Link></li>
              <li><Link href="/flights" className="hover:text-amber-400 transition-colors">Domestic Flights</Link></li>
              <li><Link href="/experiences" className="hover:text-amber-400 transition-colors">Cultural Masterclasses</Link></li>
              <li><Link href="/map" className="hover:text-amber-400 transition-colors">Interactive Route Maps</Link></li>
              <li><Link href="/partners/register" className="hover:text-amber-400 transition-colors">Partner Registration</Link></li>
            </ul>
          </div>

          {/* SECTION D: CUSTOMER SUPPORT (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('support')}
              className="w-full flex items-center justify-between text-left md:pointer-events-none pb-1 border-b border-slate-800 md:border-b-0"
              aria-expanded={openSections.support}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Customer Support
              </h4>
              <span className="md:hidden text-slate-400">
                {openSections.support ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            <ul className={`space-y-2 text-xs ${openSections.support ? 'block' : 'hidden md:block'}`}>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors font-medium">Contact Us</Link></li>
              <li><Link href="/help" className="hover:text-amber-400 transition-colors">Help Centre</Link></li>
              <li><Link href="/faq" className="hover:text-amber-400 transition-colors">Frequently Asked Questions</Link></li>
              <li><Link href="/my-trips" className="hover:text-amber-400 transition-colors">Booking Support</Link></li>
              <li><Link href="/cancellation-policy" className="hover:text-amber-400 transition-colors">Cancellation Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-amber-400 transition-colors">Refund Policy</Link></li>
              <li><Link href="/feedback" className="hover:text-amber-400 transition-colors">Report an Issue</Link></li>
              <li><Link href="/feedback" className="hover:text-amber-400 transition-colors">Feedback &amp; Suggestions</Link></li>
            </ul>
          </div>

          {/* SECTION E & F: COMPANY & LEGAL (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('company')}
              className="w-full flex items-center justify-between text-left md:pointer-events-none pb-1 border-b border-slate-800 md:border-b-0"
              aria-expanded={openSections.company}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Company &amp; Legal
              </h4>
              <span className="md:hidden text-slate-400">
                {openSections.company ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            <ul className={`space-y-2 text-xs ${openSections.company ? 'block' : 'hidden md:block'}`}>
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About BharatYatra</Link></li>
              <li><Link href="/about#mission" className="hover:text-amber-400 transition-colors">Our Mission</Link></li>
              <li><Link href="/corporate" className="hover:text-amber-400 transition-colors">Corporate Travel</Link></li>
              <li><Link href="/careers" className="hover:text-amber-400 transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-amber-400 transition-colors">Media &amp; Press</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/booking-policy" className="hover:text-amber-400 transition-colors">Booking Policy</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-amber-400 transition-colors">Cookie Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-amber-400 transition-colors">Legal Disclaimer</Link></li>
              <li><Link href="/grievance-redressal" className="hover:text-amber-400 transition-colors">Grievance Redressal</Link></li>
            </ul>
          </div>
        </div>

        {/* ================================================================== */}
        {/* SECTION H: OFFICIAL BUSINESS & CONTACT INFORMATION CARD            */}
        {/* ================================================================== */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs text-slate-300">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Direct Traveler Support
            </span>
            <a
              href={`tel:${SMART_QR_CONFIG.contact.phone}`}
              className="font-bold text-white hover:text-amber-400 transition-colors flex items-center gap-2 text-sm"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{SMART_QR_CONFIG.contact.phoneDisplay}</span>
            </a>
            <span className="text-[11px] text-slate-400 block">
              Mon - Sun: 08:00 AM - 10:00 PM IST
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Customer Support Email
            </span>
            <a
              href={`mailto:${SMART_QR_CONFIG.contact.email}`}
              className="font-bold text-white hover:text-amber-400 transition-colors flex items-center gap-2 truncate text-sm"
            >
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">{SMART_QR_CONFIG.contact.email}</span>
            </a>
            <span className="text-[11px] text-slate-400 block truncate">
              Secondary: {SMART_QR_CONFIG.contact.supportEmail}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Registered Office
            </span>
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">BharatYatra Technologies</span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  {SMART_QR_CONFIG.contact.address}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Instant Concierge
            </span>
            <a
              href={SMART_QR_CONFIG.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 font-bold transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>

        {/* ================================================================== */}
        {/* BOTTOM COPYRIGHT & NEXIIFY DEVELOPER CREDIT                         */}
        {/* ================================================================== */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
            <span>© 2026 BharatYatra. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms &amp; Conditions</Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/cancellation-policy" className="hover:text-amber-400 transition-colors">Cancellation Policy</Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/refund-policy" className="hover:text-amber-400 transition-colors">Refund Policy</Link>
          </div>
          
          {/* Nexiify Developer Credit */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-full text-xs text-slate-300 shadow-sm shrink-0">
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
