'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GroupMember,
  TripExpenseItem,
  ExpenseCategory,
  SplitType,
  computeFullTripExpenseSummary,
  TripExpenseSummary,
  paiseToInr,
} from '@/lib/trips/group-expense-engine';

export default function GroupExpensesPage({ params }: { params?: { id?: string } } = {}) {
  const router = useRouter();
  const tripId = params?.id || '1';

  // Real data state (ZERO hardcoded demo values)
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<TripExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Modals state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberUpi, setNewMemberUpi] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [viewDetailExpense, setViewDetailExpense] = useState<TripExpenseItem | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // Form inputs for Add/Edit Expense
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaidBy, setFormPaidBy] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Food');
  const [formSharedByAll, setFormSharedByAll] = useState(true);
  const [formSelectedMembers, setFormSelectedMembers] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real trip members & expenses from persistent server
  const loadTripData = useCallback(async () => {
    setIsLoading(true);
    setServerError(null);
    setIsUnauthorized(false);

    // Sanitize any legacy synthetic demo data from older visits
    if (typeof window !== 'undefined') {
      try {
        const oldSavedExp = localStorage.getItem(`cf_expenses_${tripId}`);
        if (
          oldSavedExp &&
          (oldSavedExp.includes('Hotel Accommodation') ||
            oldSavedExp.includes('Innova Highway Fuel') ||
            oldSavedExp.includes('exp-1'))
        ) {
          localStorage.removeItem(`cf_expenses_${tripId}`);
          localStorage.removeItem(`cf_members_${tripId}`);
          localStorage.removeItem(`cf_settlement_status_${tripId}`);
        }
      } catch {}
    }

    try {
      const res = await fetch(`/api/v1/trips/${tripId}/expenses`);
      if (res.status === 401 || res.status === 403 || res.status === 404) {
        setIsUnauthorized(true);
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setServerError(errJson.error || 'Failed to load trip expenses from database.');
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success && data.data) {
        setMembers(data.data.members || []);
        setExpenses(data.data.expenses || []);
      }
    } catch (err: any) {
      setServerError(err?.message || 'Network error communicating with trip expense service.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadTripData();
  }, [loadTripData]);

  // Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/trips/${tripId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName.trim(),
          email: newMemberEmail.trim() || undefined,
          phone: newMemberPhone.trim() || undefined,
          upiId: newMemberUpi.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        alert(resData.error || 'Failed to add member to database.');
        return;
      }

      const createdMember: GroupMember = resData.data;
      setMembers((prev) => [...prev, createdMember]);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPhone('');
      setNewMemberUpi('');
      setFormSelectedMembers((prev) => [...prev, createdMember.id]);
    } catch (err: any) {
      alert(err.message || 'Error communicating with database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (mId: string) => {
    const target = members.find((m) => m.id === mId);
    if (target?.role === 'OWNER') {
      alert('The trip organizer cannot be removed.');
      return;
    }

    const hasExpenses = expenses.some(
      (e) => e.paidByMemberId === mId || e.participants.some((p) => p.memberId === mId)
    );
    if (hasExpenses && !confirm('This traveler has recorded expenses. Removing them will affect trip totals. Proceed?')) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/trips/${tripId}/members/${mId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.error || 'Failed to remove member.');
        return;
      }

      setMembers((prev) => prev.filter((m) => m.id !== mId));
      setExpenses((prev) =>
        prev.map((e) => ({
          ...e,
          participants: e.participants.filter((p) => p.memberId !== mId),
        }))
      );
    } catch (err: any) {
      alert(err.message || 'Error deleting member.');
    }
  };

  // Open Drawer for Add
  const openAddModal = () => {
    setEditingExpenseId(null);
    setFormTitle('');
    setFormAmount('');
    setFormPaidBy(members[0]?.id || '');
    setFormCategory('Food');
    setFormSharedByAll(true);
    setFormSelectedMembers(members.map((m) => m.id));
    setFormError(null);
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
    setFormError(null);
    setShowAddModal(true);
  };

  // Save Expense (Create or Edit) with DB Persistence
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const amount = parseFloat(formAmount);

    if (!formTitle.trim()) {
      setFormError('Please enter an expense description.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid positive amount in ₹ INR.');
      return;
    }
    if (!formPaidBy) {
      setFormError('Please select who paid for this expense.');
      return;
    }

    const participantIds = formSharedByAll ? members.map((m) => m.id) : formSelectedMembers;
    if (participantIds.length === 0) {
      setFormError('Please select at least one traveler sharing this expense.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          amountInr: amount,
          paidByMemberId: formPaidBy,
          category: formCategory,
          splitType: 'EQUAL',
          participantMemberIds: participantIds,
        }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        setFormError(resJson.error || 'Database persistence failed.');
        setIsSubmitting(false);
        return;
      }

      const savedItem: TripExpenseItem = resJson.data;
      setExpenses((prev) => [savedItem, ...prev.filter((e) => e.id !== savedItem.id)]);
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Error communicating with database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Expense with DB Persistence
  const confirmDeleteExpense = async () => {
    if (!deletingExpenseId) return;

    try {
      const res = await fetch(`/api/v1/trips/${tripId}/expenses/${deletingExpenseId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.error || 'Failed to delete expense from database.');
        return;
      }

      setExpenses((prev) => prev.filter((e) => e.id !== deletingExpenseId));
      setDeletingExpenseId(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting expense.');
    }
  };

  // Calculate summary dynamically from REAL data only
  const summary: TripExpenseSummary = useMemo(() => {
    return computeFullTripExpenseSummary(members, expenses);
  }, [members, expenses]);

  const getMemberName = (mId: string) => {
    const found = members.find((m) => m.id === mId);
    return found ? found.name : 'Traveler';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs">
          <div className="h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="BharatYatra Logo" className="h-10 w-auto object-contain rounded-md" />
              <div className="flex flex-col leading-tight">
                <span className="font-heading font-black text-slate-900 text-base tracking-tight uppercase">
                  BharatYatra
                </span>
                <span className="text-[10px] text-amber-600 font-mono font-bold tracking-wider">
                  GROUP EXPENSE SPLIT ENGINE
                </span>
              </div>
            </Link>
          </div>
        </header>

        <main className="pt-36 pb-16 px-4 max-w-7xl mx-auto text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800">Loading Trip Expense Ledger...</h2>
          <p className="text-xs text-slate-500 mt-1">Connecting to verified database and authenticating members.</p>
        </main>
      </div>
    );
  }

  // Unauthorized access state
  if (isUnauthorized) {
    return (
      <div className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs">
          <div className="h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="BharatYatra Logo" className="h-10 w-auto object-contain rounded-md" />
              <span className="font-heading font-black text-slate-900 text-base tracking-tight uppercase">
                BharatYatra
              </span>
            </Link>
          </div>
        </header>

        <main className="pt-36 pb-16 px-4 max-w-xl mx-auto text-center">
          <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-sm">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">Access Restricted</h1>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              This trip&apos;s expense ledger belongs to another traveler or does not exist. For security, only verified trip members can view expense splits.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/trips"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition"
              >
                Go to My Trips
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
        {/* DATABASE ERROR BANNER */}
        {serverError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="text-xs text-rose-800 font-medium">
              <strong>Database Warning:</strong> {serverError}
            </div>
            <button
              onClick={loadTripData}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* TITLE RIBBON */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-900 font-mono text-[10px] font-bold uppercase border border-amber-300/60">
                ● LIVE CALCULATION ENGINE
              </span>
              <span className="text-xs text-slate-500 font-mono">
                • {members.length} {members.length === 1 ? 'Traveler' : 'Travelers'} Linked
              </span>
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

        {/* 💡 EASY 3-STEP GUIDE BANNER */}
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
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                1
              </span>
              <div>
                <strong className="text-slate-900 block font-bold">Add Expenses</strong>
                <span className="text-slate-500 text-[11px]">Click &quot;+ Add Expense&quot; whenever someone buys fuel, food, or stays.</span>
              </div>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                2
              </span>
              <div>
                <strong className="text-slate-900 block font-bold">Auto-Calculate Share</strong>
                <span className="text-slate-500 text-[11px]">BharatYatra automatically splits costs equally or custom per passenger.</span>
              </div>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                3
              </span>
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
            <span className="text-[10px] text-slate-400 mt-1 block">
              {summary.totalExpensesCount} {summary.totalExpensesCount === 1 ? 'recorded item' : 'recorded items'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-slate-500 block font-semibold">Travelers Group</span>
            <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
              {summary.totalMembersCount} {summary.totalMembersCount === 1 ? 'Person' : 'People'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {summary.totalMembersCount > 0 ? 'Active trip manifest' : 'No travelers added'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-slate-500 block font-semibold">Equal Share / Person</span>
            <span className="text-2xl font-black text-emerald-600 font-mono block mt-1">
              ₹{summary.averageCostPerPersonInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {summary.totalExpensesCount === 0 ? 'No shared expenses yet' : 'Exact per-head target'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-500 block font-semibold">Settlement Status</span>
            {summary.settlements.length > 0 ? (
              <Link
                href={`/trips/${tripId}/settle`}
                className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-200 flex items-center justify-between transition-colors mt-2 shadow-xs"
              >
                <span>View Debt Matrix ({summary.settlements.length})</span>
                <span>→</span>
              </Link>
            ) : (
              <div className="mt-2 flex items-center justify-between px-3.5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200">
                <span>{summary.totalExpensesCount === 0 ? 'No expenses yet' : 'All Settled Up'}</span>
                <span className="text-emerald-600">✓</span>
              </div>
            )}
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
                {summary.memberBalances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                      No group members in this trip yet. Click &quot;👥 Group Members&quot; above to add travelers.
                    </td>
                  </tr>
                ) : (
                  summary.memberBalances.map((mb) => {
                    const isPositive = mb.netBalancePaise > 0;
                    const isNegative = mb.netBalancePaise < 0;

                    return (
                      <tr key={mb.memberId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-6 font-sans font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-mono font-bold text-xs border border-slate-200">
                            {mb.memberName.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{mb.memberName}</span>
                          {members.find((m) => m.id === mb.memberId)?.role === 'OWNER' && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded font-sans font-semibold border border-amber-200">
                              Organizer
                            </span>
                          )}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* EXPENSE HISTORY LIST / EMPTY STATE */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-6 pb-4">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Expense History ({expenses.length})
            </h2>
            <button
              onClick={openAddModal}
              className="text-xs text-amber-600 hover:text-amber-700 font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <span>+ Add Expense</span>
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-2xl border border-amber-200/60">
                ₹
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No expenses recorded yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                Start tracking fuel, stays, meals, and tickets for this trip. Balances and settlement splits will calculate automatically.
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                <span>+ Add your first expense</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-200">
                      {exp.category === 'Food'
                        ? '🍽️'
                        : exp.category === 'Fuel'
                        ? '⛽'
                        : exp.category === 'Stay'
                        ? '🏨'
                        : exp.category === 'Tickets'
                        ? '🎟️'
                        : exp.category === 'Transport'
                        ? '🚗'
                        : '🧾'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{exp.title}</h4>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>
                          Paid by <strong className="text-slate-700">{getMemberName(exp.paidByMemberId)}</strong>
                        </span>
                        <span>•</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-[10px]">
                          {exp.category}
                        </span>
                        <span>•</span>
                        <span>Split across {exp.participants.length} travelers</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-black text-slate-900 text-base">
                        ₹{exp.amountInr.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        ≈ ₹{paiseToInr(Math.round(exp.amountPaise / exp.participants.length)).toLocaleString('en-IN')} / head
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewDetailExpense(exp)}
                        className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                        title="View Split Details"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setDeletingExpenseId(exp.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 text-xs transition cursor-pointer"
                        title="Delete Expense"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CATEGORY BREAKDOWN */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-wider">Category Outlay Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {summary.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">{cat.category}</span>
                <span className="text-sm font-black text-slate-900 font-mono block mt-1">
                  ₹{cat.totalAmountInr.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {cat.percentageOfTotal}% • {cat.expenseCount} {cat.expenseCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ============================================================================ */}
      {/* MODAL: ADD / EDIT EXPENSE                                                    */}
      {/* ============================================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveExpense} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Expense Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Innova Highway Fuel, Hotel Stay, Dinner"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g. 1500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                  >
                    <option value="Stay">Stay 🏨</option>
                    <option value="Food">Food 🍽️</option>
                    <option value="Fuel">Fuel ⛽</option>
                    <option value="Transport">Transport 🚗</option>
                    <option value="Tickets">Tickets 🎟️</option>
                    <option value="Activities">Activities 🎪</option>
                    <option value="Shopping">Shopping 🛍️</option>
                    <option value="Parking">Parking 🅿️</option>
                    <option value="Miscellaneous">Miscellaneous 🧾</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Paid By *</label>
                {members.length === 0 ? (
                  <p className="text-rose-600 text-[11px]">No group members available. Add a member first.</p>
                ) : (
                  <select
                    value={formPaidBy}
                    onChange={(e) => setFormPaidBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                    required
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.role === 'OWNER' ? '(Organizer)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-700 font-bold">Split With</label>
                  <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formSharedByAll}
                      onChange={(e) => {
                        setFormSharedByAll(e.target.checked);
                        if (e.target.checked) setFormSelectedMembers(members.map((m) => m.id));
                      }}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>Split equally among all {members.length} members</span>
                  </label>
                </div>

                {!formSharedByAll && (
                  <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[11px] text-slate-500 mb-2">Select travelers who share this expense:</p>
                    {members.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 text-slate-800 cursor-pointer py-0.5">
                        <input
                          type="checkbox"
                          checked={formSelectedMembers.includes(m.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormSelectedMembers([...formSelectedMembers, m.id]);
                            } else {
                              setFormSelectedMembers(formSelectedMembers.filter((id) => id !== m.id));
                            }
                          }}
                          className="rounded text-amber-500 focus:ring-amber-400"
                        />
                        <span>{m.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || members.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving to Database...' : editingExpenseId ? 'Update Expense' : '+ Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL: GROUP MEMBERS MANAGEMENT                                              */}
      {/* ============================================================================ */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Trip Group Manifest</h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">Registered Members ({members.length})</label>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  {members.map((m) => (
                    <div key={m.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs font-mono">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {m.role === 'OWNER' ? 'Trip Organizer' : 'Member'} {m.phone ? `• ${m.phone}` : ''}
                          </span>
                        </div>
                      </div>

                      {m.role !== 'OWNER' && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold p-1 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Remove Member"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddMember} className="pt-4 border-t border-slate-100 space-y-3">
                <label className="block text-slate-700 font-bold">+ Add New Companion</label>
                <input
                  type="text"
                  placeholder="Full Name (e.g. Sneha Patel)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone number (optional)"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                />
                <input
                  type="text"
                  placeholder="UPI ID for settlements (optional, e.g. name@okhdfcbank)"
                  value={newMemberUpi}
                  onChange={(e) => setNewMemberUpi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newMemberName.trim()}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Adding...' : 'Add Traveler to Trip'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL: VIEW EXPENSE DETAIL                                                   */}
      {/* ============================================================================ */}
      {viewDetailExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Expense Split Breakdown</h3>
              <button
                onClick={() => setViewDetailExpense(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Expense:</span>
                <span className="font-bold text-slate-900 text-sm">{viewDetailExpense.title}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-black text-slate-900 font-mono text-base">
                  ₹{viewDetailExpense.amountInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Paid by:</span>
                <span className="font-bold text-amber-700">{getMemberName(viewDetailExpense.paidByMemberId)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-700">{viewDetailExpense.category}</span>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="block text-slate-700 font-bold mb-2">Participant Allocations</span>
                <div className="space-y-1.5 divide-y divide-slate-100">
                  {viewDetailExpense.participants.map((p) => (
                    <div key={p.memberId} className="flex justify-between py-1 font-mono">
                      <span className="text-slate-700">{getMemberName(p.memberId)}</span>
                      <span className="font-bold text-slate-900">₹{p.shareAmountInr.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewDetailExpense(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL: DELETE CONFIRMATION                                                   */}
      {/* ============================================================================ */}
      {deletingExpenseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl relative text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Expense?</h3>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to remove this expense from the database? Net balances and settlement debt matrices will recalculate.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setDeletingExpenseId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExpense}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer"
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
