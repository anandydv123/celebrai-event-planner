export type EventType =
  | 'Birthday Party'
  | 'Wedding'
  | 'Anniversary'
  | 'Engagement'
  | 'Graduation Party'
  | 'Baby Shower'
  | 'Festival Celebration'
  | 'Family Gathering'
  | 'Corporate Event'
  | 'Custom Event';

export type FoodPreference = 'vegetarian' | 'non-vegetarian' | 'mixed';
export type VenueType = 'indoor' | 'outdoor' | 'hybrid';

export interface CakePreference {
  flavor: string;
  tiers: number;
  message?: string;
  targetWeightKg?: number;
}

export interface GuestCategories {
  adults: number;
  children: number;
  seniors: number;
}

export interface EventBudget {
  total: number;
  isStrict: boolean;
  contingencyReserve: number;
}

export interface EventItem {
  id: string;
  name: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  totalGuests: number;
  guestCategories: GuestCategories;
  budget: EventBudget;
  venueType: VenueType;
  theme: string;
  foodPreference: FoodPreference;
  cakePreference?: CakePreference;
  birthdayPerson?: {
    name: string;
    age: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type GuestCategory = 'adult' | 'child' | 'senior';
export type RsvpStatus = 'confirmed' | 'pending' | 'declined';

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  category: GuestCategory;
  rsvpStatus: RsvpStatus;
  dietaryRestrictions?: string;
  notes?: string;
}

export type MenuCategory =
  | 'starter'
  | 'main'
  | 'bread'
  | 'rice'
  | 'dessert'
  | 'cake'
  | 'beverage'
  | 'water';

export type UnitType = 'g' | 'kg' | 'ml' | 'L' | 'piece' | 'portion';

export interface MenuItem {
  id: string;
  eventId: string;
  name: string;
  category: MenuCategory;
  applicableGuestTypes: GuestCategory[];
  portionSizePerPerson: number; // in designated unit
  unit: UnitType;
  rawVsPrepared: 'raw' | 'prepared';
  estimatedCostPerUnit: number;
  bufferMultiplier: number; // e.g. 1.1 for 10%
  userAdjustedQuantity?: number;
  notes?: string;
}

export type BudgetCategory =
  | 'Venue'
  | 'Food & Catering'
  | 'Cake & Bakery'
  | 'Decoration'
  | 'Entertainment'
  | 'Photography'
  | 'Gifts & Favors'
  | 'Transport'
  | 'Staff'
  | 'Miscellaneous';

export interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost: number;
  isPaid: boolean;
  notes?: string;
}

export type VendorStatus = 'contacted' | 'quoted' | 'booked' | 'declined';

export interface Vendor {
  id: string;
  eventId: string;
  category: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  quotedAmount: number;
  status: VendorStatus;
  notes?: string;
}

export interface ShoppingItem {
  id: string;
  eventId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  isPurchased: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export type ChecklistCategory =
  | 'Planning'
  | 'Vendors'
  | 'Venue'
  | 'Food'
  | 'Guests'
  | 'Decor'
  | 'Day-of';

export interface ChecklistItem {
  id: string;
  eventId: string;
  title: string;
  category: ChecklistCategory;
  deadlineDate: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
}

export interface ScheduleItem {
  id: string;
  eventId: string;
  activity: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  responsiblePerson?: string;
  requiredMaterials?: string;
  notes?: string;
}

export interface AIPlanTheme {
  title: string;
  description: string;
  colorPalette: string[];
  decorIdeas: string[];
}

export interface AIMenuSuggestion {
  course: 'starter' | 'main' | 'bread' | 'rice' | 'dessert' | 'beverage';
  name: string;
  dietary: string;
  suggestedPortionPerPerson: string;
  notes: string;
}

export interface AIInvitationDraft {
  tone: string;
  text: string;
}

export interface AIScheduleOutline {
  timeSlot: string;
  activity: string;
  notes: string;
}

export interface AIPlan {
  id: string;
  eventId: string;
  source: 'gemini' | 'deterministic-fallback';
  generatedAt: string;
  themes: AIPlanTheme[];
  menuSuggestions: AIMenuSuggestion[];
  cakeRecommendation: {
    recommendedWeightKg: number;
    flavors: string[];
    designNotes: string;
  };
  invitationDrafts: AIInvitationDraft[];
  scheduleOutline: AIScheduleOutline[];
  costSavingTips: string[];
}
