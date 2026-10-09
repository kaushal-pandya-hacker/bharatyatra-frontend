'use client';

import { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Check, X, AlertTriangle, Settings, Sparkles, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { getPermissionState, subscribeToPush, PermissionState } from '@/lib/push-notifications';
import { useAuth } from '@/lib/auth/auth-context';

interface PushExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribed?: () => void;
  contextTitle?: string;
  contextSubtitle?: string;
}

export function PushExplainerModal({
  isOpen,
  onClose,
  onSubscribed,
  contextTitle = 'Stay connected with your journeys',
  contextSubtitle = 'Get real-time BharatYatra updates directly on your device so you never miss a trip detail.',
}: PushExplainerModalProps) {
  const { user } = useAuth();
  const [permission, setPermission] = useState<PermissionState>('default');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPermission(getPermissionState());
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAllowNotifications = async () => {
    setLoading(true);
    setErrorMsg(null);

    const result = await subscribeToPush(user?.id);
    setLoading(false);

    if (result.success) {
      setSubscribedSuccess(true);
      setPermission('granted');
      if (onSubscribed) onSubscribed();
      setTimeout(() => {
        onClose();
        setSubscribedSuccess(false);
      }, 1800);
    } else {
      const currentPerm = getPermissionState();
      setPermission(currentPerm);
      setErrorMsg(result.error || 'Failed to enable notifications');
    }
  };

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bharatyatra_push_prompt_dismissed', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 p-6 text-white text-center relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mx-auto w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 shadow-inner border border-white/20">
            <Bell className="w-7 h-7 text-amber-100 animate-bounce" />
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">{contextTitle}</h3>
          <p className="text-xs text-amber-100/90 mt-1 max-w-xs mx-auto leading-relaxed">
            {contextSubtitle}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {subscribedSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Notifications Enabled ✓</h4>
              <p className="text-xs text-slate-600">
                You're all set! We've sent a welcome test notification to your device.
              </p>
            </div>
          ) : permission === 'denied' ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900">Notifications are blocked in your browser.</h4>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    To enable BharatYatra notifications:
                  </p>
                  <ol className="text-xs text-amber-800 list-decimal list-inside mt-2 space-y-1 font-medium">
                    <li>Click the lock icon 🔒 next to the website URL.</li>
                    <li>Toggle <strong>Notifications</strong> to <strong>Allow</strong>.</li>
                    <li>Refresh the page to activate real-time journey alerts.</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Get useful notifications about:
                </p>
                <ul className="space-y-2 text-sm text-slate-700 font-medium">
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs shrink-0 font-bold">
                      ✈️
                    </span>
                    <span>Upcoming trips & departure reminders</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs shrink-0 font-bold">
                      🏨
                    </span>
                    <span>Booking confirmations & instant hotel updates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0 font-bold">
                      ✨
                    </span>
                    <span>AI itinerary ready alerts & smart changes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs shrink-0 font-bold">
                      📍
                    </span>
                    <span>Real-time destination alerts on active trips</span>
                  </li>
                </ul>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleAllowNotifications}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Allow Notifications</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDismiss}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
                >
                  Not Now
                </button>
              </div>
            </>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>No spam guaranteed. You can turn notifications off anytime in Profile settings.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
