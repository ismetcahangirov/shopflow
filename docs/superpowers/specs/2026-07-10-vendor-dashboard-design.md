# Vendor Dashboard + Scoping Fixes — Design (Issue #79)

**Date:** 2026-07-10
**Branch:** `feat/m79-vendor-dashboard`
**Issue:** #79 — feat(vendor): Fully-functional vendor dashboard + scoping fixes

## Goal

Turn the vendor area into a fully-functional, **vendor-scoped** dashboard: rich
dashboard (charts, recent orders, low-stock, top products, approval banner),
correct order scoping (no cross-vendor leakage), an editable store settings page,
and a vendor analytics page. Fix the two scoping bugs and the dead nav links.

## Approved decisions

1. **Backend:** add dedicated `/vendors/me/*` endpoints scoped by `vendorId`.
   Leave the admin global endpoints (`getDashboard`, `getOrders`) untouched — zero
   admin-regression risk.
2. **Route mismatch:** rename the store page `/vendor/store` → `/vendor/settings`
   to match the existing `vendorNavItems` entry.
3. **Analytics:** build a real `/vendor/analytics` page (mirrors admin analytics).
4. **Logo/banner:** real Cloudinary uploads via `POST /vendors/me/logo` and
   `POST /vendors/me/banner`, reusing the `uploadImage` + `uploadToCloudinary`
   avatar pattern.

## Backend

All new handlers live in `server/src/controllers/vendorController.ts` and are
mounted in `server/src/routes/vendorRoutes.ts` behind `protect` +
`requireApprovedVendor`. A small private helper resolves the caller's vendor id:

```
resolveVendorId(userId) -> vendor.id  (404 VENDOR_NOT_FOUND if none)
```

### 1. `GET /vendors/me/dashboard`
Vendor-scoped analogue of the admin dashboard. Query: `?period` (days, 1–365,
default 30). Returns:

```jsonc
{
  "summary": { "totalProducts", "totalOrders", "totalRevenue", "pendingOrders", "avgRating", "avgOrderValue" },
  "revenueChart": [ { "date", "revenue", "orders" } ],      // PAID order_items grouped by day
  "topProducts":  [ { "id", "name", "salesCount", "revenue" } ],  // top 10 by revenue
  "lowStockProducts": [ { "id", "name", "stock", "lowStockAlert" } ], // stock <= lowStockAlert
  "recentOrders": [ { "id", "orderNumber", "vendorSubtotal", "status", "createdAt", "user": { "name" } } ],
  "ordersByStatus": { "PENDING": n, ... }
}
```

Scoping: every aggregate joins `order_items -> products` and filters
`products."vendorId" = <id>`. Revenue/top-products use `order.paymentStatus = 'PAID'`.
Raw SQL uses **quoted camelCase** column names (`"vendorId"`, `"createdAt"`,
`"paymentStatus"`, `"productId"`, `"orderId"`) — the DB columns are camelCase.

### 2. `GET /vendors/me/orders`
Query: `?page&limit&status`. Returns orders that contain at least one of the
vendor's products, each row carrying a **vendor subtotal** (sum of the vendor's
own `order_items.total`) — not the full order total. Shape reuses the existing
`OrderListItem` fields plus `vendorSubtotal` and `vendorItemCount`. Paginated
`{ page, limit, total, pages }`. Optional `status` filters `order.status`.

Implementation: filter `prisma.order.findMany` by
`items: { some: { product: { vendorId } } }`, `include` only the vendor's items
(`where: { product: { vendorId } }`) to compute the subtotal, order by
`createdAt desc`.

### 3. `GET /vendors/me/analytics/sales`
Query: `?startDate&endDate&groupBy(day|month|year)`. Same shape as
`getSalesChart` (`[{ period, revenue, orders }]`) but scoped to the vendor's
order_items. Raw SQL, quoted camelCase columns.

### 4. `POST /vendors/me/logo` + `POST /vendors/me/banner`
`uploadImage.single('logo'|'banner')` → `uploadToCloudinary(buffer, 'vendors')`
→ persist `secure_url` to `vendor.logo` / `vendor.banner` → return updated vendor.
Requires Cloudinary env creds (already used by avatar/product images).

### Validators
Add `getVendorOrdersValidators` (page/limit/status) and
`getVendorSalesValidators` (startDate/endDate/groupBy) in
`server/src/validators/vendorValidators.ts`, mirroring the order/analytics
validators.

## Frontend

### Hooks — `client/src/hooks/useVendor.ts`
- `useVendorDashboard(period)` → `VendorDashboardData`
- `useVendorOrders({ page, limit, status })` → `ApiResponse<VendorOrderListItem[]>`
- `useVendorSales({ startDate, endDate, groupBy })` → `SalesPoint[]`
- `useUpdateMyVendor()` → `PUT /vendors/me` (mutation, invalidates `['vendor']`)
- `useUploadVendorLogo()` / `useUploadVendorBanner()` → multipart mutations

### Pages
- **`/vendor` (dashboard)** — keep 4 KPI cards + pending alert; add: approval
  banner when `vendor.status !== 'APPROVED'`; revenue/orders `TimeSeriesChart`
  (via `ChartCard`); recent orders table (links to `/vendor/orders`); low-stock
  list; top-products list. Loading skeletons, empty + error states per app
  pattern. Reuse `StatCard`, `ChartCard`, `TimeSeriesChart`.
- **`/vendor/orders`** — point at `useVendorOrders`; show `vendorSubtotal`; add
  status-filter tabs + pagination mirroring the customer `OrderList` UX. Links to
  `/vendor/orders/[id]` (order detail reuses existing `useOrder`, which is
  owner-or-admin — vendor viewing is acceptable read; if `GET /orders/:id` blocks
  vendors, link to the shared order view instead). Verify during implementation.
- **`/vendor/settings`** (moved from `/vendor/store`) — read-only stats block
  (commission, total sales, slug, product count) **plus** an edit form bound to
  `PUT /vendors/me`: storeName, description, phone, address; logo + banner file
  upload. Success toast (`store_saved`). Keep the approval banner.
- **`/vendor/analytics`** (new) — date-range inputs + `groupBy` select; revenue
  and orders `TimeSeriesChart`s via `useVendorSales`; top-products list. Mirrors
  `admin/analytics/page.tsx`.

### Nav / routing
`vendorNavItems` already points to `/vendor/settings` and `/vendor/analytics`; no
change needed once the page is moved and the analytics page exists. Delete the old
`/vendor/store` directory.

### i18n
Add keys to the `vendor` namespace in **all three** `client/messages/{az,en,ru}.json`:
`recent_orders`, `low_stock`, `top_products`, `revenue_trend`, `orders_trend`,
`edit_store`, `store_saved`, `save`, `saving`, `store_name`, `description`,
`phone`, `address`, `logo`, `banner`, `upload`, `no_recent_orders`,
`no_low_stock`, `no_top_products`, `analytics`, `sales_over_time`,
`approval_required`, `approval_required_desc`, `vendor_subtotal`, `date_from`,
`date_to`, `group_by`, `group_day`, `group_month`, `group_year`, plus any order
status/filter keys reused from the `orders` namespace.

## Testing

- **Server:** Jest + supertest. New tests for the three GET endpoints asserting
  vendor scoping (a second vendor's orders/products must not appear) and the
  upload handlers (mock Cloudinary). Follows `server/src/tests/*` helpers
  (`createTestUser`, `getBearerToken`, cleanup). ⚠️ Server tests wipe the DB —
  run only against the test DB (`NODE_ENV=test`).
- **Client:** Vitest + RTL. Tests for the dashboard (renders KPIs + charts +
  sections, loading/error), the store edit form (submits `PUT /vendors/me`), and
  the orders page (scoped hook, filter). Mock hooks + chart components per the
  existing `AdminDashboardPage.test.tsx` convention.
- **E2E:** Playwright MCP against a locally-run backend — log in as an approved
  vendor, load `/vendor`, `/vendor/orders`, `/vendor/settings`, `/vendor/analytics`,
  edit the store, verify persistence and no cross-vendor leakage.

## Acceptance criteria (from #79)
- [ ] `/vendor` shows KPIs + revenue trend + recent (scoped) orders + low-stock +
  top products + approval banner.
- [ ] Vendor Orders shows only the vendor's orders, with filter + pagination.
- [ ] Vendor can edit store details and see them persist.
- [ ] `/vendor/analytics` works; `/vendor/settings` mismatch resolved.
- [ ] All vendor pages VENDOR-guarded, responsive, dark-mode, az/en/ru.
- [ ] Backend scoping bugs fixed.
- [ ] lint + client test + server test + `next build` green; new tests added.

## Out of scope (follow-up)
- Collapsible shadcn `Sidebar` shell for `vendor/layout.tsx` (issue §5, optional).
- Changing the admin global endpoints' behavior.
