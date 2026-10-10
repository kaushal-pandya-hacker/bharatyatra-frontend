'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Compass,
  FileText,
  Bell,
  ScrollText,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { getAdminToken, adminLogout, fetchAdminMe } from '@/lib/admin-api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const normalizedPath = pathname?.replace(/\/$/, '') || '';
  const isLoginPage = normalizedPath === '/bharatyatra-ops/login';

  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(!isLoginPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoginPage) return;

    const token = getAdminToken();
    if (!token) {
      router.push('/bharatyatra-ops/login');
      return;
    }

    fetchAdminMe()
      .then((data) => {
        setAdmin(data.admin);
        setLoading(false);
      })
      .catch(() => {
        router.push('/bharatyatra-ops/login');
      });
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs tracking-wider uppercase font-semibold text-slate-400">Verifying Admin Session...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await adminLogout();
    router.push('/bharatyatra-ops/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/bharatyatra-ops/dashboard', icon: LayoutDashboard },
    { label: 'Customer Users', href: '/bharatyatra-ops/users', icon: Users },
    { label: 'Trips Directory', href: '/bharatyatra-ops/trips', icon: Compass },
    { label: 'Bookings', href: '/bharatyatra-ops/bookings', icon: FileText },
    { label: 'Push & Alerts', href: '/bharatyatra-ops/notifications', icon: Bell },
    { label: 'Audit Trail', href: '/bharatyatra-ops/audit-logs', icon: ScrollText },
    { label: 'Security & Settings', href: '/bharatyatra-ops/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row selection:bg-amber-500 selection:text-slate-950">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <span className="font-black text-sm tracking-wide">BHARATYATRA OPS</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-tight text-white">BHARATYATRA OPS</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Operations Portal
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/bharatyatra-ops/dashboard' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">
                  {admin?.displayName || admin?.username || 'Admin'}
                </h4>
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                  {admin?.role || 'SUPER_ADMIN'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Sign Out Admin Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Operational Bar */}
        <header className="hidden md:flex h-16 bg-slate-900/60 border-b border-slate-800 px-6 items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Admin Operational Governance Gateway</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Operational
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono text-[11px]">{admin?.username}</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
