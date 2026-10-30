# Design & UX Specification — CelebrAI

## 1. Aesthetic Direction & Visual Principles
CelebrAI adopts a refined, editorial celebration aesthetic that conveys warmth, festivity, and executive-grade clarity without generic AI dashboard tropes.

### Core Visual Tokens
- **Canvas (60%)**: Warm Ivory (`#FAF9F6`), card surfaces in pristine ivory white (`#FFFFFF`) with subtle warm-stone hairline borders (`#E7E5E4`).
- **Structural Identity (30%)**: Deep Royal Plum / Violet (`#3B1E48` and `#261130`) for header accents, active tabs, primary buttons, and key headers.
- **Accents & Highlights (10%)**: Muted Celebration Gold (`#D97706` / `#B45309`) for progress meters, key calls-to-action, warnings, and active markers.
- **Text & Contrast**: High-contrast charcoal (`#1C1917`) for primary copy, muted stone (`#78716C`) for metadata and secondary labels. Meets WCAG AA contrast ratio (> 7:1 for normal text).

### Zero-Pill Discipline
- **No Static Pill Enclosures**: Metadata (dates, counts, categories) is displayed as clean unboxed text separated by typographic middots (`·`) or subtle slashes.
- **Interactive Controls**: Segmented tabs and filter buttons use clear pressed/unpressed states with clean rectangular or gently rounded bounds (`rounded-lg`), not candy badges.
- **Single-Elevation Depth**: Avoids nested card-in-a-card syndrome. Borders are consistent 1px hairline lines.
- **No Decorative Slop**: Prohibits pulsing status dots, fake version tags ("SYNTHEX v4"), code comment headers (`// 01_OVERVIEW`), or arbitrary AI innovation scores.

---

## 2. Typography & Spatial Layout
- **Display Typography**: `Plus Jakarta Sans`, 600/700 weight for section titles and hero headers. `text-wrap: balance` prevents orphan words.
- **Body & Forms**: 14px–15px with generous line height (1.5) for reading comfort.
- **Data, Arithmetic & Financials**: Strictly `tabular-nums font-mono` so numeric digits align vertically in tables, catering calculators, and budget summaries.

---

## 3. Navigation & Screen Architecture

### Top Navigation Bar Contract
Strict 3-zone contract:
1. **Brand Wordmark Zone**: "CelebrAI" in Plum Bold with celebration gold crown/star indicator.
2. **Context Zone**: Active event selector, countdown to event date, and quick action indicators.
3. **Primary Action Zone**: "Create Event" CTA and quick backup/export tools.

### Sidebar Navigation
Sidebar width: 250px on desktop, collapsible off-canvas on mobile:
- **Core Operations**: Overview, Create Event, My Events, Birthday Planner.
- **Planning Engines**: Guest Management & RSVP, Food & Catering Calculator, Budget Planner, Shopping List.
- **Logistics & Day-Of**: Venue & Decoration, Vendors, Checklist & Timeline, Invitations & Copywriter, Settings & Backup.

---

## 4. State Completeness
Every single module implements:
- **Populated State**: Rich tabular lists, action buttons, progress bars.
- **Empty State**: Explanatory illustration/icon, clear guidance text, and a direct primary action button.
- **Loading State**: Clean skeletons and spinner indicators during AI generation.
- **Error State**: Informative banner explaining root cause, actionable recovery button, and fallback data access.
