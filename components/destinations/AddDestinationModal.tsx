'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  MapPin,
  Upload,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Compass,
  Camera,
  Trash2,
  Save,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export const DESTINATION_CATEGORIES = [
  'Hill Station',
  'Waterfall',
  'Temple',
  'Historical Place',
  'Beach',
  'Adventure',
  'Wildlife Sanctuary',
  'National Park',
  'Religious Place',
  'Lake',
  'Village Tourism',
  'Trekking',
  'Cultural Destination',
  'Other',
] as const;

export const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  onSuccess?: (createdDestination: any) => void;
}

export default function AddDestinationModal({
  isOpen,
  onClose,
  initialName = '',
  onSuccess,
}: AddDestinationModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState(initialName);
  const [state, setState] = useState('Gujarat');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<string>('Historical Place');
  const [gmapsUrl, setGmapsUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Additional Information
  const [shortDesc, setShortDesc] = useState('');
  const [detailedDesc, setDetailedDesc] = useState('');
  const [bestTimeToVisit, setBestTimeToVisit] = useState('October to March');
  const [estimatedDuration, setEstimatedDuration] = useState('Half day (3–4 hours)');
  const [travelTips, setTravelTips] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // UX Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [draftSavedMsg, setDraftSavedMsg] = useState(false);

  useEffect(() => {
    if (initialName && !name) {
      setName(initialName);
    }
  }, [initialName]);

  // Restore draft on mount if exists
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const savedDraft = localStorage.getItem('by_destination_draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.name && !initialName) setName(draft.name);
          if (draft.state) setState(draft.state);
          if (draft.city) setCity(draft.city);
          if (draft.category) setCategory(draft.category);
          if (draft.latitude) setLatitude(draft.latitude);
          if (draft.longitude) setLongitude(draft.longitude);
          if (draft.shortDesc) setShortDesc(draft.shortDesc);
          if (draft.bestTimeToVisit) setBestTimeToVisit(draft.bestTimeToVisit);
          if (draft.estimatedDuration) setEstimatedDuration(draft.estimatedDuration);
        } catch {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Google Maps URL coordinate parser
  const handleGmapsUrlParse = (url: string) => {
    setGmapsUrl(url);
    if (!url) return;
    try {
      // Look for @lat,lng e.g. @23.8864,70.2182
      const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        setLatitude(atMatch[1]);
        setLongitude(atMatch[2]);
        return;
      }
      // Look for q=lat,lng
      const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) {
        setLatitude(qMatch[1]);
        setLongitude(qMatch[2]);
        return;
      }
      // Look for ll=lat,lng
      const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) {
        setLatitude(llMatch[1]);
        setLongitude(llMatch[2]);
      }
    } catch {}
  };

  // Image Upload handler with size & type validation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    const validPhotos: string[] = [];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrorMsg(`"${file.name}" is not a supported image format. Please use JPG, PNG, or WebP.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setErrorMsg(`"${file.name}" exceeds 5MB limit. Please choose a smaller photo.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotos((prev) => [...prev, reader.result as string].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveDraft = () => {
    try {
      const draft = {
        name,
        state,
        city,
        category,
        latitude,
        longitude,
        shortDesc,
        bestTimeToVisit,
        estimatedDuration,
      };
      localStorage.setItem('by_destination_draft', JSON.stringify(draft));
      setDraftSavedMsg(true);
      setTimeout(() => setDraftSavedMsg(false), 2500);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Mandatory Validations
    if (!name.trim() || name.trim().length < 3) {
      setErrorMsg('Destination name must be at least 3 characters.');
      return;
    }
    if (!state.trim()) {
      setErrorMsg('State selection is required.');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('City or nearest town is required.');
      return;
    }
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lngNum) || latNum < 6 || latNum > 38 || lngNum < 68 || lngNum > 98) {
      setErrorMsg('Please provide valid Indian latitude (6° to 38°N) and longitude (68° to 98°E).');
      return;
    }

    setLoading(true);

    const fullAddress = `${name.trim()}, ${city.trim()}, ${state.trim()}, India`;
    const cleanShortDesc =
      shortDesc.trim() ||
      `${name.trim()} is an authentic ${category.toLowerCase()} destination located in ${city.trim()}, ${state.trim()}, India.`;
    const cleanDetailedDesc =
      detailedDesc.trim() ||
      `${name.trim()} in ${city.trim()}, ${state.trim()} contributed by a traveler for AI itinerary planning. Best visited during ${bestTimeToVisit}. Recommended visit duration: ${estimatedDuration}.`;

    const payload = {
      placeName: name.trim(),
      category: category as any,
      state: state.trim(),
      city: city.trim(),
      district: city.trim(),
      address: fullAddress,
      latitude: latNum,
      longitude: lngNum,
      shortDescription: cleanShortDesc,
      detailedDescription: cleanDetailedDesc,
      photos: photos.length > 0 ? photos : ['/places/aina-mahal.jpg'],
      bestTimeToVisit: bestTimeToVisit.trim(),
      estimatedVisitDuration: estimatedDuration.trim(),
      travelTips: travelTips.trim() ? [travelTips.trim()] : [],
    };

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token') || localStorage.getItem('sb_auth_token')
          : null;

      const res = await fetch('/api/v1/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to submit destination.');
      }

      // Clear draft upon successful submission
      try {
        localStorage.removeItem('by_destination_draft');
      } catch {}

      const created = data.submission || {
        id: `contrib-${Date.now()}`,
        name: name.trim(),
        placeName: name.trim(),
        state: state.trim(),
        city: city.trim(),
        category,
        latitude: latNum,
        longitude: lngNum,
        status: 'PENDING',
        isPersonalPending: true,
      };

      setSuccessMsg(
        `"${name.trim()}" successfully added! It is immediately active in your AI trip plans and submitted for admin approval.`
      );

      if (onSuccess) {
        onSuccess(created);
      }

      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Error submitting destination. Please verify fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#102A56] font-heading">
                Add Missing Destination
              </h2>
              <p className="text-xs text-slate-500">
                Help discover more beautiful places in India. Ready for your trips immediately.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {successMsg ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-950">Destination Added!</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Destination Name */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Destination Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hidden Waterfall XYZ, Kalo Dungar, Dholavira"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#102A56] focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* State & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    State / Union Territory <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:border-amber-500 focus:outline-none"
                  >
                    {INDIAN_STATES_AND_UTS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    City or Nearest Town <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bhuj, Netravali, Vadodara"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Destination Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:border-amber-500 focus:outline-none"
                >
                  {DESTINATION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Location & GPS Math */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#102A56] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Exact Geographical Coordinates</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Required for AI Route Math</span>
                </div>

                {/* Google Maps Link Paste Helper */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Paste Google Maps Link (Auto-Extracts Coordinates)
                  </label>
                  <input
                    type="text"
                    value={gmapsUrl}
                    onChange={(e) => handleGmapsUrlParse(e.target.value)}
                    placeholder="e.g. https://maps.app.goo.gl/... or https://www.google.com/maps?q=23.8864,70.2182"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] bg-white text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Latitude (6° to 38°N) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="e.g. 23.8864"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Longitude (68° to 98°E) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="e.g. 70.2182"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white text-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information Accordion / Section */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Short Description &amp; Highlights
                  </label>
                  <textarea
                    rows={2}
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="Scenic natural waterfall hidden inside the forest reserve, accessible via a short nature walk."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Best Time to Visit
                    </label>
                    <input
                      type="text"
                      value={bestTimeToVisit}
                      onChange={(e) => setBestTimeToVisit(e.target.value)}
                      placeholder="e.g. July to February, Winter Mornings"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Estimated Visiting Duration
                    </label>
                    <input
                      type="text"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      placeholder="e.g. 2–3 hours, Half day"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Helpful Travel Tips (Optional)
                  </label>
                  <input
                    type="text"
                    value={travelTips}
                    onChange={(e) => setTravelTips(e.target.value)}
                    placeholder="e.g. Carry trekking shoes, no mobile network near the gorge"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                {/* Photo Upload & Previews */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 block">
                      Destination Photos ({photos.length}/5)
                    </label>
                    <span className="text-[10px] text-slate-500">Max 5MB each (JPG, PNG, WebP)</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {photos.map((src, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute inset-0 bg-slate-950/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    ))}

                    {photos.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 flex flex-col items-center justify-center text-slate-400 hover:text-amber-600 transition-colors cursor-pointer bg-slate-50"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-[9px] font-bold mt-0.5">+ Photo</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Instant Access Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Instant AI Trip Access:</strong> Once submitted, this destination is immediately available in your personal searches and AI trip planner. It will remain private to your account until approved by our curation team for pan-India global discovery.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{draftSavedMsg ? 'Draft Saved! ✓' : 'Save Draft'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-[#102A56] hover:bg-blue-950 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Submit Destination</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
