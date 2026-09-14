'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
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
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-medium">
        Loading Admin Operations Portal...
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Suppliers', href: '/admin/suppliers', icon: '🏢' },
    { label: 'Inventory Moderation', href: '/admin/inventory', icon: '🏨' },
    { label: 'Bookings Directory', href: '/admin/bookings', icon: '📑' },
    { label: 'Payments & Financials', href: '/admin/payments', icon: '💳' },
    { label: 'Supplier Settlements', href: '/admin/settlements', icon: '🏛️' },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: '📜' },
  ];

  const futureItems: any[] = [];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 text-white flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-bold text-slate-950 shadow-md">
              CF
            </div>
            <div>
              <div className="font-bold text-white tracking-wide text-sm font-heading">CHALO FARVA</div>
              <div className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">OPERATIONS ADMIN</div>
            </div>
          </div>

          <nav className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Governance</div>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 pt-6 mb-2">Future Modules</div>
            {futureItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 select-none"
              >
                <span>{item.label}</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{item.note}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Admin User Badge & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="truncate">
            <div className="text-xs font-bold text-slate-200 truncate">{adminUser?.fullName || 'Super Admin'}</div>
            <div className="text-[11px] text-slate-500 truncate">{adminUser?.email || 'admin@chalofarva.com'}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between md:justify-end">
          <div className="md:hidden font-bold text-slate-900 font-heading">CHALO FARVA ADMIN</div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              🟢 Platform Operational
            </span>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
