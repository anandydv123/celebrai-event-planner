import {
  Guest,
  GuestCategories,
  MenuItem,
  BudgetItem,
  Vendor,
  ShoppingItem,
  ScheduleItem,
} from '@/types/event';

/**
 * Formats a numeric value into the Indian numbering format (e.g. ₹20,000, ₹1,50,000).
 */
export function formatCurrencyINR(amount: number): string {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rounded);
}

/**
 * Reconciles the category counts against the total invited guest count.
 */
export interface GuestReconciliationResult {
  isConsistent: boolean;
  categorySum: number;
  totalGuests: number;
  difference: number;
  warningMessage?: string;
}

export function reconcileGuestTotals(
  totalGuests: number,
  categories: GuestCategories
): GuestReconciliationResult {
  const categorySum =
    (categories.adults || 0) +
    (categories.children || 0) +
    (categories.seniors || 0);

  const difference = categorySum - totalGuests;
  const isConsistent = difference === 0;

  let warningMessage: string | undefined;
  if (!isConsistent) {
    if (difference > 0) {
      warningMessage = `Category sum (${categorySum}) exceeds total guest count (${totalGuests}) by ${difference}. Please adjust categories or total count.`;
    } else {
      warningMessage = `Category sum (${categorySum}) is ${Math.abs(
        difference
      )} less than the total guest count (${totalGuests}). Unallocated guests remain.`;
    }
  }

  return {
    isConsistent,
    categorySum,
    totalGuests,
    difference,
    warningMessage,
  };
}

/**
 * Calculates RSVP status breakdown. Never treats pending as confirmed.
 */
export interface RsvpBreakdown {
  invited: number;
  confirmed: number;
  pending: number;
  declined: number;
  confirmedPercentage: number;
}

export function calculateRsvpBreakdown(
  totalInvited: number,
  guests: Guest[]
): RsvpBreakdown {
  const confirmed = guests.filter((g) => g.rsvpStatus === 'confirmed').length;
  const pending = guests.filter((g) => g.rsvpStatus === 'pending').length;
  const declined = guests.filter((g) => g.rsvpStatus === 'declined').length;

  // If there are more totalInvited than recorded guests, the remaining are considered pending
  const recordedCount = confirmed + pending + declined;
  const effectivePending =
    totalInvited > recordedCount ? pending + (totalInvited - recordedCount) : pending;
  const effectiveInvited = Math.max(totalInvited, recordedCount);

  const confirmedPercentage =
    effectiveInvited > 0 ? Math.round((confirmed / effectiveInvited) * 100) : 0;

  return {
    invited: effectiveInvited,
    confirmed,
    pending: effectivePending,
    declined,
    confirmedPercentage,
  };
}

/**
 * Calculates deterministic catering quantities.
 * Formula: Required Quantity = Applicable Guests x Portion Size x Buffer Multiplier.
 */
export interface CateringQuantityResult {
  applicableGuests: number;
  calculatedQuantity: number;
  displayQuantity: string;
  unit: string;
  estimatedCost: number;
}

export function calculateCateringQuantity(
  item: MenuItem,
  categories: GuestCategories,
  globalCateringBufferMultiplier = 1.0
): CateringQuantityResult {
  // Count applicable guests
  let applicableGuests = 0;
  if (item.applicableGuestTypes.includes('adult')) {
    applicableGuests += categories.adults || 0;
  }
  if (item.applicableGuestTypes.includes('child')) {
    // Children typically consume ~60% of an adult portion
    applicableGuests += Math.round((categories.children || 0) * 0.6);
  }
  if (item.applicableGuestTypes.includes('senior')) {
    applicableGuests += categories.seniors || 0;
  }

  // Fallback if no specific guest types are selected
  if (applicableGuests === 0) {
    applicableGuests =
      (categories.adults || 0) +
      (categories.children || 0) +
      (categories.seniors || 0);
  }

  const effectiveBuffer = (item.bufferMultiplier || 1.1) * (globalCateringBufferMultiplier || 1.0);
  let rawAmount = applicableGuests * item.portionSizePerPerson * effectiveBuffer;

  // If user provided a manual override
  if (item.userAdjustedQuantity !== undefined && item.userAdjustedQuantity > 0) {
    rawAmount = item.userAdjustedQuantity;
  }

  let displayUnit = item.unit;
  let formattedNumber = rawAmount;

  // Unit conversions: convert grams to kg if >= 1000g, ml to L if >= 1000ml
  if (item.unit === 'g' && rawAmount >= 1000) {
    formattedNumber = rawAmount / 1000;
    displayUnit = 'kg';
  } else if (item.unit === 'ml' && rawAmount >= 1000) {
    formattedNumber = rawAmount / 1000;
    displayUnit = 'L';
  }

  const rounded = Math.round(formattedNumber * 10) / 10;
  const displayQuantity = `${rounded} ${displayUnit}`;
  const estimatedCost = Math.round(rawAmount * item.estimatedCostPerUnit);

  return {
    applicableGuests,
    calculatedQuantity: rounded,
    displayQuantity,
    unit: displayUnit,
    estimatedCost,
  };
}

/**
 * Calculates recommended cake weight in kilograms.
 * Benchmark standard: ~60g - 70g per guest for standard birthday / celebration cuts.
 */
export function calculateCakeRequirement(totalGuests: number): {
  weightKg: number;
  recommendedTiers: number;
  explanation: string;
} {
  const count = Math.max(1, totalGuests);
  // 60 grams per guest + 10% safety buffer
  const exactKg = count * 0.060 * 1.10;
  // Round to nearest 0.5 kg, minimum 1.0 kg
  const weightKg = Math.max(1.0, Math.ceil(exactKg * 2) / 2);

  let tiers = 1;
  if (weightKg >= 7.0) tiers = 3;
  else if (weightKg >= 3.0) tiers = 2;

  return {
    weightKg,
    recommendedTiers: tiers,
    explanation: `Calculated for ${count} guests at ~60g/slice plus 10% buffer.`,
  };
}

/**
 * Calculates the comprehensive budget health summary.
 */
export interface BudgetSummaryResult {
  totalBudget: number;
  isStrict: boolean;
  contingencyReserve: number;
  totalEstimated: number;
  totalActual: number;
  totalQuoted: number;
  totalPaid: number;
  remainingBudget: number;
  isOverBudget: boolean;
  overageAmount: number;
  burnRatePercentage: number;
}

export function calculateBudgetSummary(
  totalBudget: number,
  isStrict: boolean,
  contingencyReserve: number,
  budgetItems: BudgetItem[],
  vendors: Vendor[]
): BudgetSummaryResult {
  const totalEstimated = budgetItems.reduce(
    (sum, item) => sum + (item.estimatedCost || 0),
    0
  );

  const totalActual = budgetItems.reduce(
    (sum, item) => sum + (item.actualCost || 0),
    0
  );

  const totalPaid = budgetItems
    .filter((item) => item.isPaid)
    .reduce((sum, item) => sum + (item.actualCost || item.estimatedCost || 0), 0);

  const totalQuoted = vendors
    .filter((v) => v.status === 'booked' || v.status === 'quoted')
    .reduce((sum, v) => sum + (v.quotedAmount || 0), 0);

  // Remaining budget accounts for actual costs + contingency reserve
  const committedAmount = Math.max(totalActual, totalEstimated) + (contingencyReserve || 0);
  const remainingBudget = totalBudget - committedAmount;
  const isOverBudget = remainingBudget < 0;
  const overageAmount = isOverBudget ? Math.abs(remainingBudget) : 0;

  const burnRatePercentage =
    totalBudget > 0 ? Math.min(100, Math.round((committedAmount / totalBudget) * 100)) : 0;

  return {
    totalBudget,
    isStrict,
    contingencyReserve,
    totalEstimated,
    totalActual,
    totalQuoted,
    totalPaid,
    remainingBudget,
    isOverBudget,
    overageAmount,
    burnRatePercentage,
  };
}

/**
 * Aggregates a shopping list by combining items with compatible units and identities.
 */
export function aggregateShoppingList(items: ShoppingItem[]): ShoppingItem[] {
  const grouped: Record<string, ShoppingItem> = {};

  for (const item of items) {
    // Normalise name & unit key
    const key = `${item.name.trim().toLowerCase()}__${item.unit.trim().toLowerCase()}`;

    if (!grouped[key]) {
      grouped[key] = { ...item };
    } else {
      grouped[key].quantity += item.quantity;
      grouped[key].estimatedCost += item.estimatedCost;
      if (item.notes && !grouped[key].notes?.includes(item.notes)) {
        grouped[key].notes = `${grouped[key].notes || ''}; ${item.notes}`.trim();
      }
    }
  }

  return Object.values(grouped);
}

/**
 * Detects schedule conflicts between consecutive timeline entries.
 */
export interface ScheduleConflict {
  itemA: ScheduleItem;
  itemB: ScheduleItem;
  message: string;
}

export function detectScheduleOverlaps(items: ScheduleItem[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const sorted = [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (current.endTime > next.startTime) {
      conflicts.push({
        itemA: current,
        itemB: next,
        message: `Activity "${current.activity}" (${current.startTime} - ${current.endTime}) overlaps with "${next.activity}" (${next.startTime} - ${next.endTime}).`,
      });
    }
  }

  return conflicts;
}
