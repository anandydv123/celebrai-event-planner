# CelebrAI — Every Celebration, Thoughtfully Planned

**Challenge Vertical:** Challenge 5: Celebration & Event Planner  
**Product Name:** CelebrAI  
**Framework:** Next.js 15 (App Router), TypeScript, Tailwind CSS, `@google/genai` SDK  
**Default Currency:** INR (₹) with Indian Numbering Convention  

CelebrAI is an intelligent, full-stack celebration and event management platform. It combines creative, personalized AI generation from Google Gemini 3.8 Flash with deterministic, mathematical application logic for catering quantities, guest RSVP reconciliation, strict budget tracking, unit-safe shopping consolidation, and event-day timeline scheduling.

---

## 1. Problem Statement & Approach

### The Problem
Traditional event planning alternates between chaotic spreadsheets, unverified advice from generic chatbots, and mental math. Organizers struggle with:
- **Food waste and shortages**: Guessing catering quantities without accounting for guest categories (adults, children, seniors) or portion loss.
- **Hidden overspending**: Lacking real-time warnings when committed vendor quotations and expenses violate strict budgets.
- **Hallucinated chatbot recommendations**: Generic AI models generating fake market rates, impossible timelines, and unrealistic catering volumes.

### Our Approach
CelebrAI establishes a strict **Separation of Concerns**:
- **Generative AI (Gemini 3.8 Flash)**: Dedicated to creative ideation — conceptual themes, flavor palettes, customized invitation copywriting, entertainment itineraries, and contextual cost-saving tips.
- **Deterministic Engineering Code**: Strictly responsible for all quantitative logic — guest RSVP counters, catering portion calculators (converting grams, kilograms, litres, and portions), budget arithmetic, unit-compatible shopping aggregation, and schedule overlap detection.

---

## 2. How the Solution Works

### Core User Journey
1. **Event Creation & Setup**: Users create an event across 10 event types (Birthday Party, Wedding, Anniversary, Engagement, Graduation, Baby Shower, Festival Celebration, Family Gathering, Corporate, Custom). Users provide date, location, guest counts, demographic splits, strict/flexible budget limits, and venue preferences.
2. **Dedicated Birthday Planner**: A specialized module tailored for birthday parties, configuring the celebrated person's age, cake flavor, weight calculation based on guest count, entertainment, games, and return gifts.
3. **Guest & RSVP Management**: Tracks individual guests and aggregates counts by category (Adults, Children, Seniors) and RSVP status (Confirmed, Pending, Declined). A real-time reconciliation engine prevents count mismatches.
4. **Food & Catering Quantity Calculator**: Converts guest counts into exact food requirements:
   $$\text{Required Quantity} = \text{Applicable Guests} \times \text{Portion Size per Guest} \times \text{Adjustment Buffer Factor}$$
   Distinguishes raw ingredients from prepared dishes and ensures unit sanity.
5. **Budget & Expense Management**: Tracks allocated budget, committed vendor quotations, actual payments, and contingency reserves. If a strict budget is exceeded, an immediate overage alert is displayed.
6. **Consolidated Shopping List**: Automatically groups items by category and merges identical items only if their units are compatible.
7. **Vendors & Venue Logistics**: Manages user-entered vendor quotes and seating/stage arrangements without fabricating prices or availability.
8. **Timeline & Checklists**: Milestone tasks with category filters and priority indicators, plus a minute-by-minute event-day run sheet with collision detection.
9. **Gemini AI Integration**: Server-side Next.js route (`/api/gemini/plan`) invoking `gemini-3.8-flash` with automatic fallback to high-fidelity offline deterministic rules if the API key is absent.

---

## 3. Context-Aware Decision Logic

- **Patna Birthday Benchmark Scenario**: When planning a 50-person birthday party in Patna with a ₹20,000 budget, CelebrAI tailors cake weight to 3.5 kg (approx. 60g per person + buffer), optimizes vegetarian catering portions, and warns when vendor quotes exceed the ₹20,000 ceiling.
- **Demographic Portion Adjustments**: Children are calculated at 60% standard portion size; adult portions adjust based on menu complexity (multi-dish banquets reduce individual dish portion demands).
- **Strict Budget Ceiling Enforcement**: Unlike generic planners that silently absorb extra items, CelebrAI marks overspending in high-contrast red alerts with actionable reduction suggestions.

---

## 4. Assumptions & Limitations

- **Persistence**: Single-browser client-side persistence using versioned `localStorage` with JSON export/import backup. Multi-device sync is not claimed.
- **Market Pricing**: Food unit costs and vendor quotations reflect user entries or standard regional baseline estimates, clearly marked as estimates rather than guaranteed market quotes.
- **AI Telemetry & Failover**: If `GEMINI_API_KEY` is not present, the app transparently shifts to the deterministic rule engine without throwing errors or breaking navigation.

---

## 5. Setup & Environment Variables

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Environment Variables
Configure in `.env.local`:
```bash
# Optional: Google Gemini API Key for dynamic AI plan generation
# If omitted, CelebrAI falls back gracefully to its deterministic planning engine.
GEMINI_API_KEY="your-gemini-api-key"
```

### Installation & Launch
```bash
npm install
npm run build
npm run start
```

---

## 6. The Six Mandatory Evaluation Parameters (Evidence & Verification)

### A. Code Quality
- **Evidence**: Strictly typed TypeScript codebase with zero `any` types. All domain models (`EventItem`, `Guest`, `MenuItem`, `BudgetItem`, `Vendor`, `ShoppingItem`, `ChecklistItem`, `ScheduleItem`) defined in `/types/event.ts`.
- **Separation of Logic**: Arithmetic logic is segregated into pure functions in `/lib/calculators.ts`.
- **Compilation**: Verified via Next.js compiler (`npm run build`) and ESLint.

### B. Security
- **Evidence**: Complete server-side isolation for Gemini SDK via `/app/api/gemini/plan/route.ts`. The API key is accessed via `process.env.GEMINI_API_KEY` and is never exposed to client bundles or browser storage.
- **Input Sanitization**: All user inputs rendered safely through React JSX encoding, preventing XSS injection. No unvalidated external script execution.

### C. Efficiency
- **Evidence**: Zero extraneous dependencies. Leverages lightweight Lucide React icons, standard React memoization (`useMemo`, `useCallback`), and debounced local storage writes.
- **Network Discipline**: Server-side AI generation requests are cached in the event state to prevent duplicate or repeated billing calls.

### D. Testing & Verification
- **Evidence**: Deterministic tests execute against:
  1. Guest count category consistency (`Adults + Children + Seniors == Total`).
  2. RSVP state calculations (`Confirmed + Pending + Declined == Invited`).
  3. Catering portion arithmetic (`50 guests * 150g paneer * 1.1 buffer = 8.25 kg`).
  4. Cake weight calculation for 50 people (`50 * 0.065 kg = ~3.25 kg`).
  5. Strict budget overspending calculation.
  6. Unit-compatible shopping list aggregation.
  7. Schedule overlap detection.
  8. AI fallback behavior when API key is null.

### E. Accessibility (a11y)
- **Evidence**: WCAG AA color contrast compliance against warm ivory backgrounds. Semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<button>`, `<label>`).
- **Accessible Indicators**: Status alerts, overages, and RSVP statuses use both color and text/icon indicators (never color alone). Keyboard navigable modals and form controls.

### F. Problem Statement Alignment
- **Evidence**: Fully dedicated to the Celebration & Event Planner vertical with working modules for all 10 event types, special birthday flows, deterministic food calculators, strict budget guardrails, vendor tracking, and timeline run-sheets.
