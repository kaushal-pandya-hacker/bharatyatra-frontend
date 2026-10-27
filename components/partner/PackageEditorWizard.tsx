'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Calendar,
  IndianRupee,
  CheckSquare,
  Clock,
  Image as ImageIcon,
  Eye,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { TravelPackage, TravelPackageItineraryDay } from '@/types/travel-partner';

interface PackageEditorWizardProps {
  initialPackage?: TravelPackage;
  isEditing?: boolean;
}

export default function PackageEditorWizard({ initialPackage, isEditing = false }: PackageEditorWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Basic Details
  const [title, setTitle] = useState(initialPackage?.title || '');
  const [shortDescription, setShortDescription] = useState(initialPackage?.shortDescription || '');
  const [description, setDescription] = useState(initialPackage?.description || '');
  const [category, setCategory] = useState(initialPackage?.category || 'Pilgrimage & Spiritual');
  const [tourType, setTourType] = useState<'GROUP' | 'PRIVATE' | 'BOTH'>(initialPackage?.tourType || 'BOTH');
  const [stateOrRegion, setStateOrRegion] = useState(initialPackage?.stateOrRegion || 'Gujarat');
  const [origin, setOrigin] = useState(initialPackage?.origin || 'Ahmedabad');
  const [destinationSummary, setDestinationSummary] = useState(initialPackage?.destinationSummary || 'Dwarka, Somnath, Gir');
  const [durationDays, setDurationDays] = useState(initialPackage?.durationDays || 4);
  const [durationNights, setDurationNights] = useState(initialPackage?.durationNights || 3);
  const [minTravellers, setMinTravellers] = useState(initialPackage?.minTravellers || 2);
  const [maxTravellers, setMaxTravellers] = useState(initialPackage?.maxTravellers || 20);

  // Step 2: Itinerary Days
  const [itinerary, setItinerary] = useState<TravelPackageItineraryDay[]>(
    initialPackage?.itinerary || [
      {
        dayNumber: 1,
        title: 'Arrival and Welcome Sightseeing',
        description: 'Pick up from airport/railway station, check-in at resort, and introductory sunset temple visit.',
        places: ['Ahmedabad', 'Riverfront'],
        activities: ['Airport greeting', 'Sunset river walk'],
        meals: ['Dinner'],
        accommodationDetails: '3-Star Standard Hotel',
        transportDetails: 'Private AC Cab',
      },
      {
        dayNumber: 2,
        title: 'Temple Corridor and Heritage Exploration',
        description: 'Full-day excursion to sacred pilgrimage monuments with certified temple priest assistance.',
        places: ['Dwarka', 'Bet Dwarka'],
        activities: ['Morning Darshan', 'Island Boat Ride'],
        meals: ['Breakfast', 'Dinner'],
        accommodationDetails: '3-Star Standard Hotel',
        transportDetails: 'Private AC Cab',
      },
    ]
  );

  // Step 3: Pricing
  const [basePrice, setBasePrice] = useState(initialPackage?.basePrice || 14999);
  const [discountedPrice, setDiscountedPrice] = useState(initialPackage?.discountedPrice || 12999);

  // Step 4: Inclusions & Exclusions
  const [inclusions, setInclusions] = useState<string[]>(
    initialPackage?.inclusions || [
      'AC Hotel accommodation on twin-sharing basis',
      'Daily breakfast and dinner (Satvik vegetarian)',
      'Dedicated AC Sedan transport for all inter-city transfers',
      'Driver allowances, toll taxes, and parking fees',
    ]
  );
  const [exclusions, setExclusions] = useState<string[]>(
    initialPackage?.exclusions || [
      'Flight or train tickets to destination',
      'Personal expenses, laundry, and room service',
      'Monument camera fees and special puja passes',
    ]
  );
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  // Step 5: Availability & Booking Rules
  const [bookingNoticeDays, setBookingNoticeDays] = useState(initialPackage?.bookingNoticeDays || 3);
  const [cancellationPolicy, setCancellationPolicy] = useState(
    initialPackage?.cancellationPolicy ||
      'Full refund up to 7 days before departure. 50% refund between 7 to 3 days. Non-refundable within 72 hours of departure.'
  );

  // Step 6: Media
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialPackage?.coverImageUrl ||
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80'
  );
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>(
    initialPackage?.galleryImageUrls || [
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
    ]
  );
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Step 7: Declarations
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [confirmRights, setConfirmRights] = useState(false);

  // Step 2 Itinerary actions
  const addItineraryDay = () => {
    const nextDay = itinerary.length + 1;
    setItinerary([
      ...itinerary,
      {
        dayNumber: nextDay,
        title: `Day ${nextDay}: Sightseeing and Transfers`,
        description: 'Explore scenic destinations and cultural attractions.',
        places: ['Local Sightseeing'],
        activities: ['Guided tour'],
        meals: ['Breakfast'],
        accommodationDetails: 'Standard Stay',
        transportDetails: 'AC Transport',
      },
    ]);
  };

  const removeItineraryDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setItinerary(updated);
  };

  const updateItineraryField = (index: number, field: keyof TravelPackageItineraryDay, val: any) => {
    const updated = [...itinerary];
    (updated[index] as any)[field] = val;
    setItinerary(updated);
  };

  // Step 4 Inclusions actions
  const addInclusion = () => {
    if (newInclusion.trim()) {
      setInclusions([...inclusions, newInclusion.trim()]);
      setNewInclusion('');
    }
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      setExclusions([...exclusions, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  // Step 6 Gallery action
  const addGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setGalleryImageUrls([...galleryImageUrls, newGalleryUrl.trim()]);
      setNewGalleryUrl('');
    }
  };

  const handleSaveDraft = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const payload = {
        title,
        shortDescription,
        description,
        category,
        tourType,
        stateOrRegion,
        origin,
        destinationSummary,
        destinations: destinationSummary.split(',').map((s) => s.trim()).filter(Boolean),
        durationDays: Number(durationDays),
        durationNights: Number(durationNights),
        basePrice: Number(basePrice),
        discountedPrice: Number(discountedPrice),
        minTravellers: Number(minTravellers),
        maxTravellers: Number(maxTravellers),
        itinerary,
        inclusions,
        exclusions,
        bookingNoticeDays: Number(bookingNoticeDays),
        cancellationPolicy,
        coverImageUrl,
        galleryImageUrls,
      };

      const endpoint = isEditing
        ? `/api/v1/partner/packages/${initialPackage?.id}`
        : '/api/v1/partner/packages';
      const method = isEditing ? 'PATCH' : 'POST';

      const agencyId = typeof window !== 'undefined' ? localStorage.getItem('partner_agency_id') : '';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(agencyId ? { 'x-agency-id': agencyId } : {}),
      };

      const res = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to save package draft.');
      }

      router.push('/partner/packages');
    } catch (err: any) {
      setError(err.message || 'Error saving package.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmAccurate || !confirmRights) {
      setError('Please acknowledge both declaration checkboxes before submitting for review.');
      return;
    }
    await handleSaveDraft();
  };

  const steps = [
    { num: 1, label: 'Basic Details', icon: Package },
    { num: 2, label: 'Itinerary', icon: Calendar },
    { num: 3, label: 'Pricing', icon: IndianRupee },
    { num: 4, label: 'Inclusions', icon: CheckSquare },
    { num: 5, label: 'Availability', icon: Clock },
    { num: 6, label: 'Media & Photos', icon: ImageIcon },
    { num: 7, label: 'Preview & Submit', icon: Eye },
  ];

  return (
    <div className="space-y-8">
      {/* Stepper Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-[10px] text-[#FED65B] uppercase font-bold tracking-wider">
              Package Creation Wizard
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isEditing ? `Edit: ${initialPackage?.title}` : 'Design New Travel Package'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
            >
              {isSaving ? 'Saving Draft...' : 'Save Draft'}
            </button>
            <Link
              href="/partner/packages"
              className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-semibold"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-2 border-t border-slate-800/80">
          {steps.map((st) => {
            const Icon = st.icon;
            const isActive = currentStep === st.num;
            const isPast = currentStep > st.num;
            return (
              <button
                type="button"
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className={`p-2 rounded-xl text-left border transition-all ${
                  isActive
                    ? 'bg-[#FED65B] text-slate-950 border-[#FED65B] font-bold shadow-md'
                    : isPast
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-slate-950/60 text-slate-500 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="truncate">{st.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Body */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        
        {/* STEP 1: BASIC DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#FED65B]" /> Step 1: Basic Package Details
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Define your package title, categories, and duration.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Package Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5-Day Divine Dwarka, Somnath & Gir Forest Luxury Circuit"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FED65B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Tour Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FED65B]"
                >
                  <option value="Pilgrimage & Spiritual">Pilgrimage & Spiritual</option>
                  <option value="Heritage & Culture">Heritage & Culture</option>
                  <option value="Wildlife Safari">Wildlife Safari</option>
                  <option value="Beach & Coastal">Beach & Coastal</option>
                  <option value="Desert & Adventure">Desert & Adventure</option>
                  <option value="Family Holiday">Family Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Tour Format</label>
                <select
                  value={tourType}
                  onChange={(e) => setTourType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FED65B]"
                >
                  <option value="BOTH">Both Private & Small Group Departures</option>
                  <option value="PRIVATE">Private Tour Only</option>
                  <option value="GROUP">Fixed Group Tour Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">State / Union Territory *</label>
                <input
                  type="text"
                  required
                  value={stateOrRegion}
                  onChange={(e) => setStateOrRegion(e.target.value)}
                  placeholder="Gujarat"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FED65B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Starting Hub City (Origin) *</label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Ahmedabad / Rajkot"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FED65B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Key Destinations / Cities Covered *</label>
                <input
                  type="text"
                  required
                  value={destinationSummary}
                  onChange={(e) => setDestinationSummary(e.target.value)}
                  placeholder="Dwarka, Bet Dwarka, Somnath, Junagadh, Sasan Gir"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FED65B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Duration (Days) *</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FED65B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Duration (Nights)</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={durationNights}
                  onChange={(e) => setDurationNights(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FED65B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Package Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an enticing, detailed overview of the experiences, comfort level, and destinations included..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#FED65B] leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ITINERARY */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#FED65B]" /> Step 2: Day-by-Day Itinerary ({itinerary.length} Days)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Capture structured day plans, meals, and transport.</p>
              </div>

              <button
                type="button"
                onClick={addItineraryDay}
                className="px-3.5 py-1.5 bg-[#FED65B] text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-amber-400"
              >
                <Plus className="w-3.5 h-3.5" /> Add Day
              </button>
            </div>

            <div className="space-y-4">
              {itinerary.map((day, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#FED65B] bg-[#FED65B]/10 px-2.5 py-1 rounded-lg border border-[#FED65B]/20">
                      Day 0{day.dayNumber}
                    </span>
                    {itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItineraryDay(idx)}
                        className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Day Heading *</label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateItineraryField(idx, 'title', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Accommodation</label>
                      <input
                        type="text"
                        value={day.accommodationDetails || ''}
                        onChange={(e) => updateItineraryField(idx, 'accommodationDetails', e.target.value)}
                        placeholder="e.g. 3-Star Resort or Palace Stay"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Description *</label>
                      <textarea
                        rows={2}
                        value={day.description}
                        onChange={(e) => updateItineraryField(idx, 'description', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: PRICING */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-[#FED65B]" /> Step 3: Transparent Pricing & Minor Units
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Fixed precision pricing in Indian Rupees (INR).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Original Base Price Per Person (INR) *</label>
                <input
                  type="number"
                  min={500}
                  step={50}
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#FED65B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Discounted Offer Price Per Person (INR) *</label>
                <input
                  type="number"
                  min={500}
                  step={50}
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#FED65B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Minimum Travellers Per Booking</label>
                <input
                  type="number"
                  min={1}
                  value={minTravellers}
                  onChange={(e) => setMinTravellers(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FED65B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Maximum Group Capacity</label>
                <input
                  type="number"
                  min={1}
                  value={maxTravellers}
                  onChange={(e) => setMaxTravellers(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FED65B]"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-emerald-400">Zero Hidden Fees Commitment:</span>
              <p className="text-slate-400 leading-relaxed">
                BharatYatra displays complete customer prices transparently. Mandatory taxes and GST (5%) are shown before checkout.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: INCLUSIONS & EXCLUSIONS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#FED65B]" /> Step 4: Inclusions & Exclusions
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Clearly state what is included in the package tariff.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Inclusions */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  ✓ What&apos;s Included
                </label>
                <div className="space-y-2">
                  {inclusions.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl text-xs text-slate-200 border border-slate-800">
                      <span>✓ {item}</span>
                      <button
                        type="button"
                        onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))}
                        className="text-slate-500 hover:text-rose-400 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                    placeholder="Add an inclusion item..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={addInclusion}
                    className="px-3 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Exclusions */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider">
                  ✕ What&apos;s Excluded
                </label>
                <div className="space-y-2">
                  {exclusions.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl text-xs text-slate-200 border border-slate-800">
                      <span>✕ {item}</span>
                      <button
                        type="button"
                        onClick={() => setExclusions(exclusions.filter((_, idx) => idx !== i))}
                        className="text-slate-500 hover:text-rose-400 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    placeholder="Add an exclusion item..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={addExclusion}
                    className="px-3 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: AVAILABILITY & BOOKING RULES */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FED65B]" /> Step 5: Availability & Booking Cutoffs
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Booking notice and cancellation policies.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Minimum Advance Notice Required (Days) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={bookingNoticeDays}
                  onChange={(e) => setBookingNoticeDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Cancellation Policy & Refund Terms *
                </label>
                <textarea
                  rows={3}
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: MEDIA & PHOTOS */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#FED65B]" /> Step 6: Cover & Gallery Media
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">High-resolution photography showcasing destinations.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Cover Image URL *</label>
                <input
                  type="url"
                  required
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono"
                />
              </div>

              {coverImageUrl && (
                <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-800 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-slate-950/80 text-[#FED65B] px-3 py-1 rounded-lg text-[10px] font-bold">
                    Cover Preview
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Add Gallery Image</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={addGalleryImage}
                    className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {galleryImageUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                  {galleryImageUrls.map((url, i) => (
                    <div key={i} className="h-24 rounded-xl overflow-hidden border border-slate-800 relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGalleryImageUrls(galleryImageUrls.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-rose-600/90 text-white rounded-lg p-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: PREVIEW & FINAL SUBMISSION */}
        {currentStep === 7 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#FED65B]" /> Step 7: Customer-Style Preview & Submission
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Verify package representation before sending to review.</p>
            </div>

            {/* Customer-style Preview Box */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#FED65B]/10 text-[#FED65B] border border-[#FED65B]/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {category}
                </span>
                <span className="text-xs text-slate-400">⏱️ {durationDays} Days / {durationNights} Nights</span>
                <span className="text-xs text-slate-400">• {tourType} Tour</span>
              </div>

              <h3 className="text-2xl font-black text-white">{title || 'Untitled Package'}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Customer Quote:</div>
                  <div className="text-2xl font-black text-[#FED65B]">
                    ₹{discountedPrice || basePrice} <span className="text-xs text-slate-400 font-normal">/ person</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 text-right">
                  <div>Min {minTravellers} - Max {maxTravellers} Guests</div>
                  <div className="text-emerald-400 font-bold">✓ Verified Operator Fulfilled</div>
                </div>
              </div>
            </div>

            {/* Declarations */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={confirmAccurate}
                  onChange={(e) => setConfirmAccurate(e.target.checked)}
                  className="accent-[#FED65B] w-4 h-4 mt-0.5 shrink-0"
                />
                <span>
                  I confirm that all itinerary details, hotel accommodation standards, and tariffs are authentic and will be fulfilled as presented.
                </span>
              </label>

              <label className="flex items-start gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={confirmRights}
                  onChange={(e) => setConfirmRights(e.target.checked)}
                  className="accent-[#FED65B] w-4 h-4 mt-0.5 shrink-0"
                />
                <span>
                  I possess the appropriate licensing and rights to use the uploaded media and promote the stated destinations.
                </span>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-xl hover:from-emerald-400 hover:to-teal-400 flex items-center gap-2"
              >
                {isSaving ? 'Submitting...' : 'Submit Package for Administrative Review &rarr;'}
              </button>
            </div>
          </form>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-5 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 7 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-6 py-2.5 bg-[#FED65B] text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 hover:bg-amber-400 shadow-md"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
