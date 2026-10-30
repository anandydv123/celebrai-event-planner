'use client';

import React, { useState, useMemo } from 'react';
import { useEventContext } from '@/lib/context';
import { ShoppingItem } from '@/types/event';
import { aggregateShoppingList, formatCurrencyINR } from '@/lib/calculators';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle,
  Search,
  Filter,
  Layers,
} from 'lucide-react';

export function ShoppingListView() {
  const {
    shoppingItems,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
  } = useEventContext();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isConsolidatedView, setIsConsolidatedView] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Item State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Decoration');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('piece');
  const [estimatedCost, setEstimatedCost] = useState<number>(250);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');

  const displayItems = useMemo(() => {
    let items = isConsolidatedView
      ? aggregateShoppingList(shoppingItems)
      : shoppingItems;

    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));
      const matchCat = filterCategory === 'all' || item.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [shoppingItems, isConsolidatedView, search, filterCategory]);

  const stats = useMemo(() => {
    const totalCount = shoppingItems.length;
    const purchasedCount = shoppingItems.filter((s) => s.isPurchased).length;
    const totalEst = shoppingItems.reduce((sum, s) => sum + s.estimatedCost, 0);
    const purchasedEst = shoppingItems
      .filter((s) => s.isPurchased)
      .reduce((sum, s) => sum + s.estimatedCost, 0);

    return { totalCount, purchasedCount, totalEst, purchasedEst };
  }, [shoppingItems]);

  const categories = useMemo(() => {
    const set = new Set(shoppingItems.map((s) => s.category));
    return Array.from(set);
  }, [shoppingItems]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addShoppingItem({
      name: name.trim(),
      category,
      quantity,
      unit,
      estimatedCost,
      isPurchased: false,
      priority,
      notes: notes.trim() || undefined,
    });

    setName('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Shopping List & Supplies
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Unit-aware supply list with compatible aggregation, priority tracking, and purchase checklists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConsolidatedView(!isConsolidatedView)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isConsolidatedView
                ? 'border-[#3B1E48] bg-[#3B1E48] text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>{isConsolidatedView ? 'Consolidated View (Active)' : 'Consolidate Units'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#3B1E48] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2D123A]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Purchase Progress</div>
          <div className="mt-2 text-2xl font-bold text-stone-900 tabular-nums">
            {stats.purchasedCount} / {stats.totalCount} items
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{
                width: `${
                  stats.totalCount > 0 ? (stats.purchasedCount / stats.totalCount) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Total Estimated Cost</div>
          <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
            {formatCurrencyINR(stats.totalEst)}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            Across {shoppingItems.length} listed retail items & supplies
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800">Purchased Value</div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrencyINR(stats.purchasedEst)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700">
            {formatCurrencyINR(stats.totalEst - stats.purchasedEst)} remaining to buy
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search shopping items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pl-9 pr-3 text-xs text-stone-900 focus:bg-white focus:outline-hidden"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-700"
          aria-label="Filter shopping items by category"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Items Table */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400">
                <th className="pb-3 w-8 font-semibold">Done</th>
                <th className="pb-3 font-semibold">Item & Category</th>
                <th className="pb-3 font-semibold">Quantity</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Est. Cost</th>
                <th className="pb-3 font-semibold">Notes</th>
                <th className="pb-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {displayItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-stone-50/50 ${
                    item.isPurchased ? 'bg-stone-50/30 opacity-70' : ''
                  }`}
                >
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={item.isPurchased}
                      onChange={() =>
                        updateShoppingItem(item.id, { isPurchased: !item.isPurchased })
                      }
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>

                  <td className="py-3">
                    <div
                      className={`font-semibold ${
                        item.isPurchased ? 'line-through text-stone-500' : 'text-stone-900'
                      }`}
                    >
                      {item.name}
                    </div>
                    <div className="text-[10px] text-stone-500">{item.category}</div>
                  </td>

                  <td className="py-3 font-mono font-medium text-stone-700">
                    {item.quantity} {item.unit}
                  </td>

                  <td className="py-3">
                    <span
                      className={`text-[11px] font-semibold uppercase ${
                        item.priority === 'high'
                          ? 'text-rose-600'
                          : item.priority === 'medium'
                          ? 'text-amber-600'
                          : 'text-stone-500'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  <td className="py-3 font-mono font-semibold text-stone-900">
                    {formatCurrencyINR(item.estimatedCost)}
                  </td>

                  <td className="py-3 text-stone-500">
                    {item.notes || <span className="text-stone-300">—</span>}
                  </td>

                  <td className="py-3 text-right">
                    <button
                      onClick={() => deleteShoppingItem(item.id)}
                      className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {displayItems.length === 0 && (
            <div className="py-10 text-center text-xs text-stone-400">
              No shopping items recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900">Add Supplies / Shopping Item</h3>
            <p className="mt-0.5 text-xs text-stone-500">
              Specify quantity, compatible unit, and estimated price.
            </p>

            <form onSubmit={handleAddItem} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Helium Balloon Tank, Number Candles, Paper Napkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Decoration, Catering, Favors"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700">Unit</label>
                  <input
                    type="text"
                    placeholder="piece, pack, kg"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700">
                    Est. Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Buy from local market or order online"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#3B1E48] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#2D123A]"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
