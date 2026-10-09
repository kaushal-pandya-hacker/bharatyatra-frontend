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

export default function SettlementOptimizerPage({ params }: { params?: { id?: string } } = {}) {
  const router = useRouter();
  const tripId = params?.id || '1';

  const [members, setMembers] = useState<GroupMember[]>(DEFAULT_MEMBERS);
  const [expenses, setExpenses] = useState<TripExpenseItem[]>(DEFAULT_EXPENSES);
  const [settlementStatuses, setSettlementStatuses] = useState<Record<string, { status: 'SETTLED' | 'PENDING'; refCode?: string }>>({});

  // UPI Payment Modal State
  const [activeUpiModal, setActiveUpiModal] = useState<SettlementSuggestion | null>(null);
  const [upiRefInput, setUpiRefInput] = useState('');

  // Load from localStorage
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
        refCode: nextStatus === 'SETTLED' ? `TXN-FARVA-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
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
        refCode: upiRefInput || `TXN-FARVA-UPI-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    };
    updateSettlementState(updated);
    setActiveUpiModal(null);
    setUpiRefInput('');
  };

  const currentUserBalance = summary.memberBalances.find((b) => b.memberId === 'm1');

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
              <span className="text-[10px] text-amber-400 font-mono">SETTLEMENT OPTIMIZER ENGINE</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 text-xs font-semibold">
            <Link href={`/trips/${tripId}`} className="px-3 py-1.5 text-slate-300 hover:text-white rounded-lg transition-colors">
              Command Center
            </Link>
            <Link href={`/trips/${tripId}/expenses`} className="px-3 py-1.5 text-slate-300 hover:text-white rounded-lg transition-colors">
              Group Splitter
            </Link>
            <Link href={`/trips/${tripId}/settle`} className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg shadow-md">
              Final Settlement
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* TITLE RIBBON */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold uppercase border border-emerald-500/20">
                ● MINIMUM CASH-FLOW OPTIMIZER
              </span>
              <span className="text-xs text-slate-400 font-mono">• {summary.settlements.length} Transfers Required</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Final Trip <span className="text-amber-400">Settlement Matrix</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Automatically matches group creditors and debtors to settle all group debts with the fewest possible transactions.
            </p>
          </div>

          <Link
            href={`/trips/${tripId}/expenses`}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all self-start md:self-auto"
          >
            ← Back to Group Splitter
          </Link>
        </div>

        {/* PERSONAL INSIGHT CARD */}
        {currentUserBalance && (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-mono uppercase font-semibold">Your Personal Trip Insight</span>
              <h3 className="text-lg font-bold text-white">
                You (Kaushal) Paid ₹{currentUserBalance.totalPaidInr.toLocaleString('en-IN')} • Your Share: ₹
                {currentUserBalance.totalShareInr.toLocaleString('en-IN')}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {currentUserBalance.netBalancePaise > 0 ? (
                <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 text-xs font-mono font-bold">
                  You Should Receive ₹{currentUserBalance.netBalanceInr.toLocaleString('en-IN')}
                </div>
              ) : currentUserBalance.netBalancePaise < 0 ? (
                <div className="px-4 py-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 text-xs font-mono font-bold">
                  You Owe ₹{Math.abs(currentUserBalance.netBalanceInr).toLocaleString('en-IN')}
                </div>
              ) : (
                <div className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 text-xs font-mono font-bold">
                  ✓ Your Account is Fully Settled
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTLEMENT SUGGESTIONS LIST */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Optimal Settlement Suggestions ({summary.settlements.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">Min-Cash Flow Engine</span>
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
                    className={`bg-slate-900/90 rounded-2xl border p-5 shadow-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSettled ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-mono font-bold text-sm border border-slate-700 shrink-0">
                        0{idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-white">
                          <span className="text-rose-400">{s.fromMemberName}</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-emerald-400">{s.toMemberName}</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Transfer amount: <strong className="text-amber-400 font-mono">₹{s.amountInr.toLocaleString('en-IN')}</strong>
                          {saved?.refCode && (
                            <span className="ml-2 font-mono text-[10px] text-slate-500">
                              Ref: {saved.refCode}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <span className="text-xl font-extrabold text-amber-400 font-mono">
                        ₹{s.amountInr.toLocaleString('en-IN')}
                      </span>

                      {!isSettled ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveUpiModal(s);
                              setUpiRefInput(`TXN-FARVA-UPI-${Math.floor(1000 + Math.random() * 9000)}`);
                            }}
                            className="px-3.5 py-2 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-300 shadow-md transition-all"
                          >
                            Pay via UPI
                          </button>
                          <button
                            onClick={() => toggleMarkPaid(s)}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all"
                          >
                            Mark as Paid
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleMarkPaid(s)}
                          className="px-4 py-2 bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center gap-1.5 hover:bg-emerald-500/30 transition-all"
                        >
                          <span>✓ Settled</span>
                          <span className="text-[10px] underline text-slate-400 ml-1">(Undo)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-3xl">🎉</span>
              <h3 className="text-lg font-bold text-white">All Group Balances Perfectly Settled!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No outstanding debts or payments remain for this trip group.
              </p>
            </div>
          )}
        </section>

      </main>

      {/* UPI PAYMENT MODAL */}
      {activeUpiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">UPI Direct Gateway</span>
                <h3 className="text-lg font-bold text-white">Settle Payment</h3>
              </div>
              <button onClick={() => setActiveUpiModal(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmUpi} className="space-y-4 text-xs">
              <div className="bg-slate-800/80 p-4 rounded-2xl space-y-2 border border-slate-700 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payer (From):</span>
                  <span className="text-rose-400 font-bold">{activeUpiModal.fromMemberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payee (To):</span>
                  <span className="text-emerald-400 font-bold">{activeUpiModal.toMemberName}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-amber-400 font-bold text-base">
                    ₹{activeUpiModal.amountInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono uppercase mb-1">Transaction Reference Code</label>
                <input
                  type="text"
                  value={upiRefInput}
                  onChange={(e) => setUpiRefInput(e.target.value)}
                  className="w-full bg-slate-800 text-white font-mono px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveUpiModal(null)}
                  className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg"
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
