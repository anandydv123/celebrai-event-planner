# Product Requirements Document (PRD) — CelebrAI

## 1. Executive Summary
**Product Name:** CelebrAI  
**Product Type:** AI-powered Celebration & Event Planner  
**Tagline:** Every Celebration, Thoughtfully Planned  
**Challenge Vertical:** Challenge 5: Celebration & Event Planner  
**Default Currency:** INR (₹)  

CelebrAI is a comprehensive event planning SaaS platform designed to plan, orchestrate, and execute celebrations ranging from personal milestone birthdays and weddings to festival gatherings and corporate banquets. The product bridges creative generative AI (Gemini 3.8 Flash) with deterministic engineering calculations to ensure accurate catering quantities, strict budget adherence, guest reconciliation, and run-sheet scheduling.

---

## 2. Problem Statement & User Persona

### The Problem
Event planning is notoriously prone to guesswork, budget overruns, and logistical friction:
1. **Unreliable Food Estimates**: Hosts either over-cater (leading to food waste and excessive expenses) or run out of food because catering rules of thumb fail for mixed demographics.
2. **Hidden & Runaway Costs**: Budgets spiral due to unaccounted contingency reserves, unverified quotations, and lack of real-time expense reconciliations.
3. **AI Chatbot Failures**: Generic chatbots hallucinate catering math, invent fake market prices, or generate generic schedules disconnected from actual guest counts and venue constraints.
4. **Disjointed Tools**: Organizers juggle messaging apps, physical notepads, spreadsheets, and sticky notes for guests, menus, tasks, and vendors.

### User Personas
- **The Family Host (Primary)**: Planning a milestone 50-person birthday party in Patna with a strict ₹20,000 budget, requiring vegetarian catering, a chocolate cake, indoor seating, and entertainment for kids and seniors.
- **The Wedding Organizer**: Coordinating multi-day ceremonies, large guest rosters, venue logistics, caterer contracts, and run-sheets.
- **The Corporate Team Lead**: Arranging company celebrations or team outings with firm budget approvals and dietary compliance.

---

## 3. Core Requirements & User Journeys

### User Journey
`Create Event` ➔ `Enter Event Parameters` ➔ `Manage Guests & RSVP` ➔ `Choose Menu & Calculate Quantities` ➔ `Generate AI Plan` ➔ `Review Budget & Quotations` ➔ `Manage Venue & Vendors` ➔ `Organize Shopping & Run Sheet` ➔ `Track Execution Progress`.

### Supported Event Types
1. Birthday Party (Dedicated specialized flow)
2. Wedding
3. Anniversary
4. Engagement
5. Graduation Party
6. Baby Shower
7. Festival Celebration
8. Family Gathering
9. Corporate Event
10. Custom Event

### Functional Modules
1. **Event Management**: Create, edit, duplicate, search, filter, sort, and delete events.
2. **Guest Management & RSVP**:
   - Individual guest tracking with RSVP status (`Confirmed`, `Pending`, `Declined`).
   - Guest demographic categories (`Adult`, `Child`, `Senior`).
   - Category total reconciliation validator (alerts user if sum does not match total invited count).
   - Catering buffer percentage adjustment (0% – 30%).
3. **Food & Catering Calculator (Deterministic Engine)**:
   - Menu item categorization: Snacks/Starters, Main Courses, Breads, Rice, Desserts, Cake, Beverages, Water.
   - Portion math per guest x applicable guests x buffer factor.
   - Distinct units: kilograms (kg), litres (L), portions, pieces, cake weight (kg).
   - Distinguishes raw ingredients from prepared-food weights.
4. **Dedicated Birthday Planner**:
   - Birthday person name and age.
   - Cake flavor, tier, and weight calculation (e.g., 50–70g per person).
   - 3 Curated theme concepts.
   - Games, entertainment, and return-gift logistics.
5. **Budget & Expense Management**:
   - Strict vs. Flexible budget toggle.
   - Categories: Venue, Food/Catering, Cake, Decoration, Entertainment, Photography, Gifts, Transport, Miscellaneous.
   - Real-time remaining balance and immediate overage alerts if strict budget is exceeded.
6. **Shopping List & Unit Aggregation**:
   - Compatible unit consolidation (merges kg with kg, L with L; does not mix apples and oranges).
   - Priority tagging, purchase checkboxes, and cost sums.
7. **Venue, Seating & Decoration**:
   - Indoor/outdoor requirements, seating styles, stage/cake-cutting zones.
   - Decor materials checklist and already-purchased tracking.
8. **Vendors**:
   - User-entered vendor quotations, contact details, payment status (`Paid`, `Pending`).
   - No fabricated or invented prices.
9. **Timeline & Checklists**:
   - Milestone checklist with deadlines, priority, and completion tracking.
   - Minute-by-minute event-day run sheet with start/end times and overlap warning.
10. **Gemini AI Integration**:
    - Generates creative themes, customized menus, customized invitations, and budget-saving recommendations using actual user inputs.
    - Fails gracefully to a high-fidelity offline rule engine if API key is not configured or network drops.

---

## 4. Assumptions and Success Criteria

### Assumptions
- Persistence is managed client-side via robust versioned `localStorage` with JSON export/import for zero-latency review.
- Currency is strictly INR (`₹`) using Indian numbering formatting (`₹20,000`).
- AI is accessed server-side via Next.js App Router (`/api/gemini/plan`) with `@google/genai`.

### Success Criteria
- Deterministic math passes 100% of arithmetic edge-case tests.
- Patna Birthday benchmark test scenario produces an accurate ₹20,000 plan without hidden overages.
- App remains completely navigable and useful when offline or when no Gemini API key is present.
