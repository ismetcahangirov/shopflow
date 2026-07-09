# Vendor Dashboard + Scoping Fixes — Implementation Plan (#79)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the vendor area fully functional with vendor-scoped dashboard, orders, analytics, and an editable store page; fix the order/analytics scoping bugs.

**Architecture:** Add dedicated `/vendors/me/*` endpoints scoped by `vendorId` (admin globals untouched). Frontend reuses existing `StatCard`/`ChartCard`/`TimeSeriesChart` and mirrors the admin dashboard/analytics pages. Route `/vendor/store` → `/vendor/settings`.

**Tech Stack:** Express + Prisma + PostgreSQL (camelCase columns, raw SQL quoted); Next.js App Router + React Query + next-intl + recharts; Jest/supertest (server), Vitest/RTL (client), Playwright MCP (e2e).

**Ordering note:** Order-detail links from the vendor orders page are intentionally omitted — `GET /orders/:id` is owner-or-admin and would either 403 for vendors or leak other vendors' items. Vendor order rows are self-contained (order #, date, vendor subtotal, status).

---

## Phase A — Backend (`/vendors/me/*`)

### Task A1: Vendor dashboard endpoint

**Files:**
- Modify: `server/src/controllers/vendorController.ts` (add `getMyVendorDashboard` + private `resolveVendorId`)
- Modify: `server/src/routes/vendorRoutes.ts`
- Test: `server/src/tests/vendorDashboard.test.ts`

- [ ] **Step 1 — Write failing test** asserting: approved vendor gets `summary`, `revenueChart`, `topProducts`, `lowStockProducts`, `recentOrders`, `ordersByStatus`; a second vendor's product/order does NOT appear in the first vendor's data.
- [ ] **Step 2 — Run:** `cd server && npx jest vendorDashboard -i` → FAIL (route 404).
- [ ] **Step 3 — Implement** `getMyVendorDashboard`:
  - `resolveVendorId(userId)`: `prisma.vendor.findUnique({ where:{userId}, select:{id:true} })`, throw `AppError(...,404,'VENDOR_NOT_FOUND')`.
  - Reuse the `getMyVendorStats` aggregates for `summary` (totalProducts, totalOrders, totalRevenue, pendingOrders, avgRating, avgOrderValue).
  - `revenueChart` raw SQL (quoted camelCase):
    ```sql
    SELECT DATE(o."createdAt") as date, SUM(oi.total) as revenue, COUNT(DISTINCT o.id)::int as orders
    FROM order_items oi
    JOIN products p ON p.id = oi."productId"
    JOIN orders o ON o.id = oi."orderId"
    WHERE p."vendorId" = ${vendorId} AND o."paymentStatus" = 'PAID' AND o."createdAt" >= ${since}
    GROUP BY DATE(o."createdAt") ORDER BY date ASC
    ```
  - `topProducts` raw SQL: same joins, `GROUP BY p.id, p.name ORDER BY revenue DESC LIMIT 10`, select `SUM(oi.quantity)::int as sales_count`.
  - `lowStockProducts`: `prisma.product.findMany({ where:{ vendorId, isActive:true }, select:{id,name,stock,lowStockAlert} })` then filter `stock <= lowStockAlert` in JS (or raw `WHERE stock <= "lowStockAlert"`), take 10.
  - `recentOrders`: `prisma.order.findMany({ where:{ items:{ some:{ product:{ vendorId } } } }, include:{ user:{select:{name:true}}, items:{ where:{ product:{ vendorId } }, select:{ total:true } } }, orderBy:{createdAt:'desc'}, take:10 })`; map each to `{ id, orderNumber, vendorSubtotal: sum(items.total), status, createdAt, user }`.
  - `ordersByStatus`: `prisma.order.groupBy({ by:['status'], where:{ items:{ some:{ product:{ vendorId } } } }, _count:{status:true} })` → `Object.fromEntries`.
  - Convert all Decimals via `Number(...)`.
- [ ] **Step 4 — Route:** `router.get('/me/dashboard', requireApprovedVendor, getMyVendorDashboard);`
- [ ] **Step 5 — Run test** → PASS. **Commit** `feat(vendor): vendor-scoped dashboard endpoint`.

### Task A2: Vendor orders endpoint

**Files:**
- Modify: `server/src/controllers/vendorController.ts` (`getMyVendorOrders`)
- Modify: `server/src/validators/vendorValidators.ts` (`getVendorOrdersValidators`)
- Modify: `server/src/routes/vendorRoutes.ts`
- Test: `server/src/tests/vendorOrders.test.ts`

- [ ] **Step 1 — Failing test:** approved vendor sees only orders containing their products; `vendorSubtotal` equals the sum of that vendor's items (not the full order total); a foreign order is absent; pagination shape present; `?status` filters.
- [ ] **Step 2 — Run** → FAIL.
- [ ] **Step 3 — Implement**: `page/limit/status` from query; `where = { items:{ some:{ product:{ vendorId } } } }`, add `status` if valid enum. `findMany` with `include:{ user:{select:{id,name,email}}, items:{ where:{ product:{ vendorId } }, select:{ total:true, quantity:true } } }`, `orderBy createdAt desc`, skip/take. Map to `{ id, orderNumber, status, paymentStatus, createdAt, vendorSubtotal: sum(items.total), vendorItemCount: sum(items.quantity) }`. `count` with same where. Respond with `pagination`.
- [ ] **Step 4 — Validators:** `getVendorOrdersValidators` = page/limit int, status optional trim.
- [ ] **Step 5 — Route:** `router.get('/me/orders', requireApprovedVendor, getVendorOrdersValidators, validateRequest, getMyVendorOrders);`
- [ ] **Step 6 — Run** → PASS. **Commit** `feat(vendor): vendor-scoped orders endpoint`.

### Task A3: Vendor sales analytics endpoint

**Files:**
- Modify: `server/src/controllers/vendorController.ts` (`getMyVendorSales`)
- Modify: `server/src/validators/vendorValidators.ts` (`getVendorSalesValidators`)
- Modify: `server/src/routes/vendorRoutes.ts`
- Test: `server/src/tests/vendorSales.test.ts`

- [ ] **Step 1 — Failing test:** returns `[{period,revenue,orders}]` scoped to vendor; foreign vendor sales excluded; `groupBy=month` works.
- [ ] **Step 2 — Run** → FAIL.
- [ ] **Step 3 — Implement** like `getSalesChart` but joined to `order_items`/`products` filtered `p."vendorId" = ${vendorId}`; `revenue = SUM(oi.total)`, `orders = COUNT(DISTINCT o.id)`; day/month/year via `DATE()`/`DATE_TRUNC`. Map periods to ISO.
- [ ] **Step 4 — Validators + route** `GET /me/analytics/sales`.
- [ ] **Step 5 — Run** → PASS. **Commit** `feat(vendor): vendor-scoped sales analytics endpoint`.

### Task A4: Logo/banner upload endpoints

**Files:**
- Modify: `server/src/controllers/vendorController.ts` (`uploadVendorLogo`, `uploadVendorBanner`)
- Modify: `server/src/routes/vendorRoutes.ts`
- Test: `server/src/tests/vendorUpload.test.ts` (mock `uploadToCloudinary`)

- [ ] **Step 1 — Failing test** with `jest.mock('../middleware/uploadMiddleware')` returning a fake `secure_url`; assert vendor.logo persisted; 400 when no file.
- [ ] **Step 2 — Run** → FAIL.
- [ ] **Step 3 — Implement**: `if (!req.file) throw AppError('Fayl tələb olunur',400,'NO_FILE')`; `const { secure_url } = await uploadToCloudinary(req.file.buffer, 'vendors')`; update `vendor.logo`/`vendor.banner`; return updated vendor (Decimal→Number). Factor a shared `uploadVendorImage(field)`.
- [ ] **Step 4 — Routes:** `router.post('/me/logo', requireApprovedVendor, uploadImage.single('logo'), uploadVendorLogo);` and banner.
- [ ] **Step 5 — Run** → PASS. **Commit** `feat(vendor): store logo/banner upload endpoints`.

---

## Phase B — Frontend hooks

### Task B1: Extend `useVendor.ts`

**Files:** Modify `client/src/hooks/useVendor.ts`. Test: `client/src/hooks/useVendor.test.tsx` (optional; covered via page tests).

- [ ] Add types `VendorDashboardData`, `VendorOrderListItem`, and hooks:
  - `useVendorDashboard(period=30)` → GET `/vendors/me/dashboard?period`.
  - `useVendorOrders({page,limit,status})` → GET `/vendors/me/orders` returning `ApiResponse<VendorOrderListItem[]>` (keep pagination envelope).
  - `useVendorSales({startDate,endDate,groupBy})` → GET `/vendors/me/analytics/sales` (reuse `SalesPoint` from `useAnalytics`).
  - `useUpdateMyVendor()` → PUT `/vendors/me`; invalidates `['vendor']`.
  - `useUploadVendorLogo()` / `useUploadVendorBanner()` → multipart POST (FormData, `Content-Type: multipart/form-data`); invalidates `['vendor']`.
- [ ] **Commit** `feat(vendor): react-query hooks for dashboard/orders/analytics/store`.

---

## Phase C — Frontend pages

### Task C1: Enhance `/vendor` dashboard

**Files:** Modify `client/src/app/[locale]/vendor/page.tsx`. Test: `client/src/app/[locale]/vendor/VendorDashboardPage.test.tsx`.

- [ ] **Step 1 — Failing test** (mock `useVendorDashboard`, `useMyVendor`, chart comps): renders 4 KPI cards, revenue `ChartCard`, recent-orders section, low-stock section, top-products section; approval banner shown when `status!=='APPROVED'`; loading + error states.
- [ ] **Step 2 — Run** `npx vitest run VendorDashboardPage` → FAIL.
- [ ] **Step 3 — Implement**: keep KPI cards (feed from `dashboard.summary`), add approval banner (from `useMyVendor().status`), `ChartCard`+`TimeSeriesChart` for `revenueChart` (xKey `date`, yKey `revenue`), recent-orders list (orderNumber/date/vendorSubtotal/status badge), low-stock list, top-products list. Skeletons + `ErrorState` + empty states.
- [ ] **Step 4 — Run** → PASS. **Commit** `feat(vendor): rich dashboard (charts, recent orders, low stock, top products, approval banner)`.

### Task C2: Fix `/vendor/orders`

**Files:** Modify `client/src/app/[locale]/vendor/orders/page.tsx`. Test: `client/src/app/[locale]/vendor/VendorOrdersPage.test.tsx`.

- [ ] **Step 1 — Failing test:** uses `useVendorOrders`, renders vendor rows with `vendorSubtotal`, status-filter tabs change query, pagination controls; empty/error states.
- [ ] **Step 2 — Run** → FAIL.
- [ ] **Step 3 — Implement**: `useState` for `status` + `page`; status-filter tabs mirroring customer `OrderList` (reuse `ORDER_FILTER_STATUSES`); rows show `#orderNumber`, date, `vendorSubtotal` AZN, status badge (no detail link); pagination prev/next from `ApiResponse.pagination`.
- [ ] **Step 4 — Run** → PASS. **Commit** `fix(vendor): scope orders to vendor + filter/pagination`.

### Task C3: Move store → settings + edit form

**Files:**
- Create: `client/src/app/[locale]/vendor/settings/page.tsx`
- Delete: `client/src/app/[locale]/vendor/store/page.tsx` (and dir)
- Test: `client/src/app/[locale]/vendor/VendorSettingsPage.test.tsx`

- [ ] **Step 1 — Failing test:** renders read-only stats + an edit form; submitting calls `useUpdateMyVendor().mutate` with the edited fields; shows `store_saved` on success; logo/banner file inputs call upload hooks.
- [ ] **Step 2 — Run** → FAIL.
- [ ] **Step 3 — Implement**: form (storeName, description, phone, address) seeded from `useMyVendor`; submit → `useUpdateMyVendor`; logo/banner `<input type=file accept=image/*>` → `useUploadVendorLogo/Banner`; keep read-only commission/totalSales/slug/productCount block + approval banner; success toast.
- [ ] **Step 4 — Delete** old `/vendor/store` dir.
- [ ] **Step 5 — Run** → PASS. **Commit** `feat(vendor): editable store settings at /vendor/settings`.

### Task C4: New `/vendor/analytics`

**Files:** Create `client/src/app/[locale]/vendor/analytics/page.tsx`. Test: `client/src/app/[locale]/vendor/VendorAnalyticsPage.test.tsx`.

- [ ] **Step 1 — Failing test:** date-range inputs + groupBy select; renders revenue & orders `TimeSeriesChart` from `useVendorSales`; summary cards; loading/empty/error.
- [ ] **Step 2 — Run** → FAIL.
- [ ] **Step 3 — Implement** mirroring `admin/analytics/page.tsx` but with `useVendorSales`; summary cards computed from points; top-products optional via `useVendorDashboard`.
- [ ] **Step 4 — Run** → PASS. **Commit** `feat(vendor): vendor analytics page`.

---

## Phase D — i18n + verification

### Task D1: i18n keys (az/en/ru)
- [ ] Add all new `vendor` keys (see spec) to `client/messages/{az,en,ru}.json`. Keep JSON valid; translate az (primary), en, ru.
- [ ] **Commit** `i18n(vendor): dashboard/orders/settings/analytics keys (az/en/ru)`.

### Task D2: Full verification
- [ ] `cd server && npm run lint && npm run build` → green.
- [ ] `cd server && NODE_ENV=test npm test` (test DB only!) → green.
- [ ] `cd client && npm run lint && npx vitest run && npm run build` → green.
- [ ] Fix any failures; **commit** fixes.

### Task D3: E2E (Playwright MCP, local backend)
- [ ] Run backend + client locally; log in as an approved vendor; visit `/vendor`, `/vendor/orders`, `/vendor/settings`, `/vendor/analytics`; edit store + verify persistence; confirm no cross-vendor leakage. Screenshot each.

---

## Self-review notes
- **Spec coverage:** dashboard (C1), orders scoping (A2/C2), store edit (A4/C3), analytics (A3/C4), route mismatch (C3 + nav already correct), i18n (D1), tests (each task), scoping bug fixes (A1–A3 dedicated endpoints; admin globals untouched — the "leak" is closed by pointing vendors at scoped endpoints). ✅
- **Order detail link:** intentionally dropped to avoid 403/leak (documented above). Deviation from issue's "link to order detail" — noted in PR.
- **Cloudinary:** upload endpoints need creds; text fields still work without. Store-edit e2e focuses on text persistence if creds absent.
