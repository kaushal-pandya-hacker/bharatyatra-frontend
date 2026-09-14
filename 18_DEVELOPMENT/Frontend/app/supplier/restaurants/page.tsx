'use client';

import React, { useEffect, useState } from 'react';

export default function SupplierRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null);

  const [formData, setFormData] = useState({
    destinationId: '',
    name: '',
    description: '',
    address: '',
    cuisineType: 'Gujarati Kathiyawadi',
    priceRange: 'MODERATE',
    averageCost: 450,
    openingTime: '08:00 AM',
    closingTime: '11:00 PM',
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

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/v1/supplier/restaurants', { headers: getHeaders() });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRestaurants(json.data);
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
    fetchRestaurants();
    fetchDestinations();
  }, []);

  const openCreateModal = () => {
    setEditingRestaurant(null);
    setFormData({
      destinationId: destinations[0]?.id || '',
      name: '',
      description: '',
      address: '',
      cuisineType: 'Gujarati Kathiyawadi',
      priceRange: 'MODERATE',
      averageCost: 450,
      openingTime: '08:00 AM',
      closingTime: '11:00 PM',
      status: 'ACTIVE',
    });
    setShowModal(true);
  };

  const openEditModal = (rest: any) => {
    setEditingRestaurant(rest);
    setFormData({
      destinationId: rest.destinationId,
      name: rest.name,
      description: rest.description || '',
      address: rest.address || '',
      cuisineType: rest.cuisineType || 'Gujarati Kathiyawadi',
      priceRange: rest.priceRange || 'MODERATE',
      averageCost: Number(rest.averageCost) || 450,
      openingTime: rest.openingTime || '08:00 AM',
      closingTime: rest.closingTime || '11:00 PM',
      status: rest.status || 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const isEdit = !!editingRestaurant;
      const url = isEdit
        ? `http://localhost:4000/api/v1/supplier/restaurants/${editingRestaurant.id}`
        : 'http://localhost:4000/api/v1/supplier/restaurants';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success && json.data) {
        setMessage(`Restaurant "${json.data.name}" ${isEdit ? 'updated' : 'created'} successfully.`);
        setShowModal(false);
        fetchRestaurants();
      } else {
        throw new Error(json.message || 'Operation failed');
      }
    } catch (err: any) {
      setMessage(err.message || 'Failed to save restaurant');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (rest: any) => {
    const newStatus = rest.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`http://localhost:4000/api/v1/supplier/restaurants/${rest.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`Restaurant status set to ${newStatus}.`);
        fetchRestaurants();
      }
    } catch (e) {}
  };

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || (r.cuisineType || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-100 flex items-center gap-2">
            <span>🍽️</span>
            <span>Supplier Restaurant Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage authentic Kathiyawadi & Gujarati dining venues, opening hours & average thali costs
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <span>➕ Create New Restaurant</span>
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
          placeholder="Search restaurants by name or cuisine..."
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

      {/* Restaurants Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-200">Your Managed Dining Venues ({filteredRestaurants.length})</h2>
          <span className="text-xs text-slate-500 font-mono">Backend Tenant Boundary</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading dining venues...</div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No restaurants match your filters. Click &quot;Create New Restaurant&quot; to list a dining venue.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Restaurant Name</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">Cuisine</th>
                  <th className="px-5 py-3">Average Cost</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredRestaurants.map((rest) => (
                  <tr key={rest.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-100">{rest.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{rest.address || `${rest.openingTime} - ${rest.closingTime}`}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-teal-300">
                      {rest.destination?.name || 'Gujarat'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-amber-400">
                      {rest.cuisineType}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-400">
                      ₹{Number(rest.averageCost).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          rest.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {rest.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(rest)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(rest)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          rest.status === 'ACTIVE'
                            ? 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                        }`}
                      >
                        {rest.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
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
                {editingRestaurant ? 'Edit Dining Venue' : 'Create New Restaurant Listing'}
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Restaurant Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Shree Kathiyawadi Khadki"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cuisine Type</label>
                  <input
                    type="text"
                    value={formData.cuisineType}
                    onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                    placeholder="Gujarati Thali & Kathiyawadi"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price Range</label>
                  <select
                    value={formData.priceRange}
                    onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="BUDGET">BUDGET (₹100 - ₹300)</option>
                    <option value="MODERATE">MODERATE (₹300 - ₹800)</option>
                    <option value="FINE_DINING">FINE DINING (₹800+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Average Cost Per Person (INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.averageCost}
                    onChange={(e) => setFormData({ ...formData, averageCost: Number(e.target.value) })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Time</label>
                  <input
                    type="text"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    placeholder="08:00 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Closing Time</label>
                  <input
                    type="text"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    placeholder="11:00 PM"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Address / Location</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Near Somnath Temple Road, Somnath"
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
                  {saving ? 'Saving...' : 'Save Restaurant Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
