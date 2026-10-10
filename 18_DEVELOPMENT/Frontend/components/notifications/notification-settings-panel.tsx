'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  ShieldCheck,
  Laptop,
  Smartphone,
  Tablet,
  Trash2,
  Send,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Hotel,
  Calendar,
  Tag,
} from 'lucide-react';
import {
  getPermissionState,
  fetchConnectedDevices,
  removeDevice,
  fetchPreferences,
  updatePreferences,
  sendTestNotification,
  PushDevice,
  NotificationPreferences,
  PermissionState,
} from '@/lib/push-notifications';
import { useAuth } from '@/lib/auth/auth-context';
import { PushExplainerModal } from './push-explainer-modal';

export function NotificationSettingsPanel() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<PermissionState>('default');
  const [devices, setDevices] = useState<PushDevice[]>([]);
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    tripReminders: true,
    bookingUpdates: true,
    tripUpdates: true,
    aiUpdates: true,
    marketing: false,
  });
  const [loading, setLoading] = useState(true);
  const [testSending, setTestSending] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setPermission(getPermissionState());

    const [fetchedDevices, fetchedPrefs] = await Promise.all([
      fetchConnectedDevices(user?.id),
      fetchPreferences(user?.id),
    ]);

    setDevices(fetchedDevices);
    setPrefs(fetchedPrefs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleTogglePref = async (key: keyof NotificationPreferences) => {
    const updatedValue = !prefs[key];
    const newPrefs = { ...prefs, [key]: updatedValue };
    setPrefs(newPrefs);
    await updatePreferences({ [key]: updatedValue }, user?.id);
  };

  const handleRemoveDevice = async (deviceId: string) => {
    const ok = await removeDevice(deviceId, user?.id);
    if (ok) {
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    }
  };

  const handleSendTest = async () => {
    setTestSending(true);
    setTestStatus(null);
    const ok = await sendTestNotification(user?.id);
    setTestSending(false);

    if (ok) {
      setTestStatus('Test push notification sent to your active devices!');
      setTimeout(() => setTestStatus(null), 4000);
    } else {
      setTestStatus('Failed to send test push notification. Check subscription.');
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    const type = (deviceType || '').toLowerCase();
    if (type.includes('mobile') || type.includes('phone') || type.includes('android') || type.includes('iphone')) {
      return <Smartphone className="w-5 h-5 text-amber-600" />;
    }
    if (type.includes('tablet') || type.includes('ipad')) {
      return <Tablet className="w-5 h-5 text-amber-600" />;
    }
    return <Laptop className="w-5 h-5 text-amber-600" />;
  };

  return (
    <div className="space-y-6">
      {/* 1. Browser Notification Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Browser Web Push Notifications</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time browser notifications for trips, booking updates, and itinerary changes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Enabled
              </span>
            ) : permission === 'denied' ? (
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Blocked
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                Not Enabled
              </span>
            )}

            {permission !== 'granted' && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
              >
                Enable Notifications
              </button>
            )}
          </div>
        </div>

        {permission === 'granted' && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-600 font-medium">Want to verify browser reception?</span>
            <button
              onClick={handleSendTest}
              disabled={testSending}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs disabled:opacity-50"
            >
              {testSending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>Send Test Notification</span>
            </button>
          </div>
        )}

        {testStatus && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium">
            {testStatus}
          </div>
        )}
      </div>

      {/* 2. Notification Preferences Toggles */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose which category of travel updates you wish to receive.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Trip Reminders */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Trip Reminders</h4>
                <p className="text-xs text-slate-500">
                  7-day and 1-day departure reminders for your upcoming journeys.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.tripReminders}
                onChange={() => handleTogglePref('tripReminders')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Booking Updates */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                <Hotel className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Booking Updates</h4>
                <p className="text-xs text-slate-500">
                  Instant confirmation alerts for hotels, buses, and activities.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.bookingUpdates}
                onChange={() => handleTogglePref('bookingUpdates')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* AI Trip Updates */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">AI Trip Updates</h4>
                <p className="text-xs text-slate-500">
                  Alerts when background AI itinerary generation completes.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.aiUpdates}
                onChange={() => handleTogglePref('aiUpdates')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Promotional & Special Offers */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mt-0.5">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">Promotional & Special Offers</h4>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                    Opt-in Only
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Exclusive travel discounts, Gujarat festival deals, and package offers.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={() => handleTogglePref('marketing')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Multi-Device Management Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Connected Devices</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Active browser push subscriptions associated with your BharatYatra account.
          </p>
        </div>

        {(!Array.isArray(devices) || devices.length === 0) ? (
          <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs font-medium">No registered push devices found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    {getDeviceIcon(dev.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {dev.browser} · {dev.deviceType}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Subscribed on {new Date(dev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveDevice(dev.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove device subscription"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <PushExplainerModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          loadData();
        }}
        onSubscribed={loadData}
      />
    </div>
  );
}
