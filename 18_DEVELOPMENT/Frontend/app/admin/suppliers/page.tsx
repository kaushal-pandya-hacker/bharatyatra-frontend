'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Reason Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetSupplier, setTargetSupplier] = useState<any>(null);
  const [actionType, setActionType] = useState<'VERIFY' | 'REJECT' | 'SUSPEND' | 'REACTIVATE'>('VERIFY');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [verificationFilter, statusFilter]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (verificationFilter !== 'ALL') params.append('verificationStatus', verificationFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`http://localhost:4000/api/v1/admin/suppliers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuppliers(json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch suppliers', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuppliers();
  };

  const openActionModal = (supplier: any, type: 'VERIFY' | 'REJECT' | 'SUSPEND' | 'REACTIVATE') => {
    setTargetSupplier(supplier);
    setActionType(type);
    setReason('');
    setModalOpen(true);
  };

  const submitAction = async () => {
    if (!targetSupplier) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      let endpoint = '';
      let payload = {};

      if (actionType === 'VERIFY') {
        endpoint = `http://localhost:4000/api/v1/admin/suppliers/${targetSupplier.id}/verification`;
        payload = { status: 'VERIFIED', reason: reason || 'Verified by Operations Admin' };
      } else if (actionType === 'REJECT') {
        endpoint = `http://localhost:4000/api/v1/admin/suppliers/${targetSupplier.id}/verification`;
        payload = { status: 'REJECTED', reason: reason || 'Application rejected by Operations Admin' };
      } else if (actionType === 'SUSPEND') {
        endpoint = `http://localhost:4000/api/v1/admin/suppliers/${targetSupplier.id}/verification`;
        payload = { status: 'SUSPENDED', reason: reason || 'Account suspended by Operations Admin' };
      } else if (actionType === 'REACTIVATE') {
        endpoint = `http://localhost:4000/api/v1/admin/suppliers/${targetSupplier.id}/verification`;
        payload = { status: 'VERIFIED', reason: reason || 'Account reactivated by Operations Admin' };
      }

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchSuppliers();
      }
    } catch (e) {
      console.error('Action error', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">Supplier Directory & Onboarding Governance</h1>
          <p className="text-sm text-slate-500">Verify, reject, or manage B2B travel supplier accounts</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <input
            type="text"
            placeholder="Search business name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Verification</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Account State</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Accounts</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">Loading suppliers directory...</div>
        ) : suppliers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">
            No supplier accounts match the specified query filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Inventory</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Account State</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((supp) => (
                  <tr key={supp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <Link href={`/admin/suppliers/${supp.id}`} className="hover:text-amber-600 hover:underline">
                        {supp.businessName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{supp.businessType || 'HOTEL'}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{supp.email}</div>
                      <div className="text-[11px] text-slate-400">{supp.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{supp.city || 'Gujarat'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{supp.totalInventoryCount || 0} items</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          supp.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : supp.verificationStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : supp.verificationStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {supp.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          supp.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {supp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/suppliers/${supp.id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition-colors"
                      >
                        View
                      </Link>
                      {supp.verificationStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => openActionModal(supp, 'VERIFY')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => openActionModal(supp, 'REJECT')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {supp.verificationStatus === 'VERIFIED' && (
                        <button
                          onClick={() => openActionModal(supp, 'SUSPEND')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {supp.verificationStatus === 'SUSPENDED' && (
                        <button
                          onClick={() => openActionModal(supp, 'REACTIVATE')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation & Reason Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Confirm {actionType} — {targetSupplier?.businessName}
            </h3>
            <p className="text-xs text-slate-500">
              Provide an operational audit reason for setting supplier verification status to <strong>{actionType}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reason / Admin Note</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Required context for audit log stream..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={submitting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm"
              >
                {submitting ? 'Processing...' : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
