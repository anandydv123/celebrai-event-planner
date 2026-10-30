# Engineering Standards & Agent Guidelines — CelebrAI

## 1. Code Quality & Architecture Conventions
- **TypeScript Strictness**: All domain models, component props, and API interfaces must be strongly typed without `any`.
- **Pure Functions**: Business logic (catering calculation, budget arithmetic, guest reconciliation) must live in `/lib/calculators.ts` as pure functions independent of React components.
- **Component Hygiene**: Break views into focused, cohesive sub-components. Keep `app/page.tsx` clean and declarative.
- **No Dead Affordances**: Every button, input, toggle, and dropdown must have an active handler and tangible effect.

---

## 2. Security & Credentials
- **Zero Exposed Keys**: Never prefix server secrets with `NEXT_PUBLIC_`. The Gemini SDK is accessed strictly inside `/app/api/gemini/*`.
- **No Injected UI for Keys**: The app does not display API key input boxes or prompt the user for secrets.
- **Input Sanitization**: User-entered strings are safely bound in JSX; no `dangerouslySetInnerHTML`.
- **Telemetry**: Server-side Gemini client sets `User-Agent: 'aistudio-build'` in `httpOptions`.

---

## 3. Performance & Efficiency
- **Zero Unnecessary Rerenders**: Use memoized calculations for heavy catering quantity loops and budget sums.
- **Lightweight Dependencies**: Rely on native browser APIs, React standard hooks, and Next.js built-ins.
- **Deterministic AI Fallback**: Prevent unnecessary or repeated API calls; cache generated suggestions per event in local state.

---

## 4. Accessibility (a11y)
- **Keyboard Navigation**: All interactive elements are reachable via Tab and activatable via Enter/Space.
- **Contrast**: Text contrast meets WCAG AA standards against ivory and card surfaces.
- **No Color-Only Signaling**: Budget overage, task overdue states, and RSVP flags pair color with explicit icons and descriptive text labels.
- **Form Labels**: Every form field has an associated `<label>` or explicit `aria-label`.
