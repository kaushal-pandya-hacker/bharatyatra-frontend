'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Sparkles, ChevronRight, Plus, Check } from 'lucide-react';
import { PlaceFolderItem } from '@/lib/tourism/state-folder-loader';
import { useDestinationSelection } from '@/lib/tourism/destination-selection-context';

interface Props {
  folderPlaces: PlaceFolderItem[];
  stateName: string;
}

export default function StatePlacesInteractiveGrid({ folderPlaces, stateName }: Props) {
  const { toggleDestination, isDestinationSelected } = useDestinationSelection();

  return (
    <div className="relative">
      {/* Places Cards Grid - Dark Navy UI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {folderPlaces.map((place) => {
          const placeId = `${place.stateSlug}-${place.slug}`;
          const active = isDestinationSelected(placeId) || isDestinationSelected(place.name);

          const handleToggle = () => {
            toggleDestination({
              id: placeId,
              name: place.name,
              displayName: place.displayName || place.name,
              slug: place.slug,
              stateName: place.stateName || stateName,
              stateSlug: place.stateSlug || stateName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              location: place.location || place.district || place.city || stateName,
              category: place.category || 'Attraction',
              imageUrl: place.imageUrl,
            });
          };

          return (
            <div
              key={place.rawFileName || place.slug}
              className={`group bg-[#141A32] rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col shadow-xl hover:-translate-y-1 ${
                active ? 'border-amber-400 ring-2 ring-amber-400/40 bg-[#1A2342]' : 'border-[#2A3656] hover:border-amber-400/60'
              }`}
            >
              <div className="relative h-52 overflow-hidden bg-gray-900">
                <img
                  src={place.imageUrl}
                  alt={`${place.displayName || place.name} - ${stateName}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141A32] via-transparent to-transparent"></div>
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-[#0A1128]/80 text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded border border-amber-400/30 uppercase tracking-wider backdrop-blur">
                  {place.category || 'Attraction'}
                </div>

                {/* + Add to Plan Interactive Toggle */}
                <button
                  type="button"
                  onClick={handleToggle}
                  className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow transition flex items-center space-x-1.5 ${
                    active
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-[#0A1128]/90 text-white border border-amber-400/40 hover:border-amber-400 hover:bg-[#0A1128] backdrop-blur'
                  }`}
                >
                  {active ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>+ Add to Plan</span>
                    </>
                  )}
                </button>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-xs font-bold text-amber-300 drop-shadow flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{place.location || place.district || stateName}</span>
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                    {place.displayName || place.name}
                  </h4>
                  <p className="text-xs text-gray-300 font-medium mb-4">
                    State: <span className="text-amber-300 font-bold">{stateName}</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-[#2A3656] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleToggle}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                      active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30'
                    }`}
                  >
                    {active ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{active ? 'Added to Trip' : 'Add to Trip'}</span>
                  </button>

                  <Link
                    href={`/packages?search=${encodeURIComponent(place.displayName || place.name)}`}
                    className="text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                  >
                    <span>Packages</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
