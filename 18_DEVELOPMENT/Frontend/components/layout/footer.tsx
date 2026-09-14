import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-brand-dark text-slate-300 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold font-heading text-white mb-3">CHALO FARVA</h3>
            <p className="text-xs text-slate-400">
              "Plan less. Coordinate less. Enjoy more."<br />
              Gujarat-first AI-powered travel & trip management.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Destinations</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/destinations/bhuj" className="hover:underline">Bhuj & Kutch</Link></li>
              <li><Link href="/destinations/sasan-gir" className="hover:underline">Gir Wildlife</Link></li>
              <li><Link href="/destinations/somnath" className="hover:underline">Somnath Temple</Link></li>
              <li><Link href="/destinations/dwarka" className="hover:underline">Dwarka Kingdom</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/ai-planner" className="hover:underline">AI Trip Planner</Link></li>
              <li><Link href="/packages" className="hover:underline">Gujarat Packages</Link></li>
              <li><Link href="/buses" className="hover:underline">Bus Booking</Link></li>
              <li><Link href="/hotels" className="hover:underline">Hotel Booking</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal & Support</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">Terms of Service</span></li>
              <li><span className="text-slate-400">Privacy Policy</span></li>
              <li><span className="text-slate-400">Cancellation Policy</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © 2026 Chalo Farva. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
