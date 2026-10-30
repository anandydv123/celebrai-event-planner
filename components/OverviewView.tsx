'use client';

import React, { useMemo } from 'react';
import { useEventContext } from '@/lib/context';
import {
  reconcileGuestTotals,
  calculateRsvpBreakdown,
  calculateBudgetSummary,
  calculateCakeRequirement,
  formatCurrencyINR,
} from '@/lib/calculators';
import {
  Users,
  Wallet,
  Utensils,
  CheckSquare,
  AlertTriangle,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  Cake,
  TrendingUp,
} from 'lucide-react';

export function OverviewView() {
  const {
    activeEvent,
    guests,
    menuItems,
    budgetItems,
    vendors,
    checklistItems,
    scheduleItems,
    aiPlan,
    setActiveModule,
  } = useEventContext();

  // Deterministic computations - called unconditionally
  const reconciliation = useMemo(() => {
    if (!activeEvent) return { isConsistent: true, categorySum: 0, totalGuests: 0, difference: 0 };
    return reconcileGuestTotals(activeEvent.totalGuests, activeEvent.guestCategories);
  }, [activeEvent]);

  const rsvp = useMemo(() => {
    if (!activeEvent) return { invited: 0, confirmed: 0, pending: 0, declined: 0, confirmedPercentage: 0 };
    return calculateRsvpBreakdown(activeEvent.totalGuests, guests);
  }, [activeEvent, guests]);

  const budgetSummary = useMemo(() => {
    if (!activeEvent) {
      return {
        totalBudget: 0,
        isStrict: false,
        contingencyReserve: 0,
        totalEstimated: 0,
        totalActual: 0,
        totalQuoted: 0,
        totalPaid: 0,
        remainingBudget: 0,
        isOverBudget: false,
        overageAmount: 0,
        burnRatePercentage: 0,
      };
    }
    return calculateBudgetSummary(
      activeEvent.budget.total,
      activeEvent.budget.isStrict,
      activeEvent.budget.contingencyReserve,
      budgetItems,
      vendors
    );
  }, [activeEvent, budgetItems, vendors]);

  const cakeRequirement = useMemo(() => {
    if (!activeEvent) return { weightKg: 1, recommendedTiers: 1, explanation: '' };
    return calculateCakeRequirement(activeEvent.totalGuests);
  }, [activeEvent]);

  const taskStats = useMemo(() => {
    const total = checklistItems.length;
    const completed = checklistItems.filter((c) => c.isCompleted).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [checklistItems]);

  if (!activeEvent) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <Sparkles className="h-10 w-10 text-stone-300" />
        <h3 className="mt-4 text-base font-semibold text-stone-800">No Active Event Selected</h3>
        <p className="mt-1 text-sm text-stone-500">
          Create an event or choose one from My Events to begin planning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Warnings if inconsistent or overbudget */}
      {!reconciliation.isConsistent && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-xs">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-semibold">Guest Category Inconsistency Detected: </span>
            {reconciliation.warningMessage}
          </div>
          <button
            onClick={() => setActiveModule('guests')}
            className="rounded-lg bg-amber-200/80 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-300/80"
          >
            Fix Guests
          </button>
        </div>
      )}

      {budgetSummary.isOverBudget && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-xs">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-semibold">
              {activeEvent.budget.isStrict
                ? 'Strict Budget Ceiling Exceeded!'
                : 'Projected Budget Overage:'}{' '}
            </span>
            Total committed expenses exceed your budget by{' '}
            <span className="font-mono font-bold">
              {formatCurrencyINR(budgetSummary.overageAmount)}
            </span>
            . Consider revising optional decorations or catering portions.
          </div>
          <button
            onClick={() => setActiveModule('budget')}
            className="rounded-lg bg-rose-200/80 px-2.5 py-1 text-xs font-semibold text-rose-900 hover:bg-rose-300/80"
          >
            Review Budget
          </button>
        </div>
      )}

      {/* Hero Event Identity Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="font-medium text-[#3B1E48]">{activeEvent.type}</span>
              <span aria-hidden="true">·</span>
              <span>{activeEvent.venueType.toUpperCase()} VENUE</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{activeEvent.foodPreference} FOOD</span>
              {activeEvent.budget.isStrict && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-rose-600">Strict Budget Ceiling</span>
                </>
              )}
            </div>

            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {activeEvent.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-stone-400" />
                <span>
                  {new Date(activeEvent.date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-stone-400" />
                <span className="font-mono">{activeEvent.startTime} – {activeEvent.endTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-stone-400" />
                <span>{activeEvent.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeEvent.type === 'Birthday Party' && (
              <button
                onClick={() => setActiveModule('birthday-planner')}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                <Cake className="h-4 w-4 text-amber-600" />
                <span>Birthday Flow</span>
              </button>
            )}

            <button
              onClick={() => setActiveModule('ai-recommendations')}
              className="flex items-center gap-1.5 rounded-lg bg-[#3B1E48] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2D123A]"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>AI Plan Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Four KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Guests & RSVP */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Guests & RSVP</span>
            <Users className="h-4 w-4 text-[#3B1E48]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {activeEvent.totalGuests}
            </span>
            <span className="text-xs text-stone-500">Invited Total</span>
          </div>

          {/* Demographic Breakdown */}
          <div className="mt-3 flex items-center justify-between text-xs text-stone-600">
            <span>Adults: <strong className="tabular-nums">{activeEvent.guestCategories.adults}</strong></span>
            <span>Kids: <strong className="tabular-nums">{activeEvent.guestCategories.children}</strong></span>
            <span>Seniors: <strong className="tabular-nums">{activeEvent.guestCategories.seniors}</strong></span>
          </div>

          {/* RSVP Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-stone-500">
              <span>{rsvp.confirmed} Confirmed ({rsvp.confirmedPercentage}%)</span>
              <span>{rsvp.pending} Pending</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${Math.min(100, rsvp.confirmedPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Budget Health */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Budget Health</span>
            <Wallet className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {formatCurrencyINR(activeEvent.budget.total)}
            </span>
            <span className="text-xs text-stone-500">Limit</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-stone-600">Spent/Committed:</span>
            <span className="font-mono font-medium text-stone-900">
              {formatCurrencyINR(Math.max(budgetSummary.totalActual, budgetSummary.totalEstimated))}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-stone-600">Remaining Balance:</span>
            <span
              className={`font-mono font-semibold ${
                budgetSummary.isOverBudget ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {budgetSummary.isOverBudget
                ? `-${formatCurrencyINR(budgetSummary.overageAmount)}`
                : formatCurrencyINR(budgetSummary.remainingBudget)}
            </span>
          </div>

          <div className="mt-2 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
            <div
              className={`h-full transition-all ${
                budgetSummary.isOverBudget ? 'bg-rose-500' : 'bg-[#3B1E48]'
              }`}
              style={{ width: `${budgetSummary.burnRatePercentage}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Catering & Food Quantities */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Food & Catering</span>
            <Utensils className="h-4 w-4 text-stone-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {menuItems.length}
            </span>
            <span className="text-xs text-stone-500">Planned Courses</span>
          </div>

          <div className="mt-3 text-xs text-stone-600 space-y-1">
            <div className="flex justify-between">
              <span>Cake Size:</span>
              <strong className="font-mono text-stone-900">{cakeRequirement.weightKg} kg</strong>
            </div>
            <div className="flex justify-between">
              <span>Dietary:</span>
              <span className="capitalize">{activeEvent.foodPreference}</span>
            </div>
            <div className="flex justify-between">
              <span>Buffer Factor:</span>
              <span className="font-mono">10% Included</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Checklist & Execution */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Tasks & Run Sheet</span>
            <CheckSquare className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {taskStats.completed}/{taskStats.total}
            </span>
            <span className="text-xs text-stone-500">Tasks Done</span>
          </div>

          <div className="mt-3 text-xs text-stone-600 space-y-1">
            <div className="flex justify-between">
              <span>Day-of Activities:</span>
              <strong className="font-mono text-stone-900">{scheduleItems.length} scheduled</strong>
            </div>
            <div className="flex justify-between">
              <span>Vendors Booked:</span>
              <strong className="font-mono text-stone-900">
                {vendors.filter((v) => v.status === 'booked').length}/{vendors.length}
              </strong>
            </div>
          </div>

          <div className="mt-2 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{ width: `${taskStats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Launchpad Navigation */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <h2 className="text-sm font-semibold tracking-tight text-stone-900">
          Planning Workflow Launchpad
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <button
            onClick={() => setActiveModule('guests')}
            className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-center transition-colors hover:border-[#3B1E48] hover:bg-white"
          >
            <Users className="h-5 w-5 text-[#3B1E48]" />
            <span className="mt-2 text-xs font-semibold text-stone-900">Manage Guests</span>
            <span className="text-[10px] text-stone-500">RSVP & Demographics</span>
          </button>

          <button
            onClick={() => setActiveModule('catering')}
            className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-center transition-colors hover:border-[#3B1E48] hover:bg-white"
          >
            <Utensils className="h-5 w-5 text-amber-600" />
            <span className="mt-2 text-xs font-semibold text-stone-900">Food & Catering</span>
            <span className="text-[10px] text-stone-500">Portion Calculators</span>
          </button>

          <button
            onClick={() => setActiveModule('budget')}
            className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-center transition-colors hover:border-[#3B1E48] hover:bg-white"
          >
            <Wallet className="h-5 w-5 text-emerald-600" />
            <span className="mt-2 text-xs font-semibold text-stone-900">Budget Planner</span>
            <span className="text-[10px] text-stone-500">Expense Reconciliation</span>
          </button>

          <button
            onClick={() => setActiveModule('shopping')}
            className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-center transition-colors hover:border-[#3B1E48] hover:bg-white"
          >
            <CheckSquare className="h-5 w-5 text-purple-600" />
            <span className="mt-2 text-xs font-semibold text-stone-900">Shopping List</span>
            <span className="text-[10px] text-stone-500">Unit Aggregation</span>
          </button>

          <button
            onClick={() => setActiveModule('timeline')}
            className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-center transition-colors hover:border-[#3B1E48] hover:bg-white"
          >
            <Clock className="h-5 w-5 text-stone-700" />
            <span className="mt-2 text-xs font-semibold text-stone-900">Timeline & Tasks</span>
            <span className="text-[10px] text-stone-500">Day-of Run Sheet</span>
          </button>

          <button
            onClick={() => setActiveModule('invitations')}
            className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-center transition-colors hover:border-[#3B1E48] hover:bg-white"
          >
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="mt-2 text-xs font-semibold text-stone-900">Invitations</span>
            <span className="text-[10px] text-stone-500">Copy & WhatsApp</span>
          </button>
        </div>
      </div>

      {/* AI Recommendations Highlight Card */}
      {aiPlan && (
        <div className="rounded-2xl border border-stone-200 bg-gradient-to-r from-stone-50 to-amber-50/40 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <h2 className="text-sm font-bold text-stone-900">
                Current AI Plan Recommendations
              </h2>
              <span className="rounded bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                {aiPlan.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Deterministic Engine'}
              </span>
            </div>
            <button
              onClick={() => setActiveModule('ai-recommendations')}
              className="flex items-center gap-1 text-xs font-semibold text-[#3B1E48] hover:underline"
            >
              <span>View Full Plan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {aiPlan.themes.slice(0, 3).map((thm, i) => (
              <div key={i} className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="text-xs font-bold text-[#3B1E48]">{thm.title}</div>
                <p className="mt-1 line-clamp-2 text-xs text-stone-600">{thm.description}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  {thm.colorPalette.map((col, idx) => (
                    <span
                      key={idx}
                      className="h-3.5 w-3.5 rounded-full border border-stone-300"
                      style={{ backgroundColor: col }}
                      title={col}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
