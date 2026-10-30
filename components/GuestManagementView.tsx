'use client';

import React, { useState, useMemo } from 'react';
import { useEventContext } from '@/lib/context';
import { Guest, GuestCategory, RsvpStatus } from '@/types/event';
import {
  reconcileGuestTotals,
  calculateRsvpBreakdown,
} from '@/lib/calculators';
import {
  Users,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Search,
  Check,
  Percent,
} from 'lucide-react';

export function GuestManagementView() {
  const {
    activeEvent,
    updateEvent,
    guests,
    addGuest,
    updateGuest,
    deleteGuest,
    globalCateringBuffer,
    setGlobalCateringBuffer,
    showToast,
  } = useEventContext();

  const [filterRsvp, setFilterRsvp] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Add Guest Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GuestCategory>('adult');
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('confirmed');
  const [dietary, setDietary] = useState('');
  const [notes, setNotes] = useState('');

  // Bulk add modal/textarea state
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Demographic edit state
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [editTotal, setEditTotal] = useState(activeEvent?.totalGuests || 50);
  const [editAdults, setEditAdults] = useState(activeEvent?.guestCategories.adults || 30);
  const [editChildren, setEditChildren] = useState(activeEvent?.guestCategories.children || 15);
  const [editSeniors, setEditSeniors] = useState(activeEvent?.guestCategories.seniors || 5);

  const totalGuests = activeEvent?.totalGuests || 50;
  const guestCategories = useMemo(
    () => activeEvent?.guestCategories || { adults: 30, children: 15, seniors: 5 },
    [activeEvent?.guestCategories]
  );

  const reconciliation = useMemo(() => {
    return reconcileGuestTotals(totalGuests, guestCategories);
  }, [totalGuests, guestCategories]);

  const rsvp = useMemo(() => {
    return calculateRsvpBreakdown(totalGuests, guests);
  }, [totalGuests, guests]);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchRsvp = filterRsvp === 'all' || g.rsvpStatus === filterRsvp;
      const matchSearch =
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.notes && g.notes.toLowerCase().includes(search.toLowerCase())) ||
        (g.dietaryRestrictions && g.dietaryRestrictions.toLowerCase().includes(search.toLowerCase()));
      return matchRsvp && matchSearch;
    });
  }, [guests, filterRsvp, search]);

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addGuest({
      name: name.trim(),
      category,
      rsvpStatus,
      dietaryRestrictions: dietary.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setName('');
    setDietary('');
    setNotes('');
  };

  const handleBulkAddSubmit = () => {
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    lines.forEach((line) => {
      addGuest({
        name: line,
        category: 'adult',
        rsvpStatus: 'confirmed',
      });
    });

    setBulkText('');
    setShowBulkAdd(false);
    showToast(`Added ${lines.length} guests in bulk!`, 'success');
  };

  const handleSaveCategories = () => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, {
      totalGuests: editTotal,
      guestCategories: {
        adults: editAdults,
        children: editChildren,
        seniors: editSeniors,
      },
    });
    setIsEditingCategories(false);
    showToast('Guest parameters and demographic split updated.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Guest Management & RSVP
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Reconcile demographic categories, track confirmed attendance, and fine-tune catering buffers.
          </p>
        </div>

        <button
          onClick={() => setShowBulkAdd(true)}
          className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
        >
          <UserPlus className="h-4 w-4 text-stone-500" />
          <span>Quick Bulk Import</span>
        </button>
      </div>

      {/* Demographic Reconciliation Banner */}
      {!reconciliation.isConsistent ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold">Demographic Inconsistency Warning: </span>
              {reconciliation.warningMessage}
            </div>
          </div>
          <button
            onClick={() => setIsEditingCategories(true)}
            className="rounded-lg bg-amber-200/90 px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-300"
          >
            Adjust Breakdown
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>
              All categories agree: <strong>{guestCategories.adults} Adults</strong> +{' '}
              <strong>{guestCategories.children} Children</strong> +{' '}
              <strong>{guestCategories.seniors} Seniors</strong> ={' '}
              <strong className="font-bold">{totalGuests} Total Invited</strong>.
            </span>
          </div>
          <button
            onClick={() => setIsEditingCategories(!isEditingCategories)}
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            {isEditingCategories ? 'Close Editor' : 'Edit Demographics'}
          </button>
        </div>
      )}

      {/* Edit Categories Drawer */}
      {isEditingCategories && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-4">
          <div className="text-xs font-bold text-stone-900">
            Edit Target Demographics for {activeEvent?.name}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] text-stone-600">Total Guests</label>
              <input
                type="number"
                min="1"
                value={editTotal}
                onChange={(e) => setEditTotal(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-600">Adults</label>
              <input
                type="number"
                min="0"
                value={editAdults}
                onChange={(e) => setEditAdults(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-600">Children</label>
              <input
                type="number"
                min="0"
                value={editChildren}
                onChange={(e) => setEditChildren(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-600">Seniors</label>
              <input
                type="number"
                min="0"
                value={editSeniors}
                onChange={(e) => setEditSeniors(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditingCategories(false)}
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCategories}
              className="rounded-lg bg-[#3B1E48] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2D123A]"
            >
              Save Demographics
            </button>
          </div>
        </div>
      )}

      {/* RSVP Metric Cards & Catering Buffer */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-400">Total Invited</div>
          <div className="mt-1 text-2xl font-bold text-stone-900 tabular-nums">
            {rsvp.invited}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            Individual records: {guests.length}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800">
            <span>Confirmed Attendance</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-950 tabular-nums">
            {rsvp.confirmed}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            {rsvp.confirmedPercentage}% of invited list
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800">
            <span>Pending RSVP</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-950 tabular-nums">
            {rsvp.pending}
          </div>
          <div className="mt-1 text-[11px] text-amber-700">
            Awaiting response
          </div>
        </div>

        {/* Catering Buffer Slider */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
            <span>Catering Buffer Factor</span>
            <Percent className="h-3.5 w-3.5 text-[#3B1E48]" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              +{Math.round((globalCateringBuffer - 1) * 100)}%
            </span>
            <span className="text-xs text-stone-500">safety margin</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="1.3"
            step="0.05"
            value={globalCateringBuffer}
            onChange={(e) => setGlobalCateringBuffer(Number(e.target.value))}
            className="mt-2 w-full accent-[#3B1E48]"
          />
        </div>
      </div>

      {/* Add Single Guest Inline Form */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
        <h2 className="text-xs font-bold text-stone-900">Add Individual Guest</h2>
        <form onSubmit={handleAddSingle} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder="Guest full name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GuestCategory)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
              aria-label="Guest Category"
            >
              <option value="adult">Adult</option>
              <option value="child">Child</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div>
            <select
              value={rsvpStatus}
              onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
              aria-label="RSVP Status"
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#3B1E48] py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2D123A]"
            >
              Add Guest
            </button>
          </div>

          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder="Dietary requirements (e.g. Pure Jain, nut allergy, vegan)"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Optional notes (e.g. Needs ground floor seating)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
            />
          </div>
        </form>
      </div>

      {/* Guest Roster Table & Filter Tabs */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
            {(['all', 'confirmed', 'pending', 'declined'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterRsvp(status)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  filterRsvp === status
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search guests by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-stone-200 bg-stone-50 py-1 pl-8 pr-3 text-xs text-stone-900 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400">
                <th className="pb-2.5 font-semibold">Guest Name</th>
                <th className="pb-2.5 font-semibold">Category</th>
                <th className="pb-2.5 font-semibold">RSVP Status</th>
                <th className="pb-2.5 font-semibold">Dietary & Notes</th>
                <th className="pb-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredGuests.map((g) => (
                <tr key={g.id} className="hover:bg-stone-50/50">
                  <td className="py-2.5 font-medium text-stone-900">{g.name}</td>

                  {/* Clean unboxed metadata (Zero-Pill rule) */}
                  <td className="py-2.5 capitalize text-stone-600">{g.category}</td>

                  <td className="py-2.5">
                    <select
                      value={g.rsvpStatus}
                      onChange={(e) =>
                        updateGuest(g.id, { rsvpStatus: e.target.value as RsvpStatus })
                      }
                      className={`rounded-md border border-stone-200 bg-white px-2 py-0.5 text-xs font-medium ${
                        g.rsvpStatus === 'confirmed'
                          ? 'text-emerald-700'
                          : g.rsvpStatus === 'pending'
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="declined">Declined</option>
                    </select>
                  </td>

                  <td className="py-2.5 text-stone-500">
                    {g.dietaryRestrictions && (
                      <span className="font-medium text-stone-700">
                        {g.dietaryRestrictions}
                      </span>
                    )}
                    {g.dietaryRestrictions && g.notes && ' · '}
                    {g.notes && <span>{g.notes}</span>}
                    {!g.dietaryRestrictions && !g.notes && <span className="text-stone-300">—</span>}
                  </td>

                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => deleteGuest(g.id)}
                      className="rounded-md p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Remove guest"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredGuests.length === 0 && (
            <div className="py-8 text-center text-xs text-stone-400">
              No guests found matching this view.
            </div>
          )}
        </div>
      </div>

      {/* Bulk Add Modal */}
      {showBulkAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setShowBulkAdd(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-stone-900">Paste Guest List (1 per line)</h3>
            <p className="mt-1 text-xs text-stone-500">
              Paste names from WhatsApp or spreadsheets. Each line will be added as a confirmed guest.
            </p>

            <textarea
              rows={8}
              placeholder="Aarav Sharma&#10;Pooja Verma&#10;Dr. K.K. Sinha&#10;Meera Devi"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="mt-3 w-full rounded-lg border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowBulkAdd(false)}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAddSubmit}
                className="rounded-lg bg-[#3B1E48] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#2D123A]"
              >
                Add All Guests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
