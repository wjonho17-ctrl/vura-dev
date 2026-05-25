# Requirements Document

## Introduction

The admin section of the VSDC Manager frontend (`frontend/src/pages/Admin/` and `frontend/src/components/layout/AdminShell.jsx`) currently uses a minimal visual style that does not match the polished design system established in the reference HTML files (`JJ/Dashboard.html` and `JJ/Customers.html`). This feature redesigns all six admin components — AdminShell, AdminDashboard, AdminBranches, AdminUsers, AdminTaxConfig, and AdminTools — to adopt the full reference design language: rich topbar, KPI grid with sparklines, SVG charts, tab-bar filter bars, avatar-initial rows, pagination, quick-action cards, branch performance table, notices feed, and the complete CSS class vocabulary already present in `frontend/src/index.css` (supplemented where classes are missing).

No new API endpoints are required. All data already flows through `frontend/src/api/admin.js`. The redesign is purely a UI/UX change; existing React state management, routing, and API integration are preserved.

---

## Glossary

- **AdminShell**: The shared React layout wrapper (`AdminShell.jsx`) that renders the dark-navy sidebar and white topbar for every admin page.
- **AdminDashboard**: The system-overview page (`AdminDashboard.jsx`) showing stats, charts, recent users, and configuration status.
- **AdminBranches**: The branch CRUD page (`AdminBranches.jsx`) with filter, table, create form, and edit modal.
- **AdminUsers**: The device-user CRUD page (`AdminUsers.jsx`) with table, create form, and edit modal.
- **AdminTaxConfig**: The VAT rate editor page (`AdminTaxConfig.jsx`).
- **AdminTools**: The EBM tools page (`AdminTools.jsx`) with classification sync, TIN reprogram, and EBM query tools.
- **Design_System**: The CSS design system defined in `frontend/src/index.css` and mirrored in `JJ/styles/app.css`, providing CSS custom properties and utility classes.
- **KPI_Card**: A tile using the `.kpi` / `.kpi-grid` CSS classes that displays a label, large numeric value, delta badge, and optional SVG sparkline.
- **Stat_Card**: A compact summary tile using `.stat-card` / `.stat-grid` CSS classes.
- **Tab_Bar**: A pill-switcher component using the `.tab-bar` CSS class for filtering table views.
- **Filter_Bar**: A toolbar using the `.filterbar` CSS class containing a Tab_Bar and field dropdowns.
- **Pagination**: A page-navigation component using the `.pagination` CSS class.
- **Quick_Action_Card**: A shortcut tile using the `.quick` / `.quick-actions` CSS classes.
- **Avatar_Initial**: A circular or rounded-square element using the `.avatar` CSS class that displays the first two letters of a name.
- **Topbar**: The sticky white header bar rendered by AdminShell, using the `.topbar` CSS class.
- **Sidebar**: The dark-navy left navigation panel rendered by AdminShell, using the `.sidebar` CSS class.
- **Device_Card**: The status card at the bottom of the Sidebar using the `.device-card` CSS class.
- **SVG_Chart**: An inline SVG element rendering a line/area chart or donut chart without an external chart library.
- **Chip**: A status badge using the `.chip` CSS class and its variants (`.chip--ok`, `.chip--warn`, `.chip--err`, `.chip--info`, `.chip--brand`).
- **EBM**: Electronic Billing Machine — the RRA hardware/software device that signs invoices.
- **RRA**: Rwanda Revenue Authority.
- **TIN**: Taxpayer Identification Number (9-digit numeric string).
- **VSDC**: Virtual Sales Data Controller — the software system this frontend manages.

---

## Requirements

### Requirement 1: AdminShell — Topbar Redesign

**User Story:** As an admin user, I want the topbar to show a search bar, notification bell, and user identity pill, so that the admin console feels consistent with the rest of the application and I can quickly identify my session context.

#### Acceptance Criteria

1. THE AdminShell SHALL render a `.topbar` element containing a `.search` input group, a `.topbar__actions` container, and a `.user-pill` element.
2. WHEN the AdminShell mounts, THE AdminShell SHALL display a search input with placeholder text "Search users, branches, TINs…" and a `⌘K` keyboard shortcut hint rendered as a `.kbd` element.
3. THE AdminShell SHALL render a notification bell icon button using the `.icon-btn` CSS class with a `.dot` indicator element.
4. THE AdminShell SHALL render a `.user-pill` element containing an `.avatar` element with the initials "AD" and two lines of text: "VSDC Admin" and "Administrator".
5. THE AdminShell SHALL remove the existing plain title heading and "Admin session" chip from the topbar.
6. WHEN the search input receives focus, THE AdminShell SHALL apply the `.search:focus-within` style (white background, brand-500 border) via the existing CSS rule.

---

### Requirement 2: AdminShell — Sidebar Device Card

**User Story:** As an admin user, I want the sidebar device card to show the admin role with a pulsing online indicator, so that I can confirm the admin session is active at a glance.

#### Acceptance Criteria

1. THE AdminShell SHALL render a `.device-card` element inside `.sidebar__device` containing a row that displays "Role" and "Administrator" in amber (`#fbbf24`).
2. THE AdminShell SHALL render a `.device-card__pulse` element labelled "Online" to indicate active session status.
3. THE AdminShell SHALL render a "Sign out" button inside the Device_Card that calls the existing `logout()` function and navigates to `/login`.
4. WHILE the admin session is active, THE AdminShell SHALL display the Device_Card at the bottom of the Sidebar using `margin-top: auto` to push it to the footer position.

---

### Requirement 3: AdminDashboard — Quick Actions Row

**User Story:** As an admin, I want a row of quick-action shortcuts at the top of the dashboard, so that I can navigate to the most common admin tasks in one click.

#### Acceptance Criteria

1. THE AdminDashboard SHALL render a `.quick-actions` grid containing four `.quick` cards immediately below the page header.
2. THE AdminDashboard SHALL include Quick_Action_Cards linking to: Add Device User (`/admin/users`), Manage Branches (`/admin/branches`), Tax Config (`/admin/tax`), and EBM Tools (`/admin/tools`).
3. EACH Quick_Action_Card SHALL display a coloured icon container (`.ic`), a title (`.t`), a subtitle (`.s`), and a right-arrow indicator.
4. WHEN a Quick_Action_Card is hovered, THE AdminDashboard SHALL apply a brand-500 border and a -1px vertical translate via the existing `.quick:hover` CSS rule.

---

### Requirement 4: AdminDashboard — KPI Grid with Sparklines

**User Story:** As an admin, I want a four-column KPI grid with sparklines, so that I can see key system metrics at a glance with visual trend indicators.

#### Acceptance Criteria

1. THE AdminDashboard SHALL render a `.kpi-grid` containing four `.kpi` tiles: Total Users, Initialized Devices, Total Branches, and Pending Initialization.
2. EACH KPI tile SHALL display a `.kpi__label`, a `.kpi__value`, a `.kpi__delta` badge (`.kpi__delta--up` or `.kpi__delta--down` depending on value), and a `.kpi__spark` SVG sparkline.
3. WHEN the stats API response is loading, THE AdminDashboard SHALL display a loading skeleton or spinner in place of the KPI grid.
4. IF the stats API call fails, THEN THE AdminDashboard SHALL display an error message using the `.settings-error` CSS class and SHALL NOT render the KPI grid.
5. THE AdminDashboard SHALL derive KPI values from the existing `adminApi.stats()` response fields: `stats.users.total`, `stats.users.initialized`, `stats.branches.total`, and `stats.users.pending`.

---

### Requirement 5: AdminDashboard — Sales & VAT SVG Chart

**User Story:** As an admin, I want a line/area chart showing system activity trends, so that I can monitor usage patterns across branches.

#### Acceptance Criteria

1. THE AdminDashboard SHALL render a `.card.chart-area` containing an inline SVG element with `viewBox="0 0 720 240"` for the activity chart.
2. THE AdminDashboard SHALL render the chart inside a `.dashboard-grid` two-column layout (2fr 1fr) alongside the tax-type donut chart.
3. THE chart SVG SHALL include a `.chart-grid` group with horizontal dashed grid lines and a `.chart-axis` group with axis labels.
4. THE chart SVG SHALL render at least one `<polyline>` or `<path>` data series with a gradient fill area using a `<linearGradient>` definition.
5. THE AdminDashboard SHALL render a `.chart-area__legend` showing series labels with colour swatches.
6. WHERE live time-series data is not available from the API, THE AdminDashboard SHALL render representative static sparkline data to demonstrate the chart layout.

---

### Requirement 6: AdminDashboard — Tax Type Donut Chart

**User Story:** As an admin, I want a donut chart showing the VAT type breakdown, so that I can see the distribution of tax categories configured in the system.

#### Acceptance Criteria

1. THE AdminDashboard SHALL render a `.card` containing a `.donut-wrap` with a `.donut` SVG element and a `.donut-list` legend.
2. THE donut SVG SHALL use stacked `<circle>` elements with `stroke-dasharray` and `stroke-dashoffset` to render arc segments for each tax type (A, B, C, D).
3. THE `.donut .center` overlay SHALL display the count of active tax types and the label "Tax types".
4. THE `.donut-list` SHALL render one row per tax type showing a colour swatch, label, and percentage.
5. THE AdminDashboard SHALL derive donut data from the `stats.tax` fields returned by `adminApi.stats()`.

---

### Requirement 7: AdminDashboard — Recent Users & Notices Feed

**User Story:** As an admin, I want a two-column row showing recent device users and system notices, so that I can monitor new registrations and stay informed of RRA announcements.

#### Acceptance Criteria

1. THE AdminDashboard SHALL render a `.row-flex` two-column grid containing a "Recently Added Users" card and a "System Notices" card.
2. THE "Recently Added Users" card SHALL use the `.recents-list` pattern: each row displays an Avatar_Initial, user name + email, and an initialization status Chip.
3. THE "System Notices" card SHALL render a list of `.notice` items, each with an icon container (`.notice .ic`), a bold title, a description paragraph, and a `<time>` element.
4. WHERE `stats.recentUsers` contains data, THE AdminDashboard SHALL render up to 5 recent user rows.
5. WHERE no notice data is available from the API, THE AdminDashboard SHALL render at least two static placeholder notices to maintain layout integrity.

---

### Requirement 8: AdminDashboard — Branch Performance Table

**User Story:** As an admin, I want a branch performance table with progress bars and status chips, so that I can compare branch activity at a glance.

#### Acceptance Criteria

1. THE AdminDashboard SHALL render a `.card` containing a `.branch-row` list below the recent-users/notices row.
2. THE card header SHALL include a `.tab-bar` with tabs: "Users", "Branches", "Status".
3. EACH `.branch-row` SHALL display: branch name and ID, user count, a progress bar (`.bar > i`) sized proportionally to the maximum value in the set, and a status Chip.
4. THE AdminDashboard SHALL derive branch rows from the `stats.branches` data returned by `adminApi.stats()`.
5. WHERE branch data is unavailable, THE AdminDashboard SHALL render a "No branch data available" empty state message.

---

### Requirement 9: AdminBranches — KPI Stat Cards

**User Story:** As an admin, I want stat cards at the top of the Branches page, so that I can see aggregate counts before scanning the table.

#### Acceptance Criteria

1. THE AdminBranches SHALL render a `.kpi-grid` (or `.stat-grid`) containing four tiles: Total Branches, Headquarters, Sub-Branches, and Distinct TINs.
2. EACH tile SHALL use the `.kpi` CSS class with `.kpi__label`, `.kpi__value`, and an optional `.kpi__delta` or sub-label.
3. WHEN branch data is loading, THE AdminBranches SHALL display a loading indicator and SHALL NOT render the KPI tiles.
4. THE AdminBranches SHALL derive tile values from the loaded `branches` array and `meta` object.

---

### Requirement 10: AdminBranches — Filter Bar with Tab-Bar

**User Story:** As an admin, I want a filter bar with a tab-bar switcher and a TIN search field, so that I can quickly narrow the branch list.

#### Acceptance Criteria

1. THE AdminBranches SHALL render a `.filterbar` element inside the table card, above the table.
2. THE Filter_Bar SHALL contain a `.tab-bar` with tabs: "All", "Headquarters", "Sub-Branches".
3. WHEN a Tab_Bar tab is selected, THE AdminBranches SHALL filter the displayed rows to match the selected branch type without a new API call.
4. THE Filter_Bar SHALL contain a `.field` search input for TIN filtering.
5. WHEN the TIN field value changes and the user presses Enter or clicks Search, THE AdminBranches SHALL call `adminApi.listBranches()` with the TIN filter parameter.
6. THE Filter_Bar SHALL contain an "Export" button aligned to the right using `margin-left: auto`.

---

### Requirement 11: AdminBranches — Paginated Table with Avatar Initials

**User Story:** As an admin, I want the branches table to show avatar initials, richer row data, and pagination, so that the table is easier to scan and navigate.

#### Acceptance Criteria

1. THE AdminBranches SHALL render a `table.data` with columns: Branch (avatar + name + ID), TIN, Type (HQ/Sub chip), Location, Manager, and Actions.
2. EACH branch row SHALL display an Avatar_Initial derived from the first two characters of `branchName` (or `branchId` if name is absent), styled with a colour derived from the branch type.
3. THE AdminBranches SHALL render a `.pagination` component below the table showing "Showing X–Y of Z branches" and page navigation buttons.
4. WHEN a pagination button is clicked, THE AdminBranches SHALL call `adminApi.listBranches(page)` with the selected page number.
5. THE AdminBranches SHALL render the active page button with the `.is-active` CSS class.
6. WHEN the branch list is empty, THE AdminBranches SHALL display an empty-state message inside the table card.

---

### Requirement 12: AdminUsers — KPI Stat Cards

**User Story:** As an admin, I want KPI stat cards at the top of the Users page, so that I can see device initialization status at a glance.

#### Acceptance Criteria

1. THE AdminUsers SHALL render a `.kpi-grid` containing four tiles: Total Users, Initialized, Pending Init, and Training Mode.
2. EACH tile SHALL use the `.kpi` CSS class with a `.kpi__label`, `.kpi__value`, and a `.kpi__delta` badge.
3. THE "Pending Init" tile SHALL use `.kpi__delta--down` styling WHEN `pending > 0`.
4. THE AdminUsers SHALL derive tile values from the loaded `users` array and `meta` object.

---

### Requirement 13: AdminUsers — Filter Bar with Tab-Bar

**User Story:** As an admin, I want a filter bar with a tab-bar switcher on the Users page, so that I can quickly filter by initialization status.

#### Acceptance Criteria

1. THE AdminUsers SHALL render a `.filterbar` element inside the table card.
2. THE Filter_Bar SHALL contain a `.tab-bar` with tabs: "All", "Initialized", "Pending", "Training".
3. WHEN a Tab_Bar tab is selected, THE AdminUsers SHALL filter the displayed rows client-side to match the selected status without a new API call.
4. THE Filter_Bar SHALL contain a `.field` text input for searching by name or email.
5. WHEN the search field value changes, THE AdminUsers SHALL filter the displayed rows client-side to rows whose `fullName` or `email` contains the search string (case-insensitive).

---

### Requirement 14: AdminUsers — Table with Avatar Initials and Pagination

**User Story:** As an admin, I want the users table to show avatar initials, status chips, and pagination, so that the table is visually consistent with the reference design.

#### Acceptance Criteria

1. THE AdminUsers SHALL render a `table.data` with columns: User (avatar + name + email), TIN, Serial No, Branch, Status, and Actions.
2. EACH user row SHALL display an Avatar_Initial derived from the first two characters of `fullName` (or email prefix if name is absent).
3. THE Status column SHALL render a `.chip--ok` Chip labelled "Initialized" WHEN `u.sdcId` is truthy, and a `.chip--warn` Chip labelled "Pending" otherwise.
4. THE AdminUsers SHALL render a `.pagination` component below the table.
5. WHEN a pagination button is clicked, THE AdminUsers SHALL call `adminApi.listUsers(page)` with the selected page number.

---

### Requirement 15: AdminTaxConfig — Card/Table with Tax-Type Chips

**User Story:** As an admin, I want the tax configuration table to use the full card/table pattern with tax-type chips and better visual hierarchy, so that it is consistent with the rest of the admin UI.

#### Acceptance Criteria

1. THE AdminTaxConfig SHALL render the VAT rate table inside a `.card` with a `.card__head` showing "VAT Rate Table" and the subtitle "RRA EBM 2.1 — Article 4".
2. EACH table row SHALL render the tax type code using a `.tax-chip` element with the appropriate variant class (`.tax-A`, `.tax-B`, `.tax-C`, `.tax-D`).
3. THE AdminTaxConfig SHALL render the rate input using the `.input.input--mono` CSS classes from the Design_System (replacing the current `.form-input--num` approach) for visual consistency.
4. THE AdminTaxConfig SHALL render the Active toggle as a styled checkbox using `accent-color: var(--brand-600)`.
5. WHEN a tax rate is saved successfully, THE AdminTaxConfig SHALL display a `.chip--ok` inline confirmation for 2500 ms before reverting to the default Save button state.
6. IF the save API call fails, THEN THE AdminTaxConfig SHALL display the error message using the `.settings-error` CSS class.

---

### Requirement 16: AdminTools — Card Pattern with Visual Feedback

**User Story:** As an admin, I want the EBM tools to use the card pattern with better spacing and visual feedback, so that each tool is clearly delineated and action results are easy to read.

#### Acceptance Criteria

1. THE AdminTools SHALL render each tool (Classification Sync, TIN Reprogram, EBM Branch Users, EBM Branch Insurances, EBM Stock Items) inside a separate `.card` element with a `.card__head` and `.card__body`.
2. THE AdminTools SHALL render a description paragraph using `font-size: 13px; color: var(--ink-500)` inside each `.card__body`.
3. WHEN a tool action is in progress, THE AdminTools SHALL disable the action button and display a loading label (e.g., "Syncing…", "Processing…", "Querying…").
4. WHEN a tool action completes successfully, THE AdminTools SHALL display a success indicator using `.chip--ok` or green-coloured text adjacent to the button.
5. IF a tool action fails, THEN THE AdminTools SHALL display the error message in red (`color: var(--err)`) adjacent to the button.
6. THE TIN Reprogram tool SHALL render a two-step confirmation: the first button click changes the button to a destructive style (`background: #dc2626; color: #fff`) and updates the label to "⚠ Confirm Reprogram"; the second click submits the API call.
7. THE AdminTools SHALL render JSON result data in a `<pre>` element styled with `background: var(--ink-100); border-radius: 8px; font-family: var(--font-mono)` when a tool returns a response payload.

---

### Requirement 17: Design System CSS — Missing Class Additions

**User Story:** As a developer, I want all required CSS classes to exist in `frontend/src/index.css`, so that the redesigned components render correctly without inline styles.

#### Acceptance Criteria

1. THE Design_System SHALL define `.kpi`, `.kpi-grid`, `.kpi__label`, `.kpi__value`, `.kpi__delta`, `.kpi__delta--up`, `.kpi__delta--down`, `.kpi__sub`, and `.kpi__spark` CSS classes matching the reference `JJ/styles/app.css` definitions.
2. THE Design_System SHALL define `.quick`, `.quick-actions`, `.quick .ic`, `.quick .t`, `.quick .s`, and `.quick .arr` CSS classes matching the reference Dashboard.html inline styles.
3. THE Design_System SHALL define `.filterbar`, `.tab-bar`, `.tab-bar button`, and `.tab-bar button.is-active` CSS classes matching the reference definitions.
4. THE Design_System SHALL define `.pagination`, `.pagination .pages`, and `.pagination .pages button.is-active` CSS classes matching the reference definitions.
5. THE Design_System SHALL define `.tax-chip`, `.tax-A`, `.tax-B`, `.tax-C`, and `.tax-D` CSS classes matching the reference definitions.
6. THE Design_System SHALL define `.dashboard-grid`, `.chart-area`, `.chart-area__hd`, `.chart-area__legend`, `.chart-svg`, `.chart-grid`, and `.chart-axis` CSS classes.
7. THE Design_System SHALL define `.donut-wrap`, `.donut`, `.donut .center`, `.donut-list`, and `.donut-list .row` CSS classes.
8. THE Design_System SHALL define `.recents-list`, `.recents-list .av`, `.recents-list .t`, `.recents-list .s`, and `.recents-list .amt` CSS classes.
9. THE Design_System SHALL define `.notice`, `.notice .ic`, `.branch-row`, and `.row-flex` CSS classes.
10. THE Design_System SHALL define `.icon-btn`, `.icon-btn .dot`, `.kbd`, and `.search` CSS classes for the Topbar (these may already exist; THE Design_System SHALL verify and add only if absent).

---

### Requirement 18: Accessibility and Interaction Standards

**User Story:** As an admin user, I want all interactive elements to be keyboard-accessible and visually distinguishable, so that the admin console meets baseline accessibility standards.

#### Acceptance Criteria

1. THE AdminShell SHALL render all navigation links as `<NavLink>` elements with visible focus styles inherited from the Design_System.
2. THE AdminShell search input SHALL have an `aria-label` attribute with value "Search admin console".
3. THE notification bell button SHALL have a `title` attribute with value "Notifications".
4. ALL `.btn` elements across admin pages SHALL have descriptive text content or an `aria-label` attribute.
5. ALL form inputs across admin pages SHALL have associated `<label>` elements with matching `htmlFor` / `id` pairs.
6. WHEN a modal is open, THE AdminBranches and AdminUsers SHALL set `aria-modal="true"` and `role="dialog"` on the `.modal` element.
7. THE AdminDashboard SVG charts SHALL include a `<title>` element describing the chart content for screen readers.
