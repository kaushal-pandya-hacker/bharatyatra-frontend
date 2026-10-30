'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccessibility } from '@/lib/accessibility/accessibility-context';
import { useNexi } from '@/lib/nexi/nexi-context';
import { Home, Compass, Luggage, User, Headset } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useAccessibility();
  const { isOpen: isNexiOpen, toggleNexi } = useNexi();

  // Hide mobile bottom nav on admin, supplier, auth, checkout, payment, or detail booking pages with sticky CTAs
  const isDetailBookingRoute = Boolean(
    pathname?.match(/\/(buses|trains|flights|circuits)\/[^/]+/)
  );

  const cleanPath = pathname ? pathname.replace(/\/+$/, '') : '';

  if (
    cleanPath.startsWith('/admin') ||
    cleanPath.startsWith('/bharatyatra-ops') ||
    cleanPath.startsWith('/supplier') ||
    cleanPath.startsWith('/checkout') ||
    cleanPath.startsWith('/payment') ||
    cleanPath.startsWith('/login') ||
    cleanPath.startsWith('/auth') ||
    cleanPath.startsWith('/signup') ||
    cleanPath.startsWith('/register') ||
    (cleanPath !== '/trips' && cleanPath.startsWith('/trips/')) ||
    isDetailBookingRoute
  ) {
    return null;
  }

  const leftItems = [
    { label: t.nav.home, href: '/', icon: Home },
    { label: t.nav.explore, href: '/explore', icon: Compass },
  ];

  const rightItems = [
    { label: t.nav.myTrips, href: '/my-trips', icon: Luggage },
    { label: t.nav.profile, href: '/profile', icon: User },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 sm:px-2 py-1 pb-safe shadow-2xl"
      aria-label="Mobile and Tablet Navigation"
    >
      <div className="grid grid-cols-5 items-center w-full max-w-lg mx-auto">
        {/* Left Slots 1 & 2 */}
        {leftItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-700 font-extrabold bg-blue-50/80 border-t-2 border-blue-700'
                  : 'text-slate-700 hover:text-slate-900 font-bold active:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-blue-700' : 'stroke-2 text-slate-600'}`} />
              <span className="text-[11px] tracking-tight mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* Center Slot 3: HELP (NEXI AI Trigger) */}
        <button
          type="button"
          onClick={toggleNexi}
          aria-label="Open NEXI AI Travel Help"
          aria-expanded={isNexiOpen}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer relative group ${
            isNexiOpen
              ? 'text-amber-800 font-extrabold bg-amber-50/90 border-t-2 border-amber-500'
              : 'text-slate-700 hover:text-amber-700 font-bold active:bg-amber-50/50'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Headset className={`w-5 h-5 transition-transform group-hover:scale-110 ${
              isNexiOpen ? 'stroke-[2.5px] text-amber-600' : 'stroke-2 text-slate-700 group-hover:text-amber-600'
            }`} />
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </div>
          <span className={`text-[11px] tracking-tight mt-0.5 leading-none ${
            isNexiOpen ? 'text-amber-800 font-extrabold' : 'text-slate-700 group-hover:text-amber-700'
          }`}>
            Help
          </span>
        </button>

        {/* Right Slots 4 & 5 */}
        {rightItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-700 font-extrabold bg-blue-50/80 border-t-2 border-blue-700'
                  : 'text-slate-700 hover:text-slate-900 font-bold active:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-blue-700' : 'stroke-2 text-slate-600'}`} />
              <span className="text-[11px] tracking-tight mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
