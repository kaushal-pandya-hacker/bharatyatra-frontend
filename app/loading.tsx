export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-4 bg-white rounded-3xl shadow-xl border-2 border-slate-200">
          <img
            src="/logo.png"
            alt="BharatYatra Logo"
            className="h-16 w-auto object-contain animate-pulse"
          />
        </div>
        <span className="text-base font-extrabold text-slate-900">Loading BharatYatra...</span>
      </div>
    </div>
  );
}
