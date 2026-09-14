import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface DestinationCardProps {
  slug: string;
  name: string;
  region: string;
  durationHours: number;
  description: string;
  imageUrl?: string;
  tagline?: string;
  heroColor?: string;
}

export function DestinationCard({ slug, name, region, durationHours, description }: DestinationCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="h-44 w-full bg-slate-800 relative p-4 flex flex-col justify-between">
        <Badge variant="verified">{region}</Badge>
        <div>
          <h3 className="text-xl font-bold font-heading text-white">{name}</h3>
          <div className="flex items-center text-xs text-slate-300 gap-1 mt-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Recommended {durationHours}h stay</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-slate-600 line-clamp-2">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <Link
            href={`/destinations/${slug}`}
            className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
          >
            <MapPin className="h-3.5 w-3.5" />
            Explore Destination
          </Link>
          <Link
            href={`/ai-planner?destination=${slug}`}
            className="rounded bg-brand-primary/10 px-2.5 py-1 text-xs font-medium text-brand-primary hover:bg-brand-primary/20"
          >
            Plan with AI
          </Link>
        </div>
      </div>
    </div>
  );
}
