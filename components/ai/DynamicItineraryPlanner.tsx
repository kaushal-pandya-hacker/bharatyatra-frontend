'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Utensils,
  Plus,
  Trash2,
  RefreshCw,
  History,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronRight,
  Zap,
  Sparkles,
  ArrowRight,
  IndianRupee,
  Eye,
  Check,
  X,
  Compass,
} from 'lucide-react';
import {
  ItineraryMasterPlan,
  ItineraryDay,
  ItineraryActivity,
  ItineraryVersion,
  VerifiedAttractionMetadata,
  VERIFIED_ATTRACTIONS_REGISTRY,
} from '@/lib/ai-planner/dynamic-itinerary-engine';
import { TravelPace } from '@/lib/ai-planner/universal-preference-profile';

interface DynamicItineraryPlannerProps {
  initialPlan: ItineraryMasterPlan;
  onUpdatePlan?: (updatedPlan: ItineraryMasterPlan) => void;
  className?: string;
}

export function DynamicItineraryPlanner({
  initialPlan,
  onUpdatePlan,
  className = '',
}: DynamicItineraryPlannerProps) {
  const [plan, setPlan] = useState<ItineraryMasterPlan>(initialPlan);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [activePace, setActivePace] = useState<string>(
    plan.preferenceProfile?.pace?.style || 'balanced'
  );
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add/Replace Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'replace';
    dayNumber: number;
    slot: 'morning' | 'afternoon' | 'evening';
    targetActivityId?: string;
  }>({
    isOpen: false,
    mode: 'add',
    dayNumber: 1,
    slot: 'morning',
  });

  const currentVersion = plan.currentVersion;
  const currentDays = currentVersion.days;
  const activeDay = currentDays.find((d) => d.dayNumber === selectedDayNumber) || currentDays[0];

  // Helper to commit plan changes
  const applyPlanUpdate = (updatedPlan: ItineraryMasterPlan) => {
    setPlan(updatedPlan);
    if (onUpdatePlan) {
      onUpdatePlan(updatedPlan);
    }
  };

  // Change Travel Pace
  const handlePaceChange = async (newPace: TravelPace) => {
    try {
      setIsProcessing(true);
      setActivePace(newPace);
      const res = await fetch('/api/v1/trips/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_pace',
          plan,
          newPace,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        applyPlanUpdate(data.data);
      }
    } catch (err) {
      console.error('Failed to change travel pace:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Regenerate Single Day
  const handleRegenerateDay = async (dayNumber: number) => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/v1/trips/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate_day',
          plan,
          dayNumber,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        applyPlanUpdate(data.data);
      }
    } catch (err) {
      console.error('Failed to regenerate day:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove Activity
  const handleRemoveActivity = async (dayNumber: number, activityId: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/v1/trips/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_activity',
          plan,
          dayNumber,
          activityId,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        applyPlanUpdate(data.data);
      }
    } catch (err) {
      console.error('Failed to remove activity:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add / Replace Activity Selection
  const handleSelectAttractionForModal = async (attraction: VerifiedAttractionMetadata) => {
    try {
      setIsProcessing(true);
      const newActivity: ItineraryActivity = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        activityId: attraction.id,
        destinationId: attraction.city,
        name: attraction.name,
        displayName: attraction.displayName,
        location: attraction.city,
        state: attraction.state,
        startTime: modalState.slot === 'morning' ? '09:30' : modalState.slot === 'afternoon' ? '14:30' : '18:00',
        endTime: modalState.slot === 'morning' ? '12:00' : modalState.slot === 'afternoon' ? '16:30' : '19:30',
        durationMinutes: attraction.visitDurationMinutes || 120,
        category: attraction.category,
        estimatedCostInr: attraction.entryFeeInr || 0,
        priority: attraction.entryFeeInr > 0 ? 'must-do' : 'recommended',
        reason: `Selected for ${modalState.slot} slot during Day ${modalState.dayNumber}`,
        openingHours: {
          open: attraction.openingTime || '09:00',
          close: attraction.closingTime || '18:00',
          closedDays: attraction.closedDays || [],
        },
        entryFeeStatus: attraction.entryFeeStatus || 'verified_fee',
        bookingRequired: attraction.bookingRequired || false,
        travelDistanceFromPrevKm: 3.5,
        travelTimeFromPrevMinutes: 15,
        suitabilityInterests: attraction.interestTags || [],
        accessibility: {
          wheelchairAccessible: attraction.wheelchairAccessible || false,
          seniorFriendly: attraction.seniorFriendly || false,
        },
        evidenceStatus: 'USER_CUSTOM',
      };

      let action = 'add_activity';
      let payload: any = {
        plan,
        dayNumber: modalState.dayNumber,
        activity: newActivity,
        slot: modalState.slot,
      };

      if (modalState.mode === 'replace' && modalState.targetActivityId) {
        action = 'replace_activity';
        payload = {
          plan,
          dayNumber: modalState.dayNumber,
          oldActivityId: modalState.targetActivityId,
          newActivity,
        };
      }

      const res = await fetch('/api/v1/trips/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...payload,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        applyPlanUpdate(data.data);
      }
      setModalState((prev) => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error('Failed to update activity:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore Version
  const handleRestoreVersion = async (targetVersionId: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/v1/trips/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore_version',
          plan,
          targetVersionId,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        applyPlanUpdate(data.data);
        setShowVersionHistory(false);
      }
    } catch (err) {
      console.error('Failed to restore version:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get available attractions for the modal
  const destinationKey = (activeDay?.location || plan.destinations[0] || 'dwarka').toLowerCase();
  const availableAttractions = VERIFIED_ATTRACTIONS_REGISTRY[destinationKey] || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. MASTER HEADER & PACE CONTROLLER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                BharatYatra AI 2.0 Engine
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                {currentVersion.feasibilityRating}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {currentVersion.versionId}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {plan.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
              <span>{plan.origin}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span>{plan.destinations.join(' • ')}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span>{plan.durationDays} Days / {Math.max(1, plan.durationDays - 1)} Nights</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Pace Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['relaxed', 'balanced', 'fast-paced'] as const).map((paceKey) => {
                const isActive = activePace === paceKey || (paceKey === 'fast-paced' && activePace === 'active');
                return (
                  <button
                    key={paceKey}
                    onClick={() => handlePaceChange(paceKey)}
                    disabled={isProcessing}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-primary shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {paceKey === 'fast-paced' ? 'Active' : paceKey.charAt(0).toUpperCase() + paceKey.slice(1)}
                  </button>
                );
              })}
            </div>

            {/* Version History Trigger */}
            <button
              onClick={() => setShowVersionHistory(true)}
              className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <History className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              History ({plan.versionHistory?.length || 1})
            </button>
          </div>
        </div>

        {/* Acclimatization / Seasonal Advisory Banner */}
        {plan.explanations?.seasonalNotice && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <span className="font-semibold">Health & High-Altitude Protocol: </span>
              {plan.explanations.seasonalNotice}
            </div>
          </div>
        )}

        {/* Validation Score Banner */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Feasibility Score</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {plan.validation.score} / 100
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Total Active Hours</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {currentVersion.totalActiveHours} hrs
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Transit Distance</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {currentVersion.totalDistanceKm} km
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Travel Style</span>
            <span className="text-base font-bold text-primary capitalize">
              {plan.preferenceProfile?.pace?.style || 'Balanced'} Pace
            </span>
          </div>
        </div>
      </div>

      {/* 2. DAY SELECTOR NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {currentDays.map((day) => {
          const isSelected = day.dayNumber === selectedDayNumber;
          return (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayNumber(day.dayNumber)}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                  Day {day.dayNumber}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {day.activeHours}h active
                </span>
              </div>
              <div className="text-sm font-semibold truncate max-w-[150px]">
                {day.location}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE DAY VIEW */}
      {activeDay && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Day Overview Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                <span>Day {activeDay.dayNumber}</span>
                {activeDay.date && (
                  <>
                    <span>•</span>
                    <span>{activeDay.date}</span>
                  </>
                )}
                <span>•</span>
                <span>{activeDay.location}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {activeDay.dayTitle}
              </h2>
              {activeDay.dayNotes && activeDay.dayNotes.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  {activeDay.dayNotes.join(' • ')}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRegenerateDay(activeDay.dayNumber)}
                disabled={isProcessing}
                className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${isProcessing ? 'animate-spin' : ''}`} />
                Regenerate Day
              </button>
            </div>
          </div>

          {/* Meals & Overnight Stay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <Utensils className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Dining Recommendations</span>
                <div className="text-slate-600 dark:text-slate-400 space-y-0.5">
                  {activeDay.mealPlan?.map((m, idx) => (
                    <div key={idx}>
                      <strong>{m.mealType}:</strong> {m.recommendedCuisine} {m.suggestedVenue ? `(${m.suggestedVenue})` : ''} - ₹{m.estimatedCostInr}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Overnight Stay</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeDay.accommodation?.hotelName || 'Standard 3-star AC hotel in city center (Included in package)'}
                </p>
              </div>
            </div>
          </div>

          {/* Slots: Morning, Afternoon, Evening */}
          {(['morning', 'afternoon', 'evening'] as const).map((slotKey) => {
            const slotActivities =
              slotKey === 'morning'
                ? activeDay.morningActivities
                : slotKey === 'afternoon'
                ? activeDay.afternoonActivities
                : activeDay.eveningActivities;

            const slotTitle =
              slotKey === 'morning' ? 'Morning Slot (08:30 - 12:30)' : slotKey === 'afternoon' ? 'Afternoon Slot (13:30 - 17:00)' : 'Evening Slot (17:30 - 21:00)';

            return (
              <div key={slotKey} className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {slotTitle}
                  </h3>
                  <button
                    onClick={() =>
                      setModalState({
                        isOpen: true,
                        mode: 'add',
                        dayNumber: activeDay.dayNumber,
                        slot: slotKey,
                      })
                    }
                    className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Activity
                  </button>
                </div>

                {slotActivities.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    No scheduled activities. Free time for exploration or rest.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {slotActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/40 bg-white dark:bg-slate-900 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {act.name}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                              {act.category}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium">
                              {act.durationMinutes} mins
                            </span>
                            {act.estimatedCostInr !== undefined && (
                              <span className="text-[11px] text-slate-500 font-mono">
                                {act.estimatedCostInr === 0 ? 'Free Entry' : `₹${act.estimatedCostInr} fee`}
                              </span>
                            )}
                          </div>

                          {act.reason && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {act.reason}
                            </p>
                          )}

                          {act.suitabilityInterests && act.suitabilityInterests.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {act.suitabilityInterests.map((interest, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded"
                                >
                                  • {interest}
                                </span>
                              ))}
                            </div>
                          )}

                          {act.accessibility && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Info className="w-3 h-3 text-slate-400" />
                              <span>
                                {act.accessibility.wheelchairAccessible ? 'Wheelchair Accessible' : 'Standard Access'}
                                {act.accessibility.seniorFriendly ? ' • Senior Friendly' : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                          <button
                            onClick={() =>
                              setModalState({
                                isOpen: true,
                                mode: 'replace',
                                dayNumber: activeDay.dayNumber,
                                slot: slotKey,
                                targetActivityId: act.id,
                              })
                            }
                            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                          >
                            Replace
                          </button>
                          <button
                            onClick={() => handleRemoveActivity(activeDay.dayNumber, act.id)}
                            className="p-1.5 text-xs rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                            title="Remove Activity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL: ADD / REPLACE ACTIVITY */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {modalState.mode === 'add' ? 'Add Activity' : 'Replace Activity'} (Day {modalState.dayNumber} {modalState.slot})
              </h3>
              <button
                onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose from verified attractions in <strong>{activeDay?.location}</strong>:
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {availableAttractions.length === 0 ? (
                <div className="text-xs text-slate-400 p-4 text-center">
                  No additional attractions cataloged for this destination.
                </div>
              ) : (
                availableAttractions.map((attr) => (
                  <div
                    key={attr.id}
                    onClick={() => handleSelectAttractionForModal(attr)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary cursor-pointer hover:bg-primary/5 transition space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {attr.name}
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                        {attr.visitDurationMinutes}m
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {attr.category} • Entry: {attr.entryFeeInr === 0 ? 'Free' : `₹${attr.entryFeeInr}`}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: VERSION HISTORY & RESTORATION */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Itinerary Version History & Audit Log
                </h3>
              </div>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {plan.versionHistory?.map((ver) => {
                const isCurrent = ver.versionId === currentVersion.versionId;
                return (
                  <div
                    key={ver.versionId}
                    className={`p-3.5 rounded-xl border transition ${
                      isCurrent
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          {ver.versionId}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold bg-primary text-white px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          by {ver.author}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">
                      {ver.changeSummary}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{ver.days.length} Days • {ver.totalActiveHours}h active</span>
                      {!isCurrent && (
                        <button
                          onClick={() => handleRestoreVersion(ver.versionId)}
                          disabled={isProcessing}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowVersionHistory(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
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
