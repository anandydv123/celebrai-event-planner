# Architecture & Engineering Specification — CelebrAI

## 1. System Overview
CelebrAI is built as a full-stack Next.js 15 application utilizing the App Router architecture, TypeScript, Tailwind CSS, Lucide icons, and the Google `@google/genai` TypeScript SDK.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Next.js 15 Client                          │
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │   Navigation Sidebar  │   │          Top Bar / Event Switcher    │  │
│  └───────────┬───────────┘   └──────────────────┬───────────────────┘  │
│              │                                  │                      │
│  ┌───────────▼──────────────────────────────────▼───────────────────┐  │
│  │                     App Context & Event State Store              │  │
│  │  - Active Event ID    - Events Collection   - Currency Formatter │  │
│  │  - Guests & RSVPs     - Menu & Catering     - Budget & Expenses  │  │
│  │  - Shopping Items     - Vendors             - Checklist & Runsheet│  │
│  └───────────┬──────────────────────────────────┬───────────────────┘  │
│              │                                  │                      │
│  ┌───────────▼───────────┐         ┌────────────▼───────────────────┐  │
│  │ LocalStorage Engine   │         │ Deterministic Math Utilities   │  │
│  │ (Schema v1 + Backup)  │         │ - Catering Portion Calculator  │  │
│  └───────────────────────┘         │ - Budget & Overspending Engine │  │
│                                    │ - Guest Reconciliation Logic   │  │
│                                    └────────────┬───────────────────┘  │
└─────────────────────────────────────────────────┼──────────────────────┘
                                                  │ POST /api/gemini/plan
                                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Server API Route                         │
│                    /app/api/gemini/plan/route.ts                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Gemini 3.8 Flash SDK Client (@google/genai)                     │  │
│  │  - Model: gemini-3.8-flash                                       │  │
│  │  - User-Agent: aistudio-build                                    │  │
│  │  - Server-side only: process.env.GEMINI_API_KEY                  │  │
│  │  - Structured JSON Schema Output Validation                      │  │
│  │  - Graceful Fallback Deterministic Engine on Error               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Hierarchy & Directory Structure
- `/types/event.ts`: Canonical domain models (`EventItem`, `Guest`, `MenuItem`, `BudgetItem`, `Vendor`, `ShoppingItem`, `ChecklistItem`, `ScheduleItem`, `AIPlan`).
- `/lib/calculators.ts`: Pure functional deterministic calculation logic (catering portion arithmetic, budget ledger balancing, guest count reconciliation, schedule overlap detection).
- `/lib/sample-data.ts`: Pre-seeded realistic benchmarks:
  - Patna Birthday Party (50 guests, ₹20,000 budget, vegetarian, chocolate cake, indoor).
  - Grand Wedding Celebration (250 guests, ₹8,50,000 budget, multi-course banquet, outdoor lawn).
- `/lib/storage.ts`: Resilient browser storage wrapper with validation, migration, schema versioning, and JSON export/import.
- `/lib/context.tsx`: Global React Context providing reactive state updates across all views.
- `/app/api/gemini/plan/route.ts`: Secure server-side route executing Gemini 3.8 Flash generation.
- `/components/`:
  - `Navbar.tsx` & `Sidebar.tsx`: Navigation conforming to top-bar contract.
  - `OverviewView.tsx`: Executive dashboard with financial and RSVP metrics.
  - `EventWizard.tsx`: Multi-step event creation wizard.
  - `MyEventsView.tsx`: Event list, duplicate, edit, delete, and filter controls.
  - `BirthdayPlannerView.tsx`: Specialized birthday orchestration flow.
  - `GuestManagementView.tsx`: Guest ledger, RSVP filters, reconciliation warnings.
  - `FoodCateringView.tsx`: Menu builder and portion quantity calculator.
  - `BudgetPlannerView.tsx`: Budget allocation, quotations, actual expense ledger.
  - `ShoppingListView.tsx`: Consolidated shopping list with compatible unit grouping.
  - `VenueDecorView.tsx`: Venue capacity, layout, and decor material checklist.
  - `VendorsView.tsx`: User-entered vendor quotations and contract statuses.
  - `TimelineChecklistView.tsx`: Milestone tasks and minute-by-minute run sheet.
  - `InvitationsView.tsx`: Copywriter with copy-to-clipboard functionality.
  - `AIRecommendationsView.tsx`: AI plan generator with one-click adoption.
  - `SettingsDocumentationView.tsx`: Data export/import and embedded docs.

---

## 3. Data Integrity & Resilience Strategy
1. **Separation of Concerns**: Generative AI suggests creative ideas; deterministic code calculates numbers.
2. **Offline-First & Failure Resilience**: When `GEMINI_API_KEY` is missing or when API quota is exhausted, the server route transparently returns high-fidelity rule-based recommendations.
3. **Data Loss Prevention**: LocalStorage updates are debounced and backed up with instant JSON export.
