'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  MapPin,
  MapPinPlus,
  Sparkles,
  Camera,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  Compass,
  ArrowRight,
  Info,
  Car,
  Accessibility,
  Plus,
  ShieldCheck,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { CONTRIBUTION_CATEGORIES, ContributionCategory } from '@/lib/contributions/types';
import PlaceLocationPickerMap from '@/components/contributions/PlaceLocationPickerMap';

const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const AVAILABLE_FACILITIES = [
  'Parking Available',
  'Restrooms / Washrooms',
  'Drinking Water',
  'Cafeteria / Local Dining',
  'Guide Services Available',
  'Wheelchair Accessible',
  'Photography Permitted',
  'Trekking Trail',
  'Boating / Water Activity',
  'Cloakroom / Luggage Storage',
];

const SUITABLE_AUDIENCES = [
  'Solo Travelers',
  'Families with Kids',
  'Couples / Honeymoon',
  'Adventure Seekers',
  'Senior Citizens',
  'Nature & Wildlife Enthusiasts',
  'History & Heritage Buffs',
  'Photographers',
];

interface ContributePlaceFormProps {
  originPath?: 'dashboard' | 'places';
}

export default function ContributePlaceForm({ originPath = 'dashboard' }: ContributePlaceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');
  const { user, token: authToken } = useAuth();

  const getAuthToken = () => {
    return (
      authToken ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('auth_token') ||
          localStorage.getItem('sb_auth_token') ||
          localStorage.getItem('admin_token')
        : null)
    );
  };

  // Form Fields
  const [placeName, setPlaceName] = useState('');
  const [category, setCategory] = useState<ContributionCategory>('Hidden Gems');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Gujarat');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(23.0225);
  const [longitude, setLongitude] = useState<number>(72.5714);
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [bestTimeToVisit, setBestTimeToVisit] = useState('');
  const [estimatedVisitDuration, setEstimatedVisitDuration] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [accessibility, setAccessibility] = useState('');
  const [parkingAvailable, setParkingAvailable] = useState(true);
  const [facilities, setFacilities] = useState<string[]>(['Parking Available', 'Drinking Water']);
  const [suitableFor, setSuitableFor] = useState<string[]>(['Families with Kids', 'Photographers']);
  const [travelTips, setTravelTips] = useState<string[]>(['']);

  // Declaration & Confirmation
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Status & Progress States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState<{ id: string; placeName: string } | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Load existing submission if in edit mode
  useEffect(() => {
    if (!editId) return;
    setLoadingEdit(true);

    async function fetchSubmissionForEdit() {
      try {
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`/api/v1/contributions/${editId}`, { headers });
        const data = await res.json();
        if (data.success && data.submission) {
          const s = data.submission;
          setPlaceName(s.placeName || '');
          setCategory(s.category || 'Hidden Gems');
          setCountry(s.country || 'India');
          setState(s.state || 'Gujarat');
          setDistrict(s.district || '');
          setCity(s.city || '');
          setAddress(s.address || '');
          if (typeof s.latitude === 'number') setLatitude(s.latitude);
          if (typeof s.longitude === 'number') setLongitude(s.longitude);
          setShortDescription(s.shortDescription || '');
          setDetailedDescription(s.detailedDescription || '');
          setPhotos(s.photos || []);
          setBestTimeToVisit(s.bestTimeToVisit || '');
          setEstimatedVisitDuration(s.estimatedVisitDuration || '');
          setEntryFee(s.entryFee || '');
          setOpeningHours(s.openingHours || '');
          setAccessibility(s.accessibility || '');
          setParkingAvailable(s.parkingAvailable ?? true);
          if (Array.isArray(s.facilities)) setFacilities(s.facilities);
          if (Array.isArray(s.suitableFor)) setSuitableFor(s.suitableFor);
          if (Array.isArray(s.travelTips) && s.travelTips.length > 0) setTravelTips(s.travelTips);
        }
      } catch (err) {
        console.error('Error loading submission for edit:', err);
      } finally {
        setLoadingEdit(false);
      }
    }

    fetchSubmissionForEdit();
  }, [editId]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, replaceIdx?: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Client validation: MIME type & size
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrorMsg(`"${file.name}" has an unsupported format. Please upload JPEG, PNG, or WebP.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append('photo', file);

      try {
        setUploadProgress(50);
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/v1/contributions/upload', {
          method: 'POST',
          headers,
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          if (typeof replaceIdx === 'number') {
            setPhotos((prev) => {
              const updated = [...prev];
              updated[replaceIdx] = data.url;
              return updated;
            });
          } else {
            setPhotos((prev) => [...prev, data.url]);
          }
        } else {
          setErrorMsg(data.message || 'Failed to upload photo.');
        }
      } catch (err: unknown) {
        setErrorMsg('Network error while uploading photo.');
      }
    }

    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
      setReplacingIndex(null);
    }, 400);

    // Reset input
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFacility = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const toggleAudience = (audience: string) => {
    setSuitableFor((prev) =>
      prev.includes(audience) ? prev.filter((a) => a !== audience) : [...prev, audience]
    );
  };

  const handleTipChange = (index: number, val: string) => {
    const next = [...travelTips];
    next[index] = val;
    setTravelTips(next);
  };

  const addTipField = () => {
    setTravelTips((prev) => [...prev, '']);
  };

  const removeTipField = (index: number) => {
    setTravelTips((prev) => prev.filter((_, i) => i !== index));
  };

  // Coordinates from Interactive Leaflet Map
  const handleCoordinatesChange = (lat: number, lng: number, addr?: string) => {
    setLatitude(lat);
    setLongitude(lng);
    if (addr && !address) {
      setAddress(addr);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!placeName.trim() || placeName.trim().length < 3) {
      setErrorMsg('Please enter a valid destination name (minimum 3 characters).');
      return;
    }
    if (!state.trim()) {
      setErrorMsg('Please select a state or union territory.');
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      setErrorMsg('Please enter a full street address or location landmark.');
      return;
    }
    if (!shortDescription.trim() || shortDescription.trim().length < 20) {
      setErrorMsg('Short summary must be at least 20 characters.');
      return;
    }
    if (!detailedDescription.trim() || detailedDescription.trim().length < 50) {
      setErrorMsg('Detailed description must be at least 50 characters.');
      return;
    }
    if (photos.length === 0) {
      setErrorMsg('Please upload at least one authentic photograph of the place.');
      return;
    }
    if (!declarationConfirmed) {
      setErrorMsg('Please tick the confirmation checkbox to certify that all submitted details and photos are accurate and authorized.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        placeName: placeName.trim(),
        category,
        country: country.trim() || 'India',
        state: state.trim(),
        district: district.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim(),
        latitude,
        longitude,
        shortDescription: shortDescription.trim(),
        detailedDescription: detailedDescription.trim(),
        photos,
        bestTimeToVisit: bestTimeToVisit.trim() || undefined,
        estimatedVisitDuration: estimatedVisitDuration.trim() || undefined,
        entryFee: entryFee.trim() || undefined,
        openingHours: openingHours.trim() || undefined,
        accessibility: accessibility.trim() || undefined,
        parkingAvailable,
        facilities,
        travelTips: travelTips.filter((t) => t.trim().length > 0),
        suitableFor,
      };

      const url = editId ? `/api/v1/contributions/${editId}` : '/api/v1/contributions';
      const method = editId ? 'PUT' : 'POST';

      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to submit destination');
      }

      setSuccessResult({
        id: data.submission?.id || editId || '',
        placeName: data.submission?.placeName || placeName,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting place. Please try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold">Loading destination details for revision...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 pb-24">
      {/* Top Header / Breadcrumb Bar */}
      <div className="w-full border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            {originPath === 'dashboard' ? (
              <>
                <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
                <span>/</span>
              </>
            ) : (
              <>
                <Link href="/explore" className="hover:text-slate-900 transition-colors">Explore</Link>
                <span>/</span>
              </>
            )}
            <span className="text-amber-700 font-extrabold">Contribute a Place</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={originPath === 'dashboard' ? '/dashboard/my-contributions' : '/profile/contributions'}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>My Contributions</span>
            </Link>
            <Link
              href={originPath === 'dashboard' ? '/dashboard' : '/explore'}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Exit
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Title Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-extrabold">
            <MapPinPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>BharatYatra Community Tourism Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-white tracking-tight">
            {editId ? 'Revise Your Destination Submission' : 'Contribute a Tourist Place or Hidden Gem'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Every submitted destination is reviewed by BharatYatra’s travel curators and verified through automated AI checks. Once approved, your place goes live across Explore, Search, Interactive Maps, and the AI Trip Planner with full contributor attribution credited to your account.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg('')} className="text-rose-700 underline text-xs">Dismiss</button>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION A — BASIC INFORMATION */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">A</span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">Basic Information</h2>
                <p className="text-[11px] text-slate-500">Destination name, category, and core overview descriptions.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Destination Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gadhvi Hidden Waterfalls"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Destination Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ContributionCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {CONTRIBUTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Short Summary (1–2 Sentences) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="A pristine 3-tier cascade nestled in the dense teak forests of Dang."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">{shortDescription.length} / minimum 20 characters</span>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Detailed Description &amp; History <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Detail the natural beauty, cultural/historical significance, access route, and why travelers should visit..."
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">{detailedDescription.length} / minimum 50 characters</span>
            </div>
          </section>

          {/* SECTION B — LOCATION & INTERACTIVE MAP */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">B</span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">Geographic Location &amp; Coordinates</h2>
                <p className="text-[11px] text-slate-500">Pick exact GPS on the interactive Leaflet map or click current GPS detection.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  State / UT <span className="text-rose-600">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {INDIAN_STATES_AND_UTS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">District / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Dang / Kutch / Jaipur"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">City, Town, or Village</label>
                <input
                  type="text"
                  placeholder="e.g. Ahwa / Mandvi / Vijayanagar"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Full Address / Landmark Location <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Saputara Highway, Ahwa, Dang, Gujarat 394710"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Interactive Leaflet Location Map Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800">
                Interactive Map Pinpoint <span className="text-rose-600">*</span>
              </label>
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <PlaceLocationPickerMap
                  latitude={latitude}
                  longitude={longitude}
                  onChange={handleCoordinatesChange}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-semibold">
                <span>Selected Coordinates: <strong className="text-slate-800">{latitude.toFixed(5)}, {longitude.toFixed(5)}</strong></span>
                <span className="text-emerald-700 font-bold">✓ Valid India Geographic Bounds</span>
              </div>
            </div>
          </section>

          {/* SECTION C — DESTINATION DETAILS & PRACTICAL INFO */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">C</span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">Destination Details &amp; Visitor Practicalities</h2>
                <p className="text-[11px] text-slate-500">Timings, best season, entry fee, parking, accessibility, and visitor tips.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">Best Time to Visit</label>
                <input
                  type="text"
                  placeholder="e.g. October to March"
                  value={bestTimeToVisit}
                  onChange={(e) => setBestTimeToVisit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">Estimated Visit Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 2-3 Hours / Half Day"
                  value={estimatedVisitDuration}
                  onChange={(e) => setEstimatedVisitDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">Entry Fee</label>
                <input
                  type="text"
                  placeholder="e.g. Free / ₹50 per person"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">Opening Hours</label>
                <input
                  type="text"
                  placeholder="e.g. 6:00 AM – 6:30 PM"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Parking Availability Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">Parking Available on Site?</span>
                </div>
                <input
                  type="checkbox"
                  checked={parkingAvailable}
                  onChange={(e) => setParkingAvailable(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </div>

              {/* Accessibility */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">Accessibility Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Wheelchair accessible ramp / Rough steps"
                  value={accessibility}
                  onChange={(e) => setAccessibility(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Facilities Checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-extrabold text-slate-800">Available Facilities &amp; Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {AVAILABLE_FACILITIES.map((fac) => (
                  <button
                    key={fac}
                    type="button"
                    onClick={() => toggleFacility(fac)}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-bold text-left transition-all ${
                      facilities.includes(fac)
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {facilities.includes(fac) ? '✓ ' : '+ '}{fac}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Tips Dynamic List */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-extrabold text-slate-800">Visitor Travel Tips</label>
              <div className="space-y-2">
                {travelTips.map((tip, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Tip #${idx + 1}: e.g. Best photography light is early morning during monsoon.`}
                      value={tip}
                      onChange={(e) => handleTipChange(idx, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                    {travelTips.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTipField(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addTipField}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add another tip</span>
              </button>
            </div>
          </section>

          {/* SECTION D — PHOTOGRAPHS */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center">D</span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">Destination Photographs</h2>
                <p className="text-[11px] text-slate-500">Upload multiple authentic photographs (JPEG, PNG, WebP up to 5MB each).</p>
              </div>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-3xl p-8 text-center transition-all bg-slate-50/50 hover:bg-amber-50/20">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handlePhotoUpload(e)}
                id="photo-upload-input"
                className="hidden"
              />
              <label htmlFor="photo-upload-input" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs font-black text-slate-900">
                  Click to select photos or drag &amp; drop images here
                </div>
                <div className="text-[11px] text-slate-400">
                  JPEG, PNG, or WebP • Max 5MB per image • First image acts as primary cover
                </div>
              </label>

              {uploading && (
                <div className="mt-4 max-w-xs mx-auto space-y-1">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-amber-700">Uploading and processing photos...</span>
                </div>
              )}
            </div>

            {/* Photo Preview & Replace Grid */}
            {photos.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Uploaded Photos ({photos.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {photos.map((url, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video group bg-slate-100">
                      <Image
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-xs">
                          Primary Cover
                        </div>
                      )}
                      {/* Photo Actions Overlay */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="p-1.5 rounded-xl bg-white/20 hover:bg-white/40 text-white cursor-pointer text-xs font-bold" title="Replace photo">
                          <RefreshCw className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handlePhotoUpload(e, idx)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="p-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* SECTION E — SUBMISSION & PREVIEW */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 font-black text-xs flex items-center justify-center">E</span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">Submission &amp; Accuracy Confirmation</h2>
                <p className="text-[11px] text-slate-500">Preview the final listing and confirm authoring rights before submitting.</p>
              </div>
            </div>

            {/* Quick Preview Toggle Button */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-amber-950">Review Your Destination Card</div>
                <div className="text-[11px] text-slate-600">See how this place will look to travelers once published.</div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-amber-900 border border-amber-300 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-amber-700" />
                <span>Show Preview</span>
              </button>
            </div>

            {/* Mandatory Accuracy & Rights Confirmation Checkbox */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={declarationConfirmed}
                  onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-amber-600 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-relaxed font-semibold">
                  I confirm that all submitted information is accurate to the best of my knowledge, and I have full permission or ownership to upload these photographs for public tourism display on BharatYatra.
                </span>
              </label>
            </div>

            {/* Prominent Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Link
                href={originPath === 'dashboard' ? '/dashboard' : '/explore'}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center transition-all"
              >
                Cancel &amp; Discard
              </Link>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Destination...</span>
                  </>
                ) : (
                  <>
                    <MapPinPlus className="w-4 h-4" />
                    <span>Submit Destination for Approval</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </section>
        </form>
      </div>

      {/* FINAL PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-600" />
                <span>Destination Card Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                {photos[0] ? (
                  <Image src={photos[0]} alt={placeName || 'Preview'} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                    No cover photo uploaded yet
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-slate-900 font-extrabold text-[11px] shadow-xs">
                  {category}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">{placeName || 'Untitled Place'}</h3>
                <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{city ? `${city}, ` : ''}{district ? `${district}, ` : ''}{state}</span>
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {shortDescription || 'Short description preview will appear here.'}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                <div><strong>Timings: </strong>{openingHours || 'Open all days'}</div>
                <div><strong>Entry Fee: </strong>{entryFee || 'Free'}</div>
                <div><strong>Best Season: </strong>{bestTimeToVisit || 'October to March'}</div>
                <div><strong>Duration: </strong>{estimatedVisitDuration || '2-3 Hours'}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Will be credited: &ldquo;Discovered &amp; contributed by {user?.fullName || 'You'}&rdquo;</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION CONFIRMATION MODAL */}
      {successResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                Destination Submitted!
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Thank you for contributing <strong>&ldquo;{successResult.placeName}&rdquo;</strong>! Your submission has been saved with <span className="font-extrabold text-amber-600">PENDING</span> status. Our travel moderation team will review it shortly.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-slate-700 space-y-1">
              <div className="font-black text-amber-900 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Next Steps:</span>
              </div>
              <p className="text-[11px] text-slate-600">
                1. Automated AI checks verify duplicate candidates and GPS bounds.<br />
                2. Once approved by curators, your place is published live across BharatYatra.<br />
                3. You will receive an in-app notification upon approval.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link
                href="/dashboard/my-contributions"
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs shadow-md transition-all text-center"
              >
                Track in My Contributions
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all text-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
