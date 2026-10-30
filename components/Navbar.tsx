'use client';

import React from 'react';
import { useEventContext } from '@/lib/context';
import {
  Sparkles,
  Calendar,
  Plus,
  Menu,
  ChevronDown,
  RotateCcw,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrencyINR } from '@/lib/calculators';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenCreateModal: () => void;
}

export function Navbar({ onOpenMobileSidebar, onOpenCreateModal }: NavbarProps) {
  const {
    events,
    activeEventId,
    activeEvent,
    setActiveEventId,
    setActiveModule,
    resetToDefaultSamples,
  } = useEventContext();

  // Calculate days remaining to active event
  const activeDate = activeEvent?.date;
  const daysRemaining = activeDate
    ? Math.ceil(
        (new Date(activeDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Zone 1: Brand & Mobile Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => setActiveModule('overview')}
          className="flex items-center gap-2 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3B1E48] text-amber-400 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-[#3B1E48]">
              Celebr<span className="text-amber-600">AI</span>
            </span>
            <span className="hidden text-[10px] uppercase tracking-wider text-stone-400 sm:inline-block sm:ml-2">
              Event Planner
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Context Zone (Active Event Switcher & Countdown) */}
      <div className="flex items-center gap-2 sm:gap-4">
        {activeEvent && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={activeEventId}
                onChange={(e) => setActiveEventId(e.target.value)}
                className="h-9 max-w-[160px] truncate rounded-lg border border-stone-200 bg-stone-50 py-1 pl-2.5 pr-7 text-xs font-medium text-stone-800 shadow-xs focus:border-[#3B1E48] focus:outline-hidden sm:max-w-[220px] md:max-w-[280px]"
                aria-label="Select active event"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} ({evt.type})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-stone-400" />
            </div>

            {/* Countdown Badge */}
            {daysRemaining !== null && (
              <div className="hidden items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 px-2.5 py-1 text-xs font-medium text-amber-900 md:flex">
                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                <span className="tabular-nums">
                  {daysRemaining > 0
                    ? `${daysRemaining} days away`
                    : daysRemaining === 0
                    ? 'Today!'
                    : `${Math.abs(daysRemaining)} days ago`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone 3: Primary Action Zone */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCreateModal}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-[#3B1E48] px-3.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#2D123A]"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Event</span>
        </button>

        <button
          onClick={() => setActiveModule('settings')}
          className="hidden h-9 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 md:flex"
          title="Backup and Documentation"
        >
          <Download className="h-3.5 w-3.5 text-stone-500" />
          <span>Backup</span>
        </button>
      </div>
    </header>
  );
}
