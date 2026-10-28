'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GroupMember,
  TripExpenseItem,
  SettlementSuggestion,
  computeFullTripExpenseSummary,
  TripExpenseSummary,
  createTripExpense,
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

export default function TripSettlementPage({ params }: { params?: { id?: string } } = {}) {
  const router = useRouter();
  const tripId = params?.id || '1';

  const [members, setMembers] = useState<GroupMember[]>(DEFAULT_MEMBERS);
  const [expenses, setExpenses] = useState<TripExpenseItem[]>(DEFAULT_EXPENSES);

  // Settlement persistence state: tracks which suggestions are confirmed as paid
  const [settlementStatuses, setSettlementStatuses] = useState<Record<string, { status: 'SETTLED' | 'PENDING'; refCode?: string }>>({});

  // Active modal for UPI Payment simulation
  const [activeUpiModal, setActiveUpiModal] = useState<SettlementSuggestion | null>(null);
  const [upiRefInput, setUpiRefInput] = useState('');

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem(`cf_members_${tripId}`);
      const savedExp = localStorage.getItem(`cf_expenses_${tripId}`);
      const savedStatus = localStorage.getItem(`cf_settlement_status_${tripId}`);

      if (savedMembers) setMembers(JSON.parse(savedMembers));
      if (savedExp) setExpenses(JSON.parse(savedExp));
      if (savedStatus) setSettlementStatuses(JSON.parse(savedStatus));
    } catch {}
  }, [tripId]);

  // Save settlement status updates
  const updateSettlementState = (updated: Record<string, { status: 'SETTLED' | 'PENDING'; refCode?: string }>) => {
    setSettlementStatuses(updated);
    try {
      localStorage.setItem(`cf_settlement_status_${tripId}`, JSON.stringify(updated));
    } catch {}
  };

  // Convert existing settlement statuses for summary calculation
  const existingSettlements: SettlementSuggestion[] = Object.entries(settlementStatuses).map(([key, val]) => {
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

  const summary: TripExpenseSummary = computeFullTripExpenseSummary(members, expenses, existingSettlements);

  // Toggle or mark settlement as paid
  const toggleMarkPaid = (s: SettlementSuggestion) => {
    const key = `${s.fromMemberId}->${s.toMemberId}`;
    const current = settlementStatuses[key]?.status || 'PENDING';
    const nextStatus: 'SETTLED' | 'PENDING' = current === 'SETTLED' ? 'PENDING' : 'SETTLED';

    const updated: Record<string, { status: 'SETTLED' | 'PENDING'; refCode?: string }> = {
      ...settlementStatuses,
      [key]: {
        status: nextStatus,
        refCode: nextStatus === 'SETTLED' ? `TXN-BY-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      },
    };
    updateSettlementState(updated);
  };

  // Confirm UPI payment modal
  const handleConfirmUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUpiModal) return;
    const key = `${activeUpiModal.fromMemberId}->${activeUpiModal.toMemberId}`;
    const updated = {
      ...settlementStatuses,
      [key]: {
        status: 'SETTLED' as const,
        refCode: upiRefInput || `TXN-BY-UPI-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    };
    updateSettlementState(updated);
    setActiveUpiModal(null);
    setUpiRefInput('');
  };

  const currentUserMember = members.find((m) => m.isCurrentUser) || members[0];
  const currentUserBalance = summary.memberBalances.find((b) => b.memberId === currentUserMember?.id) || summary.memberBalances[0];

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

      {/* MAIN CONTENT */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* TITLE RIBBON */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold uppercase border border-emerald-200">
                ● MINIMUM CASH-FLOW OPTIMIZER
              </span>
              <span className="text-xs text-slate-500 font-mono">• {summary.settlements.length} Transfers Required</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Final Trip <span className="text-amber-600">Settlement Matrix</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automatically matches group creditors and debtors to settle all group debts with the fewest possible transactions.
            </p>
          </div>

          <Link
            href={`/trips/${tripId}/expenses`}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all self-start md:self-auto cursor-pointer"
          >
            ← Back to Group Splitter
          </Link>
        </div>

        {/* PERSONAL INSIGHT CARD */}
        {currentUserBalance && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-mono uppercase font-semibold">Your Personal Trip Insight</span>
              <h3 className="text-lg font-bold text-slate-900">
                You ({currentUserBalance.memberName}) Paid ₹{currentUserBalance.totalPaidInr.toLocaleString('en-IN')} • Your Share: ₹
                {currentUserBalance.totalShareInr.toLocaleString('en-IN')}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {currentUserBalance.netBalancePaise > 0 ? (
                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-mono font-bold">
                  You Should Receive ₹{currentUserBalance.netBalanceInr.toLocaleString('en-IN')}
                </div>
              ) : currentUserBalance.netBalancePaise < 0 ? (
                <div className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs font-mono font-bold">
                  You Owe ₹{Math.abs(currentUserBalance.netBalanceInr).toLocaleString('en-IN')}
                </div>
              ) : (
                <div className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-mono font-bold">
                  ✓ Your Account is Fully Settled
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTLEMENT SUGGESTIONS LIST */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Optimal Settlement Suggestions ({summary.settlements.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">Min-Cash Flow Engine</span>
          </div>

          {summary.settlements.length > 0 ? (
            <div className="space-y-4">
              {summary.settlements.map((s, idx) => {
                const key = `${s.fromMemberId}->${s.toMemberId}`;
                const saved = settlementStatuses[key];
                const isSettled = saved?.status === 'SETTLED';

                return (
                  <div
                    key={s.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSettled ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 hover:border-amber-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-mono font-bold text-sm border border-slate-200 shrink-0">
                        0{idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <span className="text-rose-600">{s.fromMemberName}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-700">{s.toMemberName}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Transfer amount: <strong className="text-slate-900 font-mono">₹{s.amountInr.toLocaleString('en-IN')}</strong>
                          {saved?.refCode && (
                            <span className="ml-2 font-mono text-[10px] text-slate-500">
                              Ref: {saved.refCode}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-xl font-black text-slate-900 font-mono">
                        ₹{s.amountInr.toLocaleString('en-IN')}
                      </span>

                      {!isSettled ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveUpiModal(s);
                              setUpiRefInput(`TXN-BY-UPI-${Math.floor(1000 + Math.random() * 9000)}`);
                            }}
                            className="px-3.5 py-2 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-300 shadow-xs transition-all cursor-pointer border border-amber-300"
                          >
                            Pay via UPI
                          </button>
                          <button
                            onClick={() => toggleMarkPaid(s)}
                            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-xs transition-all cursor-pointer"
                          >
                            Mark as Paid
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleMarkPaid(s)}
                          className="px-4 py-2 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-xl border border-emerald-300 flex items-center gap-1.5 hover:bg-emerald-200 transition-all cursor-pointer"
                        >
                          <span>✓ Settled</span>
                          <span className="text-[10px] underline text-slate-500 ml-1">(Undo)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
              <span className="text-3xl">🎉</span>
              <h3 className="text-lg font-bold text-slate-900">All Group Balances Perfectly Settled!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No outstanding debts or payments remain for this trip group.
              </p>
            </div>
          )}
        </section>

      </main>

      {/* UPI PAYMENT MODAL */}
      {activeUpiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold">UPI Direct Gateway</span>
                <h3 className="text-lg font-bold text-slate-900">Settle Payment</h3>
              </div>
              <button onClick={() => setActiveUpiModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmUpi} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer (From):</span>
                  <span className="text-rose-600 font-bold">{activeUpiModal.fromMemberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payee (To):</span>
                  <span className="text-emerald-700 font-bold">{activeUpiModal.toMemberName}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Amount:</span>
                  <span className="text-slate-900 font-black text-base">
                    ₹{activeUpiModal.amountInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-mono uppercase mb-1 font-semibold">Transaction Reference Code</label>
                <input
                  type="text"
                  value={upiRefInput}
                  onChange={(e) => setUpiRefInput(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white font-bold"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveUpiModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm cursor-pointer transition-colors"
                >
                  Confirm &amp; Mark Settled
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
