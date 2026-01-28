## 1. Project Overview

This frontend is a dashboard-style React application for a Real Estate Matching System, targeting real estate companies, managers, and brokers.  
It provides a complete UI for managing property offers and client requests, running automatic matching, tracking match lifecycles, handling notifications, and supporting operational/reporting workflows.

### Target Users and Roles

- **ADMIN**
  - Full access to all data and pages.
  - Manages users, views audit logs, exports reports.
- **MANAGER**
  - Operates the business: dashboard, offers, requests, matches, notifications.
  - Can see audit logs and export reports.
  - Cannot create or manage users.
- **BROKER**
  - Uses dashboard, offers, requests, matches, notifications.
  - Only manages their own offers/requests (enforced in the backend and reflected in action visibility).
  - No access to users, audit logs, or reports.

The frontend strictly respects these roles at the navigation, routing, and action levels.

---

## 2. Tech Stack

### Core Framework and Build

- **React** (modern, functional components with hooks).
- **Vite** as the build tool and dev server.

### Styling System

- **Tailwind CSS v4** (via `@tailwindcss/vite` and `index.css`) for utility-first styling.
- RTL support is configured globally via the `body` and `:root` styles.
- Custom design tokens (colors, spacing, typography) are expressed via Tailwind classes instead of custom CSS files.

### UI & Icons

- Custom React components for core building blocks:
  - Layout, sidebar, table, modal, cards, and forms.
- **Phosphor Icons** (`phosphor-react`) as the main icon set (sidebar icons, buttons, status, etc.).

### Animations

- **Framer Motion** for:
  - Page transitions (fade + slight slide).
  - Modal entry/exit (`Modal` component).
  - Smooth but subtle effects to maintain a professional SaaS feel.

### State Management & Data Fetching

- **TanStack React Query**:
  - Queries for all list data (offers, requests, matches, notifications, users, dashboard analytics, audit logs).
  - Mutations for all write operations (create/update/delete, status changes, mark notifications read).
  - Automatic cache invalidation after mutations for fresh views.

- **React Context**:
  - `AuthContext` for authentication state (user, token-aware loading, login/logout).

### Forms and Validation

- Controlled form state via React `useState` in each page.
- Logical validation rules implemented in submit handlers:
  - Range constraints (e.g. `areaFrom ≤ areaTo`, `priceFrom ≤ priceTo`, `budgetFrom ≤ budgetTo`).
  - Basic required field checks via HTML attributes and explicit checks as needed.

### Charts, Toasts, and Utilities

- **Recharts** for dashboard analytics:
  - Bar charts for top brokers and top areas.
- **Sonner** for toast notifications:
  - Success and error messages for mutations and global error handling.
- **Axios** for HTTP client abstraction, with a centralized instance and interceptors.

---

## 3. Application Architecture

### Folder Structure (Frontend)

High-level structure under `frontend/src`:

- `components/`
  - `Layout.jsx` – main shell (header + content) with page transitions and notification badge.
  - `Sidebar.jsx` – fixed vertical navigation, role-aware links.
  - `Table.jsx` – generic, Tailwind-styled table abstraction.
  - `Modal.jsx` – reusable modal with Framer Motion animations.
- `context/`
  - `AuthContext.jsx` – user state, login/logout, token-based session loading.
- `pages/`
  - `Login.jsx`
  - `Dashboard.jsx`
  - `Offers.jsx`
  - `Requests.jsx`
  - `Matches.jsx`
  - `Notifications.jsx`
  - `Users.jsx`
  - `AuditLogs.jsx`
  - `Reports.jsx`
  - `NotAuthorized.jsx` (403)
  - `NotFound.jsx` (404)
- `utils/`
  - `api.js` – configured Axios instance with interceptors.
  - `rbac.js` – role utilities and permission helpers.
  - `reports.js` – binary download helper for report exports.
- `App.jsx` – routing and role guards.
- `main.jsx` – React bootstrap with React Query provider and Sonner toaster.
- `index.css` – Tailwind and base global styles (including RTL).

### Routing Structure

Routing is configured with `react-router-dom`:

- Public routes:
  - `/login` – login page.
  - `/not-authorized` – 403 page.
- Protected (authenticated) routes wrapped by:
  - `ProtectedRoute` – redirects to `/login` if user is unauthenticated; shows centered loading state while `AuthContext` is resolving the current user.
  - `Layout` – shared sidebar + header wrapper with page transitions.
- Role-guarded routes inside the layout via `RoleGuard`:
  - `/` – `Dashboard` (ADMIN, MANAGER, BROKER).
  - `/offers` – `Offers` (ADMIN, MANAGER, BROKER).
  - `/requests` – `Requests` (ADMIN, MANAGER, BROKER).
  - `/matches` – `Matches` (ADMIN, MANAGER, BROKER).
  - `/notifications` – `Notifications` (ADMIN, MANAGER, BROKER).
  - `/users` – `Users` (ADMIN only).
  - `/audit-logs` – `AuditLogs` (ADMIN, MANAGER).
  - `/reports` – `Reports` (ADMIN, MANAGER).
  - `*` – `NotFound` (catch-all 404 inside the authenticated shell).

### Layout System

- `Layout.jsx`:
  - Two-column structure: fixed sidebar + flexible main content.
  - Header includes:
    - Dynamic page title derived from `location.pathname`.
    - Notification icon with unread badge (querying `/notifications` via React Query).
  - Main content area is wrapped in `AnimatePresence` and `motion.div` to animate route changes.

### Auth Context and Token Handling

- `AuthContext.jsx`:
  - On mount, reads JWT token from `localStorage`.
  - If a token exists, calls `/auth/me` to retrieve current user; on failure, clears the token and continues unauthenticated.
  - `login(email, password)`:
    - Calls `POST /auth/login`.
    - Stores `token` in `localStorage`.
    - Stores the returned `user` in context.
  - `logout()`:
    - Clears `token` from `localStorage`.
    - Clears user from context.
  - Provides `user`, `loading`, `login`, `logout` to components via `useAuth`.

---

## 4. Role-Based Access Control (RBAC)

### Role Handling in the UI

- Centralized in `utils/rbac.js`:
  - `ROLES` enum-like object: `ADMIN`, `MANAGER`, `BROKER`.
  - `hasRole(user, roles[])` – checks if `user.role` is in the allowed list.
  - `canEdit(resource, user)` / `canDelete(resource, user)`:
    - `ADMIN` / `MANAGER` can edit/delete any resource.
    - `BROKER` can edit/delete only their own resources, based on ownership keys like `ownerId`, `userId`, `brokerId`, `createdById`.

### Sidebar Visibility Rules

- `Sidebar.jsx`:
  - Shows dashboard, offers, requests, matches, notifications for all authenticated roles.
  - Shows `Users` only if `user.role === 'ADMIN'`.
  - Shows `Audit Logs` and `Reports` only when `hasRole(user, [ADMIN, MANAGER])` is true.
  - Completely omits links for unauthorized pages (no disabled or confusing items).

### Route Protection

- `ProtectedRoute`:
  - Ensures the user is authenticated before accessing any dashboard route.
  - Redirects to `/login` if `user` is missing.
- `RoleGuard`:
  - Wraps each page route with an `allowedRoles` list.
  - If `user` does not have one of these roles, redirects to `/not-authorized`.

### Action-Level Permissions

- `Offers` and `Requests`:
  - Per-row action buttons (`تعديل`, `حذف`) are only rendered when `canEdit` / `canDelete` return true for the current `user`.
  - Brokers therefore only see edit/delete controls on their own offers/requests; ADMIN/MANAGER see them for all entries.
- `Matches`:
  - Status dropdown is shown only when `hasRole(user, [ADMIN, MANAGER, BROKER])` (all roles can update, as per backend spec).
  - If future constraints are needed (e.g. brokers only update their own matches), they can be added using ownership checks.

---

## 5. Pages Overview

### Login

- **Purpose**
  - Authenticate a user via email/password and store a JWT token for subsequent API calls.
- **Main Features**
  - RTL glassmorphism-styled login card.
  - Error message area for invalid credentials and server errors.
  - Submit button with loading state and disabled while submitting to prevent double clicks.
- **Backend Endpoints**
  - `POST /auth/login`
  - `GET /auth/me` (called from `AuthContext` after token storage).

### Dashboard

- **Purpose**
  - Provide an at-a-glance overview of system activity and performance.
- **Main Features**
  - Summary cards showing counts of offers, requests, matches.
  - Recharts-based bar chart of top brokers by number of offers (ADMIN/MANAGER only).
  - Recharts-based bar chart of top areas (cities) by number of offers (all roles).
  - Loading placeholders and empty-data messages where necessary.
- **Backend Endpoints**
  - `GET /dashboard/summary`
  - `GET /dashboard/top-brokers` (role-limited display)
  - `GET /dashboard/top-areas`

### Offers

- **Purpose**
  - Create, view, update, and delete property offers (units) to be matched with client requests.
- **Main Features**
  - Table listing all offers relevant to the user (backend controls visibility; frontend provides consistent display).
  - Create/edit modal:
    - Fields aligned with backend contract:
      - `type`, `usage`, `landStatus`, `city`, `district`,
      - `areaFrom`, `areaTo`, `priceFrom`, `priceTo`,
      - `exclusivity`, `description`, `coordinates`.
    - Numeric parsing and range validation for area and price.
  - Edit opens the same modal pre-filled with existing data.
  - Delete with browser confirmation dialog.
  - React Query:
    - `useQuery` for list.
    - `useMutation` for create, update, delete, with cache invalidation and toasts.
  - RBAC:
    - Row-level actions (edit/delete) rendered only when `canEdit`/`canDelete` allow.
- **Backend Endpoints**
  - `GET /offers`
  - `POST /offers`
  - `PUT /offers/{id}`
  - `DELETE /offers/{id}`

### Requests

- **Purpose**
  - Manage client requests defining what they are searching for in properties.
- **Main Features**
  - Table listing all requests (with budget and area ranges, priority).
  - Create/edit modal:
    - Fields aligned with backend contract:
      - `type`, `usage`, `landStatus`, `city`, `district`,
      - `areaFrom`, `areaTo`, `budgetFrom`, `budgetTo`, `priority`.
    - Numeric parsing and range validation for area and budget.
  - Edit opens pre-filled modal; delete with confirmation.
  - React Query `useQuery` + `useMutation` pattern as in Offers.
  - RBAC:
    - Per-row edit/delete actions only for allowed users (brokers on own items, admin/manager globally).
- **Backend Endpoints**
  - `GET /requests`
  - `POST /requests`
  - `PUT /requests/{id}`
  - `DELETE /requests/{id}`

### Matches

- **Purpose**
  - Display and manage the matches between offers and requests, including status lifecycle.
- **Main Features**
  - Table listing matches with:
    - Offer summary (type, city, priceFrom).
    - Request summary (type, city, budgetFrom).
    - Match score (percentage).
    - Colored status badge derived from `status`:
      - `NEW`, `CONTACTED`, `NEGOTIATION`, `CLOSED`, `REJECTED`.
  - Status filter (ALL or specific status) for quick triage.
  - Status dropdown in each row to update the lifecycle state.
  - React Query `useQuery` for list and `useMutation` for status updates with invalidation.
  - Status dropdown disabled while status mutation is pending to avoid double updates.
- **Backend Endpoints**
  - `GET /matches`
  - `PATCH /matches/{id}` (updating `status`)

### Notifications

- **Purpose**
  - Show event-driven notifications for the current user, typically driven by new matches or system events.
- **Main Features**
  - Fetches all notifications for the current user with React Query.
  - Displays message and timestamp in a card list.
  - Visual distinction between unread and read (background highlight).
  - “Mark as read” action per unread notification (mutates status to `READ`).
  - Unread count summary.
  - Button disabled and label simplified while mutation is in-flight.
- **Backend Endpoints**
  - `GET /notifications`
  - `PATCH /notifications/{id}` (status to `READ`)

### Users Management (Admin Only)

- **Purpose**
  - Allow ADMIN users to view all users and create new accounts.
- **Main Features**
  - Table of users with name, email, role badge, creation date.
  - Modal form to create new user:
    - Fields: `name`, `email`, `password`, `role`.
    - Role select with human-friendly Arabic labels.
  - React Query for data and mutations:
    - `GET /users` for listing.
    - `POST /users` for creation.
  - Submit button disabled while creation is pending, with “saving…” label.
  - Explicit empty state when no users exist.
- **Backend Endpoints**
  - `GET /users`
  - `POST /users`

### Audit Logs (Admin / Manager)

- **Purpose**
  - Provide an audit trail of significant operations (create/update/delete) across resources.
- **Main Features**
  - Filter form with:
    - `resource`, `action`, `userId`, `startDate`, `endDate`.
  - Table showing:
    - Resource type, action, user, JSON-formatted `changes` payload, timestamp.
  - Empty state when no logs match current filters.
  - React Query uses the filters as part of its key to refetch on changes.
- **Backend Endpoints**
  - `GET /audit-logs` with corresponding query parameters.

### Reports (Admin / Manager)

- **Purpose**
  - Allow exporting data (offers/requests/matches) as Excel or PDF.
- **Main Features**
  - Simple selector for report type:
    - `offers`, `requests`, `matches`.
  - Two buttons:
    - Export as Excel.
    - Export as PDF.
  - Uses `downloadReport(type, format)` helper to:
    - Call the appropriate endpoint.
    - Handle binary data and trigger a file download.
    - Derive filename from `Content-Disposition` header when available.
- **Backend Endpoints**
  - `GET /reports/export/excel?type={offers|requests|matches}`
  - `GET /reports/export/pdf?type={offers|requests|matches}`

### 403 Not Authorized

- **Purpose**
  - Inform users they are not allowed to access a page.
- **Main Features**
  - Minimal card with explanation text.
  - Button to return to the dashboard.
  - Used as:
    - Explicit route (`/not-authorized`).
    - Target for `RoleGuard` and Axios 403 interceptor.

### 404 Not Found

- **Purpose**
  - Handle unknown or mistyped routes gracefully.
- **Main Features**
  - Similar visual language to 403 page, but with 404-specific copy.
  - Button to return to the dashboard.
  - Routed as the catch-all `*` inside the protected layout.

---

## 6. Data Flow & API Integration

### Axios Configuration

- Singleton Axios instance in `utils/api.js`:
  - `baseURL` read from `import.meta.env.VITE_API_URL` (with localhost fallback).
  - Request interceptor injects `Authorization: Bearer <token>` header when a token exists in `localStorage`.

### Global Interceptors Behavior

- **Request Interceptor**
  - Reads JWT from `localStorage`.
  - Attaches token to outgoing requests to any endpoint except login.

- **Response Interceptor**
  - On `401` (Unauthorized):
    - Assumes expired or invalid token.
    - Clears token from `localStorage`.
    - Shows a toast indicating the session expired.
    - Redirects user to `/login` if not already there.
  - On `403` (Forbidden):
    - Shows a toast indicating insufficient permissions.
    - Navigates to `/not-authorized` if not already there.
  - On `500` (Server Error):
    - Shows a generic “unexpected server error” toast.

### Error Handling Strategy

- At the global level, HTTP-layer errors are normalized via the Axios interceptor.
- At the page level, mutations:
  - On success: show role- and context-appropriate success toasts (e.g., “offer created successfully”).
  - On error: show concise localized error messages; where backend returns more detail, login and other flows display backend messages.

### Token Expiration Handling

- Expired tokens result in `401` from the backend:
  - The interceptor enforces a clean logout pattern:
    - Remove token.
    - Display a session-expired toast.
    - Redirect to login.
  - This prevents infinite error loops and ensures the user is not stuck on protected screens in an inconsistent state.

---

## 7. UX & UI Enhancements

### Animations

- Page-level transitions:
  - `Layout` wraps `Outlet` in `AnimatePresence` and `motion.div`, giving route changes a short fade/slide transition.
- Modal animations:
  - `Modal` uses Framer Motion to animate overlay opacity and modal scale/position.
- All animations are short and subtle to maintain responsiveness.

### Loading States

- Every data-driven page includes clear loading indicators:
  - Offers, Requests, Matches, Users, Notifications, Audit Logs, and Dashboard charts show textual “loading…” messages inside appropriately styled cards.
  - ProtectedRoute shows a full-screen neutral loading state while auth context is resolving the current session.

### Empty States

- Tables and lists display user-friendly empty states:
  - `Table` component shows a single row with centered Arabic text when `data` is empty.
  - Users, Notifications, Audit Logs, and Dashboard charts show inline empty messages like “لا توجد بيانات…” when no records are available.

### Form Validation Rules

- HTML-level: `required`, `type="number"`, and `type="email"` attributes where applicable.
- Logical-level:
  - Offers:
    - `areaFrom` must be less than or equal to `areaTo` when both numbers are provided.
    - `priceFrom` must be less than or equal to `priceTo`.
  - Requests:
    - Same logic for `areaFrom`/`areaTo` and `budgetFrom`/`budgetTo`.
  - On violation, a toast explains the constraint and the mutation is not triggered.

### Preventing Double Submissions

- Login, Offers, Requests, Users, Matches, Notifications:
  - Use React Query mutation `isPending` or local `submitting` flags.
  - Submit buttons are disabled while an operation is in progress.
  - Button text changes to reflect the in-progress state (e.g., “جاري الحفظ...”).

### Confirmation Dialogs

- Offers and Requests deletes:
  - Use `window.confirm` to require explicit user confirmation before deleting items.

### Toast Notifications

- Sonner:
  - Global success notifications for create/update/delete actions.
  - Error notifications for failed mutations and unexpected server errors.
  - Auth-related messages (session expiration, forbidden access) triggered by the Axios interceptor.

---

## 8. Security & Robustness

### Expired Tokens

- Explicit handling via the Axios response interceptor:
  - Clear token and context.
  - Redirect to login with explanation.
  - Prevents unauthorized calls from quietly failing or leaving the UI in an inconsistent state.

### Unauthorized Access Prevention

- At the UI level:
  - `RoleGuard` prevents rendering pages for disallowed roles.
  - Sidebar omits links that the current user cannot use.
- At the network level:
  - 403 responses trigger a redirect to the Not Authorized page, with a toast.
- Combined with backend checks, this enforces a defense-in-depth approach.

### Environment Variable Usage

- API base URL is configurable via `VITE_API_URL`:
  - Enables different environments (development, staging, production) without code changes.
  - Local default ensures the app works out-of-the-box for local development.

---

## 9. Known Limitations or Future Improvements

- **Filtering and search**:
  - Basic filters exist only for audit logs and matches (status).
  - Future improvements could add filter bars for offers/requests (city, type, price/area ranges) and integrate them with backend query params.
- **Pagination**:
  - Current tables assume moderate dataset sizes and do not include pagination or infinite scrolling.
  - Adding pagination with React Query and backend support would improve scalability.
- **Form UX**:
  - Could integrate a dedicated form library (e.g. React Hook Form) for more complex validation, error messages per-field, and better accessibility.
- **Dark mode**:
  - Layout and components are structured with Tailwind so that dark mode classes could be added later, but a full dark mode toggle and theme persistence are not yet implemented.
- **Optimistic updates**:
  - Currently most mutations rely on invalidation and refetch; future optimization could use optimistic updates for snappier interactions (e.g. status changes in matches, marking notifications read).

---

## 10. Final Notes

The frontend is now a cohesive, production-style SaaS dashboard for real estate matching, with complete CRUD for offers and requests, match lifecycle management, analytics, notifications, user administration (for admins), audit logs, and reports export.  
It uses modern React patterns (React Query, context, Tailwind, Framer Motion, Sonner) and enforces strict RBAC at navigation, routing, and action levels, while handling errors and expired tokens gracefully.  
This implementation is suitable both as a production foundation (with appropriate backend hardening and deployment configuration) and as a strong portfolio piece demonstrating full-stack frontend integration and UX craftsmanship.***

