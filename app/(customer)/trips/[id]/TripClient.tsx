'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import { getSavedTrips, TripItem, resolveClientTripStatus } from '@/lib/trips/trip-storage';
import {
  GroupMember,
  TripExpenseItem,
  TripExpenseSummary,
  computeFullTripExpenseSummary,
  ExpenseCategory,
} from '@/lib/trips/group-expense-engine';

export default function TripCommandCenterPage({ params }: { params?: { id?: string } } = {}) {
  return (
    <ProtectedRoute>
      <TripCommandCenterContent params={params} />
    </ProtectedRoute>
  );
}

function TripCommandCenterContent({ params }: { params?: { id?: string } } = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const tripId = params?.id || '1';

  // Real persisted trip state
  const [trip, setTrip] = useState<TripItem | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<TripExpenseItem[]>([]);
  const [summary, setSummary] = useState<TripExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Expense Modal state
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Food');
  const [formPaidBy, setFormPaidBy] = useState<string>('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load real trip, members & expense ledger
  const loadTripData = useCallback(async () => {
    setIsLoading(true);
    setIsNotFound(false);

    let resolvedTrip: TripItem | null = null;

    // 1. Fetch trip record from authenticated server API
    try {
      const res = await fetch(`/api/v1/trips/${tripId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const t = json.data;
          resolvedTrip = {
            tripId: t.tripId || t.id,
            id: t.id || t.tripId,
            title: t.title,
            destination: t.destination || t.destinationCity || 'Destination',
            destinationCity: t.destinationCity || t.destination || 'Destination',
            originCity: t.originCity || 'Origin',
            startDate: t.startDate,
            endDate: t.endDate,
            durationDays: t.durationDays || 1,
            travelers: t.travelers || t.travellerCount || 1,
            travellerCount: t.travelers || t.travellerCount || 1,
            budgetInr: t.budgetInr || 0,
            status: resolveClientTripStatus(t),
            selectedTier: t.selectedTier || 'balanced',
            routeJson: t.routeJson,
            itineraryJson: t.itineraryJson,
            tripContextJson: t.tripContextJson,
          };
        }
      }
    } catch (err) {
      console.warn('API error fetching trip details:', err);
    }

    // 2. Reconcile with user-scoped localStorage
    if (!resolvedTrip) {
      const savedTrips = getSavedTrips(user?.id);
      const found = savedTrips.find((t) => t.id === tripId || t.tripId === tripId);
      if (found) {
        resolvedTrip = found;
      }
    }

    // If trip does not exist in server or local storage, stop and show not-found
    if (!resolvedTrip) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    setTrip(resolvedTrip);

    // 3. Fetch real members and expenses from API
    try {
      const expRes = await fetch(`/api/v1/trips/${tripId}/expenses`);
      if (expRes.ok) {
        const expJson = await expRes.json();
        if (expJson.success && expJson.data) {
          const realMembers: GroupMember[] = expJson.data.members || [];
          const realExpenses: TripExpenseItem[] = expJson.data.expenses || [];
          const realSettlements = expJson.data.settlements || [];

          setMembers(realMembers);
          setExpenses(realExpenses);

          const fullSummary = computeFullTripExpenseSummary(realMembers, realExpenses, realSettlements);
          setSummary(fullSummary);
        }
      } else {
        const defaultMember: GroupMember = {
          id: user?.id || 'owner',
          name: user?.fullName || 'Trip Lead',
          email: user?.email,
          role: 'OWNER',
          isCurrentUser: true,
          avatar: (user?.fullName || 'TL').slice(0, 2).toUpperCase(),
        };
        setMembers([defaultMember]);
        setSummary(computeFullTripExpenseSummary([defaultMember], [], []));
      }
    } catch {
      const defaultMember: GroupMember = {
        id: user?.id || 'owner',
        name: user?.fullName || 'Trip Lead',
        email: user?.email,
        role: 'OWNER',
        isCurrentUser: true,
        avatar: (user?.fullName || 'TL').slice(0, 2).toUpperCase(),
      };
      setMembers([defaultMember]);
      setSummary(computeFullTripExpenseSummary([defaultMember], [], []));
    } finally {
      setIsLoading(false);
    }
  }, [tripId, user]);

  useEffect(() => {
    loadTripData();
  }, [loadTripData]);

  // Derived real trip fields
  const displayTitle = trip?.title || 'Expedition Circuit';
  const displayOrigin = trip?.originCity || 'Origin';
  const displayDest = trip?.destinationCity || trip?.destination || 'Destination';
  const displayExpeditionId = trip?.tripId || trip?.id || `EXP-${tripId}`;
  const displayDays = trip?.durationDays || 1;
  const displayNights = Math.max(1, displayDays - 1);

  const formatTripDate = (d?: string) => {
    if (!d) return '';
    try {
      const parts = d.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = parseInt(parts[2], 10);
        const month = months[parseInt(parts[1], 10) - 1] || parts[1];
        const year = parts[0];
        return `${day} ${month} ${year}`;
      }
    } catch {}
    return d;
  };

  const displayDates = trip?.startDate
    ? `${formatTripDate(trip.startDate)}${trip.endDate ? ` – ${formatTripDate(trip.endDate)}` : ''} (${displayDays} Days / ${displayNights} Nights)`
    : `Dates Unscheduled • ${displayDays} Day Circuit`;

  // Dynamic Day calculation based on actual current date
  const currentDayInfo = useMemo(() => {
    if (!trip?.startDate) {
      return {
        badge: 'Planned Circuit',
        isLive: false,
        dayNumber: 1,
        statusText: `${displayDays} Days Planned`,
      };
    }
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = trip.endDate
      ? new Date(trip.endDate)
      : new Date(start.getTime() + Math.max(1, displayDays - 1) * 86400000);

    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

    if (todayMidnight < startMidnight) {
      const daysUntil = Math.ceil((startMidnight - todayMidnight) / 86400000);
      return {
        badge: `Upcoming • Starts in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
        isLive: false,
        dayNumber: 0,
        statusText: `Scheduled for ${formatTripDate(trip.startDate)}`,
      };
    }
    if (todayMidnight > endMidnight) {
      return {
        badge: `Completed • ${displayDays} Days`,
        isLive: false,
        dayNumber: displayDays,
        statusText: `Completed on ${formatTripDate(trip.endDate || trip.startDate)}`,
      };
    }
    const currentDay = Math.floor((todayMidnight - startMidnight) / 86400000) + 1;
    return {
      badge: `Day ${currentDay} of ${displayDays} • Live in ${displayDest}`,
      isLive: true,
      dayNumber: currentDay,
      statusText: `Day ${currentDay} of ${displayDays}`,
    };
  }, [trip, displayDays, displayDest]);

  // Lead voyager
  const leadVoyager = useMemo(() => {
    const owner = members.find((m) => m.role === 'OWNER');
    if (owner?.name) return owner.name;
    return user?.fullName || 'Expedition Lead';
  }, [members, user]);

  // Stops and Vector List
  const stops = useMemo(() => {
    if (trip?.routeJson?.stops && Array.isArray(trip.routeJson.stops)) {
      return trip.routeJson.stops;
    }
    return [];
  }, [trip]);

  const vectorList: string[] = useMemo(() => {
    if (stops.length > 0) {
      const list: string[] = [];
      if (trip?.originCity) list.push(trip.originCity);
      for (const s of stops) {
        if (s?.name && !list.includes(s.name)) list.push(s.name);
      }
      return list;
    }
    const list: string[] = [];
    if (trip?.originCity) list.push(trip.originCity);
    const dest = trip?.destinationCity || trip?.destination;
    if (dest && !list.includes(dest)) list.push(dest);
    return list.length > 0 ? list : ['Origin', 'Destination'];
  }, [stops, trip]);

  // Assigned Vehicle
  const assignedVehicle = useMemo(() => {
    if (trip?.routeJson?.vehicle) return trip.routeJson.vehicle;
    if (trip?.tripContextJson?.vehicle) return trip.tripContextJson.vehicle;
    return null;
  }, [trip]);

  // Real financial derivations
  const totalSpentInr = summary?.totalTripCostInr || 0;
  const contributorsCount = (summary?.memberBalances || []).filter((m) => m.totalPaidInr > 0).length;
  const travelersCount = members.length > 0 ? members.length : (trip?.travelers || 1);
  const fairShareInr = summary?.averageCostPerPersonInr || (travelersCount > 0 ? Math.round(totalSpentInr / travelersCount) : 0);
  const pendingSettlements = (summary?.settlements || []).filter((s) => s.status === 'PENDING');
  const outstandingDebtInr = pendingSettlements.reduce((acc, s) => acc + s.amountInr, 0);
  const projectedBudgetInr = trip?.budgetInr || 0;

  // Add Expense submission
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const title = formTitle.trim();
    const amount = parseFloat(formAmount);

    if (!title) {
      setFormError('Please enter an expense title.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid amount greater than ₹0.');
      return;
    }

    const payerId = formPaidBy || members[0]?.id || user?.id || 'owner';

    setIsSubmittingExpense(true);
    try {
      const res = await fetch(`/api/v1/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amountInr: amount,
          paidByMemberId: payerId,
          category: formCategory,
          splitType: 'EQUAL',
          sharedByAll: true,
          participantMemberIds: members.map((m) => m.id),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to record expense.');
      }

      setToastMessage(`Logged ₹${amount.toLocaleString('en-IN')} for "${title}"`);
      setShowAddExpenseModal(false);
      setFormTitle('');
      setFormAmount('');
      await loadTripData();
    } catch (err: any) {
      setFormError(err.message || 'Error recording expense.');
    } finally {
      setIsSubmittingExpense(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Honest Not Found / Unauthorized state
  if (isNotFound) {
    return (
      <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">travel_explore</span>
          </div>
          <h2 className="font-heading font-black text-2xl text-slate-950 tracking-tight">
            Expedition Not Found
          </h2>
          <p className="font-body-md text-body-md text-slate-600 mt-2 mb-6">
            The requested expedition <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-sm font-bold">{tripId}</code> could not be found or you do not have permission to view it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/trips"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors text-center shadow-xs"
            >
              My Trips
            </Link>
            <Link
              href="/plan"
              className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors text-center shadow-xs"
            >
              Plan New Trip
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-heading font-bold text-lg text-slate-900">
          Loading Trip Command Center...
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Synchronizing circuit route &amp; live financial ledger
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(20,26,50,0.06)]">
        <div className="h-20 w-full px-4 lg:px-6 xl:px-8 flex items-center justify-between gap-2 lg:gap-4 shrink-0">
          <div className="flex items-center gap-3 xl:gap-space-lg shrink-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group focus:outline-hidden">
              <img
                src="/logo.png"
                alt="BharatYatra Logo"
                className="h-10 w-auto object-contain rounded-md transition-transform group-hover:scale-105 shrink-0"
              />
              <div className="flex flex-col whitespace-nowrap justify-center">
                <span className="text-base font-heading font-black tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                  BHARAT YATRA
                </span>
                <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase leading-none mt-0.5">
                  {displayDest} Expedition
                </span>
              </div>
            </Link>
            <div className="hidden 2xl:flex items-center gap-space-sm pl-space-md shrink-0">
              <div className="flex items-center gap-space-xs px-3 py-1 rounded-full bg-amber-400/20 text-slate-900 border border-amber-400/30 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-bold whitespace-nowrap">Active Expedition:</span>
                <span className="text-xs text-slate-800 font-medium truncate max-w-xs">
                  {displayTitle} ({travelersCount} Traveler{travelersCount === 1 ? '' : 's'})
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            <Link
              href={`/trips/${tripId}`}
              className="px-3 py-2 transition-colors bg-amber-400 text-slate-950 font-bold rounded-lg text-xs xl:text-sm whitespace-nowrap shrink-0 shadow-xs"
            >
              Command Center
            </Link>
            <Link
              href="/trips/road-trip"
              className="px-2.5 xl:px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium rounded-lg text-xs xl:text-sm whitespace-nowrap shrink-0"
            >
              Road Trip &amp; Vehicle
            </Link>
            <Link
              href={`/trips/${tripId}/cost`}
              className="px-2.5 xl:px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium rounded-lg text-xs xl:text-sm whitespace-nowrap shrink-0"
            >
              Cost &amp; Intelligence
            </Link>
            <Link
              href={`/trips/${tripId}/expenses`}
              className="px-2.5 xl:px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium rounded-lg text-xs xl:text-sm whitespace-nowrap shrink-0"
            >
              Group Splitter
            </Link>
            <Link
              href={`/trips/${tripId}/settle`}
              className="px-2.5 xl:px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium rounded-lg text-xs xl:text-sm whitespace-nowrap shrink-0"
            >
              Settlement Optimizer
            </Link>
          </nav>

          <div className="flex items-center gap-2 xl:gap-space-md shrink-0">
            <a
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-800 border border-slate-200 shrink-0 whitespace-nowrap shadow-xs"
              href="tel:+919624282521"
              title="Call Concierge 24/7"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined text-base">support_agent</span>
              </div>
              <div className="flex flex-col text-left leading-tight whitespace-nowrap shrink-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Concierge 24/7</span>
                <span className="text-xs font-black tracking-tight text-slate-900 whitespace-nowrap">+91 96242 82521</span>
              </div>
            </a>
            <Link href="/profile" className="flex items-center gap-2.5 pl-1 group shrink-0 whitespace-nowrap">
              <div className="flex flex-col text-right hidden sm:flex leading-tight whitespace-nowrap shrink-0">
                <span className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors whitespace-nowrap">
                  {user?.fullName || 'Traveler'}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Verified Voyager
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md ring-2 ring-white shrink-0">
                {user?.fullName
                  ? user.fullName
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'BY'}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-20 bottom-0 w-64 bg-surface-container-lowest z-40 hidden md:flex flex-col py-space-md px-space-sm shadow-[0_1px_8px_rgba(20,26,50,0.04)]">
        <div className="px-space-sm mb-space-md">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Circuit Navigation
          </span>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          <Link
            href={`/trips/${tripId}`}
            className="flex items-center gap-space-sm px-3 py-2.5 transition-all bg-primary-container text-on-primary-container font-semibold rounded-lg"
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span className="font-label-lg text-label-lg">Command Center</span>
          </Link>
          <Link
            href="/trips/road-trip"
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-lg">rv_hookup</span>
            <span className="font-label-lg text-label-lg">Road Trip &amp; Vehicle</span>
          </Link>
          <Link
            href={`/trips/${tripId}/cost`}
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-lg">insights</span>
            <span className="font-label-lg text-label-lg">Cost &amp; Intelligence</span>
          </Link>
          <Link
            href={`/trips/${tripId}/expenses`}
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-lg">group</span>
            <span className="font-label-lg text-label-lg">Group Splitter</span>
          </Link>
          <Link
            href={`/trips/${tripId}/settle`}
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            <span className="font-label-lg text-label-lg">Settlement Optimizer</span>
          </Link>
        </nav>
        <div className="mt-auto p-space-sm rounded-xl bg-surface-container-low">
          <div className="flex items-center gap-space-xs mb-1">
            <span className="material-symbols-outlined text-primary text-base">verified</span>
            <span className="font-label-md text-label-md font-semibold text-on-surface">{displayDest} Concierge</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Sovereign highway guidance and authentic local concierge active.
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="md:pl-64">
        <main className="relative pt-20 bg-surface min-h-screen w-full px-space-gutter">
          <div className="flex flex-col w-full pb-16">
            {/* CIRCUIT CONTEXT & EXPEDITION BREADCRUMB BAR */}
            <section className="w-full flex flex-col xl:flex-row xl:items-center justify-between gap-space-md mb-space-md">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container/30 text-on-primary-fixed-variant font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-1">
                    {currentDayInfo.isLive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>}
                    {currentDayInfo.badge}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">|</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    {displayExpeditionId}
                  </span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight leading-tight">
                    {displayTitle}
                  </h1>
                  <span className="material-symbols-outlined text-amber-500 text-2xl" title="Verified Circuit">
                    verified
                  </span>
                </div>
                <p className="font-body-md text-body-md text-slate-600 mt-1">
                  {displayDates} • {travelersCount} Traveler{travelersCount === 1 ? '' : 's'} • Lead Voyager:{' '}
                  <span className="font-semibold text-slate-900">{leadVoyager}</span>
                </p>
              </div>

              {/* Live Vector Strip & Vehicle Badge */}
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700 font-medium">
                  <span className="font-bold text-slate-900 flex items-center gap-1 pr-1">
                    <span className="material-symbols-outlined text-amber-500 text-sm">route</span>
                    Vector:
                  </span>
                  {vectorList.map((pt, pIdx) => (
                    <React.Fragment key={pIdx}>
                      {pIdx > 0 && <span className="material-symbols-outlined text-slate-400 text-xs">arrow_forward</span>}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        pIdx === 0
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : pIdx === vectorList.length - 1
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                          : 'bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100'
                      }`}>
                        {pt}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                <Link
                  href="/trips/road-trip"
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-900 border border-slate-200 transition-colors"
                  title="Manage Vehicle"
                >
                  <span className="material-symbols-outlined text-amber-600 text-base">directions_car</span>
                  <span className="text-xs uppercase font-extrabold tracking-tight">
                    {assignedVehicle ? (assignedVehicle.model || assignedVehicle.name) : 'Vehicle: Unassigned'}
                  </span>
                </Link>
              </div>
            </section>

            {/* LUXURY NAV TABS SUB-ROUTING */}
            <div className="flex items-center gap-space-xs overflow-x-auto pb-space-sm mb-space-lg no-scrollbar">
              <Link
                href={`/trips/${tripId}`}
                className="px-4 py-2 rounded-xl bg-on-secondary-fixed text-primary-container font-label-lg text-label-lg font-semibold shadow-md flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">dashboard_customize</span> Command Center
              </Link>
              <Link
                href="/trips/road-trip"
                className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg font-medium transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">travel_explore</span> Road Trip &amp; Telemetry
              </Link>
              <Link
                href={`/trips/${tripId}/cost`}
                className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg font-medium transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">finance_mode</span> Cost Intelligence
              </Link>
              <Link
                href={`/trips/${tripId}/expenses`}
                className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg font-medium transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">receipt_long</span> Group Expenses
              </Link>
              <Link
                href={`/trips/${tripId}/settle`}
                className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg font-medium transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">handshake</span> Settlement Optimizer
              </Link>
            </div>

            {/* SIGNATURE TRIP INTELLIGENCE MASTER BANNER */}
            <section className="relative w-full rounded-2xl bg-on-secondary-fixed text-on-primary p-space-lg shadow-xl mb-space-xl overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col gap-space-lg">
                {/* Banner Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md border-b border-surface-container-highest/10 pb-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-white/10 p-2 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20">
                      <img
                        alt="BharatYatra Logo"
                        className="w-full h-full object-contain rounded-md"
                        src="/logo.png"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-space-xs">
                        <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                          {displayDest} Trip Intelligence
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-fixed text-label-caps font-bold uppercase tracking-wider">
                          {trip?.status || 'Active'}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/70">
                        Real-time synchronization across {travelersCount} traveler{travelersCount === 1 ? '' : 's'} and persistent expense ledger.
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Quick Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <button
                      className="px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary-fixed text-on-primary-fixed font-label-lg text-label-lg font-bold transition-all shadow-[0_0_20px_-2px_rgba(254,214,91,0.4)] flex items-center gap-1.5 cursor-pointer"
                      onClick={() => setShowAddExpenseModal(true)}
                    >
                      <span className="material-symbols-outlined text-base">add_circle</span> Add Expense
                    </button>
                    <Link
                      href={`/plan?dest=${encodeURIComponent(displayDest)}`}
                      className="px-4 py-2.5 rounded-xl bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-surface-container-lowest font-label-lg text-label-lg font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-primary-container text-base">auto_awesome</span> Optimize My Day
                    </Link>
                    <Link
                      href={`/trips/${tripId}/settle`}
                      className="px-4 py-2.5 rounded-xl bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-surface-container-lowest font-label-lg text-label-lg font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">currency_exchange</span> Simplify Settlements
                    </Link>
                    <a
                      className="px-3 py-2.5 rounded-xl bg-error/80 hover:bg-error text-on-error font-label-md text-label-md font-bold transition-all flex items-center gap-1"
                      href="tel:112"
                    >
                      <span className="material-symbols-outlined text-base">fmd_bad</span> SOS Ground
                    </a>
                  </div>
                </div>

                {/* Telemetry Multi-Split Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
                  {/* Circuit Disbursal */}
                  <div className="rounded-xl bg-surface-container-lowest/5 p-space-md backdrop-blur-md flex flex-col justify-between">
                    <div className="flex items-center justify-between text-surface-container-high/80 mb-2">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider">Circuit Disbursal</span>
                      <span className="material-symbols-outlined text-primary-container text-lg">account_balance_wallet</span>
                    </div>
                    <div>
                      <div className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-white">
                        ₹{totalSpentInr.toLocaleString('en-IN')}
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/80 mt-1">
                        Spent by {contributorsCount} Contributor{contributorsCount === 1 ? '' : 's'} •{' '}
                        <span className="text-primary-container font-semibold">
                          ₹{fairShareInr.toLocaleString('en-IN')}/head
                        </span>{' '}
                        fair share
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between font-label-caps text-label-caps text-surface-container-high/70">
                      <span>Outstanding: ₹{outstandingDebtInr.toLocaleString('en-IN')}</span>
                      <span className="text-primary-container font-semibold">{travelersCount} Traveler{travelersCount === 1 ? '' : 's'} Active</span>
                    </div>
                  </div>

                  {/* Vehicle Telematics */}
                  <div className="rounded-xl bg-surface-container-lowest/5 p-space-md backdrop-blur-md flex flex-col justify-between">
                    <div className="flex items-center justify-between text-surface-container-high/80 mb-2">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider">Vehicle Telematics</span>
                      <span className="material-symbols-outlined text-primary-container text-lg">commute</span>
                    </div>
                    <div>
                      <div className="font-title-lg text-title-lg font-bold text-surface-container-lowest flex items-center gap-2">
                        {assignedVehicle ? (assignedVehicle.model || assignedVehicle.name) : 'Vehicle: Unassigned'}
                        <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container-lowest/15 text-primary-container">
                          {assignedVehicle ? 'Linked' : 'Not configured'}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/80 mt-1">
                        {assignedVehicle ? (
                          <>Odometer: <span className="text-surface-container-lowest font-medium">Active</span> • Routing Synced</>
                        ) : (
                          <>Telemetry: <span className="text-surface-container-high/60 font-medium">Unavailable</span> • Standby</>
                        )}
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between font-label-caps text-label-caps text-surface-container-high/70">
                      <span>Fuel: {assignedVehicle ? 'Monitored' : 'Unset'}</span>
                      <span>Permits: {assignedVehicle ? 'Verified' : 'Unchecked'}</span>
                      <span>GPS: {assignedVehicle ? 'Online' : 'Standby'}</span>
                    </div>
                  </div>

                  {/* Projected Budget */}
                  <div className="rounded-xl bg-surface-container-lowest/5 p-space-md backdrop-blur-md flex flex-col justify-between">
                    <div className="flex items-center justify-between text-surface-container-high/80 mb-2">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider">Cost Forecast</span>
                      <span className="material-symbols-outlined text-primary-container text-lg">trending_up</span>
                    </div>
                    <div>
                      <div className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-white">
                        {projectedBudgetInr > 0 ? `₹${projectedBudgetInr.toLocaleString('en-IN')}` : '₹0'}
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/80 mt-1">
                        {projectedBudgetInr > 0 ? 'Projected Total Package Budget' : 'Budget Unconfigured'}
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs">
                      <div className="w-full bg-surface-container-lowest/20 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary-container h-full rounded-full transition-all"
                          style={{
                            width: projectedBudgetInr > 0
                              ? `${Math.min(100, Math.round((totalSpentInr / projectedBudgetInr) * 100))}%`
                              : '0%',
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1 font-label-caps text-label-caps text-primary-container">
                        <span>Priced Tier: {trip?.selectedTier || 'Standard'}</span>
                        <span>{projectedBudgetInr > 0 ? `${Math.round((totalSpentInr / projectedBudgetInr) * 100)}% Spent` : 'No Cap'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Route Status Beacon */}
                  <div className="rounded-xl bg-surface-container-lowest/10 p-space-md backdrop-blur-md flex flex-col justify-between shadow-inner">
                    <div className="flex items-center justify-between text-surface-container-high/80 mb-1">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider">Next Waypoint Anchor</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
                    </div>
                    <div>
                      <span className="font-title-md text-title-md font-bold text-surface-container-lowest line-clamp-1">
                        {stops[0]?.name || displayDest}
                      </span>
                      <p className="font-body-sm text-body-sm text-surface-container-high mt-1">
                        {stops[0]?.district || displayDest} • Waypoint Verified
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                      <span className="font-label-md text-label-md text-primary-container font-semibold">
                        {stops.length > 0 ? `${stops.length} Milestones` : 'Direct Vector'}
                      </span>
                      <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-primary-container/20 text-primary-container font-bold">
                        {trip?.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3-COLUMN MASTER COMMAND GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* COLUMN 1: TODAY'S LIVE EXPEDITION & TIMELINE (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-space-md">
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                      <h2 className="font-title-lg text-title-lg font-bold text-on-surface">Today&apos;s Live Expedition</h2>
                    </div>
                    <span className="font-label-md text-label-md font-bold text-primary px-2 py-0.5 rounded-full bg-primary-container/30">
                      {currentDayInfo.statusText}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    Exploration Vector: {displayOrigin} → {displayDest}
                  </p>
                  <div className="flex flex-col gap-1.5 p-space-sm rounded-xl bg-surface-container-low mb-space-md">
                    <div className="flex items-center justify-between font-label-md text-label-md">
                      <span className="font-semibold text-on-surface">Expedition Status</span>
                      <span className="font-bold text-primary">{trip?.status || 'Active'}</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary-container h-full rounded-full transition-all"
                        style={{
                          width: currentDayInfo.isLive
                            ? `${Math.min(100, Math.round((currentDayInfo.dayNumber / displayDays) * 100))}%`
                            : currentDayInfo.dayNumber === displayDays ? '100%' : '15%',
                        }}
                      ></div>
                    </div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                      {stops.length > 0 ? `${stops.length} verified stops planned on this circuit` : 'Itinerary vector active'}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push(`/plan?dest=${encodeURIComponent(displayDest)}`)}
                    className="w-full py-2.5 px-4 rounded-xl bg-on-secondary-fixed text-primary-container font-label-md text-label-md font-bold shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-primary-container">auto_awesome</span>
                    Optimize My Day with Farva AI
                  </button>
                </div>

                {/* Chronological Live Expedition Timeline */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-space-md">
                  <div className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-bold">
                    Chronological Vector Stream
                  </div>

                  {stops.length > 0 ? (
                    stops.map((stop: any, idx: number) => {
                      const isFirst = idx === 0;
                      const isSecond = idx === 1;
                      const badgeText = isFirst ? 'Departure / Anchor' : isSecond ? 'Active Waypoint' : 'Scheduled Milestone';
                      return (
                        <div key={idx} className={`relative pl-6 pb-space-sm ${idx < stops.length - 1 ? 'border-l-2 border-primary-container' : ''}`}>
                          <span className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full ${isFirst ? 'bg-primary-container text-on-primary-fixed' : isSecond ? 'bg-primary text-on-primary animate-pulse' : 'bg-surface-container-high text-on-surface-variant'} flex items-center justify-center text-xs`}>
                            <span className="material-symbols-outlined text-xs font-bold">{isFirst ? 'check' : isSecond ? 'location_on' : 'wb_twilight'}</span>
                          </span>
                          <div className="flex items-center justify-between">
                            <span className={`font-label-caps text-label-caps ${isSecond ? 'text-primary font-bold uppercase tracking-wider' : 'text-on-surface-variant font-semibold'}`}>
                              {badgeText}
                            </span>
                            <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-medium">
                              {stop.district || displayDest}
                            </span>
                          </div>
                          <h3 className="font-title-md text-title-md font-bold text-on-surface mt-0.5">
                            {stop.name}
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                            {stop.district ? `Iconic destination in ${stop.district}. High-priority sightseeing experience.` : 'Verified landmark and route waypoint.'}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl bg-surface-container-low border border-dashed border-slate-300">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-xl">route</span>
                      </div>
                      <h4 className="font-label-md text-label-md font-bold text-slate-800">No Itinerary Milestones Scheduled</h4>
                      <p className="font-body-sm text-body-sm text-slate-500 max-w-xs mt-1 mb-3">
                        Farva AI can generate an optimized day-by-day itinerary with attractions, transit, and authentic food spots for {displayDest}.
                      </p>
                      <button
                        onClick={() => router.push(`/plan?dest=${encodeURIComponent(displayDest)}`)}
                        className="py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        Plan Day with Farva AI
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 2: GROUP EXPENSES & SETTLEMENTS (lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">payments</span>
                      <h2 className="font-title-lg text-title-lg font-bold text-on-surface">Group Expense Ledger</h2>
                    </div>
                    <span className="font-label-caps text-label-caps px-2 py-1 rounded bg-secondary-container text-on-secondary-fixed font-bold uppercase">
                      Equal Split Active
                    </span>
                  </div>

                  {/* Smart Algorithm / Settlement Ribbon */}
                  <div className="p-space-sm rounded-xl bg-on-secondary-fixed text-surface-container-lowest flex items-center justify-between mb-space-md shadow-inner">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary-container text-xl">bolt</span>
                      <div>
                        <div className="font-label-md text-label-md font-bold text-primary-container">
                          {pendingSettlements.length > 0 ? 'Settlement Optimization Available' : 'Ledger in Balance'}
                        </div>
                        <p className="font-body-sm text-body-sm text-surface-container-high/80">
                          {pendingSettlements.length > 0
                            ? `Only ${pendingSettlements.length} transaction${pendingSettlements.length === 1 ? '' : 's'} needed to settle all ${travelersCount} members.`
                            : 'All balances settled or no expenses recorded yet.'}
                        </p>
                      </div>
                    </div>
                    {pendingSettlements.length > 0 && (
                      <Link
                        href={`/trips/${tripId}/settle`}
                        className="px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-fixed hover:text-on-primary font-label-caps text-label-caps uppercase font-bold transition-colors"
                      >
                        Resolve
                      </Link>
                    )}
                  </div>

                  {/* Payer Breakdown List */}
                  <div className="flex flex-col gap-2 mb-space-md">
                    {summary?.memberBalances && summary.memberBalances.some((m) => m.totalPaidInr > 0) ? (
                      summary.memberBalances.map((m) => {
                        const isCreditor = m.netBalanceInr > 0;
                        const isDebtor = m.netBalanceInr < 0;
                        return (
                          <div
                            key={m.memberId}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                          >
                            <div className="flex items-center gap-space-sm">
                              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-fixed font-bold flex items-center justify-center font-label-md text-label-md">
                                {m.memberName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-label-md text-label-md font-bold text-on-surface">
                                  {m.memberName} {members.find((x) => x.id === m.memberId)?.role === 'OWNER' ? '(Organizer)' : ''}
                                </div>
                                <div className="font-body-sm text-body-sm text-on-surface-variant">
                                  {m.totalPaidInr > 0 ? `Paid ₹${m.totalPaidInr.toLocaleString('en-IN')}` : 'No payments logged'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-title-md text-title-md font-bold text-on-surface">
                                ₹{m.totalPaidInr.toLocaleString('en-IN')}
                              </span>
                              <div
                                className={`font-label-caps text-label-caps font-semibold ${
                                  isCreditor ? 'text-primary' : isDebtor ? 'text-error' : 'text-slate-500'
                                }`}
                              >
                                {isCreditor
                                  ? `Gets back ₹${m.netBalanceInr.toLocaleString('en-IN')}`
                                  : isDebtor
                                  ? `Owes ₹${Math.abs(m.netBalanceInr).toLocaleString('en-IN')}`
                                  : 'Settled'}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl bg-surface-container-low border border-dashed border-slate-300">
                        <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">receipt_long</span>
                        <p className="font-label-md text-label-md font-bold text-slate-800">No Expenses Recorded Yet</p>
                        <p className="font-body-sm text-body-sm text-slate-500 mt-0.5 mb-3">
                          All members are currently settled at ₹0 balance.
                        </p>
                        <button
                          onClick={() => setShowAddExpenseModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                          Log First Expense
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary Footer */}
                  {pendingSettlements.length > 0 && (
                    <div className="p-space-xs rounded-lg bg-surface-container text-center font-body-sm text-body-sm text-on-surface-variant">
                      Total outstanding debts: <span className="font-semibold text-on-surface">₹{outstandingDebtInr.toLocaleString('en-IN')}</span> across {pendingSettlements.length} settlement transaction(s).
                    </div>
                  )}
                </div>

                {/* Sovereign Companions */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">groups</span>
                      <h3 className="font-title-md text-title-md font-bold text-on-surface">
                        {travelersCount} Sovereign Companion{travelersCount === 1 ? '' : 's'}
                      </h3>
                    </div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant font-medium">Verified Roster</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low">
                        <div className="relative w-10 h-10 mb-1">
                          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
                            {member.avatar || member.name.slice(0, 2).toUpperCase()}
                          </div>
                          {member.isCurrentUser && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" title="Active"></span>
                          )}
                        </div>
                        <span className="font-label-md text-label-md font-bold text-on-surface truncate w-full">
                          {member.name.split(' ')[0]}
                        </span>
                        <span className="font-label-caps text-label-caps text-primary font-semibold">
                          {member.role === 'OWNER' ? 'Organizer' : member.role || 'Traveler'}
                        </span>
                      </div>
                    ))}
                    <Link
                      href={`/trips/${tripId}/expenses`}
                      className="flex flex-col items-center justify-center text-center p-2 rounded-xl border border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-slate-500 hover:text-slate-900 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center mb-1 text-slate-500 group-hover:text-amber-700 transition-colors">
                        <span className="material-symbols-outlined text-base">person_add</span>
                      </div>
                      <span className="text-xs font-bold">Add Member</span>
                      <span className="text-[10px] text-slate-400 group-hover:text-amber-600">Invite</span>
                    </Link>
                  </div>
                </div>

                {/* Expedition Dispatch Feed */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">forum</span>
                      <h3 className="font-title-md text-title-md font-bold text-on-surface">Expedition Dispatch Feed</h3>
                    </div>
                    <span className="font-label-caps text-label-caps text-primary font-bold">Live Channel</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-2xl mb-1">sensors</span>
                    <span className="font-label-md text-label-md font-bold text-slate-800">Dispatch Standby</span>
                    <p className="font-body-sm text-body-sm text-slate-500 mt-0.5">
                      No critical route alerts or transit delays logged. All systems operational.
                    </p>
                  </div>
                </div>
              </div>

              {/* COLUMN 3: VAULTED DOCUMENTS, EMERGENCY & VEHICLE (lg:col-span-3) */}
              <div className="lg:col-span-3 flex flex-col gap-space-md">
                {/* Vehicle Telemetry */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">directions_car</span>
                      <h3 className="font-title-md text-title-md font-bold text-on-surface">Vehicle Telemetry</h3>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${assignedVehicle ? 'bg-primary-container' : 'bg-slate-300'}`}></span>
                  </div>

                  {assignedVehicle ? (
                    <>
                      <div className="rounded-xl bg-surface-container-low p-space-sm mb-space-sm">
                        <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Command Vehicle</div>
                        <div className="font-title-md text-title-md font-bold text-on-surface">{assignedVehicle.model || assignedVehicle.name}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">Reg: {assignedVehicle.reg || 'Assigned'}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xl">speed</span>
                          <div>
                            <div className="font-label-md text-label-md font-bold text-on-surface">Vehicle Health Nominal</div>
                            <div className="font-label-caps text-label-caps text-on-surface-variant">Diagnostics: Passed</div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl bg-surface-container-low p-space-sm mb-space-sm text-center">
                      <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Command Vehicle</div>
                      <div className="font-title-md text-title-md font-bold text-slate-700 mt-1">Vehicle: Not configured</div>
                      <p className="font-body-sm text-body-sm text-slate-500 mt-0.5 mb-3">
                        Link a vehicle to enable live highway routing and fuel monitoring.
                      </p>
                      <Link
                        href="/trips/road-trip"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">rv_hookup</span>
                        Assign Vehicle
                      </Link>
                    </div>
                  )}
                </div>

                {/* Digital Vault */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">folder_shared</span>
                      <h3 className="font-title-md text-title-md font-bold text-on-surface">Digital Vault</h3>
                    </div>
                    <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-primary-container/20 text-on-primary-container font-bold">
                      0 Passes Active
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-2xl mb-1">folder_open</span>
                    <span className="font-label-md text-label-md font-bold text-slate-800">No Vouchers Stored</span>
                    <p className="font-body-sm text-body-sm text-slate-500 mt-0.5 mb-3">
                      Hotel booking vouchers and monument entry passes will appear here once booked.
                    </p>
                    <Link
                      href="/hotels"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200"
                    >
                      <span className="material-symbols-outlined text-sm">hotel</span>
                      Browse Stays
                    </Link>
                  </div>
                </div>

                {/* Emergency Ground Node */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-error text-xl">emergency</span>
                      <h3 className="font-title-md text-title-md font-bold text-on-surface">Emergency Ground Node</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-caps text-label-caps font-bold">24/7 Active</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Emergency coordination for {displayDest} and National Highway nodes.
                  </p>
                  <div className="flex flex-col gap-2 mt-1">
                    <a
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-error-container/20 transition-colors"
                      href="tel:112"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-error text-base">local_police</span>
                        <span className="font-label-md text-label-md font-semibold text-on-surface">{displayDest} Emergency SOS</span>
                      </div>
                      <span className="font-label-md text-label-md font-bold text-error">Dial 112</span>
                    </a>
                    <a
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                      href="tel:+919624282521"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">support_agent</span>
                        <span className="font-label-md text-label-md font-semibold text-on-surface">BharatYatra Concierge</span>
                      </div>
                      <span className="font-label-caps text-label-caps text-on-surface-variant font-bold">+91 96242 82521</span>
                    </a>
                    <div className="p-2 rounded-xl bg-surface-container text-on-surface-variant font-body-sm text-body-sm flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">local_hospital</span>
                        <span>Ambulance Network</span>
                      </span>
                      <span className="font-semibold text-on-surface">Dial 108</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* QUICK ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">receipt_long</span>
                <h3 className="font-heading font-black text-lg text-slate-900">Add Group Expense</h3>
              </div>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddExpenseSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Highway Dhaba Lunch, Fuel, Entry Pass"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Amount (₹ INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 1500"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs font-semibold"
                  >
                    <option value="Food">Food &amp; Dining</option>
                    <option value="Stay">Stay &amp; Hotels</option>
                    <option value="Fuel">Fuel &amp; FASTag</option>
                    <option value="Transport">Transport</option>
                    <option value="Tickets">Entry Tickets</option>
                    <option value="Activities">Activities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Paid By
                  </label>
                  <select
                    value={formPaidBy}
                    onChange={(e) => setFormPaidBy(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs font-semibold"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.isCurrentUser ? '(You)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                Split equally among all {members.length} member{members.length === 1 ? '' : 's'}. Exact split computed with zero rounding drift.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingExpense ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      Recording...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span>
                      Record Expense
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-800">
          <span className="material-symbols-outlined text-amber-400 text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
