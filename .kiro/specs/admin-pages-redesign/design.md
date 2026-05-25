# Design Document — Admin Pages Redesign

## Overview

This document describes the technical design for redesigning the six admin components of the VSDC Manager frontend to match the polished reference design system established in `JJ/Dashboard.html` and `JJ/Customers.html`.

The redesign is a **pure UI/UX change**. No new API endpoints are introduced. All existing React state management, routing, and API integration in `frontend/src/api/admin.js` are preserved. The work falls into four categories:

1. **AdminShell** — replace the plain topbar with a search bar, notification bell, and user pill; add a pulsing "Online" indicator to the sidebar device card.
2. **AdminDashboard** — replace the current stat-grid/dash-grid layout with the full Dashboard.html pattern: quick-actions, kpi-grid with sparklines, dashboard-grid (area chart + donut), row-flex (recents + notices), and branch performance table.
3. **AdminBranches / AdminUsers** — replace the plain filter input and stat-grid with the Customers.html pattern: kpi-grid tiles, filterbar with tab-bar, paginated `table.data` with avatar initials.
4. **AdminTaxConfig / AdminTools** — targeted improvements: tax-chip badges, `.input--mono` rate inputs, `.chip--ok` save feedback, and card spacing improvements.
5. **index.css additions** — add all CSS classes that are present in `JJ/styles/app.css` but absent from `frontend/src/index.css`.

### Goals

- Visual consistency between the admin section and the reference design system.
- No regressions in existing functionality (CRUD, modals, API calls, routing).
- Accessibility baseline: ARIA labels, focus styles, modal roles.
- No external chart library — all charts are inline SVG.

---

## Architecture

The admin section follows a flat component architecture: a shared layout shell wraps individual page components. No global state library is used; each page manages its own local state with `useState` / `useEffect`.

```
AdminShell (layout wrapper)
├── Sidebar (nav + device card)
└── Main
    ├── Topbar (search + bell + user pill)
    └── {children} (page content)
        ├── AdminDashboard
        ├── AdminBranches
        ├── AdminUsers
        ├── AdminTaxConfig
        └── AdminTools
```

### Data flow

All pages call `adminApi.*` functions from `frontend/src/api/admin.js`. The API client (`frontend/src/api/client.js`) handles auth headers and error normalisation. Pages own their loading/error/data state locally.

```
Page component
  → useEffect → adminApi.xxx()
  → setState(data / error / loading)
  → render based on state
```

No changes to this data flow are required. The redesign only changes what is rendered, not how data is fetched.

---

## Components and Interfaces

### Helper components to extract

Three small reusable components should be extracted into `frontend/src/components/ui/` or defined locally within the admin pages:

#### `KpiCard`

```jsx
// Props
{
  label: string,       // e.g. "Total Users"
  value: number|string,// e.g. 42
  delta?: string,      // e.g. "▲ 12%" or "2 overdue"
  deltaDir?: 'up'|'down', // controls .kpi__delta--up / --down
  sub?: string,        // secondary label below delta
  sparkPoints?: string // SVG polyline points string
}
```

Renders a `.kpi` tile. The `sparkPoints` prop drives the `<polyline>` inside `.kpi__spark`. When `sparkPoints` is absent the spark area is omitted.

#### `AvatarInitial`

```jsx
// Props
{
  name: string,        // source string — first two chars used
  bg?: string,         // background colour (CSS value)
  color?: string,      // text colour (CSS value)
  size?: number,       // px, defaults to 30
  rounded?: boolean    // true = circle (avatar), false = rounded-square (recents .av)
}
```

Derives initials as `name.slice(0, 2).toUpperCase()`. Falls back to `"??"` when name is empty.

#### `Pagination`

```jsx
// Props
{
  page: number,        // current page (1-indexed)
  total: number,       // total record count
  perPage: number,     // records per page
  onChange: (page: number) => void
}
```

Renders a `.pagination` bar with "Showing X–Y of Z" text and page buttons. Generates at most 7 page buttons (first, last, current ±1, ellipsis). The active page button receives `.is-active`.

### AdminShell changes

**Topbar** — replace the current `<div>` containing a title `<h1>` and "Admin session" chip with:

```
.topbar
  .search [aria-label="Search admin console"]
    svg (search icon)
    input [placeholder="Search users, branches, TINs…"]
    .kbd  ⌘K
  .topbar__actions
    button.icon-btn [title="Notifications"]
      svg (bell icon)
      .dot
    .user-pill
      .avatar  AD
      div
        .user-pill__name  VSDC Admin
        .user-pill__role  Administrator
```

**Sidebar device card** — add a `.device-card__pulse` row above the existing Role row:

```
.device-card
  .device-card__row
    span  VSDC status
    b.device-card__pulse  Online
  .device-card__row
    span  Role
    b [style="color:#fbbf24"]  Administrator
  button (Sign out)
```

### AdminDashboard layout

```
.page
  .page-head
  .quick-actions (4 × .quick)
  .kpi-grid (4 × KpiCard)
  .dashboard-grid
    .card.chart-area  (SVG area chart)
    .card             (donut chart)
  .row-flex
    .card  (recents-list)
    .card  (notices)
  .card  (branch performance table)
```

### AdminBranches layout

```
.page
  .page-head
  .kpi-grid (4 × KpiCard)
  [create form card — unchanged]
  [edit modal — unchanged, add aria-modal + role]
  .card
    .filterbar
      .tab-bar (All / Headquarters / Sub-Branches)
      .field (TIN search)
      button.btn Export
    .table-wrap
      table.data
        thead: Branch | TIN | Type | Location | Manager | Actions
        tbody: AvatarInitial + name + branchId | mono TIN | chip | location | manager | actions
    .pagination
```

### AdminUsers layout

```
.page
  .page-head
  .kpi-grid (4 × KpiCard)
  [create form card — unchanged]
  [edit modal — unchanged, add aria-modal + role]
  .card
    .filterbar
      .tab-bar (All / Initialized / Pending / Training)
      .field (name/email search)
    .table-wrap
      table.data
        thead: User | TIN | Serial No | Branch | Status | Actions
        tbody: AvatarInitial + name + email | mono TIN | mono serial | branch | chip | actions
    .pagination
```

### AdminTaxConfig changes

- Replace `<span className="chip chip--brand chip--plain">` with `<span className="tax-chip tax-{key}">` for each tax type code.
- Replace `className="form-input form-input--sm form-input--num"` with `className="input input--mono"` on the rate input.
- Replace the inline `btn--ok` style hack with a `.chip--ok` element rendered adjacent to the Save button when `saved[tax.id]` is true.

### AdminTools changes

- The existing `ToolCard` component already uses `.card` / `.card__head` / `.card__body` — keep it.
- Add `font-family: var(--font-mono)` to the `<pre>` result box via the existing inline style (already present).
- Replace inline `color: '#dc2626'` error spans with `style={{ color: 'var(--err)' }}` for consistency.
- The two-step TIN reprogram confirmation is already implemented — no logic change needed.

---

## Data Models

### Stats API response (`adminApi.stats()`)

```typescript
interface AdminStats {
  users: {
    total: number
    initialized: number
    pending: number
    training: number
  }
  branches: {
    total: number
    hq: number
    sub: number
    list?: BranchSummary[]   // used for branch performance table
  }
  tax: {
    total: number
    active: number
    types?: TaxTypeSummary[] // used for donut chart
  }
  classifications: {
    total: number
  }
  recentUsers?: RecentUser[]
}

interface BranchSummary {
  id: string
  branchId: string
  branchName: string
  tin: string
  isHeadquarter: 'Y' | 'N'
  userCount: number
  statusCode?: string
}

interface TaxTypeSummary {
  taxType: 'A' | 'B' | 'C' | 'D'
  label: string
  count: number
  pct: number
  color: string
}

interface RecentUser {
  id: string
  fullName: string
  email: string
  tin: string
  sdcId: string | null
  createdAt: string
}
```

### Branch list API response (`adminApi.listBranches()`)

```typescript
interface BranchListResponse {
  data: Branch[]
  meta: {
    total: number
    page: number
    perPage: number
    lastPage: number
  }
}

interface Branch {
  id: string
  branchId: string
  tin: string
  branchName: string
  isHeadquarter: 'Y' | 'N'
  provinceName: string
  districtName: string
  sectorName: string
  locationDescription: string
  managerName: string
  managerPhone: string
  managerEmail: string
  userId: string | null
  branchStatusCode: string
}
```

### User list API response (`adminApi.listUsers()`)

```typescript
interface UserListResponse {
  data: DeviceUser[]
  meta: {
    total: number
    page: number
    perPage: number
    lastPage: number
  }
}

interface DeviceUser {
  id: string
  fullName: string
  email: string
  tin: string
  serialNo: string | null
  mrc: string | null
  sdcId: string | null
  branchId: string | null
  branchName: string | null
  isTrainingMode: boolean
  createdAt: string
}
```

### Tax config API response (`adminApi.listTax()`)

```typescript
interface TaxConfig {
  id: string
  taxType: 'A' | 'B' | 'C' | 'D'
  rate: number
  isActive: boolean
}
```

---

## SVG Chart Specifications

### Area chart (AdminDashboard — Sales & VAT)

Since the stats API does not return time-series data, the chart renders **static representative data** to demonstrate the layout. The chart is purely decorative/illustrative in the admin context.

```
viewBox="0 0 720 240"
preserveAspectRatio="none"

Structure:
  <title>System activity — last 14 days</title>
  <defs>
    <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
      stop 0%  → brand-700 at 22% opacity
      stop 100% → brand-700 at 0% opacity
    </linearGradient>
  </defs>
  <g class="chart-grid">  (4 horizontal dashed lines)
  <g class="chart-axis">  (x-axis date labels, y-axis value labels)
  <path fill="url(#adminChartGrad)" />   (area fill)
  <polyline stroke="#143a72" />          (net users line)
  <polyline stroke="#1f9d55" />          (initialized line)
  <circle cx r="4" />                    (endpoint dots)
```

### Donut chart (AdminDashboard — Tax type breakdown)

```
viewBox="0 0 36 36"
width="140" height="140"

r = 15.9155  (circumference ≈ 100 units)
stroke-width = 3.6

Segments (one <circle> per tax type):
  Base track: stroke="#e9ecf2"
  A (Exempt):      stroke="#6d28d9"
  B (18% Std):     stroke="#2563eb"
  C (Zero-rated):  stroke="#1f9d55"
  D (Non-VAT):     stroke="#d97706"

stroke-dasharray = "{pct} {100-pct}"
stroke-dashoffset = 25 - sum(previous pcts)
transform="rotate(-90 18 18)"

Center overlay (.donut .center):
  <b>  active tax type count
  <span>  "Tax types"
```

Segment percentages are derived from `stats.tax.types` when available. When the API does not return type breakdown, equal 25% segments are used as a placeholder.

### KPI sparklines

Each `.kpi__spark` contains a simple `<polyline>` with 9 data points. Static representative data is used (the admin stats API does not return time-series). The polyline stroke colour matches the KPI semantic colour (green for ok, blue for brand, red for warn).

---

## CSS Additions to `frontend/src/index.css`

The following classes exist in `JJ/styles/app.css` but are absent from `frontend/src/index.css`. They must be added verbatim (or with minor React-context adjustments):

| Class group | Classes to add |
|---|---|
| KPI tiles | `.kpi-grid`, `.kpi`, `.kpi__label`, `.kpi__value`, `.kpi__value .currency`, `.kpi__delta`, `.kpi__delta--up`, `.kpi__delta--down`, `.kpi__sub`, `.kpi__spark` |
| Quick actions | `.quick-actions`, `.quick`, `.quick:hover`, `.quick .ic`, `.quick .ic.b`, `.quick .ic.g`, `.quick .ic.a`, `.quick .ic.v`, `.quick .t`, `.quick .s`, `.quick .arr` |
| Filter bar | `.filterbar`, `.field`, `.field input`, `.field select`, `.field--grow input`, `.field .icon`, `.tab-bar`, `.tab-bar button`, `.tab-bar button.is-active` |
| Pagination | `.pagination`, `.pagination .pages`, `.pagination .pages button`, `.pagination .pages button.is-active` |
| Tax chips | `.tax-chip`, `.tax-A`, `.tax-B`, `.tax-C`, `.tax-D` |
| Dashboard grid | `.dashboard-grid`, `.chart-area`, `.chart-area__hd`, `.chart-area__legend`, `.chart-area__legend span`, `.chart-area__legend i`, `.chart-svg`, `.chart-grid line`, `.chart-axis text` |
| Donut | `.donut-wrap`, `.donut`, `.donut .center`, `.donut .center b`, `.donut .center span`, `.donut-list`, `.donut-list .row`, `.donut-list .row i`, `.donut-list .row .v`, `.donut-list .row .pct` |
| Recents | `.recents-list`, `.recents-list > div`, `.recents-list .av`, `.recents-list .t`, `.recents-list .s`, `.recents-list .amt`, `.recents-list .amt span` |
| Notices | `.notice`, `.notice .ic`, `.notice b`, `.notice p`, `.notice time` |
| Branch rows | `.branch-row`, `.branch-row .name`, `.branch-row .num`, `.branch-row .bar`, `.branch-row .bar i` |
| Layout | `.row-flex` |
| Topbar | `.icon-btn`, `.icon-btn:hover`, `.icon-btn .dot`, `.kbd` (verify each — `.search` and `.user-pill` already exist) |
| Input | `.input`, `.input--mono` (`.input` maps to the existing `.form-input` pattern but uses the `app.css` naming) |

**Verification approach**: Before adding each class, grep `frontend/src/index.css` for the selector. Only add classes that are genuinely absent to avoid duplication.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This feature is primarily a UI redesign. Most acceptance criteria are structural checks (specific elements present) or CSS behavior checks (hover styles, focus styles). However, several criteria describe **universal rules** that hold across all inputs — these are suitable for property-based testing using a library such as [fast-check](https://github.com/dubzzz/fast-check) (the project uses React + Vite, so fast-check with `@testing-library/react` is the natural choice).

### Property Reflection

Before writing properties, redundancy is eliminated:

- Criteria 4.2 (KPI tile structure) and 9.2 / 12.2 (KPI tile structure on Branches/Users pages) all test the same KpiCard component — they collapse into **one property** about KpiCard rendering.
- Criteria 11.2 (branch avatar initials) and 14.2 (user avatar initials) both test the same AvatarInitial component — they collapse into **one property** about AvatarInitial.
- Criteria 10.3 (branch tab filtering) and 13.3 (user tab filtering) both test the same tab-filter pattern — they collapse into **one property** about tab-bar filtering.
- Criteria 7.2 (recents-list row structure) and 7.3 (notice item structure) are distinct enough to keep separate.
- Criteria 16.3, 16.4, 16.5 (tool loading/success/error states) all test the same `useAction` hook pattern — they collapse into **one property** about tool action state transitions.
- Criteria 18.4 (buttons have labels) and 18.5 (inputs have labels) are distinct accessibility properties — keep separate.

### Property 1: KpiCard renders all required sub-elements for any input

*For any* KPI tile data object with a label, numeric value, delta direction, and optional sparkline points, rendering the `KpiCard` component should produce an element containing `.kpi__label`, `.kpi__value`, a `.kpi__delta` badge with the correct directional modifier class (`.kpi__delta--up` or `.kpi__delta--down`), and a `.kpi__spark` SVG when sparkline points are provided.

**Validates: Requirements 4.2, 9.2, 12.2**

### Property 2: AvatarInitial always shows the first two characters of the source name

*For any* non-empty string `name`, rendering `AvatarInitial` with that name should produce an element whose text content equals `name.slice(0, 2).toUpperCase()`.

**Validates: Requirements 11.2, 14.2**

### Property 3: Tab-bar filtering produces a subset matching the selected filter

*For any* array of records (branches or users) with mixed type/status values, and any tab selection, the set of displayed rows after filtering should be exactly the subset of the input array that satisfies the filter predicate — no more, no fewer.

Specifically:
- For branches: "All" → all records; "Headquarters" → records where `isHeadquarter === 'Y'`; "Sub-Branches" → records where `isHeadquarter !== 'Y'`.
- For users: "All" → all records; "Initialized" → records where `sdcId` is truthy; "Pending" → records where `sdcId` is falsy and `isTrainingMode` is false; "Training" → records where `isTrainingMode` is true.

**Validates: Requirements 10.3, 13.3**

### Property 4: User search filter is case-insensitive and matches fullName or email

*For any* search string `s` and any array of user objects, the set of displayed rows after applying the search filter should be exactly the subset of users where `user.fullName.toLowerCase().includes(s.toLowerCase())` OR `user.email.toLowerCase().includes(s.toLowerCase())`.

**Validates: Requirements 13.5**

### Property 5: User status chip reflects sdcId truthiness for all users

*For any* user object, the rendered status cell should contain `.chip--ok` with text "Initialized" when `user.sdcId` is truthy, and `.chip--warn` with text "Pending" when `user.sdcId` is falsy. This must hold for all users regardless of other field values.

**Validates: Requirements 14.3**

### Property 6: Tax type chip class matches the tax type code for all tax types

*For any* tax config object with `taxType` in `{A, B, C, D}`, the rendered chip element should have the class `tax-{taxType}` (e.g., `tax-A` for type A). This must hold for all four tax types.

**Validates: Requirements 15.2**

### Property 7: Pending Init KPI delta direction reflects pending count

*For any* pending count value, the Pending Init KPI tile's delta badge should use `.kpi__delta--down` when `pending > 0` and should not use `.kpi__delta--down` when `pending === 0`.

**Validates: Requirements 12.3**

### Property 8: KPI values match the stats API response fields

*For any* stats response object, the four KPI tiles on AdminDashboard should display values equal to `stats.users.total`, `stats.users.initialized`, `stats.branches.total`, and `stats.users.pending` respectively.

**Validates: Requirements 4.5**

### Property 9: Recents list renders at most 5 rows for any input array

*For any* array of `N` recent users, the `.recents-list` should render exactly `min(N, 5)` rows.

**Validates: Requirements 7.4**

### Property 10: Tool action state machine transitions are consistent

*For any* tool component and any action outcome (loading → success, loading → error), the rendered state should be consistent: during loading the button is disabled with a loading label; on success a `.chip--ok` or green success indicator is visible; on error the error message is displayed in red (`color: var(--err)`). These states are mutually exclusive.

**Validates: Requirements 16.3, 16.4, 16.5**

### Property 11: All buttons have accessible labels

*For any* rendered admin page, every `<button>` element with the `.btn` class should have either non-empty text content or a non-empty `aria-label` attribute.

**Validates: Requirements 18.4**

### Property 12: All form inputs with IDs have matching label elements

*For any* rendered admin page, every `<input>` element with an `id` attribute should have a corresponding `<label>` element with a `htmlFor` attribute equal to that `id`.

**Validates: Requirements 18.5**

---

## Error Handling

### API errors

All pages follow the same pattern:

```
try {
  const data = await adminApi.xxx()
  setState(data)
} catch (err) {
  setError(err.message)
} finally {
  setLoading(false)
}
```

Error messages are displayed using `.settings-error` (already defined in `index.css`). The KPI grid and table are not rendered when `error` is set.

### Empty states

- **AdminBranches / AdminUsers**: When the data array is empty after loading, render a centred empty-state message inside the table card.
- **AdminDashboard branch table**: Render "No branch data available" when `stats.branches.list` is absent or empty.
- **AdminDashboard notices**: Render two static placeholder notices when no notice data is available from the API.

### Loading states

All pages show a spinner (`.spin` animation) or "Loading…" text while `loading === true`. The KPI grid and table are not rendered during loading to avoid layout shift.

### Form validation

Create/edit forms use HTML5 `required` attributes for mandatory fields. API validation errors are caught and displayed via `setSaveErr(err.data?.errors?.[0]?.message || err.message)`.

### TIN reprogram two-step confirmation

The first click sets `confirm = true` and changes the button to destructive styling. The second click submits the API call. Any field change resets `confirm = false` to prevent accidental submission after editing.

---

## Testing Strategy

### Unit tests (example-based)

Use **Vitest** + **@testing-library/react** (already in the project's ecosystem via Vite).

Focus areas:
- AdminShell topbar structure (search, bell, user pill present; old title absent).
- AdminShell sign-out button calls `logout()` and navigates to `/login`.
- AdminDashboard loading state (spinner shown, KPI grid absent).
- AdminDashboard error state (`.settings-error` shown, KPI grid absent).
- AdminDashboard chart SVG structure (viewBox, title element, polyline, linearGradient).
- AdminDashboard donut chart structure (.donut-wrap, .donut, .donut-list).
- AdminBranches / AdminUsers modal accessibility (aria-modal, role="dialog").
- AdminTaxConfig save feedback (`.chip--ok` appears on success, `.settings-error` on failure).
- AdminTools TIN reprogram two-step confirmation.
- CSS class presence in `index.css` (parse file, assert selectors exist).

### Property-based tests

Use **fast-check** for the 12 correctness properties above. Each test runs a minimum of **100 iterations**.

Tag format: `// Feature: admin-pages-redesign, Property {N}: {property_text}`

Example test structure:

```javascript
import fc from 'fast-check'
import { render, screen } from '@testing-library/react'
import KpiCard from '../components/ui/KpiCard'

// Feature: admin-pages-redesign, Property 1: KpiCard renders all required sub-elements for any input
test('KpiCard renders all required sub-elements', () => {
  fc.assert(
    fc.property(
      fc.record({
        label: fc.string({ minLength: 1 }),
        value: fc.integer({ min: 0, max: 99999 }),
        deltaDir: fc.constantFrom('up', 'down'),
        delta: fc.string({ minLength: 1 }),
        sparkPoints: fc.option(fc.string({ minLength: 1 })),
      }),
      ({ label, value, deltaDir, delta, sparkPoints }) => {
        const { container } = render(
          <KpiCard label={label} value={value} deltaDir={deltaDir} delta={delta} sparkPoints={sparkPoints} />
        )
        expect(container.querySelector('.kpi__label')).toBeTruthy()
        expect(container.querySelector('.kpi__value')).toBeTruthy()
        const deltaEl = container.querySelector('.kpi__delta')
        expect(deltaEl).toBeTruthy()
        expect(deltaEl.classList.contains(`kpi__delta--${deltaDir}`)).toBe(true)
        if (sparkPoints) {
          expect(container.querySelector('.kpi__spark')).toBeTruthy()
        }
      }
    ),
    { numRuns: 100 }
  )
})
```

### Integration tests

Not required for this feature — all API interactions are already tested by the existing backend test suite. The frontend redesign does not change API contracts.

### Accessibility checks

- Manual keyboard navigation through the admin shell nav links.
- Screen reader spot-check on SVG chart `<title>` elements.
- Automated axe-core scan (optional, via `@axe-core/react` in development mode).

---
