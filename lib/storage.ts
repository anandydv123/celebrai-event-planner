import {
  EventItem,
  Guest,
  MenuItem,
  BudgetItem,
  Vendor,
  ShoppingItem,
  ChecklistItem,
  ScheduleItem,
  AIPlan,
} from '@/types/event';
import {
  INITIAL_EVENTS,
  INITIAL_GUESTS,
  INITIAL_MENU_ITEMS,
  INITIAL_BUDGET_ITEMS,
  INITIAL_VENDORS,
  INITIAL_SHOPPING_ITEMS,
  INITIAL_CHECKLIST_ITEMS,
  INITIAL_SCHEDULE_ITEMS,
  INITIAL_AI_PLANS,
  PATNA_BIRTHDAY_EVENT_ID,
} from './sample-data';

const STORAGE_KEYS = {
  EVENTS: 'celebr_ai_events_v1',
  GUESTS: 'celebr_ai_guests_v1',
  MENU: 'celebr_ai_menu_v1',
  BUDGET: 'celebr_ai_budget_v1',
  VENDORS: 'celebr_ai_vendors_v1',
  SHOPPING: 'celebr_ai_shopping_v1',
  CHECKLIST: 'celebr_ai_checklist_v1',
  SCHEDULE: 'celebr_ai_schedule_v1',
  AI_PLANS: 'celebr_ai_ai_plans_v1',
  ACTIVE_EVENT_ID: 'celebr_ai_active_event_id_v1',
};

function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed reading localStorage key "${key}":`, err);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed writing localStorage key "${key}":`, err);
  }
}

export function initializeStorageIfNeeded(): void {
  if (typeof window === 'undefined') return;

  const existingEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (!existingEvents) {
    safeSetItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    safeSetItem(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
    safeSetItem(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
    safeSetItem(STORAGE_KEYS.BUDGET, INITIAL_BUDGET_ITEMS);
    safeSetItem(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
    safeSetItem(STORAGE_KEYS.SHOPPING, INITIAL_SHOPPING_ITEMS);
    safeSetItem(STORAGE_KEYS.CHECKLIST, INITIAL_CHECKLIST_ITEMS);
    safeSetItem(STORAGE_KEYS.SCHEDULE, INITIAL_SCHEDULE_ITEMS);
    safeSetItem(STORAGE_KEYS.AI_PLANS, INITIAL_AI_PLANS);
    safeSetItem(STORAGE_KEYS.ACTIVE_EVENT_ID, PATNA_BIRTHDAY_EVENT_ID);
  }
}

export function getActiveEventId(): string {
  initializeStorageIfNeeded();
  return safeGetItem<string>(STORAGE_KEYS.ACTIVE_EVENT_ID, PATNA_BIRTHDAY_EVENT_ID);
}

export function setActiveEventId(id: string): void {
  safeSetItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
}

export function loadAllEvents(): EventItem[] {
  initializeStorageIfNeeded();
  return safeGetItem<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
}

export function saveAllEvents(events: EventItem[]): void {
  safeSetItem(STORAGE_KEYS.EVENTS, events);
}

export function loadGuestsByEvent(eventId: string): Guest[] {
  initializeStorageIfNeeded();
  const all = safeGetItem<Guest[]>(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
  return all.filter((g) => g.eventId === eventId);
}

export function saveGuestsForEvent(eventId: string, eventGuests: Guest[]): void {
  const all = safeGetItem<Guest[]>(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
  const others = all.filter((g) => g.eventId !== eventId);
  safeSetItem(STORAGE_KEYS.GUESTS, [...others, ...eventGuests]);
}

export function loadMenuByEvent(eventId: string): MenuItem[] {
  initializeStorageIfNeeded();
  const all = safeGetItem<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
  return all.filter((m) => m.eventId === eventId);
}

export function saveMenuForEvent(eventId: string, items: MenuItem[]): void {
  const all = safeGetItem<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
  const others = all.filter((m) => m.eventId !== eventId);
  safeSetItem(STORAGE_KEYS.MENU, [...others, ...items]);
}

export function loadBudgetByEvent(eventId: string): BudgetItem[] {
  initializeStorageIfNeeded();
  const all = safeGetItem<BudgetItem[]>(STORAGE_KEYS.BUDGET, INITIAL_BUDGET_ITEMS);
  return all.filter((b) => b.eventId === eventId);
}

export function saveBudgetForEvent(eventId: string, items: BudgetItem[]): void {
  const all = safeGetItem<BudgetItem[]>(STORAGE_KEYS.BUDGET, INITIAL_BUDGET_ITEMS);
  const others = all.filter((b) => b.eventId !== eventId);
  safeSetItem(STORAGE_KEYS.BUDGET, [...others, ...items]);
}

export function loadVendorsByEvent(eventId: string): Vendor[] {
  initializeStorageIfNeeded();
  const all = safeGetItem<Vendor[]>(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
  return all.filter((v) => v.eventId === eventId);
}

export function saveVendorsForEvent(eventId: string, vendors: Vendor[]): void {
  const all = safeGetItem<Vendor[]>(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
  const others = all.filter((v) => v.eventId !== eventId);
  safeSetItem(STORAGE_KEYS.VENDORS, [...others, ...vendors]);
}

export function loadShoppingByEvent(eventId: string): ShoppingItem[] {
  initializeStorageIfNeeded();
  const all = safeGetItem<ShoppingItem[]>(STORAGE_KEYS.SHOPPING, INITIAL_SHOPPING_ITEMS);
  return all.filter((s) => s.eventId === eventId);
}

export function saveShoppingForEvent(eventId: string, items: ShoppingItem[]): void {
  const all = safeGetItem<ShoppingItem[]>(STORAGE_KEYS.SHOPPING, INITIAL_SHOPPING_ITEMS);
  const others = all.filter((s) => s.eventId !== eventId);
  safeSetItem(STORAGE_KEYS.SHOPPING, [...others, ...items]);
}

export function loadChecklistByEvent(eventId: string): ChecklistItem[] {
  initializeStorageIfNeeded();
  const all = safeGetItem<ChecklistItem[]>(STORAGE_KEYS.CHECKLIST, INITIAL_CHECKLIST_ITEMS);
  return all.filter((c) => c.eventId === eventId);
}

export function saveChecklistForEvent(eventId: string, items: ChecklistItem[]): void {
  const all = safeGetItem<ChecklistItem[]>(STORAGE_KEYS.CHECKLIST, INITIAL_CHECKLIST_ITEMS);
  const others = all.filter((c) => c.eventId !== eventId);
  safeSetItem(STORAGE_KEYS.CHECKLIST, [...others, ...items]);
}

export function loadScheduleByEvent(eventId: string): ScheduleItem[] {
  initializeStorageIfNeeded();
  const all = safeGetItem<ScheduleItem[]>(STORAGE_KEYS.SCHEDULE, INITIAL_SCHEDULE_ITEMS);
  return all.filter((s) => s.eventId === eventId);
}

export function saveScheduleForEvent(eventId: string, items: ScheduleItem[]): void {
  const all = safeGetItem<ScheduleItem[]>(STORAGE_KEYS.SCHEDULE, INITIAL_SCHEDULE_ITEMS);
  const others = all.filter((s) => s.eventId !== eventId);
  safeSetItem(STORAGE_KEYS.SCHEDULE, [...others, ...items]);
}

export function loadAIPlanByEvent(eventId: string): AIPlan | null {
  initializeStorageIfNeeded();
  const all = safeGetItem<Record<string, AIPlan>>(STORAGE_KEYS.AI_PLANS, INITIAL_AI_PLANS);
  return all[eventId] || null;
}

export function saveAIPlanForEvent(eventId: string, plan: AIPlan): void {
  const all = safeGetItem<Record<string, AIPlan>>(STORAGE_KEYS.AI_PLANS, INITIAL_AI_PLANS);
  all[eventId] = plan;
  safeSetItem(STORAGE_KEYS.AI_PLANS, all);
}

export interface DatabaseDump {
  version: string;
  exportedAt: string;
  events: EventItem[];
  guests: Guest[];
  menu: MenuItem[];
  budget: BudgetItem[];
  vendors: Vendor[];
  shopping: ShoppingItem[];
  checklist: ChecklistItem[];
  schedule: ScheduleItem[];
  aiPlans: Record<string, AIPlan>;
}

export function exportFullDatabaseJSON(): string {
  initializeStorageIfNeeded();
  const dump: DatabaseDump = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    events: safeGetItem<EventItem[]>(STORAGE_KEYS.EVENTS, []),
    guests: safeGetItem<Guest[]>(STORAGE_KEYS.GUESTS, []),
    menu: safeGetItem<MenuItem[]>(STORAGE_KEYS.MENU, []),
    budget: safeGetItem<BudgetItem[]>(STORAGE_KEYS.BUDGET, []),
    vendors: safeGetItem<Vendor[]>(STORAGE_KEYS.VENDORS, []),
    shopping: safeGetItem<ShoppingItem[]>(STORAGE_KEYS.SHOPPING, []),
    checklist: safeGetItem<ChecklistItem[]>(STORAGE_KEYS.CHECKLIST, []),
    schedule: safeGetItem<ScheduleItem[]>(STORAGE_KEYS.SCHEDULE, []),
    aiPlans: safeGetItem<Record<string, AIPlan>>(STORAGE_KEYS.AI_PLANS, {}),
  };
  return JSON.stringify(dump, null, 2);
}

export function importFullDatabaseJSON(jsonStr: string): boolean {
  try {
    const dump = JSON.parse(jsonStr) as DatabaseDump;
    if (!dump.events || !Array.isArray(dump.events)) {
      throw new Error('Invalid database format: Missing events list');
    }
    safeSetItem(STORAGE_KEYS.EVENTS, dump.events);
    safeSetItem(STORAGE_KEYS.GUESTS, dump.guests || []);
    safeSetItem(STORAGE_KEYS.MENU, dump.menu || []);
    safeSetItem(STORAGE_KEYS.BUDGET, dump.budget || []);
    safeSetItem(STORAGE_KEYS.VENDORS, dump.vendors || []);
    safeSetItem(STORAGE_KEYS.SHOPPING, dump.shopping || []);
    safeSetItem(STORAGE_KEYS.CHECKLIST, dump.checklist || []);
    safeSetItem(STORAGE_KEYS.SCHEDULE, dump.schedule || []);
    safeSetItem(STORAGE_KEYS.AI_PLANS, dump.aiPlans || {});
    if (dump.events.length > 0) {
      safeSetItem(STORAGE_KEYS.ACTIVE_EVENT_ID, dump.events[0].id);
    }
    return true;
  } catch (err) {
    console.error('Import database failed:', err);
    return false;
  }
}

export function resetToBenchmarkSamples(): void {
  if (typeof window === 'undefined') return;
  safeSetItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  safeSetItem(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
  safeSetItem(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
  safeSetItem(STORAGE_KEYS.BUDGET, INITIAL_BUDGET_ITEMS);
  safeSetItem(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
  safeSetItem(STORAGE_KEYS.SHOPPING, INITIAL_SHOPPING_ITEMS);
  safeSetItem(STORAGE_KEYS.CHECKLIST, INITIAL_CHECKLIST_ITEMS);
  safeSetItem(STORAGE_KEYS.SCHEDULE, INITIAL_SCHEDULE_ITEMS);
  safeSetItem(STORAGE_KEYS.AI_PLANS, INITIAL_AI_PLANS);
  safeSetItem(STORAGE_KEYS.ACTIVE_EVENT_ID, PATNA_BIRTHDAY_EVENT_ID);
}
