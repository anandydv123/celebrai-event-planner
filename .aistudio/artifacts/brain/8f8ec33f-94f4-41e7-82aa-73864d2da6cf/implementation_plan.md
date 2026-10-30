# CelebrAI: AI-Powered Celebration & Event Planner

CelebrAI is a production-grade, end-to-end event planning web application that guides users from initial celebration concepts through event-day execution. It couples real Gemini 3.8 Flash natural language recommendations with deterministic arithmetic engines for guest counts, catering portion quantities, strict budget limits, shopping list consolidation, and run-sheet timelines.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during clarification and will govern the build:

- **Confirmed Decision 1 (Pre-loaded Scenarios)**: Pre-load the application with the benchmark **Patna Birthday Party** (50 guests, ₹20,000 budget, indoor venue, vegetarian catering, chocolate cake) and a **Grand Wedding Celebration** sample so the application is rich, testable, and demonstrable immediately on first launch.
- **Confirmed Decision 2 (AI Resilience & Fallbacks)**: Full Next.js server-side Gemini 3.8 Flash integration via `@google/genai`. If no API key is set or if rate limits/network failures occur, the system falls back seamlessly to a high-fidelity deterministic planning engine without breaking or faking success.
- **Confirmed Decision 3 (Currency & Formatting)**: Strictly INR (₹) formatting with the Indian numbering convention (`₹20,000`, `₹1,50,000`), clear budget ceiling alerts, and overage detection.

---

## 1. Overview & Core Concept

- **What It Does**: A complete event planning suite supporting 10 event types (Birthday Party, Wedding, Anniversary, Engagement, Graduation, Baby Shower, Festival Celebration, Family Gathering, Corporate Event, Custom). Features dedicated multi-step creation wizards, a dedicated Birthday Planner module, real-time RSVP tracking, catering quantity calculators with editable serving sizes, strict/flexible budget tracking, vendor quotations, consolidated shopping lists, task checklists, and an event-day run sheet.
- **Target Audience**: Families, individuals, party hosts, and professional event organizers planning intimate or large gatherings in India and beyond.
- **Key Value**: Replaces chaotic spreadsheets and generic chatbots with a structured, verified tool where arithmetic is deterministic and reliable, while Gemini AI provides creative themes, menu curation, custom invitations, and actionable cost-saving recommendations.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Color Palette (60-30-10 Rule)**:
  - Canvas (60%): Warm ivory/neutral cream (`#FAF9F6` / `bg-stone-50`), crisp clean card surfaces (`#FFFFFF`).
  - Structural Surfaces (30%): Deep plum/violet (`#3B1E48` / `#2D123A`) for primary branding, active navigation, and key headings; warm slate borders (`border-stone-200`); charcoal text (`#1C1917` / `#292524`).
  - Accents (10%): Muted celebration gold (`#D97706` / `#B45309` / `#CA8A04`) for primary action highlights, progress meters, and important badges.
- **Typography**:
  - Display/Headings: `Plus Jakarta Sans` with bold weights and balanced line wrapping (`text-wrap: balance`).
  - Body Prose: Clean, highly legible `Plus Jakarta Sans` / `system-ui` at 14px–16px with 1.5 line height.
  - Data, Quantities & Financial Figures: Strictly tabular monospace numbers (`font-mono tabular-nums`) for currency, item weights (kg/L/portions), and timestamps.
- **Zero-Pill Discipline & Anti-Slop**:
  - No static bordered pill tags or capsule badges on cards. Informational metadata uses clean unboxed text separated by typographic middots (`·`).
  - Segmented controls and filter tabs are functional interactive button elements.
  - No fake version tags or decorative pulsing dots.
  - No thick left accent borders (`border-l-4`). Single-elevation cards with subtle 1px hairline borders (`border border-stone-200`).

### Navigation Structure
- **Sidebar Navigation (260px)**:
  - 12 Dedicated Sections: Overview, Create Event, My Events, Birthday Planner, Guest Management, Food & Catering, Budget Planner, Shopping List, Venue & Decor, Vendors, Checklist & Timeline, Settings & Data Backup.
- **Top Header**:
  - Active event selector dropdown, event date countdown, quick export/import actions, and responsive mobile hamburger trigger.

---

## 3. Key Product Decisions & Trade-Offs

- **Deterministic Arithmetic vs. LLM Generation**:
  - *Chosen Approach*: Application TypeScript code strictly handles:
    1. Guest sums: `Total Invited = Confirmed + Pending + Declined`.
    2. Catering calculations: `Required Quantity = Guests x Portion Size x Buffer Factor`.
    3. Unit compatibility: Raw ingredients vs. prepared food vs. discrete units (kg, L, pieces).
    4. Budget balancing: `Remaining = Total Budget - Actual Expenses - Committed Quotations`.
  - *Why*: Eliminates hallucinated arithmetic and guarantees financial precision.
- **Server-Side AI API Route**:
  - *Chosen Approach*: Next.js App Router API route (`/api/gemini/plan`) calling `@google/genai` with `gemini-3.8-flash`. Keys are server-only (`process.env.GEMINI_API_KEY`).
  - *Why*: Never exposes secrets to browser bundles. Includes structured JSON schema parsing with fallback recovery.
- **Client Persistence**:
  - *Chosen Approach*: Structured `localStorage` with versioned schema, reactive state provider, pre-seeded sample data, and JSON backup export/import.
  - *Why*: Instant zero-latency loading, complete privacy, and zero external DB setup needed for local evaluation.

---

## 4. Technical Architecture & Data Strategy

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
│  │  - Structured JSON Output Schema Validation                      │  │
│  │  - Fallback Deterministic Engine on Key Absence / Error          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy & Workflows
1. **Event State & Persistence (`lib/storage.ts`, `lib/context.tsx`)**:
   - Manages active event, event CRUD, data serialization, and pre-seeded events.
2. **Deterministic Calculators (`lib/calculators.ts`)**:
   - `calculateCateringQuantity(guests, itemCategory, portionGramPerPerson, bufferMultiplier)`
   - `calculateBudgetHealth(totalBudget, expenses, vendors, isStrict)`
   - `reconcileGuestTotals(total, categories, rsvp)`
3. **Dedicated Module Views**:
   - `OverviewView`: KPI cards (Budget, RSVP Rate, Days Remaining, Tasks Completed), recent activity, quick actions.
   - `EventCreationWizard`: Multi-step form with validation for 10 event types, constraints, and venue preferences.
   - `BirthdayPlannerView`: Tailored birthday flow with age, cake preferences, entertainment, themes, and return-gift logistics.
   - `GuestManagementView`: Add/edit guests, categories (Adult/Child/Senior), RSVP states, catering buffer controls, CSV/text import.
   - `CateringView`: Menu breakdown (Starters, Mains, Desserts, Cake, Beverages), portion adjustment, unit conversion, total cost estimates.
   - `BudgetView`: Total budget, actual payments, quotation ledger, contingency reserve, strict budget overage banner.
   - `ShoppingListView`: Unit-aware item aggregation, category filtering, purchase checkboxes, cost calculations.
   - `VenueDecorView`: Seating arrangements, backdrop, theme lighting, stages, weather contingency checklists.
   - `VendorView`: User-entered vendor quotations, contacts, service categories, status flags.
   - `TimelineChecklistView`: Task deadlines with categories + event-day minute-by-minute run sheet.
   - `InvitationGenerator`: AI and deterministic invitation copywriter with copy-to-clipboard.
   - `DocumentationView`: Embedded tabs for PRD.md, DESIGN.md, ARCHITECTURE.md, AGENTS.md, README.md, DATABASE.md, and API.md.

---

## 5. Verification & Testing Plan

1. **Compilation & Type Checking**: Verify clean compilation using `compile_applet`.
2. **Linting**: Run `lint_applet` to ensure zero syntax or type errors.
3. **Deterministic Math Testing**:
   - Patna Birthday scenario: 50 guests, ₹20,000 budget, vegetarian food, chocolate cake.
   - Overspending detection when expenses exceed ₹20,000.
   - Guest category reconciliation when counts do not sum to total.
   - Raw ingredient vs. prepared food portion math (e.g. 150g cooked paneer per guest + 10% buffer = 8.25 kg).
4. **AI Route & Resilience**:
   - Server-side route returns structured plan when `GEMINI_API_KEY` is present.
   - Seamless deterministic fallback when API key is unset or network times out.
5. **Accessibility & Responsive Checks**: Keyboard navigation, semantic HTML, visible focus states, no horizontal scroll on mobile.
