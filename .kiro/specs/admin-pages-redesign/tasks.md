# Implementation Plan: Admin Pages Redesign

## Overview

Redesign the six admin components (AdminShell, AdminDashboard, AdminBranches, AdminUsers, AdminTaxConfig, AdminTools) to match the reference design system in `JJ/Dashboard.html` and `JJ/Customers.html`. The work is purely a UI/UX change — no new API endpoints, no changes to routing or state management. Implementation proceeds in five phases: CSS additions → shared UI components → AdminShell → AdminDashboard → AdminBranches/AdminUsers → AdminTaxConfig/AdminTools.

## Tasks

- [x] 1. Set up testing infrastructure and install dependencies
  - Install Vitest, @testing-library/react, @testing-library/jest-dom, jsdom, and fast-check as dev dependencies
  - Add a `vitest.config.js` (or extend `vite.config.js`) with jsdom environment and `@testing-library/jest-dom` setup
  - Add a `"test": "vitest --run"` script to `frontend/package.json`
  - Create `frontend/src/test/setup.js` that imports `@testing-library/jest-dom`
  - _Requirements: Design document — Testing Strategy_

- [x] 2. Add missing CSS classes to `frontend/src/index.css`
  - Verify each class group against the existing file before adding (grep for selector, add only if absent)
  - Add KPI tile classes: `.kpi-grid`, `.kpi`, `.kpi__label`, `.kpi__value`, `.kpi__value .currency`, `.kpi__delta`, `.kpi__delta--up`, `.kpi__delta--down`, `.kpi__sub`, `.kpi__spark`
  - Add Quick-action classes: `.quick-actions`, `.quick`, `.quick:hover`, `.quick .ic`, `.quick .ic.b`, `.quick .ic.g`, `.quick .ic.a`, `.quick .ic.v`, `.quick .t`, `.quick .s`, `.quick .arr`
  - Add Filter-bar classes: `.filterbar`, `.field`, `.field input`, `.field select`, `.field--grow input`, `.field .icon`, `.tab-bar`, `.tab-bar button`, `.tab-bar button.is-active`
  - Add Pagination classes: `.pagination`, `.pagination .pages`, `.pagination .pages button`, `.pagination .pages button.is-active`
  - Add Tax-chip classes: `.tax-chip`, `.tax-A`, `.tax-B`, `.tax-C`, `.tax-D`
  - Add Dashboard-grid / chart classes: `.dashboard-grid`, `.chart-area`, `.chart-area__hd`, `.chart-area__legend`, `.chart-area__legend span`, `.chart-area__legend i`, `.chart-svg`, `.chart-grid line`, `.chart-axis text`
  - Add Donut classes: `.donut-wrap`, `.donut`, `.donut .center`, `.donut .center b`, `.donut .center span`, `.donut-list`, `.donut-list .row`, `.donut-list .row i`, `.donut-list .row .v`, `.donut-list .row .pct`
  - Add Recents-list classes: `.recents-list`, `.recents-list > div`, `.recents-list .av`, `.recents-list .t`, `.recents-list .s`, `.recents-list .amt`, `.recents-list .amt span`
  - Add Notice / branch-row / layout classes: `.notice`, `.notice .ic`, `.notice b`, `.notice p`, `.notice time`, `.branch-row`, `.branch-row .name`, `.branch-row .num`, `.branch-row .bar`, `.branch-row .bar i`, `.row-flex`
  - Add Topbar utility classes if absent: `.icon-btn`, `.icon-btn:hover`, `.icon-btn .dot`, `.kbd`
  - Add Input classes if absent: `.input`, `.input--mono`
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 17.10_

- [ ] 3. Create shared UI helper components
  - [x] 3.1 Create `frontend/src/components/ui/KpiCard.jsx`
    - Accept props: `label`, `value`, `delta`, `deltaDir` (`'up'|'down'`), `sub`, `sparkPoints`
    - Render `.kpi` tile with `.kpi__label`, `.kpi__value`, `.kpi__delta` (with `.kpi__delta--up` or `.kpi__delta--down`), optional `.kpi__sub`, and optional `.kpi__spark` SVG polyline
    - _Requirements: 4.2, 9.2, 12.2_

  - [x] 3.2 Write property test for KpiCard — Property 1
    - **Property 1: KpiCard renders all required sub-elements for any input**
    - Use `fc.record({ label, value, deltaDir, delta, sparkPoints })` with 100 runs
    - Assert `.kpi__label`, `.kpi__value`, `.kpi__delta`, correct directional class, and `.kpi__spark` when `sparkPoints` is provided
    - **Validates: Requirements 4.2, 9.2, 12.2**

  - [ ] 3.3 Create `frontend/src/components/ui/AvatarInitial.jsx`
    - Accept props: `name`, `bg`, `color`, `size` (default 30), `rounded` (true = circle, false = rounded-square)
    - Derive initials as `name.slice(0, 2).toUpperCase()`, fall back to `"??"` when name is empty
    - _Requirements: 11.2, 14.2_

  - [ ] 3.4 Write property test for AvatarInitial — Property 2
    - **Property 2: AvatarInitial always shows the first two characters of the source name**
    - Use `fc.string({ minLength: 1 })` for name with 100 runs
    - Assert rendered text content equals `name.slice(0, 2).toUpperCase()`
    - **Validates: Requirements 11.2, 14.2**

  - [ ] 3.5 Create `frontend/src/components/ui/Pagination.jsx`
    - Accept props: `page`, `total`, `perPage`, `onChange`
    - Render `.pagination` bar with "Showing X–Y of Z" text and page buttons (max 7: first, last, current ±1, ellipsis)
    - Apply `.is-active` to the current page button
    - _Requirements: 11.3, 11.5, 14.4, 14.5_

- [ ] 4. Redesign AdminShell — topbar and sidebar device card
  - Replace the current topbar `<div>` (title h1 + "Admin session" chip) with the full `.topbar` pattern:
    - `.search` group with search icon, `<input>` with `placeholder="Search users, branches, TINs…"` and `aria-label="Search admin console"`, and `.kbd ⌘K`
    - `.topbar__actions` containing a `.icon-btn` bell button with `title="Notifications"` and `.dot` indicator, and a `.user-pill` with `.avatar` initials "AD", "VSDC Admin", and "Administrator"
  - Update the `.device-card` in the sidebar to add a `.device-card__pulse` "Online" row above the existing Role row
  - Ensure the Sign out button inside `.device-card` calls `logout()` and navigates to `/login`
  - Ensure `.sidebar__device` uses `marginTop: 'auto'` (already present — verify)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 18.1, 18.2, 18.3_

  - [ ] 4.1 Write unit tests for AdminShell topbar structure
    - Assert search input present with correct placeholder and aria-label
    - Assert bell button present with `title="Notifications"` and `.dot` child
    - Assert `.user-pill` with "AD" initials, "VSDC Admin", "Administrator" text
    - Assert old title heading and "Admin session" chip are absent
    - Assert `.device-card__pulse` "Online" element is present
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2_

- [ ] 5. Redesign AdminDashboard — quick actions and KPI grid
  - Replace the `.dash-welcome` banner and `.stat-grid` with:
    - A `.quick-actions` grid of four `.quick` cards linking to `/admin/users`, `/admin/branches`, `/admin/tax`, `/admin/tools`
    - Each card has a coloured `.ic` container, `.t` title, `.s` subtitle, and `.arr` right-arrow
    - A `.kpi-grid` of four `KpiCard` components: Total Users, Initialized Devices, Total Branches, Pending Initialization
    - Derive values from `stats.users.total`, `stats.users.initialized`, `stats.branches.total`, `stats.users.pending`
    - Show loading spinner while `loading === true`; show `.settings-error` and hide KPI grid when `error` is set
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 5.1 Write property test for Pending Init KPI delta direction — Property 7
    - **Property 7: Pending Init KPI delta direction reflects pending count**
    - Use `fc.integer({ min: 0, max: 9999 })` for pending count with 100 runs
    - Assert `.kpi__delta--down` present when `pending > 0`, absent when `pending === 0`
    - **Validates: Requirements 12.3**

  - [ ] 5.2 Write property test for KPI values matching stats API — Property 8
    - **Property 8: KPI values match the stats API response fields**
    - Use `fc.record({ users: fc.record({ total, initialized, pending }), branches: fc.record({ total }) })` with 100 runs
    - Render AdminDashboard with mocked `adminApi.stats()` returning the generated object
    - Assert each KPI tile displays the correct value
    - **Validates: Requirements 4.5**

- [ ] 6. Redesign AdminDashboard — SVG area chart and donut chart
  - Replace the `.dash-grid` two-column layout with `.dashboard-grid` (2fr 1fr)
  - Add `.card.chart-area` containing:
    - `.chart-area__hd` with title "System Activity — last 14 days", subtitle, and `.chart-area__legend`
    - Inline SVG with `viewBox="0 0 720 240"`, `<title>System activity — last 14 days</title>`, `<defs>` with `<linearGradient id="adminChartGrad">`, `.chart-grid` group (4 dashed horizontal lines), `.chart-axis` group (x/y labels), `<path>` area fill, two `<polyline>` data series (net users + initialized), endpoint `<circle>` dots
  - Add `.card` containing `.donut-wrap` with `.donut` SVG (`viewBox="0 0 36 36"`, stacked `<circle>` segments for tax types A/B/C/D) and `.donut .center` overlay showing active tax type count and "Tax types" label, plus `.donut-list` legend
  - Derive donut data from `stats.tax.types` when available; fall back to equal 25% segments
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 18.7_

  - [ ] 6.1 Write unit tests for AdminDashboard chart SVG structure
    - Assert `.chart-area` card present with SVG `viewBox="0 0 720 240"`
    - Assert `<title>` element present inside chart SVG
    - Assert `<linearGradient>` definition present
    - Assert at least one `<polyline>` element present
    - Assert `.donut-wrap` and `.donut-list` present
    - _Requirements: 5.1, 5.3, 5.4, 6.1, 18.7_

- [ ] 7. Redesign AdminDashboard — recent users list and notices feed
  - Replace the existing "Recently Added" table card with a `.row-flex` two-column grid containing:
    - "Recently Added Users" card using `.recents-list` pattern: each row has `.av` AvatarInitial, `.t` name + `.s` email, and `.amt` with initialization status Chip — render up to 5 rows from `stats.recentUsers`
    - "System Notices" card with `.notice` items (`.ic` icon, `<b>` title, `<p>` description, `<time>` element) — render at least 2 static placeholder notices when no API data is available
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 7.1 Write property test for recents list row count — Property 9
    - **Property 9: Recents list renders at most 5 rows for any input array**
    - Use `fc.array(fc.record({ id, fullName, email, sdcId }), { minLength: 0, maxLength: 20 })` with 100 runs
    - Assert rendered `.recents-list > div` count equals `Math.min(N, 5)`
    - **Validates: Requirements 7.4**

- [ ] 8. Redesign AdminDashboard — branch performance table
  - Add a `.card` below `.row-flex` containing:
    - `.card__head` with title "Performance by branch" and a `.tab-bar` with tabs "Users", "Branches", "Status"
    - `.branch-row` list derived from `stats.branches.list`; each row shows `.name` (branch name + ID), `.num` user count, `.bar > i` progress bar sized proportionally to max value, and a status Chip
    - Empty state "No branch data available" when `stats.branches.list` is absent or empty
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9. Checkpoint — AdminDashboard complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Redesign AdminBranches — KPI grid, filter bar, and table
  - Replace the `.stat-grid` with a `.kpi-grid` of four `KpiCard` components: Total Branches, Headquarters, Sub-Branches, Distinct TINs
  - Derive values from the loaded `branches` array and `meta` object; show loading indicator while loading
  - Replace the plain TIN filter input with a `.filterbar` inside the table card containing:
    - `.tab-bar` with tabs "All", "Headquarters", "Sub-Branches" — filter rows client-side on tab change
    - `.field` TIN search input — call `adminApi.listBranches()` with TIN param on Enter/Search click
    - "Export" button aligned right with `margin-left: auto`
  - Update `table.data` columns to: Branch (AvatarInitial + name + branchId), TIN, Type (HQ/Sub chip), Location, Manager, Actions
  - Each branch row uses `AvatarInitial` derived from first two chars of `branchName` (or `branchId`)
  - Add `Pagination` component below the table; call `adminApi.listBranches(page)` on page change
  - Add `aria-modal="true"` and `role="dialog"` to the edit modal `.modal` element
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 18.6_

  - [ ] 10.1 Write property test for branch tab-bar filtering — Property 3 (branches)
    - **Property 3: Tab-bar filtering produces a subset matching the selected filter**
    - Use `fc.array(fc.record({ id, branchName, isHeadquarter: fc.constantFrom('Y','N') }))` with 100 runs
    - Assert "All" shows all records; "Headquarters" shows only `isHeadquarter === 'Y'`; "Sub-Branches" shows only `isHeadquarter !== 'Y'`
    - **Validates: Requirements 10.3**

- [ ] 11. Redesign AdminUsers — KPI grid, filter bar, and table
  - Replace the `.stat-grid` with a `.kpi-grid` of four `KpiCard` components: Total Users, Initialized, Pending Init, Training Mode
  - "Pending Init" tile uses `.kpi__delta--down` when `pending > 0`
  - Replace the table card header with a `.filterbar` containing:
    - `.tab-bar` with tabs "All", "Initialized", "Pending", "Training" — filter rows client-side
    - `.field` text input for name/email search — filter client-side, case-insensitive
  - Update `table.data` columns to: User (AvatarInitial + name + email), TIN, Serial No, Branch, Status, Actions
  - Each user row uses `AvatarInitial` derived from first two chars of `fullName` (or email prefix)
  - Status column: `.chip--ok` "Initialized" when `u.sdcId` is truthy; `.chip--warn` "Pending" otherwise
  - Add `Pagination` component below the table; call `adminApi.listUsers(page)` on page change
  - Add `aria-modal="true"` and `role="dialog"` to the edit modal `.modal` element
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 13.1, 13.2, 13.3, 13.4, 13.5, 14.1, 14.2, 14.3, 14.4, 14.5, 18.6_

  - [ ] 11.1 Write property test for user tab-bar filtering — Property 3 (users)
    - **Property 3: Tab-bar filtering produces a subset matching the selected filter**
    - Use `fc.array(fc.record({ id, fullName, sdcId: fc.option(fc.string()), isTrainingMode: fc.boolean() }))` with 100 runs
    - Assert each tab produces exactly the correct subset per the filter predicate
    - **Validates: Requirements 13.3**

  - [ ] 11.2 Write property test for user search filter — Property 4
    - **Property 4: User search filter is case-insensitive and matches fullName or email**
    - Use `fc.string()` for search string and `fc.array(fc.record({ fullName, email }))` with 100 runs
    - Assert displayed rows match `fullName.toLowerCase().includes(s.toLowerCase()) || email.toLowerCase().includes(s.toLowerCase())`
    - **Validates: Requirements 13.5**

  - [ ] 11.3 Write property test for user status chip — Property 5
    - **Property 5: User status chip reflects sdcId truthiness for all users**
    - Use `fc.record({ sdcId: fc.option(fc.string({ minLength: 1 })) })` with 100 runs
    - Assert `.chip--ok` "Initialized" when `sdcId` is truthy; `.chip--warn` "Pending" when falsy
    - **Validates: Requirements 14.3**

- [ ] 12. Checkpoint — AdminBranches and AdminUsers complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Redesign AdminTaxConfig — tax-chip badges and input styling
  - Replace `<span className="chip chip--brand chip--plain">{key}</span>` with `<span className="tax-chip tax-{key}">{key}</span>` for each tax type row
  - Replace `className="form-input form-input--sm form-input--num"` with `className="input input--mono"` on the rate input
  - Replace the `accent-color` inline style on the Active checkbox with `style={{ accentColor: 'var(--brand-600)' }}`
  - Replace the `btn--ok` inline style hack on the Save button with a `.chip--ok` element rendered adjacent to the button when `saved[tax.id]` is true; revert after 2500 ms (already implemented — verify timing)
  - Display save errors using `.settings-error` CSS class
  - Ensure the `.card__head` subtitle reads "RRA EBM 2.1 — Article 4"
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [ ] 13.1 Write property test for tax-chip class — Property 6
    - **Property 6: Tax type chip class matches the tax type code for all tax types**
    - Use `fc.constantFrom('A', 'B', 'C', 'D')` with 100 runs
    - Assert rendered chip element has class `tax-{taxType}`
    - **Validates: Requirements 15.2**

  - [ ] 13.2 Write unit tests for AdminTaxConfig save feedback
    - Mock `adminApi.updateTax` to resolve successfully; assert `.chip--ok` appears after save
    - Mock `adminApi.updateTax` to reject; assert `.settings-error` appears
    - _Requirements: 15.5, 15.6_

- [ ] 14. Redesign AdminTools — card spacing and visual feedback polish
  - Verify each tool is wrapped in `.card` with `.card__head` and `.card__body` (already implemented in `ToolCard` — confirm no regressions)
  - Replace inline `color: '#dc2626'` error spans with `style={{ color: 'var(--err)' }}` for consistency
  - Verify the `<pre>` result box uses `background: var(--ink-100); border-radius: 8px; font-family: var(--font-mono)` (already present — confirm)
  - Verify the TIN reprogram two-step confirmation: first click → destructive button style + "⚠ Confirm Reprogram" label; second click → API call (already implemented — confirm no regressions)
  - Add description paragraphs with `fontSize: 13, color: 'var(--ink-500)'` inside each `.card__body` (already present — verify all five tools have descriptions)
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [ ] 14.1 Write property test for tool action state machine — Property 10
    - **Property 10: Tool action state machine transitions are consistent**
    - Use `fc.constantFrom('loading', 'done', 'error')` to drive mock state with 100 runs
    - Assert loading → button disabled with loading label; done → `.chip--ok` or green text visible; error → red error message visible; states are mutually exclusive
    - **Validates: Requirements 16.3, 16.4, 16.5**

  - [ ] 14.2 Write unit tests for AdminTools TIN reprogram two-step confirmation
    - First click: assert button changes to destructive style and label becomes "⚠ Confirm Reprogram"
    - Second click: assert `adminApi.reprogramTin` is called
    - Field change between clicks: assert confirm state resets
    - _Requirements: 16.6_

- [ ] 15. Accessibility audit pass across all admin pages
  - Verify all `.btn` elements have non-empty text content or `aria-label` attribute
  - Verify all `<input>` elements with `id` attributes have matching `<label htmlFor>` elements
  - Verify AdminShell search input has `aria-label="Search admin console"`
  - Verify notification bell button has `title="Notifications"`
  - Verify AdminBranches and AdminUsers modals have `aria-modal="true"` and `role="dialog"`
  - Verify AdminDashboard SVG charts have `<title>` elements
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

  - [ ] 15.1 Write property test for button accessibility — Property 11
    - **Property 11: All buttons have accessible labels**
    - Render each admin page and use `fc.constantFrom` over page components with 100 runs
    - Assert every `<button>` with `.btn` class has non-empty `textContent` or non-empty `aria-label`
    - **Validates: Requirements 18.4**

  - [ ] 15.2 Write property test for input/label pairing — Property 12
    - **Property 12: All form inputs with IDs have matching label elements**
    - Render each admin page form and assert every `<input id="X">` has a `<label htmlFor="X">`
    - **Validates: Requirements 18.5**

- [ ] 16. Final checkpoint — Ensure all tests pass
  - Run `npm test` in `frontend/` and confirm all unit and property tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints at tasks 9, 12, and 16 ensure incremental validation
- Property tests use fast-check with a minimum of 100 runs each
- Unit tests use Vitest + @testing-library/react
- The redesign is purely UI/UX — no API contracts change
- Static representative data is used for SVG charts (the admin stats API does not return time-series)
- CSS additions in task 2 must be verified against existing `index.css` before adding to avoid duplication
