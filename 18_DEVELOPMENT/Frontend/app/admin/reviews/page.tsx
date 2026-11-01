'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    fetchReviews();
  }, [selectedStatus]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      let url = '/api/v1/admin/reviews';
      if (selectedStatus !== 'ALL') url += `?status=${selectedStatus}`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setReviews(json.data);
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId: string, status: string) => {
    const reason = prompt(`Enter moderation reason for status ${status}:`, 'Verified compliance with travel review policy.');
    if (reason === null) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/v1/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, notes: reason }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert(data.message || 'Failed to moderate review.');
      }
    } catch (e: any) {
      alert(e.message || 'Error updating review.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Reputation &amp; Trust</span>
            <span>•</span>
            <span>Customer Feedback Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Reviews &amp; Ratings Moderation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit customer feedback across hotels, packages, and destinations. Filter automated spam while preserving authentic feedback.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 w-fit">
        {['ALL', 'PUBLISHED', 'REPORTED', 'SPAM'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
              selectedStatus === st
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">No reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Customer &amp; Rating</th>
                  <th className="p-4">Review Content</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{r.entityName}</div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {r.entityType}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{r.customerName}</div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-slate-900">{r.rating} / 5</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-sm">
                      <div className="font-bold text-slate-900">{r.title}</div>
                      <p className="text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">{r.comment}</p>
                      {r.reportedReason && (
                        <div className="text-[10px] text-rose-600 font-semibold mt-1">
                          Flagged Reason: {r.reportedReason}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          r.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : r.status === 'SPAM'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      {r.status !== 'PUBLISHED' && (
                        <button
                          onClick={() => handleModerate(r.id, 'PUBLISHED')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs"
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== 'SPAM' && (
                        <button
                          onClick={() => handleModerate(r.id, 'SPAM')}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-lg text-xs"
                        >
                          Mark Spam
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
    </div>
  );
}

