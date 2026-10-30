'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/lib/context';
import { EventType, VenueType, FoodPreference } from '@/types/event';
import { X, Check, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { reconcileGuestTotals } from '@/lib/calculators';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EVENT_TYPES: EventType[] = [
  'Birthday Party',
  'Wedding',
  'Anniversary',
  'Engagement',
  'Graduation Party',
  'Baby Shower',
  'Festival Celebration',
  'Family Gathering',
  'Corporate Event',
  'Custom Event',
];

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const { createEvent, setActiveModule } = useEventContext();

  const [step, setStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('Birthday Party');
  const [date, setDate] = useState('2026-11-20');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('22:00');
  const [location, setLocation] = useState('');

  // Guests
  const [totalGuests, setTotalGuests] = useState<number>(50);
  const [adults, setAdults] = useState<number>(30);
  const [children, setChildren] = useState<number>(15);
  const [seniors, setSeniors] = useState<number>(5);

  // Budget & Venue
  const [budgetTotal, setBudgetTotal] = useState<number>(25000);
  const [isStrictBudget, setIsStrictBudget] = useState<boolean>(true);
  const [contingencyReserve, setContingencyReserve] = useState<number>(2000);
  const [venueType, setVenueType] = useState<VenueType>('indoor');

  // Food & Theme
  const [foodPreference, setFoodPreference] = useState<FoodPreference>('vegetarian');
  const [theme, setTheme] = useState('Enchanted Gold & Violet');
  const [birthdayName, setBirthdayName] = useState('');
  const [birthdayAge, setBirthdayAge] = useState<number>(10);
  const [cakeFlavor, setCakeFlavor] = useState('Chocolate Truffle');
  const [cakeMessage, setCakeMessage] = useState('');

  if (!isOpen) return null;

  const reconciliation = reconcileGuestTotals(totalGuests, { adults, children, seniors });

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    setStep((s) => Math.min(4, s + 1));
  };

  const handlePrev = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createEvent({
      name: name.trim() || 'New Celebration',
      type,
      date,
      startTime,
      endTime,
      location: location.trim() || 'City Center Hall',
      totalGuests,
      guestCategories: {
        adults,
        children,
        seniors,
      },
      budget: {
        total: budgetTotal,
        isStrict: isStrictBudget,
        contingencyReserve,
      },
      venueType,
      theme: theme.trim() || 'Classic Celebration',
      foodPreference,
      cakePreference: {
        flavor: cakeFlavor,
        tiers: totalGuests > 70 ? 2 : 1,
        message: cakeMessage,
        targetWeightKg: Math.max(1.5, Math.ceil(totalGuests * 0.065 * 2) / 2),
      },
      birthdayPerson:
        type === 'Birthday Party'
          ? {
              name: birthdayName || name,
              age: birthdayAge,
            }
          : undefined,
    });

    onClose();
    if (type === 'Birthday Party') {
      setActiveModule('birthday-planner');
    } else {
      setActiveModule('overview');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Create New Celebration</h2>
            <p className="text-xs text-stone-500">Step {step} of 4: Setup your event parameters</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="my-4 flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-[#3B1E48]' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* STEP 1: Event Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya's 5th Birthday, Sharma Family Diwali Gala"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-[#3B1E48] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Event Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-[#3B1E48] focus:bg-white focus:outline-hidden"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-[#3B1E48] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-[#3B1E48] focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-[#3B1E48] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Location / City / Venue Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Patna (Boring Road Community Hall), Bengaluru, Delhi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-[#3B1E48] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Guests & Demographics */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Total Invited Guests *
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={totalGuests}
                  onChange={(e) => setTotalGuests(Number(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-[#3B1E48] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <div className="text-xs font-semibold text-stone-800">
                  Demographic Breakdown (for food & activity planning)
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-600">Adults</label>
                    <input
                      type="number"
                      min={0}
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600">Children</label>
                    <input
                      type="number"
                      min={0}
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600">Seniors</label>
                    <input
                      type="number"
                      min={0}
                      value={seniors}
                      onChange={(e) => setSeniors(Number(e.target.value))}
                      className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900"
                    />
                  </div>
                </div>

                {/* Real-time Category Reconciliation Warning */}
                {!reconciliation.isConsistent && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-amber-800">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>{reconciliation.warningMessage}</span>
                  </div>
                )}
                {reconciliation.isConsistent && (
                  <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    <span>Demographic sum perfectly matches total invited count ({totalGuests}).</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Venue */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Total Budget (INR ₹) *
                </label>
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={budgetTotal}
                  onChange={(e) => setBudgetTotal(Number(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-[#3B1E48] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3.5">
                <div>
                  <div className="text-xs font-semibold text-stone-900">Strict Budget Ceiling</div>
                  <div className="text-[11px] text-stone-500">
                    Show high-contrast alert if expenses exceed this limit
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isStrictBudget}
                  onChange={(e) => setIsStrictBudget(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-stone-300 text-[#3B1E48] focus:ring-[#3B1E48]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Contingency Reserve (INR ₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={contingencyReserve}
                  onChange={(e) => setContingencyReserve(Number(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-[#3B1E48] focus:bg-white focus:outline-hidden"
                />
                <span className="text-[10px] text-stone-400">
                  Reserved safety funds for last-minute needs or price variations.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Venue Type</label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {(['indoor', 'outdoor', 'hybrid'] as VenueType[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVenueType(v)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors ${
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
            </div>
          )}

          {/* STEP 4: Food & Preferences */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Food & Dietary Preference
                </label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {(['vegetarian', 'non-vegetarian', 'mixed'] as FoodPreference[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFoodPreference(f)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors ${
                        foodPreference === f
                          ? 'border-[#3B1E48] bg-[#3B1E48] text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {type === 'Birthday Party' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-3">
                  <div className="text-xs font-semibold text-amber-900">
                    Birthday Person Details
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-600">Celebrant Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Aarav"
                        value={birthdayName}
                        onChange={(e) => setBirthdayName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600">Turning Age</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={birthdayAge}
                        onChange={(e) => setBirthdayAge(Number(e.target.value))}
                        className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Cake Flavor Preference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Belgian Chocolate, Red Velvet, Pineapple"
                    value={cakeFlavor}
                    onChange={(e) => setCakeFlavor(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Theme / Atmosphere Idea
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Space Galaxy, Traditional Marigold, Retro"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-stone-100 pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && !name.trim()}
                className="flex items-center gap-1 rounded-lg bg-[#3B1E48] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#2D123A] disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800"
              >
                <Check className="h-4 w-4" />
                <span>Create Event & Open Planner</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
