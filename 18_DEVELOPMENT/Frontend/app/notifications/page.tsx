'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  notificationId?: string;
  category: 'BOOKING' | 'PAYMENT' | 'REFUND' | 'TRIP' | 'ADAPTIVE_AI' | 'SYSTEM' | string;
  title: string;
  body: string;
  time?: string;
  read: boolean;
  readStatus?: 'UNREAD' | 'READ';
  deepLink?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt?: string;
}

const mockNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    category: 'ADAPTIVE_AI',
    title: 'Itinerary Alert: Heavy Monsoon Rain at Dwarka',
    body: 'Your Day 2 boat ride to Bet Dwarka is delayed. Recommended alternative: Dwarkadhish Temple Guided Darshan.',
    time: '10 mins ago',
    read: false,
    deepLink: '/my-trips/trip_dwarka_101/adaptations/adp_rain_01',
    priority: 'URGENT',
  },
  {
    id: 'notif_2',
    category: 'BOOKING',
    title: 'Booking Confirmed - Ref: CF-BUS-9981',
    body: 'GSRTC Express bus from Ahmedabad to Somnath on 15 Oct 2026 is confirmed. Seats: 12A, 12B.',
    time: '2 hours ago',
    read: false,
    deepLink: '/bookings/bk_bus_9981',
    priority: 'HIGH',
  },
  {
    id: 'notif_3',
    category: 'PAYMENT',
    title: 'Payment Received - ₹4,850',
    body: 'Payment of ₹4,850 for Txn Ref TXN-PAY-5510 was processed successfully.',
    time: '5 hours ago',
    read: true,
    deepLink: '/bookings',
    priority: 'NORMAL',
  },
  {
    id: 'notif_4',
    category: 'REFUND',
    title: 'Refund Credit Initiated - ₹1,200',
    body: 'Refund of ₹1,200 for cancelled safari slot has been credited to your UPI account.',
    time: '1 day ago',
    read: true,
    deepLink: '/bookings',
    priority: 'HIGH',
  },
  {
    id: 'notif_5',
    category: 'TRIP',
    title: 'Upcoming Trip Reminder: Gir Heritage & Somnath Circuit',
    body: 'Your trip starts in 2 days! Check your itinerary and pack your eco-permits.',
    time: '2 days ago',
    read: true,
    deepLink: '/trips',
    priority: 'NORMAL',
  },
];

export default function CustomerNotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>(mockNotifications);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch('http://localhost:4000/api/v1/notifications', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const result = await res.json();
          const list = result.data || result;
          if (Array.isArray(list) && list.length > 0) {
            const mapped: NotificationItem[] = list.map((n: any) => ({
              id: n.notificationId || n.id,
              category: n.category,
              title: n.title,
              body: n.body,
              time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              read: n.readStatus === 'READ' || n.read === true,
              deepLink: n.deepLink || '/bookings',
              priority: n.priority || 'NORMAL',
            }));
            setItems(mapped);
          }
        }
      } catch (err) {
        console.warn('Backend notification fetch fallback to local notifications state');
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`http://localhost:4000/api/v1/notifications/${id}/read`, { method: 'PATCH' });
    } catch {}
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch('http://localhost:4000/api/v1/notifications/read-all', { method: 'POST' });
    } catch {}
  };

  const filteredItems = activeCategory === 'ALL'
    ? items
    : items.filter((n) => n.category === activeCategory);

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#F8FAFC', padding: '2rem 1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>🔔 Notification Center</span>
              {unreadCount > 0 && (
                <span style={{ background: '#EF4444', color: '#FFF', fontSize: '0.85rem', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                  {unreadCount} Unread
                </span>
              )}
            </h1>
            <p style={{ color: '#94A3B8', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              Real-time booking updates, adaptive itinerary alerts, payment confirmations, and trip reminders.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{ background: '#1E293B', color: '#38BDF8', border: '1px solid #0284C7', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              Mark All Read
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'ADAPTIVE_AI', 'BOOKING', 'PAYMENT', 'REFUND', 'TRIP'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: activeCategory === cat ? '#0284C7' : '#1E293B',
                color: activeCategory === cat ? '#FFF' : '#94A3B8',
              }}
            >
              {cat === 'ALL' ? 'All Alerts' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#1E293B', borderRadius: '8px', color: '#94A3B8' }}>
              No notifications found in this category.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: item.read ? '#1E293B' : '#0F2942',
                  borderLeft: item.priority === 'URGENT' ? '4px solid #EF4444' : item.read ? '4px solid #334155' : '4px solid #0284C7',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: item.category === 'ADAPTIVE_AI' ? '#7C3AED' : item.category === 'BOOKING' ? '#059669' : '#0284C7',
                        color: '#FFF',
                      }}
                    >
                      {item.category.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{item.time}</span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 0.4rem 0', color: '#F8FAFC' }}>
                    {item.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#CBD5E1', lineHeight: '1.4' }}>
                    {item.body}
                  </p>

                  {item.deepLink && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <Link
                        href={item.deepLink}
                        style={{ color: '#38BDF8', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}
                      >
                        View Details & Actions →
                      </Link>
                    </div>
                  )}
                </div>

                {!item.read && (
                  <div>
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        textDecoration: 'underline',
                      }}
                    >
                      Mark Read
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
