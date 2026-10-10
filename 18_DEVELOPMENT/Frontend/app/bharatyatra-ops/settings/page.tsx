'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { changeAdminPassword } from '@/lib/admin-api';
import { Key, ShieldCheck, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setLoading(true);
    try {
      const res = await changeAdminPassword(currentPassword, newPassword);
      if (res.success) {
        setMessage({ type: 'success', text: 'Admin password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to change admin password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
          <Link href="/bharatyatra-ops/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-200">Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Lock className="w-7 h-7 text-amber-500" /> Admin Security Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage operational credentials, password policies, and active sessions.
        </p>
      </div>

      {/* Password Management Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" /> Change Admin Password
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Updating your admin password will securely hash it on the backend using bcrypt cost factor 10+.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-xs flex items-center gap-3 font-medium ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/80 border border-red-800 text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Current Admin Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Admin Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" /> {loading ? 'Updating Password...' : 'Update Admin Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Architecture Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Operational Security Guards & Isolation
        </h3>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          <li>Admin API routes (<code>/api/v1/admin/*</code>) require explicit <strong>AdminAuthGuard</strong> validation.</li>
          <li>Customer JWT credentials cannot authorize admin endpoints (strictly returns 401/403).</li>
          <li>Login attempts are subject to strict rate-limiting and 15-minute brute-force account lockouts.</li>
          <li>All admin administrative actions are logged to <strong>AdminAuditLog</strong> with sanitized metadata.</li>
        </ul>
      </div>
    </div>
  );
}
