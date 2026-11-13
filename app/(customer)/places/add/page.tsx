'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import {
  MapPin,
  Sparkles,
  Camera,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  Phone,
  Globe,
  Compass,
  ArrowRight,
  Info,
  Car,
  Accessibility,
  Plus,
  ShieldCheck,
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

const COMMON_FACILITIES = [
  'Restrooms',
  'Drinking Water',
  'Parking Area',
  'Food Stalls / Cafe',
  'Wheelchair Accessible',
  'Photography Permitted',
  'Guided Tours Available',
  'Audio Guides',
  'First Aid',
  'Locker Facility',
];

const SUITABLE_AUDIENCE = [
  'Families with Children',
  'Solo Travelers',
  'Couples & Honeymooners',
  'Senior Citizens',
  'Adventure Seekers',
  'Photography Enthusiasts',
  'Spiritual Seekers',
  'History Buffs',
];

function AddPlaceContent() {
  const router = useRouter();
  const { user } = useAuth();

  // Form State
  const [placeName, setPlaceName] = useState('');
  const [category, setCategory] = useState<ContributionCategory>('Historical Places');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Gujarat');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(23.0225);
  const [longitude, setLongitude] = useState<number>(72.5714);
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');

  // Optional Fields
  const [bestTimeToVisit, setBestTimeToVisit] = useState('');
  const [estimatedVisitDuration, setEstimatedVisitDuration] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [website, setWebsite] = useState('');
  const [accessibility, setAccessibility] = useState('');
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [travelTips, setTravelTips] = useState<string[]>(['']);
  const [suitableFor, setSuitableFor] = useState<string[]>([]);

  // Photos State
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successSubmission, setSuccessSubmission] = useState<any | null>(null);

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg('');
    setUploadProgress(20);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Client validation
      if (!file.type.startsWith('image/')) {
        setErrorMsg(`"${file.name}" is not a valid image file.`);
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
        const res = await fetch('/api/v1/contributions/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          setPhotos((prev) => [...prev, data.url]);
        } else {
          setErrorMsg(data.message || 'Failed to upload photo.');
        }
      } catch (err: any) {
        setErrorMsg('Network error while uploading photo.');
      }
    }

    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
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

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Client Validations
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
    }
    if (photos.length === 0) {
      setErrorMsg('Please upload at least one authentic photograph of the place.');
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
        contactInfo: contactInfo.trim() || undefined,
        website: website.trim() || undefined,
        accessibility: accessibility.trim() || undefined,
        parkingAvailable,
        facilities,
        travelTips: travelTips.filter((t) => t.trim().length > 0),
        suitableFor,
      };

      const res = await fetch('/api/v1/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.submission) {
        setSuccessSubmission(data.submission);
      } else {
        setErrorMsg(data.message || 'Failed to submit place. Please review the details.');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred while submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/explore" className="hover:text-blue-600 transition-colors">
            Explore
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Add a Place</span>
        </nav>

        {/* Page Hero Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Travel Contribution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-slate-900 tracking-tight">
            Add a Destination or Hidden Gem
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
            Know a breathtaking hidden temple, pristine mountain viewpoint, heritage fort, or secret waterfall? 
            Contribute to BharatYatra. Every place is verified by our editorial curators before publishing nationwide.
          </p>
        </div>

        {/* Verification Guarantee Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-3 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-950">
            <span className="font-bold">Quality & Authenticity Guaranteed:</span>
            <p className="text-amber-800/90 mt-0.5 leading-relaxed">
              Your submission will be assigned to a BharatYatra destination auditor. Once verified and approved, 
              it will automatically become part of India&apos;s live Explore directory, Interactive Maps, and AI Itinerary Engine with contributor attribution.
            </p>
          </div>
        </div>

        {/* Success Modal Confirmation */}
        {successSubmission && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Submission Successfully Received!
              </h3>
              <p className="text-slate-600 text-sm mt-2">
                Thank you for contributing <span className="font-bold text-slate-900">&quot;{successSubmission.placeName}&quot;</span> to BharatYatra. 
                Our curation team has received your submission and assigned it for review.
              </p>

              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Submission ID:</span>
                  <span className="font-bold text-slate-800">{successSubmission.id.slice(0, 13)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-amber-600 uppercase">Awaiting Curation Review</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">State / Region:</span>
                  <span className="font-bold text-slate-800">{successSubmission.state}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/profile/contributions"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors text-center"
                >
                  View My Contributions
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessSubmission(null);
                    setPlaceName('');
                    setShortDescription('');
                    setDetailedDescription('');
                    setPhotos([]);
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
                >
                  Contribute Another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: PRIMARY DESTINATION IDENTITY */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Compass className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">1. Destination Identity & Category</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Destination or Place Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="e.g. Champaner Archaeological Stepwell, Dholavira Harappan Citadel"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ContributionCategory)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-semibold text-slate-900 bg-white"
                >
                  {CONTRIBUTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={country}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  State / Union Territory <span className="text-red-500">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-semibold text-slate-900 bg-white"
                >
                  {INDIAN_STATES_AND_UTS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  District / Tehsil (Optional)
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Panchmahal, Kutch, Gir Somnath"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nearest City or Village (Optional)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Halol, Bhuj, Veraval"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Street Address or Landmark Location <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Provide exact access road, milestone, or landmark location"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: INTERACTIVE LOCATION & GPS COORDINATES */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <MapPin className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">2. Geographic Coordinates & Interactive Map</h2>
                <p className="text-xs text-slate-500">Pick on the interactive map or verify GPS coordinates</p>
              </div>
            </div>

            <PlaceLocationPickerMap
              latitude={latitude}
              longitude={longitude}
              onChange={(newLat, newLng, suggestedAddr) => {
                setLatitude(newLat);
                setLongitude(newLng);
                if (suggestedAddr && !address) {
                  setAddress(suggestedAddr);
                }
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Latitude (Decimal Degrees) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-xs sm:text-sm font-mono font-bold text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Longitude (Decimal Degrees) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-xs sm:text-sm font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: NARRATIVE & DESCRIPTIONS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Info className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">3. Descriptions & Visiting Highlights</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Short Summary Overview <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A concise 1-2 sentence hook describing why travelers should visit this place (min 20 characters)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Concise card highlight</span>
                  <span>{shortDescription.length} characters</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detailed Destination Story & Experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  placeholder="Describe the atmosphere, historical lore, landscape views, cultural significance, or secret tips travelers should know before visiting (min 50 characters)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Detailed guide narrative</span>
                  <span>{detailedDescription.length} characters</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: AUTHENTIC PHOTOGRAPHS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Camera className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">4. Destination Photographs</h2>
                <p className="text-xs text-slate-500">Upload at least one authentic photo (JPEG, PNG, WebP up to 5MB each)</p>
              </div>
            </div>

            {/* Upload Drag & Drop Area */}
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
              <input
                type="file"
                id="photo-upload-input"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="photo-upload-input"
                className="flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {uploading ? 'Processing & Validating Photo...' : 'Click to Upload Destination Photos'}
                </span>
                <span className="text-xs text-slate-500 mt-1">Supports multiple JPEG, PNG, or WebP files (Max 5MB each)</span>
              </label>

              {uploading && (
                <div className="mt-4 max-w-xs mx-auto">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded Photos Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {photos.map((url, idx) => (
                  <div key={url} className="relative rounded-xl overflow-hidden aspect-4/3 border border-slate-200 group shadow-xs">
                    <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Primary Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: PRACTICAL VISITING INFO (OPTIONAL) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">5. Visiting Hours & Practical Information (Optional)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Best Time of Year to Visit
                </label>
                <input
                  type="text"
                  value={bestTimeToVisit}
                  onChange={(e) => setBestTimeToVisit(e.target.value)}
                  placeholder="e.g. October to March, Monsoon Season"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Estimated Visit Duration
                </label>
                <input
                  type="text"
                  value={estimatedVisitDuration}
                  onChange={(e) => setEstimatedVisitDuration(e.target.value)}
                  placeholder="e.g. 2 - 3 Hours, Half-Day, Full-Day"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Entry Fee / Ticket Price
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    placeholder="e.g. Free entry, ₹50 Adults, ₹200 Camera"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Opening & Closing Hours
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="e.g. 6:00 AM - 6:30 PM (Closed Mondays)"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contact Phone / Caretaker (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="e.g. +91 98250 XXXXX, Forest Department Office"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Official Website / Trust Portal (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://asi.nic.in"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Parking & Accessibility Checkbox */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={parkingAvailable}
                  onChange={(e) => setParkingAvailable(e.target.checked)}
                  className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <Car className="w-4 h-4 text-slate-500" />
                <span>Dedicated vehicle parking available</span>
              </label>
            </div>
          </div>

          {/* SECTION 6: FACILITIES & AUDIENCE TAGS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">6. Facilities & Suitable Audiences</h2>
            </div>

            {/* Facilities Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Available Facilities
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_FACILITIES.map((facility) => {
                  const selected = facilities.includes(facility);
                  return (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => toggleFacility(facility)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {facility}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suitable Audience Pills */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recommended For
              </label>
              <div className="flex flex-wrap gap-2">
                {SUITABLE_AUDIENCE.map((aud) => {
                  const selected = suitableFor.includes(aud);
                  return (
                    <button
                      key={aud}
                      type="button"
                      onClick={() => toggleAudience(aud)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {aud}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Tips List */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Insider Travel Tips (Optional)
              </label>
              {travelTips.map((tip, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => handleTipChange(idx, e.target.value)}
                    placeholder={`Travel tip ${idx + 1} (e.g. Wear comfortable shoes, carry drinking water)`}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900"
                  />
                  {travelTips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTipField(idx)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTipField}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add another travel tip</span>
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">
              By submitting, you confirm this information is accurate and non-infringing.
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/explore"
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm text-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black text-sm transition-all shadow-md cursor-pointer"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Submitting Destination...</span>
                  </>
                ) : (
                  <>
                    <span>Submit for Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddPlacePage() {
  return (
    <ProtectedRoute>
      <AddPlaceContent />
    </ProtectedRoute>
  );
}

