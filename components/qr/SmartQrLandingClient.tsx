'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Compass,
  Building2,
  PhoneCall,
  ChevronRight,
  Share2,
  Check,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  Heart,
  X,
  MessageSquare,
  Globe,
  Award,
  Navigation,
} from 'lucide-react';
import { SMART_QR_CONFIG, SmartQrButtonConfig } from '@/lib/config/smart-qr-config';
import { AshokaChakraIcon } from '@/components/qr/AshokaChakraIcon';

// Custom high-fidelity Instagram SVG icon
function InstagramIcon({ className = 'w-5 h-5 text-pink-600' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

// Custom WhatsApp SVG icon
function WhatsAppIcon({ className = 'w-5 h-5 text-emerald-600' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export function SmartQrLandingClient() {
  const [copied, setCopied] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Non-blocking telemetry tracking
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const payload = {
          eventType: 'qr_landing_page_visit',
          timestamp: new Date().toISOString(),
          referrer: document.referrer || 'qr_scan',
          userAgent: navigator.userAgent,
          screen: `${window.innerWidth}x${window.innerHeight}`,
        };
        fetch('/api/v1/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    } catch {
      // Graceful fail-open
    }
  }, []);

  const trackButtonClick = (button: SmartQrButtonConfig) => {
    try {
      if (typeof window !== 'undefined') {
        fetch('/api/v1/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: button.analyticsEvent,
            buttonId: button.id,
            destination: button.destinationUrl,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      }
    } catch {
      // Graceful fail-open
    }
  };

  const handleShare = async () => {
    const url = SMART_QR_CONFIG.brand.landingPageUrl;
    const title = 'BharatYatra — Discover India. Travel Better.';
    const text = 'Check out BharatYatra, India\'s premier AI travel platform.';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User dismissed share dialog
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Clipboard failed
      }
    }
  };

  const renderIcon = (name: SmartQrButtonConfig['iconName'], theme: SmartQrButtonConfig['themeColor']) => {
    const iconSizeClass = 'w-6 h-6 stroke-[2.2]';
    switch (name) {
      case 'Sparkles':
        return <Sparkles className={`${iconSizeClass} text-[#FF7700]`} />;
      case 'MapPin':
        return <MapPin className={`${iconSizeClass} text-[#102B4E]`} />;
      case 'Compass':
        return <Compass className={`${iconSizeClass} text-[#138808]`} />;
      case 'Instagram':
        return <InstagramIcon className="w-6 h-6 text-[#E1306C]" />;
      case 'Building2':
        return <Building2 className={`${iconSizeClass} text-[#102B4E]`} />;
      case 'PhoneCall':
        return <PhoneCall className={`${iconSizeClass} text-[#138808]`} />;
      default:
        return <Compass className={iconSizeClass} />;
    }
  };

  const getCardThemeClasses = (theme: SmartQrButtonConfig['themeColor']) => {
    switch (theme) {
      case 'saffron':
        return {
          iconBg: 'bg-[#FFF4E6] border border-[#FF9933]/30',
          borderAccent: 'hover:border-[#FF9933] border-slate-200/90',
          badgeBg: 'bg-[#FFF4E6] text-[#D96B00] border border-[#FF9933]/40',
          glow: 'group-hover:shadow-[0_8px_25px_rgba(255,153,51,0.18)]',
        };
      case 'green':
        return {
          iconBg: 'bg-[#E8F5E9] border border-[#138808]/30',
          borderAccent: 'hover:border-[#138808] border-slate-200/90',
          badgeBg: 'bg-[#E8F5E9] text-[#0F6B06] border border-[#138808]/40',
          glow: 'group-hover:shadow-[0_8px_25px_rgba(19,136,8,0.18)]',
        };
      case 'navy':
      default:
        return {
          iconBg: 'bg-[#EBF2FA] border border-[#102B4E]/25',
          borderAccent: 'hover:border-[#102B4E] border-slate-200/90',
          badgeBg: 'bg-[#EBF2FA] text-[#102B4E] border border-[#102B4E]/30',
          glow: 'group-hover:shadow-[0_8px_25px_rgba(16,43,78,0.16)]',
        };
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#102B4E] flex flex-col justify-between selection:bg-[#FF9933]/20 relative overflow-x-hidden font-sans">
      
      {/* 1. TOP TRICOLOUR HEADER STRIPE */}
      <div className="w-full h-1.5 flex shrink-0 sticky top-0 z-50 shadow-xs">
        <div className="w-1/3 bg-[#FF9933]" title="Saffron (Strength & Courage)" />
        <div className="w-1/3 bg-white" title="White (Peace & Truth)" />
        <div className="w-1/3 bg-[#138808]" title="Green (Growth & Auspiciousness)" />
      </div>

      {/* Decorative Tricolour Blur Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-80 bg-gradient-to-b from-[#FF9933]/10 via-[#FFF4E6]/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-t from-[#138808]/8 via-[#E8F5E9]/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* MAIN CONTENT WRAPPER */}
      <main className="w-full max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col">
        
        {/* BRAND HERO SECTION */}
        <header className="text-center space-y-4 mb-6">
          
          {/* Logo Badge */}
          <div className="inline-block relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto p-2.5 rounded-3xl bg-white shadow-xl shadow-slate-900/6 border-2 border-slate-100 flex items-center justify-center relative group transition-transform duration-300 hover:scale-105">
              <img
                src={SMART_QR_CONFIG.brand.logoUrl}
                alt="BharatYatra Official Emblem"
                className="w-full h-full object-contain"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-md border border-slate-100">
                <AshokaChakraIcon size={18} color="#000080" />
              </span>
            </div>
          </div>

          {/* Brand Name & Gujarati Subscript */}
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102B4E] uppercase font-['Outfit',sans-serif]">
                {SMART_QR_CONFIG.brand.name}
              </h1>
            </div>
            <p className="text-xs font-semibold text-[#FF7700] tracking-wide mt-0.5">
              {SMART_QR_CONFIG.brand.subNameGujarati} • અધિકૃત ટ્રાવેલ પોર્ટલ
            </p>
          </div>

          {/* National Tagline Ribbon */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 shadow-2xs">
            <AshokaChakraIcon size={14} color="#000080" />
            <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#102B4E] uppercase">
              {SMART_QR_CONFIG.brand.tagline}
            </span>
            <AshokaChakraIcon size={14} color="#000080" />
          </div>

          {/* Main Headline & Subtitle */}
          <div className="space-y-1.5 pt-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#102B4E] leading-snug">
              {SMART_QR_CONFIG.brand.headline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {SMART_QR_CONFIG.brand.subtitle}
            </p>
          </div>

          {/* Verification Pill */}
          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1 text-[#138808] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#138808]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Sovereign Portal</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-mono text-[10px]">bharatyatra.in</span>
          </div>
        </header>

        {/* 2. EXACT SIX PRIMARY BUTTONS IN MANDATED ORDER */}
        <section
          className="space-y-3.5 flex-1"
          aria-label="BharatYatra Primary Travel Actions"
        >
          {SMART_QR_CONFIG.buttons.map((btn) => {
            const themeClasses = getCardThemeClasses(btn.themeColor);

            const cardContent = (
              <div
                className={`group relative w-full p-4 sm:p-4.5 rounded-2xl bg-white border ${themeClasses.borderAccent} shadow-xs hover:shadow-md ${themeClasses.glow} transition-all duration-200 active:scale-[0.98] flex items-center justify-between gap-3 text-left`}
              >
                {/* Left: Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${themeClasses.iconBg} transition-transform group-hover:scale-105 duration-200`}
                >
                  {renderIcon(btn.iconName, btn.themeColor)}
                </div>

                {/* Middle: Text details */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-[15px] font-extrabold text-[#102B4E] group-hover:text-blue-900 transition-colors tracking-tight">
                      {btn.label}
                    </span>
                    {btn.badgeText && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${themeClasses.badgeBg}`}
                      >
                        {btn.badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed font-normal">
                    {btn.subtitle}
                  </p>
                </div>

                {/* Right: Action Indicator */}
                <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-[#102B4E] group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 transition-colors duration-200 border border-slate-100">
                  {btn.isExternal ? (
                    <ExternalLink className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
              </div>
            );

            // BUTTON 6: Special click handling to also show immediate contact drawer if preferred
            if (btn.id === 'contact-us') {
              return (
                <div key={btn.id} className="relative">
                  <Link
                    href={btn.destinationUrl}
                    onClick={() => trackButtonClick(btn)}
                    className="block focus:outline-hidden focus:ring-2 focus:ring-[#138808] rounded-2xl"
                  >
                    {cardContent}
                  </Link>
                </div>
              );
            }

            if (btn.isExternal) {
              return (
                <a
                  key={btn.id}
                  href={btn.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackButtonClick(btn)}
                  className="block focus:outline-hidden focus:ring-2 focus:ring-[#FF9933] rounded-2xl"
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <Link
                key={btn.id}
                href={btn.destinationUrl}
                onClick={() => trackButtonClick(btn)}
                className="block focus:outline-hidden focus:ring-2 focus:ring-[#102B4E] rounded-2xl"
              >
                {cardContent}
              </Link>
            );
          })}
        </section>

        {/* 3. DIRECT QUICK CONTACT BAR (Zero-Friction for Business Card Holders) */}
        <section className="mt-6 pt-5 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-[#EBF2FA]/50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#102B4E]">
                  Direct Executive Support
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                Official Card QR
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Direct Call */}
              <a
                href={`tel:${SMART_QR_CONFIG.contact.phone}`}
                onClick={() => {
                  try {
                    fetch('/api/v1/analytics/events', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ eventType: 'qr_direct_call_click' }),
                    }).catch(() => {});
                  } catch {}
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-[#102B4E] hover:border-[#102B4E] hover:bg-slate-50 transition-all shadow-2xs active:scale-95"
              >
                <Phone className="w-3.5 h-3.5 text-blue-700" />
                <span>Call Directly</span>
              </a>

              {/* Instant WhatsApp */}
              <a
                href={SMART_QR_CONFIG.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  try {
                    fetch('/api/v1/analytics/events', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ eventType: 'qr_direct_whatsapp_click' }),
                    }).catch(() => {});
                  } catch {}
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#138808] text-white text-xs font-bold hover:bg-[#0F6B06] transition-all shadow-2xs active:scale-95"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Share or Bookmark Button */}
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-2 px-3 rounded-xl bg-white/80 border border-slate-200 text-xs font-medium text-slate-600 hover:text-[#102B4E] hover:bg-white transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Link Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share BharatYatra Smart Card</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* 4. CURATED TRAVEL INSPIRATION THUMBNAILS */}
        <section className="mt-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-[#102B4E] uppercase tracking-wider text-[11px]">
              Explore Across India
            </span>
            <Link
              href="/destinations"
              className="text-[#FF7700] hover:underline font-semibold text-[11px] inline-flex items-center gap-1"
            >
              <span>View All 36 States</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/destinations"
              className="group relative rounded-xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-200 block shadow-2xs"
            >
              <img
                src="/somnath-temple-bg.jpg"
                alt="Somnath Temple Coast"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-1.5">
                <span className="text-[10px] font-bold text-white leading-tight">Somnath</span>
              </div>
            </Link>

            <Link
              href="/destinations"
              className="group relative rounded-xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-200 block shadow-2xs"
            >
              <img
                src="/bhuj-kutch-bg.jpg"
                alt="Kutch White Desert"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-1.5">
                <span className="text-[10px] font-bold text-white leading-tight">White Rann</span>
              </div>
            </Link>

            <Link
              href="/destinations"
              className="group relative rounded-xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-200 block shadow-2xs"
            >
              <img
                src="/gir-national-park-bg.jpg"
                alt="Gir National Park Safari"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-1.5">
                <span className="text-[10px] font-bold text-white leading-tight">Sasan Gir</span>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* 5. RESPECTFUL TRICOLOUR FOOTER */}
      <footer className="w-full border-t border-slate-200 bg-slate-50/90 text-center py-6 px-4 mt-6 space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#102B4E] transition-colors">
            Main Portal
          </Link>
          <span>•</span>
          <Link href="/plan" className="hover:text-[#102B4E] transition-colors">
            AI Planner
          </Link>
          <span>•</span>
          <Link href="/destinations" className="hover:text-[#102B4E] transition-colors">
            Destinations
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-[#102B4E] transition-colors">
            Contact
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-[#102B4E] transition-colors">
            Terms
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[#102B4E] transition-colors">
            Privacy
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <span>Official Smart QR Portal of</span>
          <strong className="text-slate-600 font-semibold uppercase">BharatYatra</strong>
          <span>•</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" /> in India
          </span>
        </div>

        {/* Bottom subtle green accent border */}
        <div className="w-24 h-1 bg-gradient-to-r from-[#FF9933] via-slate-300 to-[#138808] mx-auto rounded-full" />
      </footer>
    </div>
  );
}
