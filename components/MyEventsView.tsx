'use client';

import React, { useState, useMemo } from 'react';
import { useEventContext } from '@/lib/context';
import { EventItem, EventType } from '@/types/event';
import {
  Calendar,
  Users,
  Wallet,
  Copy,
  Trash2,
  CheckCircle2,
  Search,
  Plus,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { formatCurrencyINR } from '@/lib/calculators';

interface MyEventsViewProps {
  onOpenCreateModal: () => void;
}

export function MyEventsView({ onOpenCreateModal }: MyEventsViewProps) {
  const {
    events,
    activeEventId,
    setActiveEventId,
    duplicateEvent,
    deleteEvent,
    setActiveModule,
  } = useEventContext();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'name'>('date');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        const matchesSearch =
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.location.toLowerCase().includes(search.toLowerCase());
        const matchesType = selectedType === 'all' || e.type === selectedType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return a.date.localeCompare(b.date);
        if (sortBy === 'budget') return b.budget.total - a.budget.total;
        return a.name.localeCompare(b.name);
      });
  }, [events, search, selectedType, sortBy]);

  const handleActivate = (id: string) => {
    setActiveEventId(id);
    setActiveModule('overview');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            My Celebrations ({events.length})
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Manage, duplicate, and switch between your planned celebrations.
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 rounded-lg bg-[#3B1E48] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2D123A]"
        >
          <Plus className="h-4 w-4" />
          <span>New Celebration</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by event title, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pl-9 pr-3 text-xs text-stone-900 focus:border-[#3B1E48] focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-700"
            aria-label="Filter by event type"
          >
            <option value="all">All Types</option>
            <option value="Birthday Party">Birthday Party</option>
            <option value="Wedding">Wedding</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Engagement">Engagement</option>
            <option value="Graduation Party">Graduation Party</option>
            <option value="Baby Shower">Baby Shower</option>
            <option value="Festival Celebration">Festival</option>
            <option value="Family Gathering">Family Gathering</option>
            <option value="Corporate Event">Corporate</option>
            <option value="Custom Event">Custom</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-700"
            aria-label="Sort events"
          >
            <option value="date">Sort by Date</option>
            <option value="budget">Sort by Budget</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredEvents.map((evt) => {
          const isActive = evt.id === activeEventId;
          const isDeleting = deleteConfirmId === evt.id;

          return (
            <div
              key={evt.id}
              className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all ${
                isActive
                  ? 'border-[#3B1E48] bg-white shadow-md ring-2 ring-[#3B1E48]/10'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-[#3B1E48]">{evt.type}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{evt.venueType}</span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-stone-900">{evt.name}</h3>
                  </div>

                  {isActive && (
                    <span className="flex items-center gap-1 rounded-md bg-[#3B1E48] px-2 py-0.5 text-[10px] font-semibold text-white">
                      <CheckCircle2 className="h-3 w-3 text-amber-300" />
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600 sm:grid-cols-3">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Date</span>
                    <span className="font-medium">{evt.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Invited</span>
                    <span className="font-medium tabular-nums">{evt.totalGuests} Guests</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Budget</span>
                    <span className="font-mono font-medium text-stone-900">
                      {formatCurrencyINR(evt.budget.total)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-stone-500 truncate">
                  📍 {evt.location}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => duplicateEvent(evt.id)}
                    className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100"
                    title="Duplicate Event"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </button>

                  {!isDeleting ? (
                    <button
                      onClick={() => setDeleteConfirmId(evt.id)}
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Delete Event"
                      aria-label="Delete Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        onClick={() => {
                          deleteEvent(evt.id);
                          setDeleteConfirmId(null);
                        }}
                        className="rounded-md bg-rose-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-rose-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-md border border-stone-200 px-2 py-1 text-[11px] text-stone-600 hover:bg-stone-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {!isActive ? (
                  <button
                    onClick={() => handleActivate(evt.id)}
                    className="flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1 text-xs font-medium text-white hover:bg-stone-800"
                  >
                    <span>Switch & Plan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveModule('overview')}
                    className="flex items-center gap-1 text-xs font-semibold text-[#3B1E48] hover:underline"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-200 bg-white p-12 text-center">
          <p className="text-xs text-stone-500">No events matched your search query or filters.</p>
        </div>
      )}
    </div>
  );
}
