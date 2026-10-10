'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, AlertCircle, X } from 'lucide-react';
import { getPermissionState, subscribeToPush, PermissionState } from '@/lib/push-notifications';
import { useAuth } from '@/lib/auth/auth-context';
import { PushExplainerModal } from './push-explainer-modal';

export function NotificationPermissionBanner() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<PermissionState>('default');
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = localStorage.getItem('bharatyatra_push_banner_dismissed') === 'true';
      setDismissed(isDismissed);
      setPermission(getPermissionState());
    }
  }, []);

  if (dismissed || permission === 'unsupported') {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bharatyatra_push_banner_dismissed', 'true');
    }
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 font-medium">
            {permission === 'granted' ? (
              <>
                <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-200 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>BharatYatra push notifications enabled ✓</span>
              </>
            ) : permission === 'denied' ? (
              <>
                <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-200 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                </span>
                <span>Notifications are currently blocked in your browser site settings.</span>
              </>
            ) : (
              <>
                <span className="w-6 h-6 rounded-full bg-white/20 text-amber-100 flex items-center justify-center shrink-0 animate-pulse">
                  <Bell className="w-3.5 h-3.5" />
                </span>
                <span>Stay updated on your upcoming journeys, trip reminders & AI itineraries.</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {permission === 'default' && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-white hover:bg-amber-50 text-amber-800 font-semibold px-3 py-1 rounded-lg text-xs transition-colors shadow-xs"
              >
                Enable Notifications
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/80 hover:text-white"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PushExplainerModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setPermission(getPermissionState());
        }}
        onSubscribed={() => {
          setPermission('granted');
        }}
      />
    </>
  );
}
