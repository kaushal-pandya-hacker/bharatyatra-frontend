'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Users,
  Plus,
  ArrowRight,
  Check,
  CreditCard,
  Receipt,
  Trash2,
  Eye,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  AlertCircle,
  Headset,
} from 'lucide-react';
import { useNexi } from '@/lib/nexi/nexi-context';
import {
  GroupMember,
  TripExpenseItem,
  ExpenseCategory,
  SplitType,
  computeFullTripExpenseSummary,
  TripExpenseSummary,
  paiseToInr,
} from '@/lib/trips/group-expense-engine';

const CATEGORY_META: Record<ExpenseCategory, { icon: string; label: string }> = {
  Stay: { icon: '🏨', label: 'Stay' },
  Food: { icon: '🍽️', label: 'Food' },
  Transport: { icon: '🚗', label: 'Transport' },
  Fuel: { icon: '⛽', label: 'Fuel' },
  Tickets: { icon: '🎟️', label: 'Tickets' },
  Activities: { icon: '🎪', label: 'Activities' },
  Shopping: { icon: '🛍️', label: 'Shopping' },
  Parking: { icon: '🅿️', label: 'Parking' },
  Miscellaneous: { icon: '🧾', label: 'Misc' },
};

export default function GroupExpensesPage({ params }: { params?: { id?: string } } = {}) {
  const router = useRouter();
  const tripId = params?.id || '1';

  // Real data state (ZERO hardcoded demo values)
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<TripExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Mobile navigation drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isOpen: isNexiOpen, toggleNexi, openNexi } = useNexi();

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

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setShowMemberModal(false);
        setShowAddModal(false);
        setViewDetailExpense(null);
        setDeletingExpenseId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    setMobileMenuOpen(false);
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
    setMobileMenuOpen(false);
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
          <div className="h-16 sm:h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
              <img src="/logo.png" alt="BharatYatra Logo" className="h-8 sm:h-10 w-auto object-contain rounded-md" />
              <div className="flex flex-col leading-tight">
                <span className="font-heading font-black text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                  BharatYatra
                </span>
                <span className="text-[9px] sm:text-[10px] text-amber-600 font-mono font-bold tracking-wider">
                  GROUP EXPENSE SPLIT ENGINE
                </span>
              </div>
            </Link>
          </div>
        </header>

        <main className="pt-32 pb-16 px-4 max-w-7xl mx-auto text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-base sm:text-lg font-bold text-slate-800">Loading Trip Expense Ledger...</h2>
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
          <div className="h-16 sm:h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
              <img src="/logo.png" alt="BharatYatra Logo" className="h-8 sm:h-10 w-auto object-contain rounded-md" />
              <span className="font-heading font-black text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                BharatYatra
              </span>
            </Link>
          </div>
        </header>

        <main className="pt-32 pb-16 px-4 max-w-xl mx-auto text-center">
          <div className="bg-white rounded-2xl border border-rose-200 p-6 sm:p-8 shadow-sm">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">Access Restricted</h1>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              This trip&apos;s expense ledger belongs to another traveler or does not exist. For security, only verified trip members can view expense splits.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/trips"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs"
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
    <div className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col">
      {/* ============================================================================ */}
      {/* 2. RESPONSIVE HEADER                                                         */}
      {/* ============================================================================ */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs">
        <div className="h-16 sm:h-20 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
            <img
              src="/logo.png"
              alt="BharatYatra Logo"
              className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 rounded-md shrink-0"
            />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-heading font-black text-slate-900 text-sm sm:text-base tracking-tight uppercase group-hover:text-amber-600 transition-colors truncate">
                BharatYatra
              </span>
              <span className="text-[9px] sm:text-[10px] text-amber-600 font-mono font-bold tracking-wider truncate hidden xs:inline">
                GROUP EXPENSE SPLIT ENGINE
              </span>
            </div>
          </Link>

          {/* Tablet & Desktop Navigation (>= 768px) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-xs font-semibold shrink-0">
            <Link
              href={`/trips/${tripId}`}
              className="px-2.5 lg:px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Command Center
            </Link>
            <Link
              href={`/trips/${tripId}/expenses`}
              className="px-3 lg:px-3.5 py-1.5 bg-amber-400 text-slate-950 font-extrabold rounded-lg shadow-xs whitespace-nowrap"
            >
              Group Splitter
            </Link>
            <Link
              href={`/trips/${tripId}/settle`}
              className="px-2.5 lg:px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Final Settlement
            </Link>
            <button
              type="button"
              onClick={toggleNexi}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap border cursor-pointer ${
                isNexiOpen
                  ? 'bg-amber-500/15 text-amber-950 border-amber-400 font-extrabold shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              }`}
              aria-label="Open NEXI AI Travel Help"
              aria-expanded={isNexiOpen}
            >
              <Headset className={`w-3.5 h-3.5 ${isNexiOpen ? 'text-amber-600 stroke-[2.5px]' : 'text-slate-500'}`} />
              <span>Help</span>
            </button>
          </nav>

          {/* Mobile Actions: Add Expense CTA + Hamburger Button (< 768px) */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={openAddModal}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer min-h-[38px]"
              aria-label="Add Expense"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-[11px] font-black">Add</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Dropdown (< 768px) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3.5 space-y-2.5 shadow-xl animate-in slide-in-from-top duration-200">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider px-1">
              Trip Navigation
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <Link
                href={`/trips/${tripId}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors border border-slate-100"
              >
                <span>Command Center</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href={`/trips/${tripId}/expenses`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-xs"
              >
                <span>Group Splitter (Active)</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </Link>
              <Link
                href={`/trips/${tripId}/settle`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors border border-slate-100"
              >
                <span>Final Settlement</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  openNexi();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800 text-xs font-bold transition-colors border border-slate-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Headset className="w-4 h-4 text-amber-600" />
                  <span>Help & NEXI Assistant</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowMemberModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[42px]"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Members ({members.length})</span>
              </button>
              <button
                onClick={openAddModal}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer min-h-[42px]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Add Expense</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================================ */}
      {/* MAIN LAYOUT CONTAINER                                                        */}
      {/* ============================================================================ */}
      <main className="flex-1 pt-20 sm:pt-24 lg:pt-28 pb-16 px-3.5 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
        {/* DATABASE ERROR BANNER */}
        {serverError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-rose-800 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Database Warning:</strong> {serverError}
              </div>
            </div>
            <button
              onClick={loadTripData}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer self-start sm:self-auto min-h-[36px]"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* ============================================================================ */}
        {/* 3. DASHBOARD HEADING & ACTIONS                                               */}
        {/* ============================================================================ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 sm:pb-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-900 font-mono text-[10px] font-bold uppercase border border-amber-300/60 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                LIVE CALCULATION ENGINE
              </span>
              <span className="text-xs text-slate-500 font-mono">
                • {members.length} {members.length === 1 ? 'Traveler' : 'Travelers'} Linked
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Group Expense <span className="text-amber-600">Split &amp; Wallet</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Multi-payer expense ledger with deterministic minor unit rounding and instant balance reconciliation.
            </p>
          </div>

          {/* Action buttons (full-width 2-column grid on mobile, flex on desktop) */}
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-3 shrink-0 pt-1 md:pt-0">
            <button
              onClick={() => setShowMemberModal(true)}
              className="w-full sm:w-auto px-3.5 sm:px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Users className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="truncate">Group Members ({members.length})</span>
            </button>

            <button
              onClick={openAddModal}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400/80 min-h-[44px]"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>

        {/* ============================================================================ */}
        {/* 4. INSTRUCTION CARDS (3-STEP GUIDE)                                          */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 text-xs shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-extrabold text-slate-900 font-mono flex items-center gap-2 uppercase tracking-wide text-xs sm:text-sm">
              <span>💡</span> How Group Expense Splitter Works
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              REAL-TIME BALANCING
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="bg-slate-50/80 hover:bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/70 flex items-start gap-3 transition-colors h-full">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs mt-0.5">
                1
              </span>
              <div className="min-w-0">
                <strong className="text-slate-900 block font-bold text-xs sm:text-sm">Add Expenses</strong>
                <span className="text-slate-500 text-[11px] sm:text-xs leading-normal block mt-0.5">
                  Click &quot;+ Add Expense&quot; whenever someone buys fuel, food, or stays.
                </span>
              </div>
            </div>

            <div className="bg-slate-50/80 hover:bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/70 flex items-start gap-3 transition-colors h-full">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs mt-0.5">
                2
              </span>
              <div className="min-w-0">
                <strong className="text-slate-900 block font-bold text-xs sm:text-sm">Auto-Calculate Share</strong>
                <span className="text-slate-500 text-[11px] sm:text-xs leading-normal block mt-0.5">
                  BharatYatra automatically splits costs equally or custom per passenger.
                </span>
              </div>
            </div>

            <div className="bg-slate-50/80 hover:bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/70 flex items-start gap-3 transition-colors h-full">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs mt-0.5">
                3
              </span>
              <div className="min-w-0">
                <strong className="text-slate-900 block font-bold text-xs sm:text-sm">Instant UPI Settlement</strong>
                <span className="text-slate-500 text-[11px] sm:text-xs leading-normal block mt-0.5">
                  Go to &quot;Final Settlement&quot; tab to clear balances with 1-click Google Pay/UPI.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================================ */}
        {/* 5. SUMMARY CARDS                                                             */}
        {/* ============================================================================ */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                Total Trip Expenses
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono block mt-1 tracking-tight truncate">
                ₹{summary.totalTripCostInr.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-2 block truncate">
              {summary.totalExpensesCount} {summary.totalExpensesCount === 1 ? 'recorded item' : 'recorded items'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                Travelers Group
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono block mt-1 tracking-tight truncate">
                {summary.totalMembersCount} {summary.totalMembersCount === 1 ? 'Person' : 'People'}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-2 block truncate">
              {summary.totalMembersCount > 0 ? 'Active trip manifest' : 'No travelers added'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                Equal Share / Person
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono block mt-1 tracking-tight truncate">
                ₹{summary.averageCostPerPersonInr.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-2 block truncate">
              {summary.totalExpensesCount === 0 ? 'No shared expenses yet' : 'Exact per-head target'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                Settlement Status
              </span>
              {summary.settlements.length > 0 ? (
                <Link
                  href={`/trips/${tripId}/settle`}
                  className="px-3 py-2 sm:px-3.5 sm:py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-200 flex items-center justify-between transition-colors mt-2 shadow-xs min-h-[40px]"
                >
                  <span className="truncate">View Debt Matrix ({summary.settlements.length})</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-1" />
                </Link>
              ) : (
                <div className="mt-2 flex items-center justify-between px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 min-h-[40px]">
                  <span className="truncate">{summary.totalExpensesCount === 0 ? 'No expenses yet' : 'All Settled Up'}</span>
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                </div>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-2 block truncate">
              {summary.settlements.length > 0 ? 'Pending settlements exist' : 'Zero outstanding balance'}
            </span>
          </div>
        </div>

        {/* ============================================================================ */}
        {/* 6. MEMBER OUTLAY TABLE (RESPONSIVE TABLE + MOBILE CARDS)                     */}
        {/* ============================================================================ */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-6 pb-3 sm:pb-4 gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Member Outlay &amp; Net Balances</span>
            </h2>
            <span className="text-[10px] sm:text-xs text-slate-500 font-mono shrink-0">Paid vs Actual Share</span>
          </div>

          {/* DESKTOP & TABLET VIEW: Full Financial Table (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
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
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-mono font-bold text-xs border border-slate-200 shrink-0">
                            {mb.memberName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[180px]">{mb.memberName}</span>
                          {members.find((m) => m.id === mb.memberId)?.role === 'OWNER' && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded font-sans font-semibold border border-amber-200 shrink-0">
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
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
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

          {/* MOBILE VIEW: Dedicated Responsive Financial Cards (< 768px) */}
          <div className="block md:hidden divide-y divide-slate-100 p-3 sm:p-4">
            {summary.memberBalances.length === 0 ? (
              <div className="py-6 text-center text-slate-400 font-sans text-xs">
                No group members in this trip yet. Tap &quot;Group Members&quot; above to add travelers.
              </div>
            ) : (
              summary.memberBalances.map((mb) => {
                const isPositive = mb.netBalancePaise > 0;
                const isNegative = mb.netBalancePaise < 0;

                return (
                  <div key={mb.memberId} className="py-3 first:pt-1 last:pb-1 space-y-2.5">
                    {/* Top Row: Avatar + Name + Status Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-mono font-bold text-xs border border-slate-200 shrink-0">
                          {mb.memberName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {mb.memberName}
                        </span>
                        {members.find((m) => m.id === mb.memberId)?.role === 'OWNER' && (
                          <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-semibold border border-amber-200 shrink-0">
                            Organizer
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono shrink-0 ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isNegative
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isPositive ? 'Gets Back' : isNegative ? 'Owes' : 'Settled'}
                      </span>
                    </div>

                    {/* Bottom Metric Strip (Paid, Share, Net Balance) */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 font-mono text-center">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Paid</span>
                        <span className="text-xs font-bold text-slate-800">
                          ₹{mb.totalPaidInr.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="border-x border-slate-200/70">
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Share</span>
                        <span className="text-xs font-bold text-slate-800">
                          ₹{mb.totalShareInr.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Net Balance</span>
                        <span
                          className={`text-xs font-black ${
                            isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-500'
                          }`}
                        >
                          {isPositive ? '+' : ''}₹{mb.netBalanceInr.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ============================================================================ */}
        {/* 7. EXPENSE HISTORY (COMPACT EMPTY STATE & RESPONSIVE CARDS)                  */}
        {/* ============================================================================ */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-6 pb-3 sm:pb-4 gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Expense History ({expenses.length})</span>
            </h2>
            <button
              onClick={openAddModal}
              className="text-xs text-amber-600 hover:text-amber-700 font-bold transition flex items-center gap-1 cursor-pointer min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Expense</span>
            </button>
          </div>

          {expenses.length === 0 ? (
            /* COMPACT REFINED EMPTY STATE */
            <div className="py-7 px-4 sm:py-9 sm:px-6 text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto mb-3 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-200/60 shadow-xs">
                ₹
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">No expenses recorded yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
                Start tracking fuel, stays, meals, and tickets for this trip. Balances and settlement splits will calculate automatically.
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer min-h-[44px]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Add your first expense</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 sm:p-4 lg:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                >
                  {/* Left: Category Icon + Description + Meta */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-200 mt-0.5">
                      {CATEGORY_META[exp.category]?.icon || '🧾'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{exp.title}</h4>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
                        <span className="truncate">
                          Paid by <strong className="text-slate-700">{getMemberName(exp.paidByMemberId)}</strong>
                        </span>
                        <span>•</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-[10px] shrink-0">
                          {exp.category}
                        </span>
                        <span>•</span>
                        <span className="shrink-0">{exp.participants.length} sharing</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount + Per-head + Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-transparent">
                    <div className="text-left sm:text-right">
                      <span className="font-mono font-black text-slate-900 text-sm sm:text-base block">
                        ₹{exp.amountInr.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        ≈ ₹{paiseToInr(Math.round(exp.amountPaise / exp.participants.length)).toLocaleString('en-IN')} / head
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setViewDetailExpense(exp)}
                        className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer min-h-[38px] flex items-center gap-1"
                        title="View Split Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Details</span>
                      </button>
                      <button
                        onClick={() => setDeletingExpenseId(exp.id)}
                        className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                        title="Delete Expense"
                        aria-label={`Delete ${exp.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ============================================================================ */}
        {/* 8. CATEGORY OUTLAY BREAKDOWN                                                 */}
        {/* ============================================================================ */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Category Outlay Breakdown</span>
            </h3>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">9 Categories</span>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3">
            {summary.categoryBreakdown.map((cat) => {
              const meta = CATEGORY_META[cat.category] || { icon: '🧾', label: cat.category };
              const fillPct = Math.min(100, Math.max(0, cat.percentageOfTotal));

              return (
                <div
                  key={cat.category}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-mono uppercase text-slate-600 font-bold truncate flex items-center gap-1.5">
                        <span>{meta.icon}</span>
                        <span>{cat.category}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {cat.percentageOfTotal}%
                      </span>
                    </div>

                    <span className="text-sm sm:text-base font-black text-slate-900 font-mono block mt-1 tracking-tight truncate">
                      ₹{cat.totalAmountInr.toLocaleString('en-IN')}
                    </span>

                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {cat.expenseCount} {cat.expenseCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ============================================================================ */}
      {/* 11. MODAL: ADD / EDIT EXPENSE                                                */}
      {/* ============================================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3.5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveExpense} className="space-y-3.5 sm:space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Expense Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Innova Highway Fuel, Hotel Stay, Dinner"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium text-xs sm:text-sm min-h-[44px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g. 1500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono font-bold text-xs sm:text-sm min-h-[44px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium text-xs sm:text-sm min-h-[44px]"
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
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium text-xs sm:text-sm min-h-[44px]"
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
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="text-slate-700 font-bold">Split With</label>
                  <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer text-[11px] sm:text-xs">
                    <input
                      type="checkbox"
                      checked={formSharedByAll}
                      onChange={(e) => {
                        setFormSharedByAll(e.target.checked);
                        if (e.target.checked) setFormSelectedMembers(members.map((m) => m.id));
                      }}
                      className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                    />
                    <span>Split equally among all {members.length} members</span>
                  </label>
                </div>

                {!formSharedByAll && (
                  <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                    <p className="text-[11px] text-slate-500 mb-2">Select travelers who share this expense:</p>
                    {members.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 text-slate-800 cursor-pointer py-1 min-h-[32px]">
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
                          className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                        />
                        <span className="text-xs sm:text-sm font-medium">{m.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || members.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-xs transition disabled:opacity-50 cursor-pointer min-h-[44px]"
                >
                  {isSubmitting ? 'Saving to Database...' : editingExpenseId ? 'Update Expense' : '+ Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 12. MODAL: GROUP MEMBERS MANAGEMENT                                          */}
      {/* ============================================================================ */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-4 sm:p-6 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Trip Group Manifest</h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">Registered Members ({members.length})</label>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  {members.map((m) => (
                    <div key={m.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">
                            {m.role === 'OWNER' ? 'Trip Organizer' : 'Member'} {m.phone ? `• ${m.phone}` : ''}
                          </span>
                        </div>
                      </div>

                      {m.role !== 'OWNER' && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold px-2 py-1 hover:bg-rose-50 rounded transition cursor-pointer shrink-0 min-h-[36px]"
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
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium text-xs sm:text-sm min-h-[44px]"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone number (optional)"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium text-xs sm:text-sm min-h-[44px]"
                />
                <input
                  type="text"
                  placeholder="UPI ID for settlements (optional, e.g. name@okhdfcbank)"
                  value={newMemberUpi}
                  onChange={(e) => setNewMemberUpi(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium text-xs sm:text-sm min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newMemberName.trim()}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer min-h-[44px]"
                >
                  {isSubmitting ? 'Adding...' : 'Add Traveler to Trip'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 13. MODAL: VIEW EXPENSE DETAIL                                               */}
      {/* ============================================================================ */}
      {viewDetailExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-4 sm:p-6 shadow-2xl relative text-xs max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Expense Split Breakdown</h3>
              <button
                onClick={() => setViewDetailExpense(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500">Expense:</span>
                <span className="font-bold text-slate-900 text-sm text-right">{viewDetailExpense.title}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-black text-slate-900 font-mono text-base">
                  ₹{viewDetailExpense.amountInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500">Paid by:</span>
                <span className="font-bold text-amber-700">{getMemberName(viewDetailExpense.paidByMemberId)}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-700">{viewDetailExpense.category}</span>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="block text-slate-700 font-bold mb-2">Participant Allocations</span>
                <div className="space-y-1.5 divide-y divide-slate-100">
                  {viewDetailExpense.participants.map((p) => (
                    <div key={p.memberId} className="flex justify-between items-center py-1 font-mono">
                      <span className="text-slate-700 truncate">{getMemberName(p.memberId)}</span>
                      <span className="font-bold text-slate-900 shrink-0">₹{p.shareAmountInr.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewDetailExpense(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition cursor-pointer min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 14. MODAL: DELETE CONFIRMATION                                               */}
      {/* ============================================================================ */}
      {deletingExpenseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-5 sm:p-6 shadow-2xl relative text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Expense?</h3>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to remove this expense from the database? Net balances and settlement debt matrices will recalculate.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setDeletingExpenseId(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExpense}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer min-h-[44px]"
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
