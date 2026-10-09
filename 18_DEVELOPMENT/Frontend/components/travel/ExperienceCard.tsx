'use client';

import React from 'react';
import Link from 'next/link';
import { Mountain, MapPin, Clock, Star, ArrowRight } from 'lucide-react';

export interface ExperienceItem {
  id: string;
  title: string;
  location: string;
  category: string;
  duration: string;
  rating: number;
  pricePerPerson: number;
  image: string;
  tagline?: string;
}

export function ExperienceCard({ experience }: { experience: ExperienceItem }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-farva-gold-sahara/20 flex flex-col group">
      <div className="relative h-48 bg-farva-navy-surface overflow-hidden">
        <img
          src={experience.image || '/landmarks/kankaria-lake.jpg'}
          alt={experience.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold gold-gradient-bg text-farva-navy-deep shadow-sm">
          {experience.category}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-farva-navy-deep/80 backdrop-blur-md px-2 py-1 rounded-lg border border-farva-gold-sahara/20">
          <Star className="h-3.5 w-3.5 fill-farva-gold-sahara text-farva-gold-sahara" />
          <span className="text-xs font-bold text-white">{experience.rating}</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-base font-heading font-bold text-white group-hover:text-farva-gold-sahara transition-colors">
            {experience.title}
          </h4>
          <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5 text-farva-gold-sahara" />
            <span>{experience.location}</span>
            <span>•</span>
            <Clock className="h-3.5 w-3.5 text-farva-gold-sahara" />
            <span>{experience.duration}</span>
          </p>
          {experience.tagline && (
            <p className="text-xs text-slate-400 mt-2 line-clamp-2">{experience.tagline}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-farva-gold-sahara/10">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Per person</span>
            <span className="text-xl font-heading font-extrabold gold-gradient-text">₹{experience.pricePerPerson}</span>
          </div>
          <Link
            href={`/experiences/${experience.id}`}
            className="gold-gradient-bg text-farva-navy-deep font-semibold text-xs px-4 py-2.5 rounded-xl hover:shadow-farva-gold transition-all flex items-center gap-1.5"
          >
            <span>Book Experience</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
