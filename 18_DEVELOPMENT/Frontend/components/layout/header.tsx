'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useAccessibility } from '@/lib/accessibility/accessibility-context';
import { NotificationCenterDropdown } from '@/components/notifications/notification-center-dropdown';
import { 
  User, 
  LogOut, 
  Compass, 
  Sparkles, 
  Map, 
  Hotel, 
  Bus, 
  Train, 
  Plane, 
  UtensilsCrossed, 
  Mountain, 
  Route, 
  MapPin, 
  Sliders, 
  ChevronDown, 
  Menu, 
  X,
  Globe,
  Check
} from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const { openSettings, language, setLanguage, t } = useAccessibility();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns and mobile menu when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMoreOpen(false);
        setLangOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Hide global header on auth pages, checkout, admin, or supplier routes
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/bharatyatra-ops') ||
    pathname?.startsWith('/supplier') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/register')
  ) {
    return null;
  }

  // Primary navigation items displayed directly in header bar (sleek 5 items)
  const mainNavItems = [
    { label: t.nav.explore, href: '/explore', icon: Compass },
    { label: t.nav.destinations, href: '/destinations', icon: MapPin },
    { label: t.nav.plan, href: '/plan', icon: Sparkles, highlight: true },
    { label: t.nav.packages, href: '/packages', icon: Route },
    { label: t.nav.stays, href: '/stays', icon: Hotel },
  ];

  // Secondary navigation items housed inside "More" dropdown
  const secondaryNavItems = [
    { label: t.nav.buses, href: '/buses', icon: Bus, desc: 'Intercity bus booking' },
    { label: t.nav.trains, href: '/trains', icon: Train, desc: 'IRCTC train routes & tickets' },
    { label: t.nav.flights, href: '/flights', icon: Plane, desc: 'Domestic & international flights' },
    { label: t.nav.dining, href: '/restaurants', icon: UtensilsCrossed, desc: 'Top restaurants & local food' },
    { label: t.nav.experiences, href: '/experiences', icon: Mountain, desc: 'Guided tours & adventures' },
    { label: 'Map Discovery', href: '/map', icon: Map, desc: 'Interactive map navigation' },
  ];

  const languages = [
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  ] as const;

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];
  const allNavItems = [...mainNavItems, ...secondaryNavItems];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs text-slate-900 pt-safe">
      <div className="mx-auto flex h-16 w-full max-w-[1536px] items-center justify-between px-3 sm:px-5 lg:px-6 gap-2">
        
        {/* Left: Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group mr-1 xl:mr-3 whitespace-nowrap focus:outline-hidden">
          <img
            src="/logo.png"
            alt="BharatYatra Logo"
            className="h-9 lg:h-10 w-auto object-contain rounded-md transition-transform group-hover:scale-105 shrink-0"
          />
          <div className="flex flex-col whitespace-nowrap justify-center">
            <span className="text-sm lg:text-base font-heading font-black tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
              BHARAT YATRA
            </span>
            <span className="text-[10px] font-bold text-amber-600 tracking-wide leading-none">
              ભારત યાત્રા
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink min-w-0">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl transition-all text-xs font-bold whitespace-nowrap border shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : item.highlight
                    ? 'text-amber-800 bg-amber-50/90 border-amber-300 hover:bg-amber-100 font-extrabold'
                    : 'text-slate-700 hover:text-slate-900 bg-slate-50/80 hover:bg-slate-100 border-slate-200/80'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-amber-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* "More" Dropdown Menu */}
          <div className="relative shrink-0" ref={moreDropdownRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all text-xs font-bold whitespace-nowrap border cursor-pointer ${
                secondaryNavItems.some(item => pathname?.startsWith(item.href))
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-50/80 hover:bg-slate-100 border-slate-200/80'
              }`}
              aria-label="More navigation categories"
              aria-expanded={moreOpen}
            >
              <span>More</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreOpen && (
              <div className="absolute left-0 lg:right-0 lg:left-auto mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[70vh] overflow-y-auto">
                {secondaryNavItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-start gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition-colors ${
                        isActive ? 'bg-blue-50/60 text-blue-700 font-bold' : 'text-slate-800'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[11px] text-slate-500 font-normal leading-tight">{item.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right: Quick Actions & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ml-auto">

          {/* Professional White-Theme Dropdown Language Switcher */}
          <div className="relative hidden md:block shrink-0" ref={langDropdownRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs text-xs font-extrabold text-slate-800 transition-all cursor-pointer"
              title="Select Language"
              aria-label="Select Language"
              aria-expanded={langOpen}
            >
              <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>{currentLangObj.native}</span>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {languages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50 text-blue-700 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accessibility "Easy Read" Button */}
          <button
            onClick={openSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-300/80 text-slate-900 font-bold text-xs transition-all shrink-0 cursor-pointer"
            title={t.accessibility.title}
            aria-label={t.accessibility.title}
          >
            <Sliders className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="hidden sm:inline text-xs">Easy Read</span>
          </button>

          {/* My Trips */}
          <Link
            href="/my-trips"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-blue-700 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0"
          >
            <Compass className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span>{t.nav.myTrips}</span>
          </Link>

          {/* Notification Center Dropdown */}
          <NotificationCenterDropdown />

          {/* User Sign In / Profile */}
          {user ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300/80 hover:border-blue-600 px-2.5 py-1.5 rounded-xl transition-all"
              >
                <User className="h-3.5 w-3.5 text-blue-600" />
                <span className="max-w-[90px] truncate">{user.fullName || user.email.split('@')[0]}</span>
              </Link>
              <button
                onClick={logout}
                title={t.nav.signOut}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label={t.nav.signOut}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0 flex items-center min-h-[40px]"
            >
              {t.nav.signIn}
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top duration-200 max-h-[80vh] overflow-y-auto">
          {/* Language Switcher in Mobile */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500">Language / ભાષા</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold min-h-[36px] ${
                    language === lang.code
                      ? 'bg-blue-600 text-white font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2">
            {allNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600'
                      : ('highlight' in item && item.highlight)
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
