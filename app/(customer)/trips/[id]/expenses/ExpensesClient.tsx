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

  // Persist state updates
  const saveState = (updatedMembers: GroupMember[], updatedExp: TripExpenseItem[]) => {
    setMembers(updatedMembers);
    setExpenses(updatedExp);
    try {
      localStorage.setItem(`cf_members_${tripId}`, JSON.stringify(updatedMembers));
      localStorage.setItem(`cf_expenses_${tripId}`, JSON.stringify(updatedExp));
    } catch {}
  };

  // Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newId = `m${Date.now()}`;
    const newM: GroupMember = {
      id: newId,
      name: newMemberName.trim(),
      avatar: newMemberName.trim().slice(0, 2).toUpperCase(),
    };
    const updated = [...members, newM];
    saveState(updated, expenses);
    setNewMemberName('');
    setFormSelectedMembers([...formSelectedMembers, newId]);
  };

  // Remove Member
  const handleRemoveMember = (mId: string) => {
    if (members.length <= 2) {
      alert('Trip group must have at least 2 travelers to calculate expense splits.');
      return;
    }
    const hasExpenses = expenses.some((e) => e.paidByMemberId === mId || e.participants.some((p) => p.memberId === mId));
    if (hasExpenses && !confirm('This traveler has recorded expenses. Removing them will affect trip totals. Proceed?')) {
      return;
    }

    const updatedM = members.filter((m) => m.id !== mId);
    // Clean removed member from participant lists
    const updatedE = expenses.map((e) => ({
      ...e,
      participants: e.participants.filter((p) => p.memberId !== mId),
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
    <div className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs">
        <div className="h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/logo.png"
              alt="BharatYatra Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105 rounded-md"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-heading font-black text-slate-900 text-base tracking-tight uppercase group-hover:text-amber-600 transition-colors">
                BharatYatra
              </span>
              <span className="text-[10px] text-amber-600 font-mono font-bold tracking-wider">
                GROUP EXPENSE SPLIT ENGINE
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 text-xs font-semibold">
            <Link
              href={`/trips/${tripId}`}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Command Center
            </Link>
            <Link
              href={`/trips/${tripId}/expenses`}
              className="px-3.5 py-1.5 bg-amber-400 text-slate-950 font-extrabold rounded-lg shadow-xs"
            >
              Group Splitter
            </Link>
            <Link
              href={`/trips/${tripId}/settle`}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Final Settlement
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* TITLE RIBBON */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-900 font-mono text-[10px] font-bold uppercase border border-amber-300/60">
                ● LIVE CALCULATION ENGINE
              </span>
              <span className="text-xs text-slate-500 font-mono">• {members.length} Travelers Linked</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Group Expense <span className="text-amber-600">Split &amp; Wallet</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Multi-payer expense ledger with deterministic minor unit rounding and instant balance reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>👥 Group Members ({members.length})</span>
            </button>

            <button
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer border border-amber-400/80"
            >
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>

        {/* 💡 EASY 3-STEP GUIDE BANNER FOR NOVICE & POWER USERS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 text-xs space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 font-mono flex items-center gap-2 uppercase tracking-wide">
              <span>💡</span> How Group Expense Splitter Works
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
              ● REAL-TIME BALANCING
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">1</span>
              <div>
                <strong className="text-slate-900 block font-bold">Add Expenses</strong>
                <span className="text-slate-500 text-[11px]">Click &quot;+ Add Expense&quot; whenever someone buys fuel, food, or stays.</span>
              </div>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">2</span>
              <div>
                <strong className="text-slate-900 block font-bold">Auto-Calculate Share</strong>
                <span className="text-slate-500 text-[11px]">BharatYatra automatically splits costs equally or custom per passenger.</span>
              </div>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">3</span>
              <div>
                <strong className="text-slate-900 block font-bold">Instant UPI Settlement</strong>
                <span className="text-slate-500 text-[11px]">Go to &quot;Final Settlement&quot; tab to clear balances with 1-click Google Pay/UPI.</span>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-slate-500 block font-semibold">Total Trip Expenses</span>
            <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
              ₹{summary.totalTripCostInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">{summary.totalExpensesCount} recorded items</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-slate-500 block font-semibold">Travelers Group</span>
            <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
              {summary.totalMembersCount} People
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Active trip manifest</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-slate-500 block font-semibold">Equal Share / Person</span>
            <span className="text-2xl font-black text-emerald-600 font-mono block mt-1">
              ₹{summary.averageCostPerPersonInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Exact per-head target</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-500 block font-semibold">Settlement Status</span>
            <Link
              href={`/trips/${tripId}/settle`}
              className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-200 flex items-center justify-between transition-colors mt-2 shadow-xs"
            >
              <span>View Debt Matrix ({summary.settlements.length})</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* PER-PERSON SUMMARY TABLE */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-6 pb-4">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Member Outlay &amp; Net Balances</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">Paid vs Actual Share</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase font-mono text-[11px]">
                  <th className="py-3 px-6">Traveler</th>
                  <th className="py-3 px-6 text-right">Amount Paid</th>
                  <th className="py-3 px-6 text-right">Actual Share</th>
                  <th className="py-3 px-6 text-right">Net Balance</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {summary.memberBalances.map((mb) => {
                  const isPositive = mb.netBalancePaise > 0;
                  const isNegative = mb.netBalancePaise < 0;

                  return (
                    <tr key={mb.memberId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-6 font-sans font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-mono font-bold text-xs border border-slate-200">
                          {mb.memberName.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{mb.memberName}</span>
                      </td>
                      <td className="py-3 px-6 text-right text-slate-700">
                        ₹{mb.totalPaidInr.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-6 text-right text-slate-700">
                        ₹{mb.totalShareInr.toLocaleString('en-IN')}
                      </td>
                      <td
                        className={`py-3 px-6 text-right font-black ${
                          isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-500'
                        }`}
                      >
                        {isPositive ? '+' : ''}₹{mb.netBalanceInr.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-6 text-center font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isNegative
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
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
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Expense History ({expenses.length})
              </h2>
              <span className="text-xs text-slate-500">Click item for details</span>
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
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      <div
                        className="flex-1 space-y-1 cursor-pointer"
                        onClick={() => setViewDetailExpense(exp)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono text-[10px] font-bold rounded uppercase border border-slate-200">
                            {exp.category}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {exp.participants.length} Shared ({exp.splitType})
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                          {exp.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Paid by <strong className="text-slate-800">{payerName}</strong> • ₹
                          {sharePerPerson.toLocaleString('en-IN')}/person
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                        <span className="text-base font-black text-slate-900 font-mono">
                          ₹{exp.amountInr.toLocaleString('en-IN')}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Edit Expense"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDeletingExpenseId(exp.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-200 cursor-pointer"
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
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                <p className="text-sm font-bold text-slate-900">No group expenses recorded yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Track hotel, food, transport, and fuel expenses and split the bill seamlessly!
                </p>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-300 transition-colors shadow-xs"
                >
                  + Add First Expense
                </button>
              </div>
            )}
          </div>

          {/* CATEGORY BREAKDOWN SIDEBAR (1 Column) */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Category Outlay Breakdown
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              {summary.categoryBreakdown
                .filter((c) => c.totalAmountPaise > 0)
                .map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat.category}</span>
                      <span className="font-mono text-slate-900 font-bold">
                        ₹{cat.totalAmountInr.toLocaleString('en-IN')} ({cat.percentageOfTotal}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, cat.percentageOfTotal)}%` }}
                      />
                    </div>
                  </div>
                ))}

              {summary.categoryBreakdown.every((c) => c.totalAmountPaise === 0) && (
                <p className="text-xs text-slate-500 text-center py-4">No category data yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: ADD / EDIT EXPENSE DRAWER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingExpenseId ? 'Edit Group Expense' : 'Log New Group Expense'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-mono uppercase mb-1 font-semibold">Expense Description</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Dhaba Dinner, Hotel Stay, Fuel Refill"
                  className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-mono uppercase mb-1 font-semibold">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-slate-50 text-slate-900 font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-mono uppercase mb-1 font-semibold">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
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
                <label className="block text-slate-600 font-mono uppercase mb-1 font-semibold">Paid By</label>
                <select
                  value={formPaidBy}
                  onChange={(e) => setFormPaidBy(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-bold"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-mono uppercase mb-1 font-semibold">Split Between</label>
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      checked={formSharedByAll}
                      onChange={() => {
                        setFormSharedByAll(true);
                        setFormSelectedMembers(members.map((m) => m.id));
                      }}
                      className="accent-amber-500"
                    />
                    Everyone in Group ({members.length})
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      checked={!formSharedByAll}
                      onChange={() => setFormSharedByAll(false)}
                      className="accent-amber-500"
                    />
                    Select Travelers
                  </label>
                </div>

                {!formSharedByAll && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {members.map((m) => {
                      const isChecked = formSelectedMembers.includes(m.id);
                      return (
                        <label key={m.id} className="flex items-center gap-2 cursor-pointer text-slate-800">
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
                            className="accent-amber-500"
                          />
                          <span>{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold shadow-sm cursor-pointer transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Trip Group Manifest ({members.length})</h3>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="font-bold text-slate-800 text-xs">{m.name}</span>
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMember} className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Enter traveler name"
                className="flex-1 bg-slate-50 text-slate-900 px-3.5 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-300 cursor-pointer shadow-xs"
              >
                + Add
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EXPENSE DETAIL */}
      {viewDetailExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold">{viewDetailExpense.category}</span>
                <h3 className="text-lg font-bold text-slate-900">{viewDetailExpense.title}</h3>
              </div>
              <button onClick={() => setViewDetailExpense(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-mono font-black text-slate-900 text-base">
                  ₹{viewDetailExpense.amountInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Paid By:</span>
                <span className="font-bold text-slate-900">{getMemberName(viewDetailExpense.paidByMemberId)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Split Method:</span>
                <span className="font-mono text-slate-700 font-medium">{viewDetailExpense.splitType}</span>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 font-mono uppercase block mb-2 font-semibold">Participant Shares:</span>
                <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl font-mono border border-slate-200">
                  {viewDetailExpense.participants.map((p) => (
                    <div key={p.memberId} className="flex justify-between text-xs">
                      <span className="text-slate-700">{getMemberName(p.memberId)}</span>
                      <span className="text-slate-900 font-bold">₹{p.shareAmountInr.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewDetailExpense(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deletingExpenseId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center text-slate-900">
            <h3 className="text-lg font-bold text-slate-900">Delete Expense?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this expense? All balances will automatically recalculate.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingExpenseId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExpense}
                className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 cursor-pointer shadow-xs transition-colors"
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
