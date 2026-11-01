'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Handshake,
  Package,
  BadgePercent,
  ShieldCheck,
  Building2,
  Boxes,
  CalendarCheck,
  CreditCard,
  Landmark,
  ScrollText,
  LogOut,
  Menu,
  X,
  CheckCircle2,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Normalize path to handle Next.js trailingSlash: true (/admin/login or /admin/login/)
  const cleanPath = (pathname || '').replace(/\/+$/, '') || '/';
  const isLoginPage = cleanPath === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {}
    }
    setLoading(false);
  }, [cleanPath, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-medium">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="BharatYatra Logo" className="h-12 w-auto animate-pulse" />
          <span className="text-sm font-semibold text-slate-700">Loading Admin Operations Portal...</span>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    if (typeof document !== 'undefined') {
      document.cookie = 'admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    }
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Travel Partners', href: '/admin/travel-partners', icon: Handshake },
    { label: 'Travel Packages', href: '/admin/travel-packages', icon: Package },
    { label: 'Partner Commissions', href: '/admin/travel-commissions', icon: BadgePercent },
    { label: 'Partner Audit Log', href: '/admin/travel-partner-audit', icon: ShieldCheck },
    { label: 'Suppliers', href: '/admin/suppliers', icon: Building2 },
    { label: 'Inventory Moderation', href: '/admin/inventory', icon: Boxes },
    { label: 'Bookings Directory', href: '/admin/bookings', icon: CalendarCheck },
    { label: 'Payments & Financials', href: '/admin/payments', icon: CreditCard },
    { label: 'Supplier Settlements', href: '/admin/settlements', icon: Landmark },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation (Desktop) - White Theme */}
      <aside className="w-64 border-r border-slate-200 bg-white text-slate-800 flex flex-col justify-between hidden md:flex shrink-0 shadow-xs">
        <div className="p-5 space-y-6">
          {/* Official BharatYatra Brand Header */}
          <Link href="/admin" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="BharatYatra Logo"
              className="h-10 w-auto object-contain rounded-md transition-transform group-hover:scale-105 shrink-0"
            />
            <div className="flex flex-col whitespace-nowrap justify-center min-w-0">
              <span className="text-sm font-heading font-black tracking-tight text-slate-900 leading-tight">
                BHARAT YATRA
              </span>
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase leading-tight">
                Operations Admin
              </span>
            </div>
          </Link>

          <nav className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Governance
            </div>
            {navItems.map((item) => {
              const isActive =
                cleanPath === item.href || (item.href !== '/admin' && cleanPath.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin User Badge & Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-xs font-bold text-slate-900 truncate">
              {adminUser?.fullName || 'Platform Operations Admin'}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {adminUser?.email || 'admin@bharatyatra.com'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 text-xs cursor-pointer flex items-center gap-1.5"
              aria-label="Toggle Admin Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>Menu</span>
            </button>
            <Link href="/admin" className="flex items-center gap-2">
              <img src="/logo.png" alt="BharatYatra Logo" className="h-7 w-auto object-contain" />
              <span className="font-bold text-slate-900 font-heading text-xs sm:text-sm">
                BHARAT YATRA ADMIN
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Platform Operational
            </span>
          </div>
        </header>

        {/* Mobile Navigation Drawer - White Theme */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white text-slate-900 p-4 border-b border-slate-200 space-y-2 shadow-lg animate-in slide-in-from-top duration-150">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
              Admin Governance Navigation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const isActive =
                  cleanPath === item.href || (item.href !== '/admin' && cleanPath.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {adminUser?.email || 'admin@bharatyatra.com'}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded hover:bg-rose-50 cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
