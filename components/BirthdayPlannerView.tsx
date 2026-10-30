'use client';

import React, { useState, useMemo } from 'react';
import { useEventContext } from '@/lib/context';
import {
  calculateCakeRequirement,
  formatCurrencyINR,
  calculateCateringQuantity,
} from '@/lib/calculators';
import {
  Cake,
  Gift,
  Gamepad2,
  Sparkles,
  Users,
  Palette,
  Check,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export function BirthdayPlannerView() {
  const {
    activeEvent,
    updateEvent,
    menuItems,
    addMenuItem,
    shoppingItems,
    addShoppingItem,
    checklistItems,
    addChecklistItem,
    scheduleItems,
    addScheduleItem,
    setActiveModule,
    showToast,
  } = useEventContext();

  // Local state for birthday person info
  const [celebrantName, setCelebrantName] = useState(
    activeEvent?.birthdayPerson?.name || activeEvent?.name || 'Aarav'
  );
  const [celebrantAge, setCelebrantAge] = useState(
    activeEvent?.birthdayPerson?.age || 10
  );
  const [flavor, setFlavor] = useState(
    activeEvent?.cakePreference?.flavor || 'Belgian Chocolate Truffle'
  );
  const [message, setMessage] = useState(
    activeEvent?.cakePreference?.message || `Happy ${celebrantAge}th Birthday ${celebrantName}!`
  );
  const [customWeight, setCustomWeight] = useState<number | undefined>(
    activeEvent?.cakePreference?.targetWeightKg
  );

  // Return gifts state
  const childCount = activeEvent?.guestCategories.children || 15;
  const [giftItemName, setGiftItemName] = useState('Space Theme Stationery & Puzzle Set');
  const [giftCostPerChild, setGiftCostPerChild] = useState(65);

  const cakeCalc = useMemo(() => {
    return calculateCakeRequirement(activeEvent?.totalGuests || 50);
  }, [activeEvent?.totalGuests]);

  const effectiveCakeWeight = customWeight || cakeCalc.weightKg;

  const totalReturnGiftBudget = childCount * giftCostPerChild;

  const handleSaveCakeSettings = () => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, {
      birthdayPerson: {
        name: celebrantName,
        age: celebrantAge,
      },
      cakePreference: {
        flavor,
        tiers: effectiveCakeWeight >= 3.5 ? 2 : 1,
        message,
        targetWeightKg: effectiveCakeWeight,
      },
    });
    showToast('Birthday and cake parameters saved!', 'success');
  };

  // Pre-curated party games
  const partyGames = [
    {
      title: 'Cosmic Musical Planets',
      duration: '20 mins',
      materials: 'Colored floor circles, Bluetooth speaker',
      description: 'Children dance around colored planet cutouts. When space music pauses, they must stand on an announced planetary color.',
    },
    {
      title: 'Space Trivia & Balloon Relay',
      duration: '30 mins',
      materials: '10 balloons, printed quiz cards',
      description: 'Two teams pass balloons without using hands; answer a fun science/cartoon trivia question at the finish line.',
    },
    {
      title: 'Pin the Astronaut on the Moon',
      duration: '15 mins',
      materials: 'Moon poster, astronaut stickers, blindfold',
      description: 'Classic party game reimagined with high-contrast sticker badges.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-stone-200 bg-gradient-to-r from-amber-50/70 via-white to-purple-50/50 p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
              <Cake className="h-4 w-4 text-amber-600" />
              <span>Dedicated Birthday Planning Engine</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-stone-900">
              {celebrantName}’s {celebrantAge}th Birthday Party Planner
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              Deterministic cake sizing, entertainment schedule, return gifts, and theme orchestration for {activeEvent?.totalGuests || 50} guests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModule('ai-recommendations')}
              className="flex items-center gap-1.5 rounded-lg bg-[#3B1E48] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2D123A]"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Get AI Birthday Concepts</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Cake Sizing & Flavor Specifications */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section 1: Cake Requirement Calculator */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Cake className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-stone-900">Cake Requirement Calculator</h2>
              </div>
              <span className="text-xs text-stone-500">Deterministic Arithmetic</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-center">
                <div className="text-[11px] text-amber-800">Calculated Weight</div>
                <div className="mt-1 text-2xl font-bold text-amber-950 font-mono">
                  {effectiveCakeWeight} kg
                </div>
                <div className="mt-1 text-[10px] text-amber-700">
                  {cakeCalc.explanation}
                </div>
              </div>

              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-center">
                <div className="text-[11px] text-stone-600">Recommended Tiers</div>
                <div className="mt-1 text-2xl font-bold text-stone-900">
                  {cakeCalc.recommendedTiers} {cakeCalc.recommendedTiers > 1 ? 'Tiers' : 'Tier'}
                </div>
                <div className="mt-1 text-[10px] text-stone-500">
                  Stable support for {activeEvent?.totalGuests || 50} servings
                </div>
              </div>

              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-center">
                <div className="text-[11px] text-stone-600">Estimated Cost</div>
                <div className="mt-1 text-2xl font-bold text-stone-900 font-mono">
                  {formatCurrencyINR(effectiveCakeWeight * 650)}
                </div>
                <div className="mt-1 text-[10px] text-stone-500">
                  Standard artisanal rate (~₹650/kg)
                </div>
              </div>
            </div>

            {/* Editable Cake Inputs */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Cake Flavor
                </label>
                <input
                  type="text"
                  value={flavor}
                  onChange={(e) => setFlavor(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Target Cake Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={effectiveCakeWeight}
                  onChange={(e) => setCustomWeight(Number(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Lettering / Inscription Message
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Happy 10th Birthday Aarav!"
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveCakeSettings}
                className="flex items-center gap-1.5 rounded-lg bg-[#3B1E48] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#2D123A]"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Cake & Birthday Details</span>
              </button>
            </div>
          </div>

          {/* Section 2: Entertainment & Games Itinerary */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-purple-600" />
                <h2 className="text-sm font-bold text-stone-900">
                  Curated Party Games for {celebrantAge}-Year-Olds
                </h2>
              </div>
              <span className="text-xs text-stone-500">{partyGames.length} Activities</span>
            </div>

            <div className="mt-4 space-y-3">
              {partyGames.map((game, idx) => (
                <div key={idx} className="rounded-lg border border-stone-200 bg-stone-50/60 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">
                      {idx + 1}. {game.title}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-purple-700">
                      <Clock className="h-3 w-3" />
                      {game.duration}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-600">{game.description}</p>
                  <div className="mt-2 text-[11px] text-stone-500">
                    <strong className="text-stone-700">Required: </strong>
                    {game.materials}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Return Gifts & Decor Logistics */}
        <div className="space-y-6">
          {/* Return Gifts Calculator */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Gift className="h-4 w-4 text-rose-600" />
              <h2 className="text-sm font-bold text-stone-900">Return Gifts & Favors</h2>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">Child Guests:</span>
                <strong className="text-stone-900 tabular-nums">{childCount} Kids</strong>
              </div>

              <div>
                <label className="block text-[11px] text-stone-600">Gift Pack Concept</label>
                <input
                  type="text"
                  value={giftItemName}
                  onChange={(e) => setGiftItemName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600">Budget Per Child (INR ₹)</label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  value={giftCostPerChild}
                  onChange={(e) => setGiftCostPerChild(Number(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                />
              </div>

              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-center">
                <div className="text-[11px] text-stone-500">Total Favor Cost</div>
                <div className="mt-1 text-xl font-bold text-stone-900 font-mono">
                  {formatCurrencyINR(totalReturnGiftBudget)}
                </div>
                <div className="text-[10px] text-stone-400">
                  {childCount} packs × {formatCurrencyINR(giftCostPerChild)}
                </div>
              </div>

              <button
                onClick={() => {
                  addShoppingItem({
                    name: `Return Gift: ${giftItemName}`,
                    category: 'Favors',
                    quantity: childCount,
                    unit: 'piece',
                    estimatedCost: totalReturnGiftBudget,
                    isPurchased: false,
                    priority: 'medium',
                  });
                }}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100"
              >
                Sync to Shopping List
              </button>
            </div>
          </div>

          {/* Theme Quick Selector */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Palette className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-bold text-stone-900">Current Birthday Theme</h2>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-[#3B1E48]">
                {activeEvent?.theme || 'Cosmic Galaxy & Space Explorer'}
              </div>
              <p className="mt-1 text-xs text-stone-600">
                Navy, royal violet, and silver chrome balloon styling with astronaut stage photo cutouts.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => setActiveModule('ai-recommendations')}
                  className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-2.5 text-xs font-medium text-stone-800 hover:bg-stone-100"
                >
                  <span>Explore Alternative Themes</span>
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                </button>
                <button
                  onClick={() => setActiveModule('invitations')}
                  className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-2.5 text-xs font-medium text-stone-800 hover:bg-stone-100"
                >
                  <span>Draft Birthday Invitations</span>
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
