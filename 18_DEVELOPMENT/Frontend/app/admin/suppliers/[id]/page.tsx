'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params?.id as string;

  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (supplierId) fetchSupplier();
  }, [supplierId]);

  const fetchSupplier = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`http://localhost:4000/api/v1/admin/suppliers/${supplierId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch supplier details');
      }
      setSupplier(json.data);
    } catch (err: any) {
      setError(err.message || 'Could not load supplier details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (verificationStatus: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`http://localhost:4000/api/v1/admin/suppliers/${supplierId}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: verificationStatus, reason: reason || `Updated to ${verificationStatus}` }),
      });
      if (res.ok) {
        setReason('');
        fetchSupplier();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm font-medium">Loading supplier details...</div>;
  }

  if (error || !supplier) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-3">
        <div className="font-bold text-lg">Supplier Not Found</div>
        <p className="text-sm">{error || 'Supplier record could not be located.'}</p>
        <Link href="/admin/suppliers" className="inline-block px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">
          ← Return to Suppliers Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/suppliers" className="text-xs font-bold text-amber-600 hover:underline">
            ← Back to Suppliers Directory
          </Link>
          <h1 className="text-2xl font-bold font-heading text-slate-900 mt-1">{supplier.businessName}</h1>
          <p className="text-sm text-slate-500">B2B Travel Vendor Account Profile</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-slate-100 text-slate-800 font-bold rounded-full text-xs border border-slate-200">
            {supplier.verificationStatus}
          </span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs border border-emerald-200">
            {supplier.status}
          </span>
        </div>
      </div>

      {/* Supplier Profile Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">Business Details & Contact Information</h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-slate-400 font-semibold uppercase">Legal Business Name</div>
              <div className="font-bold text-slate-800 mt-1">{supplier.legalName || supplier.businessName}</div>
            </div>
            <div>
              <div className="text-slate-400 font-semibold uppercase">Category / Industry</div>
              <div className="font-bold text-slate-800 mt-1">{supplier.businessType || 'HOTEL'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-semibold uppercase">Contact Email</div>
              <div className="font-bold text-slate-800 mt-1">{supplier.email}</div>
            </div>
            <div>
              <div className="text-slate-400 font-semibold uppercase">Phone Number</div>
              <div className="font-bold text-slate-800 mt-1">{supplier.phone || 'N/A'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-semibold uppercase">City / State</div>
              <div className="font-bold text-slate-800 mt-1">{supplier.city || 'Gujarat'}, {supplier.state || 'Gujarat'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-semibold uppercase">Member Since</div>
              <div className="font-bold text-slate-800 mt-1">{new Date(supplier.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Business Description</div>
            <p className="text-xs text-slate-600 leading-relaxed">{supplier.description || 'No description provided.'}</p>
          </div>
        </div>

        {/* Governance Action Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Administrative Governance Actions</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Operational Action Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for verification change or account suspension..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2 pt-2">
            {supplier.verificationStatus !== 'VERIFIED' && (
              <button
                onClick={() => handleStatusChange('VERIFIED')}
                disabled={updating}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Approve & Verify Supplier
              </button>
            )}

            {supplier.verificationStatus !== 'SUSPENDED' && (
              <button
                onClick={() => handleStatusChange('SUSPENDED')}
                disabled={updating}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Suspend Supplier Account
              </button>
            )}

            {supplier.verificationStatus !== 'REJECTED' && (
              <button
                onClick={() => handleStatusChange('REJECTED')}
                disabled={updating}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Reject Supplier Onboarding
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Linked Inventory Listings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Supplier Owned Inventory Listings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Hotels</span>
              <span className="font-bold text-slate-900">{supplier.hotels?.length || 0}</span>
            </div>
            {supplier.hotels?.map((h: any) => (
              <div key={h.id} className="text-xs flex items-center justify-between text-slate-700 py-1 border-t border-slate-200/60">
                <span className="font-medium truncate max-w-[160px]">{h.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">{h.status}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Restaurants</span>
              <span className="font-bold text-slate-900">{supplier.restaurants?.length || 0}</span>
            </div>
            {supplier.restaurants?.map((r: any) => (
              <div key={r.id} className="text-xs flex items-center justify-between text-slate-700 py-1 border-t border-slate-200/60">
                <span className="font-medium truncate max-w-[160px]">{r.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">{r.status}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Activities</span>
              <span className="font-bold text-slate-900">{supplier.activities?.length || 0}</span>
            </div>
            {supplier.activities?.map((a: any) => (
              <div key={a.id} className="text-xs flex items-center justify-between text-slate-700 py-1 border-t border-slate-200/60">
                <span className="font-medium truncate max-w-[160px]">{a.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
