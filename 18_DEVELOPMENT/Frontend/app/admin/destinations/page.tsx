'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);

  const [formName, setFormName] = useState('');
  const [formState, setFormState] = useState('Gujarat');
  const [formCity, setFormCity] = useState('');
  const [formCategory, setFormCategory] = useState('Historical');
  const [formDesc, setFormDesc] = useState('');
  const [formDuration, setFormDuration] = useState('2 to 3 Days');
  const [formBudget, setFormBudget] = useState('₹8,000 - ₹15,000');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, [selectedCategory]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      let url = '/api/v1/admin/destinations?';
      if (selectedCategory !== 'ALL') url += `category=${selectedCategory}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setDestinations(json.data);
      }
    } catch (e) {
      console.error('Failed to load destinations:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          state: formState,
          city: formCity,
          category: formCategory,
          description: formDesc,
          attractions: ['Historic Landmark', 'City Center'],
          bestSeason: 'October to March',
          suggestedDuration: formDuration,
          estimatedBudget: formBudget,
          travelTips: ['Book travel permits in advance'],
          seoTitle: `${formName} Tour — Visit ${formCity}`,
          seoDescription: formDesc,
          isPublished: true,
          image: '/landmarks/sabarmati-ashram.jpg',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchDestinations();
        setFormName('');
        setFormCity('');
        setFormDesc('');
      } else {
        alert(data.message || 'Failed to create destination.');
      }
    } catch (e: any) {
      alert(e.message || 'Error creating destination.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    'ALL',
    'Adventure',
    'Religious',
    'Mountains',
    'Beaches',
    'Historical',
    'Wildlife',
    'Family',
    'Honeymoon',
    'Cultural',
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Marketplace Catalog</span>
            <span>•</span>
            <span>Pan-India Destinations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Destination Management CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Curate Indian travel circuits, seasonal advisories, sightseeing attractions, and AI planning seeds.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Destination Circuit
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                selectedCategory === c
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search circuit, state, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none w-64"
          />
        </div>
      </div>

      {/* Destination Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-slate-500">Loading destination circuits...</div>
      ) : destinations.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
          <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <div className="text-sm font-bold text-slate-700">No Custom Admin Destinations Created Yet</div>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            The AI Trip Planner references the 126 verified knowledge base entities (lib/data/destinations.ts). Custom CMS destinations created here will be indexed alongside the verified catalog.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition cursor-pointer"
          >
            Create First Destination
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((d) => (
            <div
              key={d.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all group"
            >
              <div>
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img
                    src={d.image || '/landmarks/sabarmati-ashram.jpg'}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-slate-900 rounded-full text-[10px] font-bold border border-slate-200 shadow-xs">
                    {d.category}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold shadow-xs">
                    Published
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-heading leading-tight">{d.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{d.city}, {d.state}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{d.description}</p>

                  <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 text-slate-500 font-semibold">
                    <span>Duration: {d.suggestedDuration}</span>
                    <span className="text-amber-700 font-bold">{d.estimatedBudget}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  {d.visitCount?.toLocaleString()} Platform Inquiries
                </span>
                <button
                  onClick={() => setSelectedDestination(d)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-heading">Add Destination Circuit</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Circuit Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Somnath Coastal Jyotirlinga Circuit"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">City / Hub</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Somnath / Veraval"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'ALL').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Comprehensive description of attractions and cultural significance..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Recommended Duration</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Estimated Budget</label>
                  <input
                    type="text"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
                >
                  {submitting ? 'Saving...' : 'Save & Publish Circuit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedDestination && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">{selectedDestination.category}</span>
                <h3 className="text-xl font-black text-slate-900">{selectedDestination.name}</h3>
              </div>
              <button onClick={() => setSelectedDestination(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-700 leading-relaxed">{selectedDestination.description}</p>
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Attractions:</div>
                <div className="text-slate-600">{(selectedDestination.attractions || []).join(' • ')}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Best Season</span>
                  <div className="font-bold text-slate-900">{selectedDestination.bestSeason}</div>
                </div>
                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Suggested Duration</span>
                  <div className="font-bold text-slate-900">{selectedDestination.suggestedDuration}</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDestination(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

