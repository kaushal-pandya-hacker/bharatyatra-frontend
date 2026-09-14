'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Search, Sparkles, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Explore', href: '/', icon: Compass },
    { label: 'Search', href: '/explore', icon: Search },
    { label: 'AI Plan', href: '/ai-planner', icon: Sparkles, isHighlight: true },
    { label: 'My Trips', href: '/trips', icon: MapPin },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-slate-200 bg-white/90 backdrop-blur-md md:hidden">
      <div className="mx-auto grid h-full max-w-lg grid-cols-5 font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/30">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-semibold text-brand-primary mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex flex-col items-center justify-center px-1 text-slate-500 hover:text-brand-primary',
                isActive && 'text-brand-primary'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
