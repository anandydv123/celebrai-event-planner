# Database & Data Model Specification — CelebrAI

## 1. Persistence Strategy
CelebrAI uses a client-side versioned storage model stored under the localStorage key `celebr_ai_store_v1`.

### Why LocalStorage?
- **Zero-latency Startup**: Instantaneous boot time without database network handshakes.
- **Privacy & Security**: Event, budget, and guest data remains on the user's device.
- **Export/Import Portability**: Complete backup and migration via structured JSON export/import.
- **Limitations**: Single-browser scope; clearing browser cache erases data unless exported.

---

## 2. Entity Schemas

### Event Entity (`EventItem`)
```typescript
interface EventItem {
  id: string;
  name: string;
  type: EventType; // Birthday Party, Wedding, Anniversary, etc.
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  totalGuests: number;
  guestCategories: {
    adults: number;
    children: number;
    seniors: number;
  };
  budget: {
    total: number;
    isStrict: boolean;
    contingencyReserve: number;
  };
  venueType: 'indoor' | 'outdoor' | 'hybrid';
  theme: string;
  foodPreference: 'vegetarian' | 'non-vegetarian' | 'mixed';
  cakePreference?: {
    flavor: string;
    tiers: number;
    message: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Guest Entity (`Guest`)
```typescript
interface Guest {
  id: string;
  eventId: string;
  name: string;
  category: 'adult' | 'child' | 'senior';
  rsvpStatus: 'confirmed' | 'pending' | 'declined';
  dietaryRestrictions?: string;
  notes?: string;
}
```

### Menu Item Entity (`MenuItem`)
```typescript
interface MenuItem {
  id: string;
  eventId: string;
  name: string;
  category: 'starter' | 'main' | 'bread' | 'rice' | 'dessert' | 'cake' | 'beverage' | 'water';
  applicableGuestTypes: ('adult' | 'child' | 'senior')[];
  portionSizePerPerson: number; // In unit
  unit: 'g' | 'kg' | 'ml' | 'L' | 'piece' | 'portion';
  rawVsPrepared: 'raw' | 'prepared';
  estimatedCostPerUnit: number;
  userAdjustedQuantity?: number;
}
```

### Budget Item Entity (`BudgetItem`)
```typescript
interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost: number;
  isPaid: boolean;
  notes?: string;
}
```

### Vendor Entity (`Vendor`)
```typescript
interface Vendor {
  id: string;
  eventId: string;
  category: 'Catering' | 'Venue' | 'Decoration' | 'Cake & Bakery' | 'Photography' | 'Entertainment' | 'Transportation' | 'Other';
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  quotedAmount: number;
  status: 'contacted' | 'quoted' | 'booked' | 'declined';
  notes?: string;
}
```

### Shopping Item Entity (`ShoppingItem`)
```typescript
interface ShoppingItem {
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
```

### Checklist Task Entity (`ChecklistItem`)
```typescript
interface ChecklistItem {
  id: string;
  eventId: string;
  title: string;
  category: 'Planning' | 'Vendors' | 'Food' | 'Guests' | 'Decor' | 'Day-of';
  deadlineDate: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
}
```

### Event-Day Schedule Entity (`ScheduleItem`)
```typescript
interface ScheduleItem {
  id: string;
  eventId: string;
  activity: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  responsiblePerson?: string;
  requiredMaterials?: string;
  notes?: string;
}
```
