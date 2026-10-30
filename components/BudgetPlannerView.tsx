'use client';

import React, { useState, useMemo } from 'react';
import { useEventContext } from '@/lib/context';
import { BudgetItem, BudgetCategory } from '@/types/event';
import { calculateBudgetSummary, formatCurrencyINR } from '@/lib/calculators';
import {
  Wallet,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Percent,
  TrendingDown,
  Layers,
} from 'lucide-react';

const BUDGET_CATEGORIES: BudgetCategory[] = [
  'Venue',
  'Food & Catering',
  'Cake & Bakery',
  'Decoration',
  'Entertainment',
  'Photography',
  'Gifts & Favors',
  'Transport',
  'Staff',
  'Miscellaneous',
];

export function BudgetPlannerView() {
  const {
    activeEvent,
    updateEvent,
    budgetItems,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    vendors,
    showToast,
  } = useEventContext();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Item State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('Food & Catering');
  const [estimatedCost, setEstimatedCost] = useState<number>(2000);
  const [actualCost, setActualCost] = useState<number>(2000);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [notes, setNotes] = useState('');

  // Budget Header Edit State
  const [isEditingBudgetLimit, setIsEditingBudgetLimit] = useState(false);
  const [editLimit, setEditLimit] = useState(activeEvent?.budget.total || 20000);
  const [editStrict, setEditStrict] = useState(activeEvent?.budget.isStrict ?? true);
  const [editContingency, setEditContingency] = useState(
    activeEvent?.budget.contingencyReserve || 1500
  );

  const budgetSummary = useMemo(() => {
    return calculateBudgetSummary(
      activeEvent?.budget.total || 20000,
      activeEvent?.budget.isStrict ?? true,
      activeEvent?.budget.contingencyReserve || 1500,
      budgetItems,
      vendors
    );
  }, [activeEvent?.budget, budgetItems, vendors]);

  const filteredItems = useMemo(() => {
    if (filterCategory === 'all') return budgetItems;
    return budgetItems.filter((b) => b.category === filterCategory);
  }, [budgetItems, filterCategory]);

  // Group by category for visual distribution
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    budgetItems.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + (item.actualCost || item.estimatedCost || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [budgetItems]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addBudgetItem({
      name: name.trim(),
      category,
      estimatedCost,
      actualCost,
      isPaid,
      notes: notes.trim() || undefined,
    });

    setName('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleSaveBudgetLimit = () => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, {
      budget: {
        total: editLimit,
        isStrict: editStrict,
        contingencyReserve: editContingency,
      },
    });
    setIsEditingBudgetLimit(false);
    showToast('Budget parameters updated.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Budget & Expense Management
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Real-time arithmetic tracking estimated costs, user quotations, actual payments, and overspending.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#3B1E48] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2D123A]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense Item</span>
        </button>
      </div>

      {/* Strict Budget Overspending Warning Banner */}
      {budgetSummary.isOverBudget && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-950 shadow-xs">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold">
              {budgetSummary.isStrict ? 'Strict Budget Ceiling Exceeded!' : 'Budget Alert:'}{' '}
            </span>
            Total committed amount ({formatCurrencyINR(
              Math.max(budgetSummary.totalActual, budgetSummary.totalEstimated) +
                budgetSummary.contingencyReserve
            )}) exceeds your {formatCurrencyINR(budgetSummary.totalBudget)} limit by{' '}
            <strong className="font-mono text-rose-900 font-bold">
              {formatCurrencyINR(budgetSummary.overageAmount)}
            </strong>
            .
            <div className="mt-1 text-[11px] text-rose-800">
              Review discretionary decorations, catering portions, or upgrade budget ceiling.
            </div>
          </div>
          <button
            onClick={() => setIsEditingBudgetLimit(true)}
            className="rounded-lg bg-rose-200/90 px-3 py-1 text-xs font-semibold text-rose-950 hover:bg-rose-300"
          >
            Adjust Ceiling
          </button>
        </div>
      )}

      {/* Edit Budget Drawer */}
      {isEditingBudgetLimit && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-4">
          <div className="text-xs font-bold text-stone-900">
            Adjust Budget Ceiling & Reserve for {activeEvent?.name}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] text-stone-600">Total Budget (INR ₹)</label>
              <input
                type="number"
                step="500"
                value={editLimit}
                onChange={(e) => setEditLimit(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block text-[11px] text-stone-600">
                Contingency Reserve (INR ₹)
              </label>
              <input
                type="number"
                step="100"
                value={editContingency}
                onChange={(e) => setEditContingency(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="strictToggle"
                checked={editStrict}
                onChange={(e) => setEditStrict(e.target.checked)}
                className="rounded border-stone-300 text-[#3B1E48]"
              />
              <label htmlFor="strictToggle" className="text-xs font-medium text-stone-700">
                Enforce Strict Budget Alert
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditingBudgetLimit(false)}
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBudgetLimit}
              className="rounded-lg bg-[#3B1E48] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2D123A]"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Budget */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Total Budget</span>
            <Wallet className="h-4 w-4 text-[#3B1E48]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
            {formatCurrencyINR(budgetSummary.totalBudget)}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            {budgetSummary.isStrict ? 'Strict Ceiling' : 'Flexible Target'} · Reserve:{' '}
            {formatCurrencyINR(budgetSummary.contingencyReserve)}
          </div>
        </div>

        {/* Committed / Spent */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Committed Expenses</span>
            <TrendingDown className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
            {formatCurrencyINR(budgetSummary.totalActual || budgetSummary.totalEstimated)}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            Actual: {formatCurrencyINR(budgetSummary.totalActual)} · Est:{' '}
            {formatCurrencyINR(budgetSummary.totalEstimated)}
          </div>
        </div>

        {/* Paid to Date */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Paid to Date</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
            {formatCurrencyINR(budgetSummary.totalPaid)}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            Pending Payment:{' '}
            {formatCurrencyINR(
              Math.max(0, budgetSummary.totalActual - budgetSummary.totalPaid)
            )}
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Remaining Balance</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                budgetSummary.isOverBudget
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {budgetSummary.isOverBudget ? 'Over Budget' : 'Safe'}
            </span>
          </div>
          <div
            className={`mt-2 text-2xl font-bold font-mono ${
              budgetSummary.isOverBudget ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {budgetSummary.isOverBudget
              ? `-${formatCurrencyINR(budgetSummary.overageAmount)}`
              : formatCurrencyINR(budgetSummary.remainingBudget)}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            {budgetSummary.burnRatePercentage}% of budget committed
          </div>
        </div>
      </div>

      {/* Category Allocation Bar & Breakdown */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
        <h2 className="text-xs font-bold text-stone-900">Expenditure Category Distribution</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {categoryBreakdown.map(([cat, amount]) => {
            const pct = Math.round((amount / (budgetSummary.totalBudget || 1)) * 100);
            return (
              <div
                key={cat}
                className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs"
              >
                <span className="font-medium text-stone-800">{cat}:</span>
                <span className="font-mono font-bold text-stone-900">
                  {formatCurrencyINR(amount)}
                </span>
                <span className="text-[10px] text-stone-500">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Items Table */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#3B1E48]" />
            <h2 className="text-xs font-bold text-stone-900">Expense Ledger</h2>
          </div>

          {/* Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-700"
            aria-label="Filter expenses by category"
          >
            <option value="all">All Categories</option>
            {BUDGET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400">
                <th className="pb-3 font-semibold">Expense Item</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Estimated</th>
                <th className="pb-3 font-semibold">Actual Cost</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Notes</th>
                <th className="pb-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/50">
                  <td className="py-3 font-medium text-stone-900">{item.name}</td>

                  {/* Clean unboxed category */}
                  <td className="py-3 text-stone-600">{item.category}</td>

                  <td className="py-3 font-mono text-stone-600">
                    {formatCurrencyINR(item.estimatedCost)}
                  </td>

                  <td className="py-3 font-mono font-bold text-stone-900">
                    <input
                      type="number"
                      value={item.actualCost}
                      onChange={(e) =>
                        updateBudgetItem(item.id, { actualCost: Number(e.target.value) })
                      }
                      className="w-24 rounded border border-stone-200 bg-stone-50 px-2 py-0.5 font-mono text-xs text-stone-900"
                    />
                  </td>

                  <td className="py-3">
                    <button
                      onClick={() => updateBudgetItem(item.id, { isPaid: !item.isPaid })}
                      className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                        item.isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {item.isPaid ? 'Paid' : 'Unpaid'}
                    </button>
                  </td>

                  <td className="py-3 text-stone-500">
                    {item.notes || <span className="text-stone-300">—</span>}
                  </td>

                  <td className="py-3 text-right">
                    <button
                      onClick={() => deleteBudgetItem(item.id)}
                      className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Remove expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="py-8 text-center text-xs text-stone-400">
              No expenses recorded in this category.
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900">Add Expense Item</h3>
            <p className="mt-0.5 text-xs text-stone-500">
              Record estimated and committed costs for your celebration.
            </p>

            <form onSubmit={handleAddItem} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balloon Arch, Sound System, Photographer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                >
                  {BUDGET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Estimated Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Actual Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={actualCost}
                    onChange={(e) => setActualCost(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="paidCheck"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="rounded border-stone-300 text-[#3B1E48]"
                />
                <label htmlFor="paidCheck" className="text-xs text-stone-700 font-medium">
                  Payment has already been made
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Notes / Vendor</label>
                <input
                  type="text"
                  placeholder="e.g. Paid 50% advance to decorator"
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
