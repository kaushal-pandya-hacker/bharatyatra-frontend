import { AIPlannerWizard } from '@/components/ai/ai-planner-wizard';
import { DestinationCard } from '@/components/travel/destination-card';

const sampleDestinations = [
  { slug: 'bhuj', name: 'Bhuj & Kutch', region: 'Kutch', durationHours: 48, description: 'Cultural heart of Kutch, gateway to the White Rann desert.' },
  { slug: 'sasan-gir', name: 'Sasan Gir Wildlife', region: 'Saurashtra', durationHours: 36, description: 'Exclusive home of the wild Asiatic Lion in Gir National Park.' },
  { slug: 'somnath', name: 'Somnath Temple', region: 'Saurashtra', durationHours: 24, description: 'First among the 12 sacred Jyotirlinga shrines on Arabian sea coast.' },
  { slug: 'statue-of-unity', name: 'Statue of Unity', region: 'Central_Gujarat', durationHours: 36, description: 'World tallest statue honoring Sardar Vallabhbhai Patel.' },
];

export default function HomePage() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative bg-brand-dark px-4 pt-16 pb-24 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <span className="inline-block rounded-full bg-brand-primary/20 px-3 py-1 text-xs font-semibold text-brand-primary mb-4">
            Gujarat-First AI Travel Platform
          </span>
          <h1 className="text-4xl font-extrabold font-heading sm:text-5xl lg:text-6xl tracking-tight">
            Plan less. Coordinate less.<br />
            <span className="text-brand-primary">Enjoy more.</span>
          </h1>
          <p className="mt-4 text-base text-slate-300 sm:text-lg max-w-2xl mx-auto">
            Discover Gujarat destinations, build AI itineraries, book verified buses & hotels, and enjoy live adaptive re-routing when weather or traffic changes.
          </p>

          <div className="mt-10">
            <AIPlannerWizard />
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-heading text-slate-900">Popular Gujarat Circuits</h2>
            <p className="text-xs text-slate-500 mt-1">Verified travel metadata & recommended stay durations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleDestinations.map((d) => (
            <DestinationCard key={d.slug} {...d} />
          ))}
        </div>
      </section>
    </div>
  );
}
