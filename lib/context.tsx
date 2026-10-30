'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  getActiveEventId,
  setActiveEventId as persistActiveEventId,
  loadAllEvents,
  saveAllEvents,
  loadGuestsByEvent,
  saveGuestsForEvent,
  loadMenuByEvent,
  saveMenuForEvent,
  loadBudgetByEvent,
  saveBudgetForEvent,
  loadVendorsByEvent,
  saveVendorsForEvent,
  loadShoppingByEvent,
  saveShoppingForEvent,
  loadChecklistByEvent,
  saveChecklistForEvent,
  loadScheduleByEvent,
  saveScheduleForEvent,
  loadAIPlanByEvent,
  saveAIPlanForEvent,
  resetToBenchmarkSamples,
} from './storage';
import { PATNA_BIRTHDAY_EVENT_ID } from './sample-data';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface EventContextType {
  events: EventItem[];
  activeEventId: string;
  activeEvent: EventItem | undefined;
  activeModule: string;
  setActiveModule: (m: string) => void;
  setActiveEventId: (id: string) => void;
  createEvent: (data: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEvent: (id: string, updates: Partial<EventItem>) => void;
  duplicateEvent: (id: string) => string;
  deleteEvent: (id: string) => void;

  // Sub entities
  guests: Guest[];
  addGuest: (guest: Omit<Guest, 'id' | 'eventId'>) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;

  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'eventId'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  budgetItems: BudgetItem[];
  addBudgetItem: (item: Omit<BudgetItem, 'id' | 'eventId'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id' | 'eventId'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  shoppingItems: ShoppingItem[];
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'eventId'>) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;

  checklistItems: ChecklistItem[];
  addChecklistItem: (item: Omit<ChecklistItem, 'id' | 'eventId'>) => void;
  toggleChecklistItem: (id: string) => void;
  deleteChecklistItem: (id: string) => void;

  scheduleItems: ScheduleItem[];
  addScheduleItem: (item: Omit<ScheduleItem, 'id' | 'eventId'>) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  aiPlan: AIPlan | null;
  setAiPlan: (plan: AIPlan) => void;

  globalCateringBuffer: number;
  setGlobalCateringBuffer: (multiplier: number) => void;

  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  resetToDefaultSamples: () => void;
  refreshFromStorage: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>(() => loadAllEvents());
  const [activeEventId, setActiveEventIdState] = useState<string>(() => {
    const loadedEvents = loadAllEvents();
    const savedActiveId = getActiveEventId();
    return loadedEvents.some((e) => e.id === savedActiveId)
      ? savedActiveId
      : loadedEvents[0]?.id || PATNA_BIRTHDAY_EVENT_ID;
  });
  const [activeModule, setActiveModule] = useState<string>('overview');

  const [guests, setGuests] = useState<Guest[]>(() => {
    const savedActiveId = getActiveEventId();
    return loadGuestsByEvent(savedActiveId);
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const savedActiveId = getActiveEventId();
    return loadMenuByEvent(savedActiveId);
  });
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    const savedActiveId = getActiveEventId();
    return loadBudgetByEvent(savedActiveId);
  });
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const savedActiveId = getActiveEventId();
    return loadVendorsByEvent(savedActiveId);
  });
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    const savedActiveId = getActiveEventId();
    return loadShoppingByEvent(savedActiveId);
  });
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(() => {
    const savedActiveId = getActiveEventId();
    return loadChecklistByEvent(savedActiveId);
  });
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(() => {
    const savedActiveId = getActiveEventId();
    return loadScheduleByEvent(savedActiveId);
  });
  const [aiPlan, setAiPlanState] = useState<AIPlan | null>(() => {
    const savedActiveId = getActiveEventId();
    return loadAIPlanByEvent(savedActiveId);
  });

  const [globalCateringBuffer, setGlobalCateringBuffer] = useState<number>(1.1); // 10% default buffer
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Date.now().toString();
      setToast({ id, message, type });
      setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, 4000);
    },
    []
  );

  // Manual reload from storage (e.g., after JSON import or sample reset)
  const refreshFromStorage = useCallback(() => {
    const loadedEvents = loadAllEvents();
    setEvents(loadedEvents);

    const savedActiveId = getActiveEventId();
    const effectiveActiveId =
      loadedEvents.some((e) => e.id === savedActiveId)
        ? savedActiveId
        : loadedEvents[0]?.id || PATNA_BIRTHDAY_EVENT_ID;

    setActiveEventIdState(effectiveActiveId);

    if (effectiveActiveId) {
      setGuests(loadGuestsByEvent(effectiveActiveId));
      setMenuItems(loadMenuByEvent(effectiveActiveId));
      setBudgetItems(loadBudgetByEvent(effectiveActiveId));
      setVendors(loadVendorsByEvent(effectiveActiveId));
      setShoppingItems(loadShoppingByEvent(effectiveActiveId));
      setChecklistItems(loadChecklistByEvent(effectiveActiveId));
      setScheduleItems(loadScheduleByEvent(effectiveActiveId));
      setAiPlanState(loadAIPlanByEvent(effectiveActiveId));
    }
  }, []);

  // When active event changes, reload sub-entities
  const setActiveEventId = useCallback((id: string) => {
    setActiveEventIdState(id);
    persistActiveEventId(id);
    setGuests(loadGuestsByEvent(id));
    setMenuItems(loadMenuByEvent(id));
    setBudgetItems(loadBudgetByEvent(id));
    setVendors(loadVendorsByEvent(id));
    setShoppingItems(loadShoppingByEvent(id));
    setChecklistItems(loadChecklistByEvent(id));
    setScheduleItems(loadScheduleByEvent(id));
    setAiPlanState(loadAIPlanByEvent(id));
  }, []);

  const activeEvent = useMemo(() => {
    return events.find((e) => e.id === activeEventId);
  }, [events, activeEventId]);

  // Event CRUD
  const createEvent = useCallback(
    (data: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>): string => {
      const newId = `evt-${Date.now()}`;
      const now = new Date().toISOString();
      const newEvent: EventItem = {
        ...data,
        id: newId,
        createdAt: now,
        updatedAt: now,
      };

      const updated = [newEvent, ...events];
      setEvents(updated);
      saveAllEvents(updated);
      setActiveEventId(newId);
      showToast(`Event "${newEvent.name}" created successfully!`, 'success');
      return newId;
    },
    [events, setActiveEventId, showToast]
  );

  const updateEvent = useCallback(
    (id: string, updates: Partial<EventItem>) => {
      const updated = events.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      );
      setEvents(updated);
      saveAllEvents(updated);
      showToast('Event settings updated.', 'info');
    },
    [events, showToast]
  );

  const duplicateEvent = useCallback(
    (id: string): string => {
      const target = events.find((e) => e.id === id);
      if (!target) return '';

      const newId = `evt-${Date.now()}`;
      const now = new Date().toISOString();
      const clonedEvent: EventItem = {
        ...target,
        id: newId,
        name: `${target.name} (Copy)`,
        createdAt: now,
        updatedAt: now,
      };

      const updated = [clonedEvent, ...events];
      setEvents(updated);
      saveAllEvents(updated);

      // Clone sub entities
      const srcGuests = loadGuestsByEvent(id);
      saveGuestsForEvent(
        newId,
        srcGuests.map((g) => ({ ...g, id: `gst-${Date.now()}-${Math.random()}`, eventId: newId }))
      );

      const srcMenu = loadMenuByEvent(id);
      saveMenuForEvent(
        newId,
        srcMenu.map((m) => ({ ...m, id: `menu-${Date.now()}-${Math.random()}`, eventId: newId }))
      );

      const srcBudget = loadBudgetByEvent(id);
      saveBudgetForEvent(
        newId,
        srcBudget.map((b) => ({ ...b, id: `bud-${Date.now()}-${Math.random()}`, eventId: newId }))
      );

      const srcVendors = loadVendorsByEvent(id);
      saveVendorsForEvent(
        newId,
        srcVendors.map((v) => ({ ...v, id: `vnd-${Date.now()}-${Math.random()}`, eventId: newId }))
      );

      const srcShopping = loadShoppingByEvent(id);
      saveShoppingForEvent(
        newId,
        srcShopping.map((s) => ({ ...s, id: `shp-${Date.now()}-${Math.random()}`, eventId: newId }))
      );

      const srcChecklist = loadChecklistByEvent(id);
      saveChecklistForEvent(
        newId,
        srcChecklist.map((c) => ({ ...c, id: `chk-${Date.now()}-${Math.random()}`, eventId: newId }))
      );

      const srcSchedule = loadScheduleByEvent(id);
      saveScheduleForEvent(
        newId,
        srcSchedule.map((s) => ({ ...s, id: `sch-${Date.now()}-${Math.random()}`, eventId: newId }))
      );

      setActiveEventId(newId);
      showToast(`Duplicated into "${clonedEvent.name}".`, 'success');
      return newId;
    },
    [events, setActiveEventId, showToast]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      if (events.length <= 1) {
        showToast('Cannot delete the only remaining event. Create another first.', 'error');
        return;
      }

      const updated = events.filter((e) => e.id !== id);
      setEvents(updated);
      saveAllEvents(updated);

      const nextActive = updated[0].id;
      setActiveEventId(nextActive);
      showToast('Event removed.', 'info');
    },
    [events, setActiveEventId, showToast]
  );

  // Guest actions
  const addGuest = useCallback(
    (guestData: Omit<Guest, 'id' | 'eventId'>) => {
      const newGuest: Guest = {
        ...guestData,
        id: `gst-${Date.now()}`,
        eventId: activeEventId,
      };
      const updated = [...guests, newGuest];
      setGuests(updated);
      saveGuestsForEvent(activeEventId, updated);
      showToast(`Guest "${newGuest.name}" added.`, 'success');
    },
    [activeEventId, guests, showToast]
  );

  const updateGuest = useCallback(
    (id: string, updates: Partial<Guest>) => {
      const updated = guests.map((g) => (g.id === id ? { ...g, ...updates } : g));
      setGuests(updated);
      saveGuestsForEvent(activeEventId, updated);
    },
    [activeEventId, guests]
  );

  const deleteGuest = useCallback(
    (id: string) => {
      const updated = guests.filter((g) => g.id !== id);
      setGuests(updated);
      saveGuestsForEvent(activeEventId, updated);
      showToast('Guest record removed.', 'info');
    },
    [activeEventId, guests, showToast]
  );

  // Menu actions
  const addMenuItem = useCallback(
    (itemData: Omit<MenuItem, 'id' | 'eventId'>) => {
      const newItem: MenuItem = {
        ...itemData,
        id: `menu-${Date.now()}`,
        eventId: activeEventId,
      };
      const updated = [...menuItems, newItem];
      setMenuItems(updated);
      saveMenuForEvent(activeEventId, updated);
      showToast(`Menu item "${newItem.name}" added.`, 'success');
    },
    [activeEventId, menuItems, showToast]
  );

  const updateMenuItem = useCallback(
    (id: string, updates: Partial<MenuItem>) => {
      const updated = menuItems.map((m) => (m.id === id ? { ...m, ...updates } : m));
      setMenuItems(updated);
      saveMenuForEvent(activeEventId, updated);
    },
    [activeEventId, menuItems]
  );

  const deleteMenuItem = useCallback(
    (id: string) => {
      const updated = menuItems.filter((m) => m.id !== id);
      setMenuItems(updated);
      saveMenuForEvent(activeEventId, updated);
      showToast('Menu item removed.', 'info');
    },
    [activeEventId, menuItems, showToast]
  );

  // Budget actions
  const addBudgetItem = useCallback(
    (itemData: Omit<BudgetItem, 'id' | 'eventId'>) => {
      const newItem: BudgetItem = {
        ...itemData,
        id: `bud-${Date.now()}`,
        eventId: activeEventId,
      };
      const updated = [...budgetItems, newItem];
      setBudgetItems(updated);
      saveBudgetForEvent(activeEventId, updated);
      showToast(`Expense "${newItem.name}" added to budget.`, 'success');
    },
    [activeEventId, budgetItems, showToast]
  );

  const updateBudgetItem = useCallback(
    (id: string, updates: Partial<BudgetItem>) => {
      const updated = budgetItems.map((b) => (b.id === id ? { ...b, ...updates } : b));
      setBudgetItems(updated);
      saveBudgetForEvent(activeEventId, updated);
    },
    [activeEventId, budgetItems]
  );

  const deleteBudgetItem = useCallback(
    (id: string) => {
      const updated = budgetItems.filter((b) => b.id !== id);
      setBudgetItems(updated);
      saveBudgetForEvent(activeEventId, updated);
      showToast('Budget item removed.', 'info');
    },
    [activeEventId, budgetItems, showToast]
  );

  // Vendor actions
  const addVendor = useCallback(
    (vendorData: Omit<Vendor, 'id' | 'eventId'>) => {
      const newVendor: Vendor = {
        ...vendorData,
        id: `vnd-${Date.now()}`,
        eventId: activeEventId,
      };
      const updated = [...vendors, newVendor];
      setVendors(updated);
      saveVendorsForEvent(activeEventId, updated);
      showToast(`Vendor "${newVendor.name}" saved.`, 'success');
    },
    [activeEventId, vendors, showToast]
  );

  const updateVendor = useCallback(
    (id: string, updates: Partial<Vendor>) => {
      const updated = vendors.map((v) => (v.id === id ? { ...v, ...updates } : v));
      setVendors(updated);
      saveVendorsForEvent(activeEventId, updated);
    },
    [activeEventId, vendors]
  );

  const deleteVendor = useCallback(
    (id: string) => {
      const updated = vendors.filter((v) => v.id !== id);
      setVendors(updated);
      saveVendorsForEvent(activeEventId, updated);
      showToast('Vendor record deleted.', 'info');
    },
    [activeEventId, vendors, showToast]
  );

  // Shopping actions
  const addShoppingItem = useCallback(
    (itemData: Omit<ShoppingItem, 'id' | 'eventId'>) => {
      const newItem: ShoppingItem = {
        ...itemData,
        id: `shp-${Date.now()}`,
        eventId: activeEventId,
      };
      const updated = [...shoppingItems, newItem];
      setShoppingItems(updated);
      saveShoppingForEvent(activeEventId, updated);
      showToast(`Item "${newItem.name}" added to shopping list.`, 'success');
    },
    [activeEventId, shoppingItems, showToast]
  );

  const updateShoppingItem = useCallback(
    (id: string, updates: Partial<ShoppingItem>) => {
      const updated = shoppingItems.map((s) => (s.id === id ? { ...s, ...updates } : s));
      setShoppingItems(updated);
      saveShoppingForEvent(activeEventId, updated);
    },
    [activeEventId, shoppingItems]
  );

  const deleteShoppingItem = useCallback(
    (id: string) => {
      const updated = shoppingItems.filter((s) => s.id !== id);
      setShoppingItems(updated);
      saveShoppingForEvent(activeEventId, updated);
      showToast('Shopping item deleted.', 'info');
    },
    [activeEventId, shoppingItems, showToast]
  );

  // Checklist actions
  const addChecklistItem = useCallback(
    (itemData: Omit<ChecklistItem, 'id' | 'eventId'>) => {
      const newItem: ChecklistItem = {
        ...itemData,
        id: `chk-${Date.now()}`,
        eventId: activeEventId,
      };
      const updated = [...checklistItems, newItem];
      setChecklistItems(updated);
      saveChecklistForEvent(activeEventId, updated);
      showToast(`Task "${newItem.title}" added to checklist.`, 'success');
    },
    [activeEventId, checklistItems, showToast]
  );

  const toggleChecklistItem = useCallback(
    (id: string) => {
      const updated = checklistItems.map((c) =>
        c.id === id ? { ...c, isCompleted: !c.isCompleted } : c
      );
      setChecklistItems(updated);
      saveChecklistForEvent(activeEventId, updated);
    },
    [activeEventId, checklistItems]
  );

  const deleteChecklistItem = useCallback(
    (id: string) => {
      const updated = checklistItems.filter((c) => c.id !== id);
      setChecklistItems(updated);
      saveChecklistForEvent(activeEventId, updated);
      showToast('Task removed from checklist.', 'info');
    },
    [activeEventId, checklistItems, showToast]
  );

  // Schedule actions
  const addScheduleItem = useCallback(
    (itemData: Omit<ScheduleItem, 'id' | 'eventId'>) => {
      const newItem: ScheduleItem = {
        ...itemData,
        id: `sch-${Date.now()}`,
        eventId: activeEventId,
      };
      const updated = [...scheduleItems, newItem].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
      setScheduleItems(updated);
      saveScheduleForEvent(activeEventId, updated);
      showToast(`Schedule item "${newItem.activity}" added.`, 'success');
    },
    [activeEventId, scheduleItems, showToast]
  );

  const updateScheduleItem = useCallback(
    (id: string, updates: Partial<ScheduleItem>) => {
      const updated = scheduleItems
        .map((s) => (s.id === id ? { ...s, ...updates } : s))
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      setScheduleItems(updated);
      saveScheduleForEvent(activeEventId, updated);
    },
    [activeEventId, scheduleItems]
  );

  const deleteScheduleItem = useCallback(
    (id: string) => {
      const updated = scheduleItems.filter((s) => s.id !== id);
      setScheduleItems(updated);
      saveScheduleForEvent(activeEventId, updated);
      showToast('Timeline activity removed.', 'info');
    },
    [activeEventId, scheduleItems, showToast]
  );

  // AI Plan
  const setAiPlan = useCallback(
    (plan: AIPlan) => {
      setAiPlanState(plan);
      saveAIPlanForEvent(activeEventId, plan);
      showToast('AI Plan adopted and saved to your event!', 'success');
    },
    [activeEventId, showToast]
  );

  const resetToDefaultSamples = useCallback(() => {
    resetToBenchmarkSamples();
    refreshFromStorage();
    showToast('Reset to Patna Birthday & Wedding benchmarks.', 'success');
  }, [refreshFromStorage, showToast]);

  const value = useMemo(
    () => ({
      events,
      activeEventId,
      activeEvent,
      activeModule,
      setActiveModule,
      setActiveEventId,
      createEvent,
      updateEvent,
      duplicateEvent,
      deleteEvent,
      guests,
      addGuest,
      updateGuest,
      deleteGuest,
      menuItems,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      budgetItems,
      addBudgetItem,
      updateBudgetItem,
      deleteBudgetItem,
      vendors,
      addVendor,
      updateVendor,
      deleteVendor,
      shoppingItems,
      addShoppingItem,
      updateShoppingItem,
      deleteShoppingItem,
      checklistItems,
      addChecklistItem,
      toggleChecklistItem,
      deleteChecklistItem,
      scheduleItems,
      addScheduleItem,
      updateScheduleItem,
      deleteScheduleItem,
      aiPlan,
      setAiPlan,
      globalCateringBuffer,
      setGlobalCateringBuffer,
      toast,
      showToast,
      resetToDefaultSamples,
      refreshFromStorage,
    }),
    [
      events,
      activeEventId,
      activeEvent,
      activeModule,
      setActiveEventId,
      createEvent,
      updateEvent,
      duplicateEvent,
      deleteEvent,
      guests,
      addGuest,
      updateGuest,
      deleteGuest,
      menuItems,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      budgetItems,
      addBudgetItem,
      updateBudgetItem,
      deleteBudgetItem,
      vendors,
      addVendor,
      updateVendor,
      deleteVendor,
      shoppingItems,
      addShoppingItem,
      updateShoppingItem,
      deleteShoppingItem,
      checklistItems,
      addChecklistItem,
      toggleChecklistItem,
      deleteChecklistItem,
      scheduleItems,
      addScheduleItem,
      updateScheduleItem,
      deleteScheduleItem,
      aiPlan,
      setAiPlan,
      globalCateringBuffer,
      toast,
      showToast,
      resetToDefaultSamples,
      refreshFromStorage,
    ]
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
}
