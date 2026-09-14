'use client';

import React, { useEffect, useState } from 'react';

export default function SupplierActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);

  const [formData, setFormData] = useState({
    destinationId: '',
    title: '',
    description: '',
    category: 'Cultural Tour',
    priceInr: 1200,
    durationMinutes: 120,
    bestTimeToVisit: 'Morning / Evening',
    status: 'ACTIVE',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('chalo_farva_supplier_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['x-supplier-id'] = 'supp_001';
    }
    return headers;
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/v1/supplier/activities', { headers: getHeaders() });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setActivities(json.data);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/destinations');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDestinations(json.data);
        if (json.data.length > 0 && !formData.destinationId) {
          setFormData((prev) => ({ ...prev, destinationId: json.data[0].id }));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchActivities();
    fetchDestinations();
  }, []);

  const openCreateModal = () => {
    setEditingActivity(null);
    setFormData({
      destinationId: destinations[0]?.id || '',
      title: '',
      description: '',
      category: 'Cultural Tour',
      priceInr: 1200,
      durationMinutes: 120,
      bestTimeToVisit: 'Morning / Evening',
      status: 'ACTIVE',
    });
    setShowModal(true);
  };

  const openEditModal = (act: any) => {
    setEditingActivity(act);
    setFormData({
      destinationId: act.destinationId,
      title: act.title,
      description: act.description || '',
      category: act.category || 'Cultural Tour',
      priceInr: Number(act.priceInr) || 1200,
      durationMinutes: act.durationMinutes || 120,
      bestTimeToVisit: act.bestTimeToVisit || 'Morning / Evening',
      status: act.status || 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const isEdit = !!editingActivity;
      const url = isEdit
        ? `http://localhost:4000/api/v1/supplier/activities/${editingActivity.id}`
        : 'http://localhost:4000/api/v1/supplier/activities';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success && json.data) {
        setMessage(`Activity "${json.data.title}" ${isEdit ? 'updated' : 'created'} successfully.`);
        setShowModal(false);
        fetchActivities();
      } else {
        throw new Error(json.message || 'Operation failed');
      }
    } catch (err: any) {
      setMessage(err.message || 'Failed to save activity');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (act: any) => {
    const newStatus = act.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`http://localhost:4000/api/v1/supplier/activities/${act.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`Activity status set to ${newStatus}.`);
        fetchActivities();
      }
    } catch (e) {}
  };

  const filteredActivities = activities.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || (a.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-100 flex items-center gap-2">
            <span>🎯</span>
            <span>Supplier Activity Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage guided tours, water sports, heritage walks & local experience slots
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <span>➕ Create New Activity</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs rounded-xl flex items-center gap-2">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-950 border border-slate-800 rounded-xl p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activities by title or category..."
          className="w-full sm:w-72 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-teal-500"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-200">Your Managed Tours & Experiences ({filteredActivities.length})</h2>
          <span className="text-xs text-slate-500 font-mono">Backend Tenant Boundary</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading activities...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No activities match your filters. Click &quot;Create New Activity&quot; to publish an experience.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Activity Title</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-100">{act.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{act.bestTimeToVisit || 'All Day'}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-teal-300">
                      {act.destination?.name || 'Gujarat'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-amber-400">
                      {act.category}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 font-mono">
                      {act.durationMinutes} mins
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-400">
                      ₹{Number(act.priceInr).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          act.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {act.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(act)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(act)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          act.status === 'ACTIVE'
                            ? 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                        }`}
                      >
                        {act.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form for Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-100">
                {editingActivity ? 'Edit Activity Experience' : 'Create New Activity Listing'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Location *</label>
                <select
                  required
                  value={formData.destinationId}
                  onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Dwarka Marine Sunset Boat Cruise"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="Cultural Tour">Cultural & Heritage Tour</option>
                    <option value="Water Sports">Water Sports & Boating</option>
                    <option value="Wildlife Safari">Wildlife Safari</option>
                    <option value="Adventure">Adventure & Trekking</option>
                    <option value="General">General Experience</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price Per Person (INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.priceInr}
                    onChange={(e) => setFormData({ ...formData, priceInr: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="ACTIVE">ACTIVE (Published)</option>
                    <option value="INACTIVE">INACTIVE (Hidden)</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Best Time to Visit / Slot Recommendation</label>
                <input
                  type="text"
                  value={formData.bestTimeToVisit}
                  onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                  placeholder="Sunset hours (05:00 PM - 07:00 PM)"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Experience Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe guided itinerary, safety gear provided, meeting point, and highlights..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Activity Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
