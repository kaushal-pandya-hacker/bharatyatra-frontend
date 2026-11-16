'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Undo2,
  Redo2,
  Share2,
  Hotel,
  Car,
  Plane,
  Train,
  Bus,
  Copy,
  ChevronUp,
  ChevronDown,
  Layers,
  CheckCircle2,
  GripVertical,
  Sliders,
  DollarSign,
  Send,
  BookOpen,
} from 'lucide-react';
import {
  ItineraryMasterPlan,
  ItineraryDay,
  ItineraryActivity,
  ItineraryVersion,
  ItineraryDiffProposal,
  VerifiedAttractionMetadata,
  VERIFIED_ATTRACTIONS_REGISTRY,
  dynamicItineraryEngine,
} from '@/lib/ai-planner/dynamic-itinerary-engine';
import { TravelPace } from '@/lib/ai-planner/universal-preference-profile';
import { ItineraryDiffModal } from './ItineraryDiffModal';
import { ItineraryAiAssistantDrawer } from './ItineraryAiAssistantDrawer';
import { saveTrip, saveTripToApi } from '@/lib/trips/trip-storage';

interface DynamicItineraryPlannerProps {
  initialPlan: ItineraryMasterPlan;
  onUpdatePlan?: (updatedPlan: ItineraryMasterPlan) => void;
  className?: string;
  tripId?: string;
}

export function DynamicItineraryPlanner({
  initialPlan,
  onUpdatePlan,
  className = '',
  tripId,
}: DynamicItineraryPlannerProps) {
  const router = useRouter();

  // Primary Plan & Navigation State
  const [plan, setPlan] = useState<ItineraryMasterPlan>(initialPlan);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [activePace, setActivePace] = useState<string>(
    plan.preferenceProfile?.pace?.style || 'balanced'
  );

  // Undo / Redo in-memory stacks
  const [undoStack, setUndoStack] = useState<ItineraryMasterPlan[]>([]);
  const [redoStack, setRedoStack] = useState<ItineraryMasterPlan[]>([]);

  // UI Modals & Drawers
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [diffProposal, setDiffProposal] = useState<ItineraryDiffProposal | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'ready'>('saved');
  const [copyShareFeedback, setCopyShareFeedback] = useState(false);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);
  const [showAddDestModal, setShowAddDestModal] = useState(false);
  const [newDestInput, setNewDestInput] = useState('');

  // Drag and drop tracking
  const [dragSource, setDragSource] = useState<{
    dayNumber: number;
    slot: 'morning' | 'afternoon' | 'evening';
    activityId: string;
    index: number;
  } | null>(null);

  // Custom Activity Modal State
  const [customActModal, setCustomActModal] = useState<{
    isOpen: boolean;
    dayNumber: number;
    slot: 'morning' | 'afternoon' | 'evening';
    title: string;
    category: string;
    duration: number;
    cost: number;
    notes: string;
  }>({
    isOpen: false,
    dayNumber: 1,
    slot: 'morning',
    title: '',
    category: 'Sightseeing & Culture',
    duration: 90,
    cost: 0,
    notes: '',
  });

  // Add / Replace Modal from Registry
  const [registryModal, setRegistryModal] = useState<{
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

  // Helper to commit plan changes with undo tracking
  const commitPlanChange = (updatedPlan: ItineraryMasterPlan) => {
    setUndoStack((prev) => [...prev.slice(-25), plan]);
    setRedoStack([]);
    setPlan(updatedPlan);
    setSaveStatus('saving');
    onUpdatePlan?.(updatedPlan);

    // Autosave to user trips storage
    if (typeof window !== 'undefined') {
      try {
        const idToUse = tripId || plan.tripId || `trip_${Date.now()}`;
        saveTrip({
          tripId: idToUse,
          title: updatedPlan.title,
          destination: updatedPlan.destinations.join(', '),
          startDate: updatedPlan.startDate || new Date().toISOString(),
          durationDays: updatedPlan.durationDays,
          status: 'PLANNING',
          itineraryJson: updatedPlan,
          selectedTier: (updatedPlan.currentVersion.pricing?.recommendedTier || 'balanced') as any,
          budgetInr: updatedPlan.currentVersion.pricing?.tiers?.[updatedPlan.currentVersion.pricing.recommendedTier || 'standard']?.totalGroupCost || 0,
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Autosave error:', err);
      }
    }
  };

  // Undo / Redo operations
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, plan]);
    setPlan(previous);
    onUpdatePlan?.(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, plan]);
    setPlan(next);
    onUpdatePlan?.(next);
  };

  // Drag and drop event handlers
  const handleDragStart = (
    e: React.DragEvent,
    dayNumber: number,
    slot: 'morning' | 'afternoon' | 'evening',
    activityId: string,
    index: number
  ) => {
    setDragSource({ dayNumber, slot, activityId, index });
    e.dataTransfer.setData('text/plain', JSON.stringify({ dayNumber, slot, activityId, index }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSlot = (
    e: React.DragEvent,
    targetDayNumber: number,
    targetSlot: 'morning' | 'afternoon' | 'evening',
    targetIndex?: number
  ) => {
    e.preventDefault();
    if (!dragSource) return;

    if (dragSource.dayNumber === targetDayNumber && dragSource.slot === targetSlot) {
      if (typeof targetIndex === 'number' && targetIndex !== dragSource.index) {
        const updated = dynamicItineraryEngine.reorderActivitiesInSlot(
          plan,
          targetDayNumber,
          targetSlot,
          dragSource.index,
          targetIndex
        );
        commitPlanChange(updated);
      }
    } else {
      const updated = dynamicItineraryEngine.moveActivity(
        plan,
        dragSource.dayNumber,
        dragSource.slot,
        targetDayNumber,
        targetSlot,
        dragSource.activityId,
        targetIndex
      );
      commitPlanChange(updated);
    }
    setDragSource(null);
  };

  // Touch Move Controls
  const handleMoveWithinSlot = (
    dayNumber: number,
    slot: 'morning' | 'afternoon' | 'evening',
    fromIdx: number,
    direction: 'up' | 'down'
  ) => {
    const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
    const updated = dynamicItineraryEngine.reorderActivitiesInSlot(
      plan,
      dayNumber,
      slot,
      fromIdx,
      toIdx
    );
    commitPlanChange(updated);
  };

  const handleMoveToAnotherSlot = (
    dayNumber: number,
    currentSlot: 'morning' | 'afternoon' | 'evening',
    targetSlot: 'morning' | 'afternoon' | 'evening',
    activityId: string
  ) => {
    const updated = dynamicItineraryEngine.moveActivity(
      plan,
      dayNumber,
      currentSlot,
      dayNumber,
      targetSlot,
      activityId
    );
    commitPlanChange(updated);
  };

  const handleMoveToDay = (
    sourceDayNumber: number,
    sourceSlot: 'morning' | 'afternoon' | 'evening',
    targetDayNumber: number,
    activityId: string
  ) => {
    const updated = dynamicItineraryEngine.moveActivity(
      plan,
      sourceDayNumber,
      sourceSlot,
      targetDayNumber,
      sourceSlot,
      activityId
    );
    commitPlanChange(updated);
  };

  // Duplicate Activity
  const handleDuplicate = (dayNumber: number, activityId: string) => {
    const updated = dynamicItineraryEngine.duplicateActivity(plan, dayNumber, activityId);
    commitPlanChange(updated);
  };

  // Remove Activity
  const handleRemoveActivity = (dayNumber: number, activityId: string) => {
    const updated = dynamicItineraryEngine.removeActivityFromDay(plan, dayNumber, activityId);
    commitPlanChange(updated);
  };

  // Pace Change
  const handlePaceChange = (newPace: 'relaxed' | 'balanced' | 'active') => {
    setActivePace(newPace);
    const updated = dynamicItineraryEngine.changeTravelPace(plan, newPace);
    commitPlanChange(updated);
  };

  // Day Management
  const handleAddDay = () => {
    const updated = dynamicItineraryEngine.addDay(plan, activeDay?.dayNumber);
    commitPlanChange(updated);
    setSelectedDayNumber(updated.durationDays);
  };

  const handleRemoveDay = (dayNum: number) => {
    if (plan.currentVersion.days.length <= 1) return;
    const updated = dynamicItineraryEngine.removeDay(plan, dayNum);
    commitPlanChange(updated);
    setSelectedDayNumber(Math.min(dayNum, updated.durationDays));
  };

  // Destination Management
  const handleAddDestination = () => {
    const d = newDestInput.trim();
    if (!d) return;
    const updated = dynamicItineraryEngine.addDestination(plan, d, 1);
    commitPlanChange(updated);
    setNewDestInput('');
    setShowAddDestModal(false);
  };

  const handleRemoveDestination = (dest: string) => {
    if (plan.destinations.length <= 1) return;
    const updated = dynamicItineraryEngine.removeDestination(plan, dest);
    commitPlanChange(updated);
  };

  // Accommodation Tier Switch
  const handleHotelTierChange = (dayNumber: number, tier: 'budget' | 'standard' | 'premium' | 'luxury') => {
    const tierRates: Record<string, { rate: number; name: string }> = {
      budget: { rate: 1600, name: 'Verified Heritage Homestay / Express Stay' },
      standard: { rate: 3500, name: 'Comfort City Hotel with Breakfast' },
      premium: { rate: 7500, name: 'Premium Resort & Spa' },
      luxury: { rate: 14000, name: '5-Star Luxury Heritage Palace' },
    };
    const choice = tierRates[tier] || tierRates.standard;
    const updated = dynamicItineraryEngine.updateAccommodation(plan, dayNumber, {
      hotelName: `${activeDay.location} ${choice.name}`,
      city: activeDay.location,
      category: tier,
      starRating: tier === 'luxury' ? 5 : tier === 'premium' ? 4 : 3,
      nights: 1,
      estimatedCostPerNightInr: choice.rate,
      totalCostInr: choice.rate,
      reason: `Customer selected ${tier} stay tier (Estimated suggestion — not confirmed booking)`,
    });
    commitPlanChange(updated);
  };

  // Transit Mode Switch
  const handleTransitModeChange = (
    dayNumber: number,
    legIdx: number,
    mode: 'flight' | 'train' | 'bus' | 'cab' | 'walking' | 'ropeway'
  ) => {
    const modeRates: Record<string, { cost: number; mins: number }> = {
      flight: { cost: 4200, mins: 80 },
      train: { cost: 1250, mins: 320 },
      cab: { cost: 2400, mins: 210 },
      bus: { cost: 750, mins: 280 },
      walking: { cost: 0, mins: 30 },
      ropeway: { cost: 180, mins: 15 },
    };
    const choice = modeRates[mode] || { cost: 1000, mins: 180 };
    const updated = dynamicItineraryEngine.updateTransportLeg(
      plan,
      dayNumber,
      legIdx,
      mode,
      choice.cost,
      choice.mins
    );
    commitPlanChange(updated);
  };

  // Custom Activity Submission
  const handleSaveCustomActivity = () => {
    if (!customActModal.title.trim()) return;
    const updated = dynamicItineraryEngine.addCustomActivity(
      plan,
      customActModal.dayNumber,
      customActModal.slot,
      {
        title: customActModal.title.trim(),
        category: customActModal.category,
        estimatedDurationMinutes: Number(customActModal.duration) || 90,
        costInr: Number(customActModal.cost) || 0,
        userNotes: customActModal.notes.trim(),
      }
    );
    commitPlanChange(updated);
    setCustomActModal((prev) => ({ ...prev, isOpen: false, title: '', notes: '' }));
  };

  // Add from Registry Selection
  const handleSelectFromRegistry = (attraction: VerifiedAttractionMetadata) => {
    const newActivity: ItineraryActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      activityId: attraction.id,
      destinationId: attraction.city,
      name: attraction.name,
      displayName: attraction.displayName,
      location: attraction.city,
      state: attraction.state,
      durationMinutes: attraction.visitDurationMinutes || 120,
      category: attraction.category,
      estimatedCostInr: attraction.entryFeeInr || 0,
      priority: attraction.entryFeeInr > 0 ? 'must-do' : 'recommended',
      reason: `Selected for ${registryModal.slot} slot on Day ${registryModal.dayNumber}`,
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
      evidenceStatus: 'VERIFIED',
    };

    let updated: ItineraryMasterPlan;
    if (registryModal.mode === 'replace' && registryModal.targetActivityId) {
      updated = dynamicItineraryEngine.replaceActivity(
        plan,
        registryModal.dayNumber,
        registryModal.targetActivityId,
        newActivity
      );
    } else {
      updated = dynamicItineraryEngine.addActivityToDay(
        plan,
        registryModal.dayNumber,
        newActivity,
        registryModal.slot
      );
    }
    commitPlanChange(updated);
    setRegistryModal((prev) => ({ ...prev, isOpen: false }));
  };

  // AI Diff Application
  const handleApplyAiDiff = (proposal: ItineraryDiffProposal) => {
    commitPlanChange(proposal.proposedPlan);
    setDiffProposal(null);
  };

  // Share URL copy
  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/trips/${tripId || plan.tripId || 'demo'}?view=shared`;
      navigator.clipboard.writeText(shareUrl);
      setCopyShareFeedback(true);
      setTimeout(() => setCopyShareFeedback(false), 2000);
    }
  };

  // Budget calculations
  const totalCost =
    plan.currentVersion.pricing?.tiers?.[plan.currentVersion.pricing.recommendedTier || 'standard']?.totalGroupCost ||
    24500;
  const travelersCount = Math.max(1, plan.travelers.adults + (plan.travelers.children || 0));
  const perPersonCost = Math.round(totalCost / travelersCount);

  // Available attractions for registry modal
  const destinationKey = (activeDay?.location || plan.destinations[0] || 'dwarka').toLowerCase();
  const availableAttractions = VERIFIED_ATTRACTIONS_REGISTRY[destinationKey] || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. TOP TOOLBAR & CONTROL PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> BharatYatra AI Editable Workspace
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                {currentVersion.versionId}
              </span>
              {/* Autosave Status */}
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                {saveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Saved</span>
                  </>
                )}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{plan.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-0.5">
              <span>{plan.origin}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              {/* Destination Chips with Add / Remove */}
              <div className="flex flex-wrap items-center gap-1.5">
                {plan.destinations.map((dest, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 text-xs"
                  >
                    <span>{dest}</span>
                    {plan.destinations.length > 1 && (
                      <button
                        onClick={() => handleRemoveDestination(dest)}
                        className="hover:text-amber-400 p-0.5"
                        title={`Remove ${dest}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                <button
                  onClick={() => setShowAddDestModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Stop
                </button>
              </div>
              <span className="text-slate-700">•</span>
              <span>{plan.durationDays} Days / {Math.max(1, plan.durationDays - 1)} Nights</span>
            </div>
          </div>

          {/* Action Buttons: Undo, Redo, AI Assistant, History, Share, Book */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Undo / Redo */}
            <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 p-0.5">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition"
                title="Undo last change (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* AI Assistant Trigger */}
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Farva AI Assistant</span>
            </button>

            {/* Version History */}
            <button
              onClick={() => setShowVersionHistory(true)}
              className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Versions ({plan.versionHistory?.length || 1})</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShareLink}
              className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
              title="Copy shareable link"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{copyShareFeedback ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Book & Finalize */}
            <button
              onClick={() => router.push(`/checkout?tripId=${tripId || plan.tripId || 'custom'}`)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Review & Book</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon & Pace Selector */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          {/* Live Budget Pill */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Estimated Total:</span>
              <span className="text-base font-extrabold text-white">
                ₹{totalCost.toLocaleString('en-IN')}
              </span>
              <span className="text-slate-400 text-[11px]">
                (~₹{perPersonCost.toLocaleString('en-IN')}/person)
              </span>
            </div>
            <button
              onClick={() => setShowBudgetBreakdown(!showBudgetBreakdown)}
              className="text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              {showBudgetBreakdown ? 'Hide Breakdown' : 'Cost Breakdown'}
            </button>
          </div>

          {/* Travel Pace */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Pace:</span>
            <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              {(['relaxed', 'balanced', 'active'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePaceChange(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                    activePace === p
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible Budget Breakdown */}
        {showBudgetBreakdown && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Stays & Hotels</span>
              <span className="text-sm font-bold text-white">
                ₹{Math.round(totalCost * 0.42).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block">Suggested tier</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Transportation</span>
              <span className="text-sm font-bold text-white">
                ₹{Math.round(totalCost * 0.28).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block">Transit legs & cabs</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Activities & Entries</span>
              <span className="text-sm font-bold text-white">
                ₹{Math.round(totalCost * 0.12).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block">Sightseeing & guides</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Estimated Meals</span>
              <span className="text-sm font-bold text-white">
                ₹{Math.round(totalCost * 0.13).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block">3 meals/day guide</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Buffer & Taxes</span>
              <span className="text-sm font-bold text-white">
                ₹{Math.round(totalCost * 0.05).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block">Contingency reserve</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. DAY NAVIGATION TABS & ADD DAY */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {currentDays.map((day) => {
          const isSelected = day.dayNumber === selectedDayNumber;
          return (
            <div key={day.dayNumber} className="relative group shrink-0">
              <button
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`px-4 py-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className={`text-[10px] uppercase tracking-wider ${isSelected ? 'text-slate-950/80 font-bold' : 'text-slate-400'}`}>
                    Day {day.dayNumber}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {day.activeHours}h active
                  </span>
                </div>
                <div className="text-xs font-bold truncate max-w-[130px]">
                  {day.location}
                </div>
              </button>

              {/* Day Delete Button (if > 1 day) */}
              {currentDays.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDay(day.dayNumber);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white border border-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                  title={`Delete Day ${day.dayNumber}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Day Button */}
        <button
          onClick={handleAddDay}
          className="shrink-0 px-4 py-3 rounded-2xl border border-dashed border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-emerald-400 bg-slate-900/40 hover:bg-slate-900 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Day</span>
        </button>
      </div>

      {/* 3. ACTIVE DAY VIEW & SLOTS */}
      {activeDay && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Day Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <span>Day {activeDay.dayNumber} of {plan.durationDays}</span>
                <span>•</span>
                <span>Base: {activeDay.location}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{activeDay.dayTitle}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                {activeDay.activeHours} hours scheduled
              </span>
              <span className={`px-2.5 py-1 rounded-lg border ${
                activeDay.isFeasible ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {activeDay.isFeasible ? 'Optimal Flow' : 'Pace Warning'}
              </span>
            </div>
          </div>

          {/* Accommodation Suggestion Card with Clear Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Hotel className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Suggested Overnight Stay
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">
                  Estimated Suggestion — Not Confirmed Booking
                </span>
              </div>
              {/* Hotel Tier Switcher */}
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[11px]">
                {(['budget', 'standard', 'premium', 'luxury'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleHotelTierChange(activeDay.dayNumber, tier)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition ${
                      activeDay.accommodation?.category === tier
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div>
                <span className="font-semibold text-white">
                  {activeDay.accommodation?.hotelName || `${activeDay.location} Comfort Stay`}
                </span>
                <span className="text-slate-500 ml-2">
                  (⭐ {activeDay.accommodation?.starRating || 3} Star Rating)
                </span>
              </div>
              <span className="font-bold text-emerald-400">
                ₹{(activeDay.accommodation?.estimatedCostPerNightInr || 3500).toLocaleString('en-IN')}/night est.
              </span>
            </div>
          </div>

          {/* Time Slots: Morning, Afternoon, Evening */}
          {(['morning', 'afternoon', 'evening'] as const).map((slotKey) => {
            const slotTitle =
              slotKey === 'morning' ? 'Morning Slot (08:00 – 12:30)' : slotKey === 'afternoon' ? 'Afternoon Slot (13:30 – 17:30)' : 'Evening & Leisure (18:00 – 21:30)';
            const slotColor =
              slotKey === 'morning' ? 'text-amber-400' : slotKey === 'afternoon' ? 'text-sky-400' : 'text-purple-400';
            const activities =
              slotKey === 'morning'
                ? activeDay.morningActivities
                : slotKey === 'afternoon'
                ? activeDay.afternoonActivities
                : activeDay.eveningActivities;

            return (
              <div
                key={slotKey}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnSlot(e, activeDay.dayNumber, slotKey)}
                className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3 transition-colors hover:border-slate-700"
              >
                {/* Slot Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${slotColor}`}>
                      {slotTitle}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({activities.length} planned)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCustomActModal({
                          isOpen: true,
                          dayNumber: activeDay.dayNumber,
                          slot: slotKey,
                          title: '',
                          category: 'Sightseeing & Culture',
                          duration: 90,
                          cost: 0,
                          notes: '',
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Custom Place
                    </button>
                    <button
                      onClick={() =>
                        setRegistryModal({
                          isOpen: true,
                          mode: 'add',
                          dayNumber: activeDay.dayNumber,
                          slot: slotKey,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> From Registry
                    </button>
                  </div>
                </div>

                {/* Activity Cards List */}
                {activities.length > 0 ? (
                  <div className="space-y-2.5">
                    {activities.map((act, actIdx) => (
                      <div
                        key={act.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, activeDay.dayNumber, slotKey, act.id, actIdx)
                        }
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition group cursor-grab active:cursor-grabbing space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-400 mt-1 shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">{act.name}</h4>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                                  {act.evidenceStatus}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {act.durationMinutes} mins
                                </span>
                                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                  {act.estimatedCostInr > 0
                                    ? `₹${act.estimatedCostInr} fee`
                                    : 'Free Access'}
                                </span>
                                <span className="text-slate-500">{act.category}</span>
                              </p>
                              {act.reason && (
                                <p className="text-[11px] text-slate-400 italic mt-1">
                                  "{act.reason}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Desktop & Mobile Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Move Up */}
                            <button
                              onClick={() =>
                                handleMoveWithinSlot(activeDay.dayNumber, slotKey, actIdx, 'up')
                              }
                              disabled={actIdx === 0}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            {/* Move Down */}
                            <button
                              onClick={() =>
                                handleMoveWithinSlot(activeDay.dayNumber, slotKey, actIdx, 'down')
                              }
                              disabled={actIdx === activities.length - 1}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicate(activeDay.dayNumber, act.id)}
                              className="p-1 text-slate-400 hover:text-white transition"
                              title="Duplicate Activity"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => handleRemoveActivity(activeDay.dayNumber, act.id)}
                              className="p-1 text-slate-400 hover:text-amber-400 transition"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Mobile Slot Switcher Bar */}
                        <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <span>Move to Slot:</span>
                            {(['morning', 'afternoon', 'evening'] as const)
                              .filter((s) => s !== slotKey)
                              .map((targetS) => (
                                <button
                                  key={targetS}
                                  onClick={() =>
                                    handleMoveToAnotherSlot(
                                      activeDay.dayNumber,
                                      slotKey,
                                      targetS,
                                      act.id
                                    )
                                  }
                                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 capitalize text-[10px]"
                                >
                                  {targetS}
                                </button>
                              ))}
                          </div>
                          {/* Move to another Day */}
                          {currentDays.length > 1 && (
                            <div className="flex items-center gap-1">
                              <span>Move to:</span>
                              <select
                                value={activeDay.dayNumber}
                                onChange={(e) =>
                                  handleMoveToDay(
                                    activeDay.dayNumber,
                                    slotKey,
                                    parseInt(e.target.value),
                                    act.id
                                  )
                                }
                                className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-[10px]"
                              >
                                {currentDays.map((d) => (
                                  <option key={d.dayNumber} value={d.dayNumber}>
                                    Day {d.dayNumber}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    No activities scheduled for this slot. Drag an activity here, or click "+ Custom Place" to add one.
                  </div>
                )}
              </div>
            );
          })}

          {/* Transit Legs on this Day */}
          {activeDay.transportLegs && activeDay.transportLegs.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-emerald-400" /> Inter-City / En-Route Transit Legs
              </div>
              <div className="space-y-2">
                {activeDay.transportLegs.map((leg, legIdx) => (
                  <div
                    key={legIdx}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">
                        {leg.from} → {leg.to}
                      </span>
                      <span className="text-slate-500 ml-2">
                        (~{leg.estimatedDurationMinutes} mins • {leg.distanceKm} km)
                      </span>
                    </div>
                    {/* Transit Mode Switcher */}
                    <div className="flex items-center gap-2">
                      <select
                        value={leg.mode}
                        onChange={(e) =>
                          handleTransitModeChange(activeDay.dayNumber, legIdx, e.target.value as any)
                        }
                        className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs capitalize"
                      >
                        <option value="cab">Private Cab / SUV</option>
                        <option value="train">Vande Bharat / Express Train</option>
                        <option value="flight">Domestic Flight</option>
                        <option value="bus">Volvo AC Bus</option>
                        <option value="walking">Walking / Local</option>
                      </select>
                      <span className="font-bold text-emerald-400">
                        ₹{leg.estimatedCostInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MODALS & DRAWERS */}

      {/* Custom Activity Dialog */}
      {customActModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Add Custom Place to Day {customActModal.dayNumber} ({customActModal.slot})
              </h3>
              <button
                onClick={() => setCustomActModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Place / Activity Name *</label>
                <input
                  type="text"
                  value={customActModal.title}
                  onChange={(e) =>
                    setCustomActModal((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Sunset Point Tea Stall & View"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Category</label>
                  <select
                    value={customActModal.category}
                    onChange={(e) =>
                      setCustomActModal((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Sightseeing & Culture">Sightseeing & Culture</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Shopping & Bazaar">Shopping & Bazaar</option>
                    <option value="Adventure & Nature">Adventure & Nature</option>
                    <option value="Leisure & Relaxation">Leisure & Relaxation</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Duration (minutes)</label>
                  <input
                    type="number"
                    value={customActModal.duration}
                    onChange={(e) =>
                      setCustomActModal((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 60,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Estimated Cost (₹ INR)</label>
                <input
                  type="number"
                  value={customActModal.cost}
                  onChange={(e) =>
                    setCustomActModal((prev) => ({
                      ...prev,
                      cost: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0 for free"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Personal Notes / Tips</label>
                <textarea
                  value={customActModal.notes}
                  onChange={(e) =>
                    setCustomActModal((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={2}
                  placeholder="e.g. Try the local kesar chai, best during golden hour"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setCustomActModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomActivity}
                disabled={!customActModal.title.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition disabled:opacity-40"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Destination Modal */}
      {showAddDestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Destination Stop</h3>
              <button onClick={() => setShowAddDestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Destination City or Landmark</label>
              <input
                type="text"
                value={newDestInput}
                onChange={(e) => setNewDestInput(e.target.value)}
                placeholder="e.g. Somnath, Diu, or Agra"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddDestModal(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDestination}
                disabled={!newDestInput.trim()}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-40"
              >
                Add Stop & Days
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registry Selection Modal */}
      {registryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Select from Verified Attractions ({activeDay.location})
              </h3>
              <button
                onClick={() => setRegistryModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {availableAttractions.length > 0 ? (
                availableAttractions.map((attraction) => (
                  <div
                    key={attraction.id}
                    onClick={() => handleSelectFromRegistry(attraction)}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500 hover:bg-slate-950 transition cursor-pointer flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                        {attraction.displayName || attraction.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {attraction.category} • ~{attraction.visitDurationMinutes} mins
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Hours: {attraction.openingTime} – {attraction.closingTime}
                        {attraction.closedDays.length > 0 && ` (Closed: ${attraction.closedDays.join(', ')})`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-400 block">
                        {attraction.entryFeeInr > 0 ? `₹${attraction.entryFeeInr}` : 'Free'}
                      </span>
                      <span className="text-[10px] text-slate-400">Select</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No verified attractions in database for {activeDay.location}. You can use "+ Custom Place" to add any attraction.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version History Drawer */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Itinerary Version History</h3>
                </div>
                <button
                  onClick={() => setShowVersionHistory(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {plan.versionHistory.map((v, i) => (
                  <div
                    key={v.versionId}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition ${
                      v.versionId === currentVersion.versionId
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-400">{v.versionId}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300">{v.changeSummary}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500">Author: {v.author}</span>
                      {v.versionId !== currentVersion.versionId && (
                        <button
                          onClick={() => {
                            const restored = dynamicItineraryEngine.restoreVersion(plan, v.versionId);
                            commitPlanChange(restored);
                            setShowVersionHistory(false);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-bold underline"
                        >
                          Restore This Version
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
              Every customization automatically creates a restorable audit checkpoint.
            </div>
          </div>
        </div>
      )}

      {/* Farva AI Assistant Drawer */}
      <ItineraryAiAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        plan={plan}
        onRequestDiffPreview={(proposal) => {
          setIsAssistantOpen(false);
          setDiffProposal(proposal);
        }}
      />

      {/* Side-by-Side Diff Modal */}
      <ItineraryDiffModal
        isOpen={diffProposal !== null}
        proposal={diffProposal}
        onApply={handleApplyAiDiff}
        onCancel={() => setDiffProposal(null)}
      />
    </div>
  );
}

export default DynamicItineraryPlanner;
