/**
 * Utility to generate comprehensive static parameters for SSG export routes in Next.js
 */

export function getSampleTripStaticParams() {
  const ids = [
    'demo',
    '1',
    '2',
    '3',
    '4',
    '5',
    'CF-GJ-8820',
    'CF-GJ-8821',
    'CF-GJ-8822',
    'CF-GJ-8823',
    'CF-GJ-8824',
    'CF-GJ-8825',
    'CF-GJ-1001',
    'CF-GJ-1002',
  ];

  for (let i = 8800; i <= 8860; i++) {
    ids.push(`CF-GJ-${i}`);
  }

  return Array.from(new Set(ids)).map((id) => ({ id }));
}

export function getSampleTripCancelStaticParams() {
  const tripParams = getSampleTripStaticParams();
  return tripParams.flatMap((t) => [
    { id: t.id, bookingId: 'demo' },
    { id: t.id, bookingId: '1' },
    { id: t.id, bookingId: 'CF-BK-8820' },
  ]);
}

export function getSampleBookingStaticParams() {
  const ids = ['demo', '1', '2', '3', 'CF-BK-8820', 'CF-BK-8821'];
  for (let i = 8800; i <= 8830; i++) {
    ids.push(`CF-BK-${i}`);
  }
  return Array.from(new Set(ids)).map((id) => ({ id }));
}
