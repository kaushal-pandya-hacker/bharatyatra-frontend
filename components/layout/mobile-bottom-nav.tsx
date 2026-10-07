'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccessibility } from '@/lib/accessibility/accessibility-context';
import { Home, Compass, Luggage, ShoppingBag, User } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useAccessibility();

  const navItems = [
    { label: t.nav.home, href: '/', icon: Home },
    { label: t.nav.explore, href: '/explore', icon: Compass },
    { label: t.nav.myTrips, href: '/my-trips', icon: Luggage },
    { label: t.nav.cart, href: '/cart', icon: ShoppingBag },
    { label: t.nav.profile, href: '/profile', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-slate-200 px-2 py-1 shadow-2xl"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-700 font-extrabold bg-blue-50 border-t-2 border-blue-700'
                  : 'text-slate-700 hover:text-slate-900 font-bold'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-blue-700' : 'stroke-2 text-slate-600'}`} />
              <span className="text-[11px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
