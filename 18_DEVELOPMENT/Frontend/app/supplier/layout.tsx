'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('chalo_farva_supplier');
      if (stored) {
        setSupplier(JSON.parse(stored));
      }
    } catch (e) {}
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('chalo_farva_supplier_token');
    localStorage.removeItem('chalo_farva_supplier');
    setSupplier(null);
    router.push('/supplier/login');
  };

  const navItems = [
    { label: 'Vendor Dashboard', href: '/supplier/dashboard', icon: '📊' },
    { label: 'Bookings & Orders', href: '/supplier/bookings', icon: '📑' },
    { label: 'Payments & Payouts', href: '/supplier/payments', icon: '💳' },
    { label: 'My Profile', href: '/supplier/profile', icon: '🏢' },
    { label: 'Hotels & Stays', href: '/supplier/hotels', icon: '🏨' },
    { label: 'Restaurants & Dining', href: '/supplier/restaurants', icon: '🍽️' },
    { label: 'Activities & Tours', href: '/supplier/activities', icon: '🎯' },
    { label: 'Master Inventory', href: '/supplier/inventory', icon: '📦' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-body">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 p-6 space-y-6 hidden md:flex md:flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              CF
            </div>
            <div>
              <div className="text-base font-bold font-heading text-teal-300">SUPPLIER PORTAL</div>
              <div className="text-xs text-slate-400">B2B Marketplace Engine</div>
            </div>
          </div>

          <nav className="space-y-1.5 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/supplier/dashboard' && pathname === '/supplier');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-colors ${
                    isActive
                      ? 'bg-teal-600/20 text-teal-300 font-semibold border-l-4 border-teal-500 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Account Status inside Sidebar */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          {supplier ? (
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200 truncate">{supplier.companyName || supplier.email}</div>
              <div className="text-slate-400 flex items-center justify-between mt-1">
                <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {supplier.status || 'ACTIVE'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/supplier/login"
                className="w-full py-2 text-center text-xs font-semibold text-teal-300 bg-teal-950 border border-teal-800 hover:bg-teal-900 rounded-lg transition"
              >
                Supplier Sign In
              </Link>
              <Link
                href="/supplier/register"
                className="w-full py-2 text-center text-xs font-semibold text-slate-900 bg-gradient-to-r from-teal-400 to-emerald-400 hover:opacity-95 rounded-lg transition"
              >
                Register Business
              </Link>
            </div>
          )}
          <div className="text-[11px] text-slate-500 text-center">BharatYatra v1.0 • B2B Tenant</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-slate-700 cursor-pointer flex items-center gap-1.5"
              aria-label="Toggle Supplier Menu"
            >
              <span>{mobileMenuOpen ? '✕' : '☰'}</span>
              <span>Menu</span>
            </button>

            <div className="text-sm sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>🏰</span>
              <span className="hidden sm:inline">Gujarat Partner Marketplace</span>
              <span className="sm:hidden">Partner Portal</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 hidden lg:inline-block font-mono">
              Phase 3A Tenant Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            {supplier ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-200">{supplier.companyName}</div>
                  <div className="text-[11px] text-slate-400">{supplier.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/supplier/login"
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-teal-300 px-3 py-1.5 rounded-lg font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/supplier/register"
                  className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-1.5 rounded-lg font-semibold shadow transition"
                >
                  Register Business
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 text-white p-4 border-b border-slate-800 space-y-2 animate-in slide-in-from-top duration-150">
            <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider px-2 mb-1">
              Supplier Partner Navigation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href === '/supplier/dashboard' && pathname === '/supplier');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
