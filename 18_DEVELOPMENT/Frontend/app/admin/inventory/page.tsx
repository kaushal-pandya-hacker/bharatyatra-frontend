'use client';

import { useEffect, useState } from 'react';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTab, setCategoryTab] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Moderation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [categoryTab, statusFilter]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams();
      if (categoryTab !== 'ALL') params.append('type', categoryTab);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await fetch(`http://localhost:4000/api/v1/admin/inventory?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setItems(json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch inventory', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const openReviewModal = (item: any, action: 'APPROVE' | 'REJECT') => {
    setTargetItem(item);
    setReviewAction(action);
    setReason('');
    setModalOpen(true);
  };

  const submitReview = async () => {
    if (!targetItem) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(
        `http://localhost:4000/api/v1/admin/inventory/${targetItem.type}/${targetItem.id}/review`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: reviewAction,
            reason: reason || `Listing ${reviewAction.toLowerCase()}d by Admin Moderator`,
          }),
        },
      );

      if (res.ok) {
        setModalOpen(false);
        fetchInventory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (item: any) => {
    try {
      const token = localStorage.getItem('admin_token');
      const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await fetch(
        `http://localhost:4000/api/v1/admin/inventory/${item.type}/${item.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            reason: `Admin toggled status to ${newStatus}`,
          }),
        },
      );
      if (res.ok) fetchInventory();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-900">Inventory Moderation & Quality Governance</h1>
        <p className="text-sm text-slate-500">Review, approve, reject, or toggle status of travel inventory listings</p>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-medium">
        {[
          { key: 'ALL', label: 'All Inventory' },
          { key: 'HOTEL', label: 'Hotels' },
          { key: 'RESTAURANT', label: 'Restaurants' },
          { key: 'ACTIVITY', label: 'Activities' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCategoryTab(tab.key)}
            className={`pb-3 transition-colors ${
              categoryTab === tab.key
                ? 'border-b-2 border-amber-500 font-bold text-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <input
            type="text"
            placeholder="Search listing title, supplier name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Filter
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-500">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Listing States</option>
            <option value="ACTIVE">Active (Customer Visible)</option>
            <option value="INACTIVE">Inactive (Hidden)</option>
          </select>
        </div>
      </div>

      {/* Inventory Listings Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">Loading inventory listings...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">
            No inventory listings match the specified category or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Title / Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Price (INR)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[10px] text-slate-700">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 truncate max-w-xs">{item.supplierName}</td>
                    <td className="px-6 py-4 text-slate-700">{item.destination}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">₹{item.price?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openReviewModal(item, 'APPROVE')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openReviewModal(item, 'REJECT')}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => toggleStatus(item)}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[11px] font-bold transition-colors"
                      >
                        {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Confirm {reviewAction} — {targetItem?.name}
            </h3>
            <p className="text-xs text-slate-500">
              Set inventory listing status to <strong>{reviewAction === 'APPROVE' ? 'ACTIVE' : 'INACTIVE'}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reason / Feedback Note</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for approval or rejection..."
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
                onClick={submitReview}
                disabled={submitting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm"
              >
                {submitting ? 'Processing...' : `Confirm ${reviewAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
