'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GroupMember,
  TripExpenseItem,
  SettlementSuggestion,
  computeFullTripExpenseSummary,
  TripExpenseSummary,
} from '@/lib/trips/group-expense-engine';

export default function TripSettlementPage({ params }: { params?: { id?: string } } = {}) {
  const router = useRouter();
  const tripId = params?.id || '1';

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<TripExpenseItem[]>([]);
  const [settlementStatuses, setSettlementStatuses] = useState<
    Record<string, { status: 'SETTLED' | 'PENDING'; refCode?: string }>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Active modal for UPI Payment confirmation
  const [activeUpiModal, setActiveUpiModal] = useState<SettlementSuggestion | null>(null);
  const [upiRefInput, setUpiRefInput] = useState('');
  const [isSavingSettlement, setIsSavingSettlement] = useState(false);

  // Fetch real trip members, expenses & settlements
  const loadTripData = useCallback(async () => {
    setIsLoading(true);
    setServerError(null);
    setIsUnauthorized(false);

    try {
      const res = await fetch(`/api/v1/trips/${tripId}/expenses`);
      if (res.status === 401 || res.status === 403 || res.status === 404) {
        setIsUnauthorized(true);
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setServerError(errJson.error || 'Failed to fetch trip data.');
        setIsLoading(false);
        return;
      }

      const resData = await res.json();
      if (resData.success && resData.data) {
        setMembers(resData.data.members || []);
        setExpenses(resData.data.expenses || []);

        const statusMap: Record<string, { status: 'SETTLED' | 'PENDING'; refCode?: string }> = {};
        if (Array.isArray(resData.data.settlements)) {
          resData.data.settlements.forEach((s: any) => {
            const key = `${s.fromMemberId}->${s.toMemberId}`;
            statusMap[key] = {
              status: s.status,
              refCode: s.refCode,
            };
          });
        }
        setSettlementStatuses(statusMap);
      }
    } catch (err: any) {
      setServerError(err?.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadTripData();
  }, [loadTripData]);

  // Convert existing settlement statuses for summary calculation
  const existingSettlements: SettlementSuggestion[] = useMemo(() => {
    return Object.entries(settlementStatuses).map(([key, val]) => {
      const [fromMemberId, toMemberId] = key.split('->');
      return {
        id: key,
        fromMemberId,
        fromMemberName: '',
        toMemberId,
        toMemberName: '',
        amountInr: 0,
        amountPaise: 0,
        status: val.status,
        refCode: val.refCode,
      };
    });
  }, [settlementStatuses]);

  const summary: TripExpenseSummary = useMemo(() => {
    return computeFullTripExpenseSummary(members, expenses, existingSettlements);
  }, [members, expenses, existingSettlements]);

  // Persist settlement state to backend database
  const persistSettlement = async (
    fromMemberId: string,
    toMemberId: string,
    amountInr: number,
    status: 'SETTLED' | 'PENDING',
    refCode?: string
  ) => {
    const fromM = members.find((m) => m.id === fromMemberId);
    const toM = members.find((m) => m.id === toMemberId);

    try {
      const res = await fetch(`/api/v1/trips/${tripId}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromMemberId,
          fromMemberName: fromM?.name || 'Traveler',
          toMemberId,
          toMemberName: toM?.name || 'Traveler',
          amountInr,
          status,
          refCode,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.error || 'Failed to persist settlement status.');
        return false;
      }
      return true;
    } catch (e: any) {
      alert(e.message || 'Error updating settlement.');
      return false;
    }
  };

  // Toggle or mark settlement as paid
  const toggleMarkPaid = async (s: SettlementSuggestion) => {
    const key = `${s.fromMemberId}->${s.toMemberId}`;
    const current = settlementStatuses[key]?.status || 'PENDING';
    const nextStatus: 'SETTLED' | 'PENDING' = current === 'SETTLED' ? 'PENDING' : 'SETTLED';
    const refCode = nextStatus === 'SETTLED' ? `TXN-BY-${Math.floor(1000 + Math.random() * 9000)}` : undefined;

    const ok = await persistSettlement(s.fromMemberId, s.toMemberId, s.amountInr, nextStatus, refCode);
    if (ok) {
      setSettlementStatuses((prev) => ({
        ...prev,
        [key]: {
          status: nextStatus,
          refCode,
        },
      }));
    }
  };

  // Confirm UPI payment modal
  const handleConfirmUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUpiModal) return;

    setIsSavingSettlement(true);
    const key = `${activeUpiModal.fromMemberId}->${activeUpiModal.toMemberId}`;
    const refCode = upiRefInput.trim() || `TXN-BY-UPI-${Math.floor(1000 + Math.random() * 9000)}`;

    const ok = await persistSettlement(
      activeUpiModal.fromMemberId,
      activeUpiModal.toMemberId,
      activeUpiModal.amountInr,
      'SETTLED',
      refCode
    );

    if (ok) {
      setSettlementStatuses((prev) => ({
        ...prev,
        [key]: {
          status: 'SETTLED',
          refCode,
        },
      }));
      setActiveUpiModal(null);
      setUpiRefInput('');
    }
    setIsSavingSettlement(false);
  };

  const currentUserMember = members.find((m) => m.isCurrentUser) || members[0];
  const currentUserBalance =
    summary.memberBalances.find((b) => b.memberId === currentUserMember?.id) || summary.memberBalances[0];

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
                  SETTLEMENT OPTIMIZER ENGINE
                </span>
              </div>
            </Link>
          </div>
        </header>

        <main className="pt-36 pb-16 px-4 max-w-7xl mx-auto text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800">Calculating Settlement Balances...</h2>
          <p className="text-xs text-slate-500 mt-1">Solving minimal cash flow matrix.</p>
        </main>
      </div>
    );
  }

  // Unauthorized state
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
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">Access Restricted</h1>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              This trip settlement ledger belongs to another traveler or does not exist.
            </p>
            <Link
              href="/trips"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition"
            >
              Go to My Trips
            </Link>
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
                SETTLEMENT OPTIMIZER ENGINE
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
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Group Splitter
            </Link>
            <Link
              href={`/trips/${tripId}/settle`}
              className="px-3.5 py-1.5 bg-amber-400 text-slate-950 font-extrabold rounded-lg shadow-xs"
            >
              Final Settlement
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        {serverError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 font-medium">
            <strong>Warning:</strong> {serverError}
          </div>
        )}

        {/* HEADER HERO */}
        <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold uppercase border border-emerald-200">
                ● MIN-CASH-FLOW ALGORITHM
              </span>
              <span className="text-xs text-slate-500 font-mono">
                • {summary.settlements.length} Optimal Transactions
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Final Group <span className="text-amber-600">Settlement</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Minimal transaction matrix resolving all inter-traveler debt with zero residual drift.
            </p>
          </div>

          <Link
            href={`/trips/${tripId}/expenses`}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <span>← Back to Group Splitter</span>
          </Link>
        </div>

        {/* PERSONAL INSIGHT CARD */}
        {currentUserBalance && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                Your Personal Ledger Position ({currentUserBalance.memberName})
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-3xl font-mono font-black ${
                    currentUserBalance.netBalancePaise > 0
                      ? 'text-emerald-600'
                      : currentUserBalance.netBalancePaise < 0
                      ? 'text-rose-600'
                      : 'text-slate-900'
                  }`}
                >
                  {currentUserBalance.netBalancePaise > 0 ? '+' : ''}₹{currentUserBalance.netBalanceInr.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentUserBalance.netBalancePaise > 0
                    ? 'Total you should receive'
                    : currentUserBalance.netBalancePaise < 0
                    ? 'Total you need to pay'
                    : 'All settled up! Zero balance'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block uppercase">Paid Out</span>
                <strong className="text-slate-900">₹{currentUserBalance.totalPaidInr.toLocaleString('en-IN')}</strong>
              </div>
              <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block uppercase">Your Share</span>
                <strong className="text-slate-900">₹{currentUserBalance.totalShareInr.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        )}

        {/* SETTLEMENT SUGGESTIONS LIST */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Optimal Settlement Transactions ({summary.settlements.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">Minimizes bank transfers</span>
          </div>

          {summary.settlements.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl border border-emerald-200">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {expenses.length === 0 ? 'No expenses recorded yet' : 'All Settled Up!'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                {expenses.length === 0
                  ? 'There are no expenses in this trip yet. Add expenses in the Group Splitter to compute debts and settlements.'
                  : 'Every traveler has settled their balance. Zero outstanding transfers required for this trip.'}
              </p>
              {expenses.length === 0 && (
                <Link
                  href={`/trips/${tripId}/expenses`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  Go to Group Splitter
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {summary.settlements.map((s) => {
                const isSettled = s.status === 'SETTLED';

                return (
                  <div
                    key={s.id}
                    className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isSettled ? 'bg-slate-50/60 opacity-80' : 'hover:bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isSettled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isSettled ? '✓' : '⇄'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-slate-900 font-bold">{s.fromMemberName}</strong>
                          <span className="text-slate-400">pays</span>
                          <strong className="text-slate-900 font-bold">{s.toMemberName}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {isSettled ? (
                            <span className="text-emerald-700 font-mono font-bold">
                              Settled • Ref: {s.refCode || 'Confirmed'}
                            </span>
                          ) : (
                            <span>Pending confirmation</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-lg font-black font-mono text-slate-900">
                        ₹{s.amountInr.toLocaleString('en-IN')}
                      </span>

                      {!isSettled ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveUpiModal(s);
                              setUpiRefInput('');
                            }}
                            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Pay UPI</span>
                          </button>
                          <button
                            onClick={() => toggleMarkPaid(s)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleMarkPaid(s)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-xl transition cursor-pointer"
                        >
                          Mark Pending
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ============================================================================ */}
      {/* MODAL: UPI PAYMENT VERIFICATION                                              */}
      {/* ============================================================================ */}
      {activeUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">UPI Settlement Confirmation</h3>
              <button
                onClick={() => setActiveUpiModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-slate-800 text-center">
                <span className="text-[11px] text-amber-800 font-bold block mb-0.5">Transfer Amount</span>
                <span className="text-2xl font-black font-mono text-slate-900">
                  ₹{activeUpiModal.amountInr.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-600 block mt-1">
                  From <strong>{activeUpiModal.fromMemberName}</strong> to <strong>{activeUpiModal.toMemberName}</strong>
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  UPI / Bank Transaction Ref (UTR / Ref Code)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 429182910482 or TXN-1029"
                  value={upiRefInput}
                  onChange={(e) => setUpiRefInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Provide your UPI transaction reference to verify and mark this settlement complete.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveUpiModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingSettlement}
                onClick={handleConfirmUpi}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSavingSettlement ? 'Saving...' : 'Confirm Settlement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
