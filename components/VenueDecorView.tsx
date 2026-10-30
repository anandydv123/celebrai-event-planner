'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/lib/context';
import { VenueType } from '@/types/event';
import {
  Building2,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Armchair,
  CloudRain,
  MapPin,
  Check,
} from 'lucide-react';

export function VenueDecorView() {
  const { activeEvent, updateEvent, showToast } = useEventContext();

  const totalGuests = activeEvent?.totalGuests || 50;
  const [venueType, setVenueType] = useState<VenueType>(activeEvent?.venueType || 'indoor');
  const [locationName, setLocationName] = useState(activeEvent?.location || '');
  const [seatingStyle, setSeatingStyle] = useState<'round' | 'theater' | 'informal'>('round');
  const [hasElevator, setHasElevator] = useState(true);
  const [hasParking, setHasParking] = useState(true);
  const [hasBackupPower, setHasBackupPower] = useState(true);
  const [weatherContingency, setWeatherContingency] = useState(
    'Air-conditioned / indoor hall reserved in case of sudden rain or extreme heat.'
  );

  // Decor items checklist
  const [decorList, setDecorList] = useState([
    {
      id: 'dec-1',
      name: 'Main Stage Backdrop (8ft x 10ft)',
      category: 'Stage',
      qty: '1 set',
      isPurchased: true,
      notes: 'Galaxy theme flex / fabric banner',
    },
    {
      id: 'dec-2',
      name: 'Metallic Balloon Arch (Navy, Silver, Violet)',
      category: 'Entrance',
      qty: '150 balloons',
      isPurchased: true,
      notes: 'Installed by local balloon decorator',
    },
    {
      id: 'dec-3',
      name: 'LED Fairy Light Curtains & Warm Spotlights',
      category: 'Lighting',
      qty: '4 strands',
      isPurchased: false,
      notes: 'Included in hall rental package',
    },
    {
      id: 'dec-4',
      name: 'Cake Cutting Table Cloth & Gold Runner',
      category: 'Cake Area',
      qty: '1 table',
      isPurchased: false,
      notes: 'Deep violet linen with gold sequin runner',
    },
    {
      id: 'dec-5',
      name: 'Centerpieces for Dining Tables',
      category: 'Tables',
      qty: `${Math.ceil(totalGuests / 8)} centerpieces`,
      isPurchased: false,
      notes: 'Mini constellation jars with battery tea-lights',
    },
  ]);

  // Seating calculation: 8 guests per round table
  const tablesNeeded = Math.ceil(totalGuests / 8);
  const chairsNeeded = Math.round(totalGuests * 1.1); // 10% extra seating buffer

  const handleSaveVenueSettings = () => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, {
      venueType,
      location: locationName.trim(),
    });
    showToast('Venue parameters updated!', 'success');
  };

  const toggleDecorPurchased = (id: string) => {
    setDecorList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isPurchased: !d.isPurchased } : d))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
          Venue, Seating & Decoration Plan
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Capacity calculations, table arrangements, stage setup, and decor material checklists.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Venue Setup & Seating Math */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section 1: Venue Configuration */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#3B1E48]" />
                <h2 className="text-sm font-bold text-stone-900">Venue Specifications</h2>
              </div>
              <span className="text-xs text-stone-500 capitalize">{venueType} Setting</span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Venue Name & Address
                </label>
                <div className="mt-1 flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Boring Road Community Hall, Patna"
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pl-9 pr-3 text-xs text-stone-900 focus:bg-white"
                    />
                  </div>
                  <button
                    onClick={handleSaveVenueSettings}
                    className="rounded-lg bg-[#3B1E48] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#2D123A]"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Environment Type</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(['indoor', 'outdoor', 'hybrid'] as VenueType[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVenueType(v)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                        venueType === v
                          ? 'border-[#3B1E48] bg-[#3B1E48] text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seating Math Strip */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                  <span className="flex items-center gap-1.5">
                    <Armchair className="h-4 w-4 text-[#3B1E48]" />
                    <span>Seating Math for {totalGuests} Guests</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSeatingStyle('round')}
                      className={`rounded px-2 py-0.5 text-[11px] ${
                        seatingStyle === 'round' ? 'bg-[#3B1E48] text-white font-medium' : 'text-stone-600'
                      }`}
                    >
                      Round Tables
                    </button>
                    <button
                      onClick={() => setSeatingStyle('theater')}
                      className={`rounded px-2 py-0.5 text-[11px] ${
                        seatingStyle === 'theater' ? 'bg-[#3B1E48] text-white font-medium' : 'text-stone-600'
                      }`}
                    >
                      Theater Row
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                    <div className="text-[10px] text-stone-500 uppercase">Dining Tables</div>
                    <div className="mt-1 text-xl font-bold text-stone-900 font-mono">
                      {tablesNeeded} Tables
                    </div>
                    <div className="text-[10px] text-stone-400">8 guests / table</div>
                  </div>

                  <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                    <div className="text-[10px] text-stone-500 uppercase">Total Chairs</div>
                    <div className="mt-1 text-xl font-bold text-stone-900 font-mono">
                      {chairsNeeded} Chairs
                    </div>
                    <div className="text-[10px] text-stone-400">incl. +10% buffer</div>
                  </div>

                  <div className="rounded-lg bg-white p-3 text-center border border-stone-200 sm:col-span-1 col-span-2">
                    <div className="text-[10px] text-stone-500 uppercase">Stage / Cake Table</div>
                    <div className="mt-1 text-xl font-bold text-stone-900 font-mono">
                      6ft × 3ft
                    </div>
                    <div className="text-[10px] text-stone-400">Elevated center stage</div>
                  </div>
                </div>
              </div>

              {/* Venue Checklist & Accessibility */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-stone-800">Venue Facility Checks</div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <label className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white p-2.5 text-stone-700">
                    <input
                      type="checkbox"
                      checked={hasElevator}
                      onChange={(e) => setHasElevator(e.target.checked)}
                      className="rounded border-stone-300 text-[#3B1E48]"
                    />
                    <span>Ground floor / Elevator</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white p-2.5 text-stone-700">
                    <input
                      type="checkbox"
                      checked={hasParking}
                      onChange={(e) => setHasParking(e.target.checked)}
                      className="rounded border-stone-300 text-[#3B1E48]"
                    />
                    <span>Guest Parking Space</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white p-2.5 text-stone-700">
                    <input
                      type="checkbox"
                      checked={hasBackupPower}
                      onChange={(e) => setHasBackupPower(e.target.checked)}
                      className="rounded border-stone-300 text-[#3B1E48]"
                    />
                    <span>Generator Backup</span>
                  </label>
                </div>
              </div>

              {/* Weather Contingency */}
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                  <CloudRain className="h-4 w-4 text-stone-500" />
                  <span>Weather Contingency Plan</span>
                </div>
                <input
                  type="text"
                  value={weatherContingency}
                  onChange={(e) => setWeatherContingency(e.target.value)}
                  className="mt-1.5 w-full rounded border border-stone-200 bg-white p-2 text-xs text-stone-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Decoration Tracker & Purchased Status */}
        <div className="space-y-6">
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-stone-900">Decoration Materials</h2>
              </div>
              <span className="text-[10px] text-stone-400">
                {decorList.filter((d) => d.isPurchased).length}/{decorList.length} Arranged
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {decorList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleDecorPurchased(item.id)}
                  className={`flex cursor-pointer items-start justify-between rounded-lg border p-3 transition-colors ${
                    item.isPurchased
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100/60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        item.isPurchased
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {item.isPurchased && <Check className="h-3 w-3" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-stone-900">{item.name}</div>
                      <div className="mt-0.5 text-[10px] text-stone-500">
                        {item.category} · {item.qty} · {item.notes}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-stone-50 p-2.5 text-[11px] text-stone-500">
              💡 Tip: Marking items here avoids duplicate shopping list recommendations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
