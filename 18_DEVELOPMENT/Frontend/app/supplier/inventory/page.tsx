'use client';

import React, { useEffect, useState } from 'react';

export default function SupplierInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'HOTEL',
    basePriceInr: 2500,
    availableCapacity: 10,
  });
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-supplier-id'] = 'supp_001';
      }

      const res = await fetch('http://localhost:4000/api/v1/suppliers/inventory', { headers });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-supplier-id'] = 'supp_001';
      }

      const res = await fetch('http://localhost:4000/api/v1/suppliers/inventory', {
        method: 'POST',
        headers,
        body: JSON.stringify(newItem),
      });

      const json = await res.json();

      if (json.success && json.data) {
        setMessage(`Added new inventory listing "${json.data.title}" successfully.`);
        setNewItem({ title: '', category: 'HOTEL', basePriceInr: 2500, availableCapacity: 10 });
        setShowAddForm(false);
        fetchInventory();
      }
    } catch (err: any) {
      setMessage(err.message || 'Failed to add inventory item');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-100 flex items-center gap-2">
            <span>🏨</span>
            <span>Supplier Inventory Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Strict tenant data isolation • Control room rates, bus seats, and activity slots
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <span>{showAddForm ? '✕ Close Form' : '➕ Add Inventory Listing'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs rounded-xl flex items-center gap-2">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddItem} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">Create New Inventory Listing</h2>
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Listing Title / Service Name *</label>
            <input
              type="text"
              required
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="Deluxe Sea View Suite"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
              >
                <option value="HOTEL">Hotel Room</option>
                <option value="BUS">Bus Seat</option>
                <option value="RESTAURANT">Dining Slot</option>
                <option value="ACTIVITY">Activity Slot</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Base Price (INR)</label>
              <input
                type="number"
                required
                value={newItem.basePriceInr}
                onChange={(e) => setNewItem({ ...newItem, basePriceInr: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Daily Capacity</label>
              <input
                type="number"
                required
                value={newItem.availableCapacity}
                onChange={(e) => setNewItem({ ...newItem, availableCapacity: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={adding}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {adding ? 'Publishing...' : 'Publish Inventory Item'}
            </button>
          </div>
        </form>
      )}

      {/* Inventory Items List Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-200">Active Tenant Inventory ({items.length})</h2>
          <span className="text-xs text-slate-500 font-mono">Isolated Data Boundary</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading supplier inventory items...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No inventory listings found for this supplier tenant.</div>
        ) : (
          <div className="divide-y divide-slate-800/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Inventory Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Base Price</th>
                  <th className="px-5 py-3">Capacity</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {items.map((item, idx) => (
                  <tr key={item.inventoryId || idx} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-3.5 font-semibold text-slate-100">{item.title}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-amber-400">₹{Number(item.basePriceInr).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5">{item.availableCapacity} slots</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {item.approvalStatus || 'APPROVED'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
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
