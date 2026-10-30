'use client';

import React, { useState, useMemo } from 'react';
import { useEventContext } from '@/lib/context';
import { MenuItem, MenuCategory, UnitType, GuestCategory } from '@/types/event';
import {
  calculateCateringQuantity,
  calculateCakeRequirement,
  formatCurrencyINR,
} from '@/lib/calculators';
import {
  Utensils,
  Plus,
  Trash2,
  Cake,
  Info,
  Scale,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export function FoodCateringView() {
  const {
    activeEvent,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    globalCateringBuffer,
    setActiveModule,
  } = useEventContext();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New item form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('starter');
  const [applicableGuests, setApplicableGuests] = useState<GuestCategory[]>(['adult', 'child', 'senior']);
  const [portionSize, setPortionSize] = useState<number>(100);
  const [unit, setUnit] = useState<UnitType>('g');
  const [rawVsPrepared, setRawVsPrepared] = useState<'raw' | 'prepared'>('prepared');
  const [estimatedCostPerUnit, setEstimatedCostPerUnit] = useState<number>(0.3);
  const [bufferMultiplier, setBufferMultiplier] = useState<number>(1.1);
  const [notes, setNotes] = useState('');

  const guestCategories = useMemo(
    () => activeEvent?.guestCategories || { adults: 30, children: 15, seniors: 5 },
    [activeEvent?.guestCategories]
  );
  const totalGuests = activeEvent?.totalGuests || 50;

  // Cake requirement
  const cakeRequirement = useMemo(() => {
    return calculateCakeRequirement(totalGuests);
  }, [totalGuests]);

  // Compute catering calculations for each item
  const calculatedItems = useMemo(() => {
    return menuItems.map((item) => {
      const calc = calculateCateringQuantity(item, guestCategories, globalCateringBuffer);
      return {
        ...item,
        calculation: calc,
      };
    });
  }, [menuItems, guestCategories, globalCateringBuffer]);

  const filteredItems = useMemo(() => {
    if (activeCategoryFilter === 'all') return calculatedItems;
    if (activeCategoryFilter === 'breads-rice') {
      return calculatedItems.filter((i) => i.category === 'bread' || i.category === 'rice');
    }
    if (activeCategoryFilter === 'drinks') {
      return calculatedItems.filter((i) => i.category === 'beverage' || i.category === 'water');
    }
    return calculatedItems.filter((i) => i.category === activeCategoryFilter);
  }, [calculatedItems, activeCategoryFilter]);

  const totalCateringCost = useMemo(() => {
    return calculatedItems.reduce((sum, item) => sum + item.calculation.estimatedCost, 0);
  }, [calculatedItems]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMenuItem({
      name: name.trim(),
      category,
      applicableGuestTypes: applicableGuests,
      portionSizePerPerson: portionSize,
      unit,
      rawVsPrepared,
      estimatedCostPerUnit,
      bufferMultiplier,
      notes: notes.trim() || undefined,
    });

    setName('');
    setNotes('');
    setShowAddModal(false);
  };

  const toggleApplicableGuest = (type: GuestCategory) => {
    setApplicableGuests((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Food, Catering & Quantity Calculator
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Deterministic portion arithmetic: Required Quantity = Guests × Portion Size × Catering Buffer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModule('ai-recommendations')}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>AI Menu Suggestions</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#3B1E48] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2D123A]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Assumptions & Cake Info Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span>Catering Headcount</span>
            <Scale className="h-4 w-4 text-[#3B1E48]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900 tabular-nums">
            {totalGuests} Guests
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            {guestCategories.adults} Adults · {guestCategories.children} Kids (60% ratio) · {guestCategories.seniors} Seniors
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
            <span>Celebration Cake Requirement</span>
            <Cake className="h-4 w-4 text-amber-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {cakeRequirement.weightKg} kg Cake
          </div>
          <div className="mt-1 text-[11px] text-amber-800">
            {cakeRequirement.explanation} ({cakeRequirement.recommendedTiers} tiers)
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span>Estimated Catering Budget</span>
            <Utensils className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
            {formatCurrencyINR(totalCateringCost)}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            {calculatedItems.length} menu dishes planned with +{Math.round((globalCateringBuffer - 1) * 100)}% buffer
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl bg-stone-100 p-1">
        {[
          { id: 'all', label: 'All Courses' },
          { id: 'starter', label: 'Starters & Snacks' },
          { id: 'main', label: 'Main Courses' },
          { id: 'breads-rice', label: 'Breads & Rice' },
          { id: 'dessert', label: 'Desserts' },
          { id: 'cake', label: 'Cake' },
          { id: 'drinks', label: 'Drinks & Water' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategoryFilter(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategoryFilter === tab.id
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Menu Calculator Table */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400">
                <th className="pb-3 font-semibold">Dish & Category</th>
                <th className="pb-3 font-semibold">Target Guests</th>
                <th className="pb-3 font-semibold">Portion / Guest</th>
                <th className="pb-3 font-semibold">Calculated Quantity</th>
                <th className="pb-3 font-semibold">User Override</th>
                <th className="pb-3 font-semibold">Est. Cost</th>
                <th className="pb-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/50">
                  <td className="py-3">
                    <div className="font-semibold text-stone-900">{item.name}</div>
                    <div className="mt-0.5 text-[10px] text-stone-500 capitalize">
                      {item.category} · <span className="font-medium text-stone-600">{item.rawVsPrepared} weight</span>
                      {item.notes && <span> · {item.notes}</span>}
                    </div>
                  </td>

                  <td className="py-3">
                    <span className="font-medium text-stone-700 tabular-nums">
                      {item.calculation.applicableGuests} pax
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      {item.applicableGuestTypes.join(', ')}
                    </span>
                  </td>

                  <td className="py-3 text-stone-600 font-mono">
                    {item.portionSizePerPerson} {item.unit}
                  </td>

                  <td className="py-3">
                    <span className="font-mono font-bold text-[#3B1E48] text-sm">
                      {item.calculation.displayQuantity}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      incl. +{Math.round(((item.bufferMultiplier || 1.1) - 1) * 100)}% buffer
                    </span>
                  </td>

                  <td className="py-3">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Override"
                      value={item.userAdjustedQuantity || ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        updateMenuItem(item.id, { userAdjustedQuantity: val });
                      }}
                      className="w-20 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-mono text-stone-900 focus:bg-white"
                    />
                  </td>

                  <td className="py-3 font-mono font-semibold text-stone-900">
                    {formatCurrencyINR(item.calculation.estimatedCost)}
                  </td>

                  <td className="py-3 text-right">
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="rounded-md p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Delete menu item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="py-10 text-center text-xs text-stone-400">
              No menu items recorded in this course category.
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900">Add Menu Item</h3>
            <p className="mt-0.5 text-xs text-stone-500">
              Specify demographic portion assumptions and units.
            </p>

            <form onSubmit={handleAddItem} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malai Kofta, Butter Naan, Gulab Jamun"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MenuCategory)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  >
                    <option value="starter">Starter / Snack</option>
                    <option value="main">Main Course</option>
                    <option value="bread">Bread / Roti</option>
                    <option value="rice">Rice / Biryani</option>
                    <option value="dessert">Dessert</option>
                    <option value="cake">Birthday Cake</option>
                    <option value="beverage">Beverage</option>
                    <option value="water">Drinking Water</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">State</label>
                  <select
                    value={rawVsPrepared}
                    onChange={(e) => setRawVsPrepared(e.target.value as any)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  >
                    <option value="prepared">Prepared / Cooked</option>
                    <option value="raw">Raw Ingredient</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Target Demographics
                </label>
                <div className="mt-1.5 flex items-center gap-3 text-xs">
                  {(['adult', 'child', 'senior'] as GuestCategory[]).map((cat) => (
                    <label key={cat} className="flex items-center gap-1.5 capitalize text-stone-700">
                      <input
                        type="checkbox"
                        checked={applicableGuests.includes(cat)}
                        onChange={() => toggleApplicableGuest(cat)}
                        className="rounded border-stone-300 text-[#3B1E48]"
                      />
                      <span>{cat}s</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700">
                    Portion / Person
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={portionSize}
                    onChange={(e) => setPortionSize(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ml">Millilitres (ml)</option>
                    <option value="L">Litres (L)</option>
                    <option value="piece">Pieces</option>
                    <option value="portion">Portions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700">
                    Unit Cost (INR ₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={estimatedCostPerUnit}
                    onChange={(e) => setEstimatedCostPerUnit(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Notes / Recipe</label>
                <input
                  type="text"
                  placeholder="e.g. Mild spice for kids, garnish with fresh coriander"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#3B1E48] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#2D123A]"
                >
                  Add Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
