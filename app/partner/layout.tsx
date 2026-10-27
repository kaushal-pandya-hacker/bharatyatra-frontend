'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  CalendarCheck,
  Percent,
  Bell,
  Building2,
  Sliders,
  LogOut,
  ShieldCheck,
  AlertCircle,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agencyData, setAgencyData] = useState<any>(null);

  useEffect(() => {
    // Fetch partner telemetry
    const agencyId = typeof window !== 'undefined' ? localStorage.getItem('partner_agency_id') : '';
    const headers: HeadersInit = agencyId ? { 'x-agency-id': agencyId } : {};
    fetch('/api/v1/partner/dashboard', { headers })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.agency) {
          setAgencyData(json.agency);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { label: 'Dashboard Overview', href: '/partner/dashboard', icon: LayoutDashboard },
    { label: 'My Tour Packages', href: '/partner/packages', icon: Package },
    { label: 'Create New Package', href: '/partner/packages/new', icon: PlusCircle },
    { label: 'Bookings & Fulfilment', href: '/partner/bookings', icon: CalendarCheck },
    { label: 'Commissions & Ledger', href: '/partner/commissions', icon: Percent },
    { label: 'Agency Profile', href: '/partner/profile', icon: Building2 },
    { label: 'Notifications', href: '/partner/notifications', icon: Bell },
    { label: 'Settings & Contract', href: '/partner/settings', icon: Sliders },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-base shadow-sm">
              BY
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-slate-950 text-sm tracking-wide">BHARAT YATRA</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Partner Portal
              </div>
            </div>
          </div>

          {/* Agency Badge Card */}
          {agencyData && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Operating Partner
              </div>
              <div className="text-xs font-bold text-slate-950 truncate">{agencyData.businessName}</div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-emerald-700 font-bold uppercase">
                  {agencyData.verificationStatus}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/partner/packages' && pathname.startsWith('/partner/packages/') && pathname !== '/partner/packages/new');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 space-y-3">
          <Link
            href="/packages"
            target="_blank"
            className="flex items-center justify-between text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Exit Portal
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-950 rounded-lg bg-slate-100 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="text-xs font-semibold text-slate-500 hidden sm:block">
              Commission-Based Marketplace Operator Dashboard
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/partner/packages/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-950 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" /> New Package
            </Link>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800">
              RP
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold ${
                    isActive ? 'bg-slate-950 text-white' : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
