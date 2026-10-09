'use client';

import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';

interface SeatSelectorProps {
  totalSeats?: number;
  onSeatSelect: (seats: string[]) => void;
}

export function SeatSelector({ onSeatSelect }: SeatSelectorProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // 20-seat layout simulation (Lower & Upper Berths)
  const seatsLower = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'];
  const seatsUpper = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9', 'U10'];
  const occupied = ['L2', 'L5', 'U3', 'U7'];

  const toggleSeat = (seatId: string) => {
    if (occupied.includes(seatId)) return;
    const updated = selectedSeats.includes(seatId)
      ? selectedSeats.filter((s) => s !== seatId)
      : [...selectedSeats, seatId];
    setSelectedSeats(updated);
    onSeatSelect(updated);
  };

  const renderSeatGrid = (seats: string[], label: string) => (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-farva-gold-sahara uppercase tracking-wider block">{label}</span>
      <div className="grid grid-cols-5 gap-2">
        {seats.map((seat) => {
          const isOccupied = occupied.includes(seat);
          const isSelected = selectedSeats.includes(seat);
          return (
            <button
              key={seat}
              disabled={isOccupied}
              onClick={() => toggleSeat(seat)}
              className={`h-12 rounded-lg font-mono text-xs font-bold transition-all border flex items-center justify-center ${
                isOccupied
                  ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                  : isSelected
                  ? 'gold-gradient-bg text-farva-navy-deep border-farva-gold-sahara shadow-farva-gold'
                  : 'bg-farva-navy-surface text-slate-300 border-farva-gold-sahara/20 hover:border-farva-gold-sahara'
              }`}
            >
              {seat}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl p-6 border border-farva-gold-sahara/20 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-farva-gold-sahara" />
          <span>Interactive Sleeper & Seater Deck</span>
        </h3>
        <div className="flex items-center gap-4 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-farva-navy-surface border border-farva-gold-sahara/20" /> Available</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded gold-gradient-bg" /> Selected</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-800" /> Booked</div>
        </div>
      </div>

      <div className="space-y-6">
        {renderSeatGrid(seatsLower, 'Lower Deck Sleeper')}
        {renderSeatGrid(seatsUpper, 'Upper Deck Sleeper')}
      </div>

      <div className="pt-4 border-t border-farva-gold-sahara/10 flex items-center justify-between text-xs">
        <span className="text-slate-400">Selected Seats: <strong className="text-white">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</strong></span>
        <span className="text-slate-400">Total Price: <strong className="text-farva-gold-sahara font-heading text-sm">₹{selectedSeats.length * 850}</strong></span>
      </div>
    </div>
  );
}
