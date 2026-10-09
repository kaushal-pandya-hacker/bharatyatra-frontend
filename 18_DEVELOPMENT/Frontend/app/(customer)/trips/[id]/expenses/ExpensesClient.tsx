'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GroupMember,
  TripExpenseItem,
  ExpenseCategory,
  SplitType,
  computeFullTripExpenseSummary,
  createTripExpense,
  TripExpenseSummary,
  paiseToInr,
} from '@/lib/trips/group-expense-engine';

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: 'm1', name: 'Kaushal', avatar: 'KP', isCurrentUser: true },
  { id: 'm2', name: 'Rahul', avatar: 'RM' },
  { id: 'm3', name: 'Jay', avatar: 'JD' },
  { id: 'm4', name: 'Dev', avatar: 'DV' },
];

const DEFAULT_EXPENSES: TripExpenseItem[] = [
  createTripExpense({
    id: 'exp-1',
    tripId: '1',
    title: 'Hotel Accommodation',
    amountInr: 8000,
    paidByMemberId: 'm2', // Rahul
    category: 'Stay',
    participantMemberIds: ['m1', 'm2', 'm3', 'm4'],
  }),
  createTripExpense({
    id: 'exp-2',
    tripId: '1',
    title: 'Group Dinner Feast',
    amountInr: 2000,
    paidByMemberId: 'm2', // Rahul
    category: 'Food',
    participantMemberIds: ['m1', 'm2', 'm3', 'm4'],
  }),
  createTripExpense({
    id: 'exp-3',
    tripId: '1',
    title: 'Innova Highway Fuel',
    amountInr: 1500,
    paidByMemberId: 'm2', // Rahul
    category: 'Fuel',
    participantMemberIds: ['m1', 'm2', 'm3', 'm4'],
  }),
  createTripExpense({
    id: 'exp-4',
    tripId: '1',
    title: 'Monument & Heritage Permits',
    amountInr: 4000,
    paidByMemberId: 'm1', // Kaushal
    category: 'Tickets',
    participantMemberIds: ['m1', 'm2', 'm3', 'm4'],
  }),
  createTripExpense({
    id: 'exp-5',
    tripId: '1',
    title: 'Highway Tea & Kathiyawadi Snacks',
    amountInr: 1000,
    paidByMemberId: 'm3', // Jay
    category: 'Food',
    participantMemberIds: ['m1', 'm2', 'm3', 'm4'],
  }),
];

export default function GroupExpensesPage({ params }: { params?: { id?: string } } = {}) {
  const router = useRouter();
  const tripId = params?.id || '1';

  // Members state
  const [members, setMembers] = useState<GroupMember[]>(DEFAULT_MEMBERS);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // Expenses state
  const [expenses, setExpenses] = useState<TripExpenseItem[]>(DEFAULT_EXPENSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [viewDetailExpense, setViewDetailExpense] = useState<TripExpenseItem | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // Form inputs for Add/Edit Expense
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaidBy, setFormPaidBy] = useState('m1');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Food');
  const [formSharedByAll, setFormSharedByAll] = useState(true);
  const [formSelectedMembers, setFormSelectedMembers] = useState<string[]>(['m1', 'm2', 'm3', 'm4']);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem(`cf_members_${tripId}`);
      const savedExp = localStorage.getItem(`cf_expenses_${tripId}`);
      if (savedMembers) setMembers(JSON.parse(savedMembers));
      if (savedExp) setExpenses(JSON.parse(savedExp));
    } catch {}
  }, [tripId]);

  // Sync to localStorage
  const saveState = (updatedMembers: GroupMember[], updatedExpenses: TripExpenseItem[]) => {
    setMembers(updatedMembers);
    setExpenses(updatedExpenses);
    try {
      localStorage.setItem(`cf_members_${tripId}`, JSON.stringify(updatedMembers));
      localStorage.setItem(`cf_expenses_${tripId}`, JSON.stringify(updatedExpenses));
    } catch {}
  };

  // Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newM: GroupMember = {
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      avatar: newMemberName.trim().substring(0, 2).toUpperCase(),
    };
    const updatedM = [...members, newM];
    saveState(updatedM, expenses);
    setNewMemberName('');
    setShowMemberModal(false);
  };

  // Remove Member
  const handleRemoveMember = (memberId: string) => {
    if (members.length <= 2) {
      alert('A group trip must contain at least 2 travelers.');
      return;
    }
    const updatedM = members.filter((m) => m.id !== memberId);
    // Remove member from existing expense participants
    const updatedE = expenses.map((exp) => ({
      ...exp,
      participants: exp.participants.filter((p) => p.memberId !== memberId),
    }));
    saveState(updatedM, updatedE);
  };

  // Open Drawer for Add
  const openAddModal = () => {
    setEditingExpenseId(null);
    setFormTitle('');
    setFormAmount('');
    setFormPaidBy(members[0]?.id || 'm1');
    setFormCategory('Food');
    setFormSharedByAll(true);
    setFormSelectedMembers(members.map((m) => m.id));
    setShowAddModal(true);
  };

  // Open Drawer for Edit
  const openEditModal = (exp: TripExpenseItem) => {
    setEditingExpenseId(exp.id);
    setFormTitle(exp.title);
    setFormAmount(exp.amountInr.toString());
    setFormPaidBy(exp.paidByMemberId);
    setFormCategory(exp.category);
    const pIds = exp.participants.map((p) => p.memberId);
    setFormSharedByAll(pIds.length === members.length);
    setFormSelectedMembers(pIds);
    setShowAddModal(true);
  };

  // Save Expense (Create or Edit)
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formAmount);
    if (!formTitle.trim() || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid description and positive amount.');
      return;
    }

    const participantIds = formSharedByAll ? members.map((m) => m.id) : formSelectedMembers;
    if (participantIds.length === 0) {
      alert('Please select at least one traveler sharing this expense.');
      return;
    }

    try {
      const newExp = createTripExpense({
        id: editingExpenseId || undefined,
        tripId,
        title: formTitle,
        amountInr: amount,
        paidByMemberId: formPaidBy,
        category: formCategory,
        splitType: 'EQUAL',
        participantMemberIds: participantIds,
      });

      let updatedE: TripExpenseItem[];
      if (editingExpenseId) {
        updatedE = expenses.map((e) => (e.id === editingExpenseId ? newExp : e));
      } else {
        updatedE = [newExp, ...expenses];
      }

      saveState(members, updatedE);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving expense.');
    }
  };

  // Delete Expense
  const confirmDeleteExpense = () => {
    if (!deletingExpenseId) return;
    const updatedE = expenses.filter((e) => e.id !== deletingExpenseId);
    saveState(members, updatedE);
    setDeletingExpenseId(null);
  };

  // Calculate summary dynamically
  const summary: TripExpenseSummary = computeFullTripExpenseSummary(members, expenses);

  const getMemberName = (mId: string) => {
    const found = members.find((m) => m.id === mId);
    return found ? found.name : 'Traveler';
  };

  return (
    <div className="bg-[#0b1c30] text-slate-100 font-body-md min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
        <div className="h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-lg">
              CF
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-base tracking-tight uppercase">BharatYatra</span>
              <span className="text-[10px] text-amber-400 font-mono">GROUP EXPENSE SPLIT ENGINE</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 text-xs font-semibold">
            <Link href={`/trips/${tripId}`} className="px-3 py-1.5 text-slate-300 hover:text-white rounded-lg transition-colors">
              Command Center
            </Link>
            <Link href={`/trips/${tripId}/expenses`} className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg shadow-md">
              Group Splitter
            </Link>
            <Link href={`/trips/${tripId}/settle`} className="px-3 py-1.5 text-slate-300 hover:text-white rounded-lg transition-colors">
              Final Settlement
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* TITLE RIBBON */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-mono text-[10px] font-bold uppercase border border-amber-400/20">
                ● LIVE CALCULATION ENGINE
              </span>
              <span className="text-xs text-slate-400 font-mono">• {members.length} Travelers Linked</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Group Expense <span className="text-amber-400">Split &amp; Wallet</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-payer expense ledger with deterministic minor unit rounding and instant balance reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>👥 Group Members ({members.length})</span>
            </button>

            <button
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-amber-300/50"
            >
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>

        {/* 💡 EASY 3-STEP GUIDE BANNER FOR NOVICE & POWER USERS */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 rounded-2xl border border-amber-500/20 p-4 text-xs space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-amber-400 font-mono flex items-center gap-2 uppercase tracking-wide">
              <span>💡</span> How Group Expense Splitter Works
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              ● REAL-TIME BALANCING
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-xs shrink-0">1</span>
              <div>
                <strong className="text-white block font-bold">Add Expenses</strong>
                <span className="text-slate-400 text-[11px]">Click "+ Add Expense" whenever someone buys fuel, food, or stays.</span>
              </div>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-xs shrink-0">2</span>
              <div>
                <strong className="text-white block font-bold">Auto-Calculate Share</strong>
                <span className="text-slate-400 text-[11px]">BharatYatra automatically splits costs equally or custom per passenger.</span>
              </div>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-xs shrink-0">3</span>
              <div>
                <strong className="text-white block font-bold">Instant UPI Settlement</strong>
                <span className="text-slate-400 text-[11px]">Go to "Final Settlement" tab to clear balances with 1-click Google Pay/UPI.</span>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">Total Trip Expenses</span>
            <span className="text-2xl font-extrabold text-amber-400 font-mono block mt-1">
              ₹{summary.totalTripCostInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">{summary.totalExpensesCount} recorded items</span>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">Travelers Group</span>
            <span className="text-2xl font-extrabold text-white font-mono block mt-1">
              {summary.totalMembersCount} People
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">Active trip manifest</span>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">Equal Share / Person</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono block mt-1">
              ₹{summary.averageCostPerPersonInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">Exact per-head target</span>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">Settlement Status</span>
            <Link
              href={`/trips/${tripId}/settle`}
              className="px-3 py-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 rounded-xl text-xs font-bold border border-amber-400/30 flex items-center justify-between transition-colors mt-2"
            >
              <span>View Debt Matrix ({summary.settlements.length})</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* PER-PERSON SUMMARY TABLE */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Member Outlay &amp; Net Balances</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Paid vs Actual Share</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                  <th className="py-3 px-4">Traveler</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Actual Share</th>
                  <th className="py-3 px-4 text-right">Net Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {summary.memberBalances.map((mb) => {
                  const isPositive = mb.netBalancePaise > 0;
                  const isNegative = mb.netBalancePaise < 0;

                  return (
                    <tr key={mb.memberId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-mono font-bold text-xs border border-slate-700">
                          {mb.memberName.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{mb.memberName}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-200">
                        ₹{mb.totalPaidInr.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        ₹{mb.totalShareInr.toLocaleString('en-IN')}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-extrabold ${
                          isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}₹{mb.netBalanceInr.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            isPositive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isNegative
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isPositive ? 'Gets Back' : isNegative ? 'Owes' : 'Settled'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* CATEGORY ANALYTICS & EXPENSES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* EXPENSES LIST (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Expense History ({expenses.length})
              </h2>
              <span className="text-xs text-slate-400">Click item for details</span>
            </div>

            {expenses.length > 0 ? (
              <div className="space-y-3">
                {expenses.map((exp) => {
                  const payerName = getMemberName(exp.paidByMemberId);
                  const sharePerPerson = paiseToInr(
                    Math.round(exp.amountPaise / (exp.participants.length || 1))
                  );

                  return (
                    <div
                      key={exp.id}
                      className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-lg hover:border-amber-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      <div
                        className="flex-1 space-y-1 cursor-pointer"
                        onClick={() => setViewDetailExpense(exp)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-800 text-amber-400 font-mono text-[10px] font-bold rounded uppercase">
                            {exp.category}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {exp.participants.length} Shared ({exp.splitType})
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          {exp.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Paid by <strong className="text-slate-200">{payerName}</strong> • ₹
                          {sharePerPerson.toLocaleString('en-IN')}/person
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                        <span className="text-base font-extrabold text-amber-400 font-mono">
                          ₹{exp.amountInr.toLocaleString('en-IN')}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                            title="Edit Expense"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDeletingExpenseId(exp.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                            title="Delete Expense"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
                <p className="text-sm font-bold text-white">No group expenses recorded yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Track hotel, food, transport, and fuel expenses and split the bill seamlessly!
                </p>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-300 transition-colors"
                >
                  + Add First Expense
                </button>
              </div>
            )}
          </div>

          {/* CATEGORY BREAKDOWN SIDEBAR (1 Column) */}
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Category Outlay Breakdown
              </h2>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
              {summary.categoryBreakdown
                .filter((c) => c.totalAmountPaise > 0)
                .map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{cat.category}</span>
                      <span className="font-mono text-amber-400 font-bold">
                        ₹{cat.totalAmountInr.toLocaleString('en-IN')} ({cat.percentageOfTotal}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, cat.percentageOfTotal)}%` }}
                      />
                    </div>
                  </div>
                ))}

              {summary.categoryBreakdown.every((c) => c.totalAmountPaise === 0) && (
                <p className="text-xs text-slate-400 text-center py-4">No category data yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: ADD / EDIT EXPENSE DRAWER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingExpenseId ? 'Edit Group Expense' : 'Log New Group Expense'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono uppercase mb-1">Expense Description</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Dhaba Dinner, Hotel Stay, Fuel Refill"
                  className="w-full bg-slate-800 text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono uppercase mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-slate-800 text-white font-mono px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono uppercase mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-slate-800 text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Stay">Stay</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Tickets">Tickets</option>
                    <option value="Activities">Activities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Parking">Parking</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono uppercase mb-1">Paid By</label>
                <select
                  value={formPaidBy}
                  onChange={(e) => setFormPaidBy(e.target.value)}
                  className="w-full bg-slate-800 text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 font-bold"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono uppercase mb-1">Split Between</label>
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      checked={formSharedByAll}
                      onChange={() => {
                        setFormSharedByAll(true);
                        setFormSelectedMembers(members.map((m) => m.id));
                      }}
                      className="accent-amber-400"
                    />
                    Everyone in Group ({members.length})
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      checked={!formSharedByAll}
                      onChange={() => setFormSharedByAll(false)}
                      className="accent-amber-400"
                    />
                    Select Travelers
                  </label>
                </div>

                {!formSharedByAll && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    {members.map((m) => {
                      const isChecked = formSelectedMembers.includes(m.id);
                      return (
                        <label key={m.id} className="flex items-center gap-2 cursor-pointer text-slate-200">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormSelectedMembers([...formSelectedMembers, m.id]);
                              } else {
                                setFormSelectedMembers(formSelectedMembers.filter((id) => id !== m.id));
                              }
                            }}
                            className="accent-amber-400"
                          />
                          <span>{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold shadow-lg"
                >
                  {editingExpenseId ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GROUP MEMBERS MANAGER */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Trip Group Manifest ({members.length})</h3>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl">
                  <span className="font-bold text-white text-xs">{m.name}</span>
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMember} className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Enter traveler name"
                className="flex-1 bg-slate-800 text-white px-3 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-amber-400"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-300"
              >
                + Add
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EXPENSE DETAIL */}
      {viewDetailExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">{viewDetailExpense.category}</span>
                <h3 className="text-lg font-bold text-white">{viewDetailExpense.title}</h3>
              </div>
              <button onClick={() => setViewDetailExpense(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Amount:</span>
                <span className="font-mono font-bold text-amber-400 text-base">
                  ₹{viewDetailExpense.amountInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Paid By:</span>
                <span className="font-bold text-white">{getMemberName(viewDetailExpense.paidByMemberId)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Split Method:</span>
                <span className="font-mono text-slate-300">{viewDetailExpense.splitType}</span>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 font-mono uppercase block mb-2">Participant Shares:</span>
                <div className="space-y-1 bg-slate-800/80 p-3 rounded-xl font-mono">
                  {viewDetailExpense.participants.map((p) => (
                    <div key={p.memberId} className="flex justify-between">
                      <span className="text-slate-300">{getMemberName(p.memberId)}</span>
                      <span className="text-white font-bold">₹{p.shareAmountInr.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewDetailExpense(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deletingExpenseId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white">Delete Expense?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this expense? All balances will automatically recalculate.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingExpenseId(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExpense}
                className="px-4 py-2 bg-rose-500 text-white font-bold text-xs rounded-xl hover:bg-rose-600"
              >
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
