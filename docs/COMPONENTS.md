# COMPONENTS.md — Komponent Kataloqu

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Komponent Strukturu

```
src/components/
│
├── common/              ← Universal — hər yerdə istifadə olunur
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Spinner.tsx
│   ├── Skeleton.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   ├── ErrorBoundary.tsx
│   ├── Pagination.tsx
│   └── ConfirmDialog.tsx
│
├── layout/              ← Səhifə quruluşu
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── AdminSidebar.tsx
│   ├── VendorSidebar.tsx
│   ├── BottomTabs.tsx
│   ├── Breadcrumb.tsx
│   └── ProtectedRoute.tsx
│
├── shop/                ← Mağaza xüsusi komponentlər
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductFilters.tsx
│   ├── ProductImages.tsx
│   ├── ProductSchema.tsx
│   ├── CartItem.tsx
│   ├── CartSummary.tsx
│   ├── CheckoutForm.tsx
│   ├── StripePayment.tsx
│   ├── ReviewCard.tsx
│   ├── ReviewForm.tsx
│   ├── StarRating.tsx
│   └── CouponInput.tsx
│
└── ui/                  ← Panel UI elementləri
    ├── StatCard.tsx
    ├── DataTable.tsx
    ├── PageHeader.tsx
    ├── SearchBar.tsx
    ├── PriceRange.tsx
    └── LanguageSwitcher.tsx
```

---

## 2. Common Komponentlər

---

### Button

Bütün düymə variantları üçün vahid komponent.

**Fayl:** `src/components/common/Button.tsx`

**Props:**

| Prop | Tip | Default | Açıqlama |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost' \| 'outline'` | `'primary'` | Görünüş variantı |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Ölçü |
| `isLoading` | `boolean` | `false` | Yüklənmə vəziyyəti |
| `disabled` | `boolean` | `false` | Deaktiv vəziyyət |
| `fullWidth` | `boolean` | `false` | Tam en tutması |
| `icon` | `ReactNode` | — | Sol tərəfdə ikon |
| `iconRight` | `ReactNode` | — | Sağ tərəfdə ikon |
| `onClick` | `() => void` | — | Klik hadisəsi |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML tipi |
| `className` | `string` | — | Əlavə Tailwind sinifləri |

**İmplementasiya:**

```typescript
// src/components/common/Button.tsx

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn }      from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?:      'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?:      ReactNode;
  iconRight?: ReactNode;
}

const variants = {
  primary:   'bg-accent hover:bg-accent-dark text-white',
  secondary: 'bg-primary hover:bg-primary-dark text-white',
  danger:    'bg-red-500 hover:bg-red-600 text-white',
  ghost:     'bg-transparent hover:bg-gray-100 text-gray-700',
  outline:   'border border-gray-300 hover:bg-gray-50 text-gray-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary', size = 'md', isLoading = false,
  fullWidth = false, icon, iconRight, disabled,
  className, children, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-colors duration-200 focus:outline-none focus:ring-2',
        'focus:ring-accent focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size],
        fullWidth && 'w-full', className
      )}
      {...props}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
      {!isLoading && iconRight}
    </button>
  );
}
```

**İstifadə:**

```tsx
// Səbətə əlavə et
<Button variant="primary" icon={<ShoppingCart size={16} />} onClick={addToCart}>
  Səbətə əlavə et
</Button>

// Yüklənmə vəziyyəti
<Button isLoading={isSubmitting} fullWidth type="submit">
  Sifarişi Tamamla
</Button>

// Silmə
<Button variant="danger" icon={<Trash2 size={16} />} onClick={onDelete}>
  Sil
</Button>

// Filter sıfırlama
<Button variant="ghost" size="sm" onClick={clearFilters}>
  Filterləri Sıfırla
</Button>
```

---

### Input

Form inputları — label, xəta mesajı, ikon daxil.

**Fayl:** `src/components/common/Input.tsx`

**Props:**

| Prop | Tip | Default | Açıqlama |
|---|---|---|---|
| `label` | `string` | — | Input üzərindəki etiket |
| `error` | `string` | — | Xəta mesajı (qırmızı) |
| `hint` | `string` | — | Köməkçi mətn (boz) |
| `leftIcon` | `ReactNode` | — | Sol ikon |
| `rightIcon` | `ReactNode` | — | Sağ ikon |
| `required` | `boolean` | `false` | Məcburi sahə ulduz işarəsi |
| `fullWidth` | `boolean` | `true` | Tam en |

```tsx
// Email inputu
<Input
  label="Email"
  type="email"
  leftIcon={<Mail size={16} />}
  placeholder="ali@example.com"
  error={errors.email?.message}
  required
  {...register('email')}
/>

// Axtarış inputu
<Input
  placeholder="Məhsul axtar..."
  leftIcon={<Search size={16} />}
  rightIcon={query && <X size={16} className="cursor-pointer" onClick={clear} />}
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>
```

---

### Badge

Status, kateqoriya, stok etiketləri.

**Fayl:** `src/components/common/Badge.tsx`

**Props:**

| Prop | Tip | Default | Açıqlama |
|---|---|---|---|
| `variant` | `'success' \| 'warning' \| 'error' \| 'info' \| 'neutral'` | `'neutral'` | Rəng |
| `size` | `'sm' \| 'md'` | `'md'` | Ölçü |
| `dot` | `boolean` | `false` | Sol nöqtə |

```tsx
// Sifariş statusu
<Badge variant="success">Çatdırıldı</Badge>
<Badge variant="warning">Göndərildi</Badge>
<Badge variant="error">Ləğv edildi</Badge>
<Badge variant="info">Gözləyir</Badge>

// Stok vəziyyəti
<Badge variant={product.stock > 0 ? 'success' : 'error'}>
  {product.stock > 0 ? `${product.stock} ədəd` : 'Stokda yoxdur'}
</Badge>

// Vendor statusu (nöqtə ilə)
<Badge variant="warning" dot>Gözləyir</Badge>
<Badge variant="success" dot>Təsdiqlənib</Badge>
```

---

### Modal

Dialoq, forma, təsdiq modal-ları.

**Fayl:** `src/components/common/Modal.tsx`

**Props:**

| Prop | Tip | Default | Açıqlama |
|---|---|---|---|
| `isOpen` | `boolean` | — | Açıq/bağlı |
| `onClose` | `() => void` | — | Bağlama funksiyası |
| `title` | `string` | — | Başlıq |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Modal eni |
| `footer` | `ReactNode` | — | Alt hissə (düymələr) |
| `closeOnBackdrop` | `boolean` | `true` | Kənarı klikdə bağla |

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Yeni Məhsul"
  size="lg"
  footer={
    <div className="flex gap-2 justify-end">
      <Button variant="ghost" onClick={onClose}>Ləğv et</Button>
      <Button type="submit" form="product-form" isLoading={isSubmitting}>
        Yadda saxla
      </Button>
    </div>
  }
>
  <ProductForm id="product-form" onSuccess={onClose} />
</Modal>
```

---

### ConfirmDialog

Silmə, ləğv etmə kimi təhlükəli əməliyyatlar.

**Fayl:** `src/components/common/ConfirmDialog.tsx`

**Props:**

| Prop | Tip | Default | Açıqlama |
|---|---|---|---|
| `isOpen` | `boolean` | — | — |
| `onClose` | `() => void` | — | — |
| `onConfirm` | `() => void` | — | Təsdiq funksiyası |
| `title` | `string` | — | Başlıq |
| `message` | `string` | — | Açıqlama |
| `confirmLabel` | `string` | `'Sil'` | Təsdiq düyməsi |
| `isLoading` | `boolean` | `false` | — |
| `variant` | `'danger' \| 'warning'` | `'danger'` | Rəng |

```tsx
<ConfirmDialog
  isOpen={deleteOpen}
  onClose={() => setDeleteOpen(false)}
  onConfirm={handleDelete}
  title="Məhsulu Sil"
  message="Bu əməliyyat geri alına bilməz. Davam etmək istəyirsiniz?"
  confirmLabel="Bəli, Sil"
  isLoading={isDeleting}
/>
```

---

### Skeleton

Yüklənmə zamanı UI placeholder-lar.

**Fayl:** `src/components/common/Skeleton.tsx`

```typescript
// Bazis skeleton
<Skeleton className="h-4 w-3/4 rounded" />

// Məhsul kartı skeleton
export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 p-4 space-y-3">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

// Məhsul siyahısı skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Sifariş sətri skeleton
export function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-4 w-24 ml-auto" />
    </div>
  );
}
```

---

### EmptyState & ErrorState

```typescript
// EmptyState
interface EmptyStateProps {
  icon?:        ReactNode;
  title:        string;
  description?: string;
  action?:      { label: string; onClick: () => void };
}

// İstifadə nümunələri
<EmptyState
  icon={<Package size={48} className="text-gray-300" />}
  title="Məhsul tapılmadı"
  description="Axtarış kriteriyalarınıza uyğun məhsul yoxdur"
  action={{ label: 'Filteri Sıfırla', onClick: clearFilters }}
/>

<EmptyState
  icon={<ShoppingCart size={48} className="text-gray-300" />}
  title="Səbətiniz boşdur"
  action={{ label: 'Alış-verişə Başla', onClick: () => router.push('/products') }}
/>

<EmptyState
  icon={<Heart size={48} className="text-gray-300" />}
  title="İstək siyahınız boşdur"
  action={{ label: 'Məhsullara Bax', onClick: () => router.push('/products') }}
/>

// ErrorState
<ErrorState
  message="Məhsullar yüklənərkən xəta baş verdi"
  onRetry={() => refetch()}
/>
```

---

### Pagination

**Fayl:** `src/components/common/Pagination.tsx`

**Props:**

| Prop | Tip | Açıqlama |
|---|---|---|
| `page` | `number` | Cari səhifə |
| `totalPages` | `number` | Ümumi səhifə sayı |
| `onPageChange` | `(page: number) => void` | Callback |
| `showInfo` | `boolean` | "1-20 / 145 nəticə" mətni |
| `total` | `number` | Ümumi say |
| `limit` | `number` | Hər səhifədəki say |

```tsx
<Pagination
  page={page}
  totalPages={Math.ceil(total / limit)}
  onPageChange={setPage}
  showInfo
  total={total}
  limit={limit}
/>
// Çıxış: "← 1 2 3 ... 8 →  |  21-40 / 145 nəticə"
```

---

## 3. Layout Komponentləri

---

### Navbar

Public mağaza başlığı.

**Fayl:** `src/components/layout/Navbar.tsx`

**Xüsusiyyətlər:**
- Desktop: logo + kateqoriya dropdown + axtarış + [❤️][🛒][👤]
- Mobil: logo + [🔍][🛒]
- Scroll zamanı `sticky top-0` + kölgə
- Səbət sayğacı — `useCartStore()` real-time
- Dil dəyişdirici inteqrasiyası

```tsx
// Səbət sayğacı
function CartIcon() {
  const count = useCartStore(
    (s) => s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  return (
    <Link href="/cart" className="relative">
      <ShoppingCart size={22} />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-accent text-white
                         text-xs font-bold rounded-full w-5 h-5
                         flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
```

---

### Breadcrumb

SEO-friendly naviqasiya yolu + JSON-LD Schema.

**Fayl:** `src/components/layout/Breadcrumb.tsx`

```tsx
<Breadcrumb
  items={[
    { label: 'Ana Səhifə',  href: '/' },
    { label: 'Elektronika', href: '/category/elektronika' },
    { label: 'Telefonlar',  href: '/category/telefonlar' },
    { label: 'iPhone 15 Pro' },    // href yoxdur = cari səhifə
  ]}
/>
// → Avtomatik BreadcrumbList JSON-LD yaradır
```

---

### BottomTabs

Mobil müştəri naviqasiyası.

**Fayl:** `src/components/layout/BottomTabs.tsx`

```
[🏠 Ana]  [🔍 Axtar]  [❤️ İstək]  [👤 Hesab]
```

- Aktiv tab vurğulanır (`usePathname`)
- İstək siyahısı sayğacı
- Yalnız `(shop)` layout-da görünür, admin/vendor-da yoxdur

---

## 4. Shop Komponentləri

---

### ProductCard

Məhsul siyahısında hər kart.

**Fayl:** `src/components/shop/ProductCard.tsx`

**Props:**

| Prop | Tip | Açıqlama |
|---|---|---|
| `product` | `ProductSummary` | Məhsul məlumatı |
| `showWishlist` | `boolean` | ❤️ düyməsi |
| `priority` | `boolean` | LCP şəkili üçün priority=true |

```typescript
interface ProductSummary {
  id:            string;
  name:          string;
  slug:          string;
  price:         number;
  comparePrice?: number;
  brand?:        string;
  stock:         number;
  avgRating:     number;
  reviewCount:   number;
  isFeatured:    boolean;
  image:         { url: string; alt: string };
  category:      { name: string; slug: string };
}
```

**Xüsusiyyətlər:**
- `next/image` blur placeholder ilə
- Endirim faizi avtomatik hesablanır
- Stok = 0 → overlay "Stokda yoxdur"
- `isFeatured` → "Öne Çıxan" badge
- Hover-da "Səbətə əlavə et" düyməsi görünür
- SEO: `<Link>` — axtarış motorları crawl edir

```tsx
// Endirim faizi
const discountPercent = product.comparePrice
  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
  : 0;
```

---

### ProductFilters

Sol sidebar filterlər.

**Fayl:** `src/components/shop/ProductFilters.tsx`

**Props:**

| Prop | Tip | Açıqlama |
|---|---|---|
| `categories` | `Category[]` | Kateqoriya siyahısı |
| `brands` | `string[]` | Unikal brendlər |
| `onFilterChange` | `(filters: Filters) => void` | Callback |

**Xüsusiyyətlər:**
- URL `searchParams` ilə sinxronizasiya (SSR uyğun)
- Qiymət aralığı → ikili slider (`PriceRange`)
- Çoxlu brend → checkbox siyahısı
- Reytinq → ulduz seçici
- "Yalnız stokdakılar" checkbox
- "Filterləri Sıfırla" düyməsi

---

### ProductImages

Məhsul şəkil qalereyası.

**Fayl:** `src/components/shop/ProductImages.tsx`

**Props:**

| Prop | Tip | Açıqlama |
|---|---|---|
| `images` | `ProductImage[]` | Şəkillər |
| `productName` | `string` | SEO alt mətni |

**Xüsusiyyətlər:**
- Böyük əsas şəkil + alt thumbnail sətri
- Thumbnail klikdə əsas şəkil dəyişir
- Hover zoom effekti
- Mobil: swipe karusel

---

### CartItem

Səbətdəki hər məhsul sətri.

**Fayl:** `src/components/shop/CartItem.tsx`

**Props:**

| Prop | Tip | Açıqlama |
|---|---|---|
| `item` | `CartItemType` | Səbət elementi |
| `onQuantityChange` | `(id: string, qty: number) => void` | Miqdar dəyişmə |
| `onRemove` | `(id: string) => void` | Silmə |

**Xüsusiyyətlər:**
- `+` / `-` düymələri — max miqdar = stok
- Cəmi qiymət = miqdar × qiymət
- Silmə birbaşa (ConfirmDialog olmadan)

---

### CartSummary

Səbət cəmi bloku.

**Fayl:** `src/components/shop/CartSummary.tsx`

**Props:**

| Prop | Tip | Açıqlama |
|---|---|---|
| `items` | `CartItemType[]` | Səbət məhsulları |
| `coupon` | `CouponResult \| null` | Tətbiq edilmiş kupon |
| `onCheckout` | `() => void` | Checkout düyməsi |
| `isLoading` | `boolean` | — |

```
┌─────────────────────────────┐
│  Ara cəm:      ₼2,499.99   │
│  Çatdırılma:   ₼5.00       │
│  Endirim:      -₼250.00    │
│  ─────────────────────────  │
│  Ümumi:        ₼2,254.99   │
│                             │
│  [Sifarişi Tamamla →]      │
└─────────────────────────────┘
```

---

### CouponInput

Kupon kodu daxiletmə.

**Fayl:** `src/components/shop/CouponInput.tsx`

**Props:**

| Prop | Tip | Açıqlama |
|---|---|---|
| `onApply` | `(result: CouponResult) => void` | Uğurlu tətbiq |
| `onRemove` | `() => void` | Kuponu ləğv et |
| `orderTotal` | `number` | Minimum məbləq yoxlaması |

**Vəziyyətlər:**
- Boş → input + "Tətbiq et" düyməsi
- Yüklənir → spinner
- Uğurlu → `"SUMMER20 — 20% endirim ✓"` + "Ləğv et"
- Xəta → qırmızı mesaj

---

### StripePayment

Stripe Elements ödəniş komponenti.

**Fayl:** `src/components/shop/StripePayment.tsx`

**Props:**

| Prop | Tip | Açıqlama |
|---|---|---|
| `clientSecret` | `string` | Stripe PaymentIntent secret |
| `orderId` | `string` | Ödəniş sonrası təsdiq |
| `onSuccess` | `() => void` | Uğurlu ödəniş callback |

```tsx
{clientSecret && (
  <Elements stripe={stripePromise} options={{ clientSecret }}>
    <StripePayment
      clientSecret={clientSecret}
      orderId={orderId}
      onSuccess={() => router.push(`/order/success/${orderId}`)}
    />
  </Elements>
)}
```

---

### StarRating

Ulduz reytinqi — display və interaktiv rejim.

**Fayl:** `src/components/shop/StarRating.tsx`

**Props:**

| Prop | Tip | Default | Açıqlama |
|---|---|---|---|
| `rating` | `number` | — | Reytinq (0-5) |
| `count` | `number` | — | Rəy sayı |
| `interactive` | `boolean` | `false` | Klik ilə seçilə bilər |
| `onChange` | `(r: number) => void` | — | İnteraktiv üçün |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Ölçü |

```tsx
// Display rejimi — məhsul kartında
<StarRating rating={4.8} count={124} size="sm" />
// → ★★★★★ 4.8 (124 rəy)

// İnteraktiv — rəy formasında
<StarRating
  rating={selectedRating}
  interactive
  onChange={setSelectedRating}
  size="lg"
/>
```

---

## 5. UI Komponentləri (Panel)

---

### StatCard

Admin/Vendor dashboard KPI kartları.

**Fayl:** `src/components/ui/StatCard.tsx`

**Props:**

| Prop | Tip | Açıqlama |
|---|---|---|
| `title` | `string` | Göstəricinin adı |
| `value` | `string \| number` | Əsas dəyər |
| `icon` | `ReactNode` | Lucide ikon |
| `change` | `number` | Dəyişmə % (+/-) |
| `changeLabel` | `string` | "keçən aya nisbətən" |
| `color` | `'blue' \| 'green' \| 'orange' \| 'purple'` | Ikon rəngi |

```tsx
<StatCard
  title="Ümumi Gəlir"
  value="₼125,480"
  icon={<DollarSign />}
  change={+12.5}
  changeLabel="keçən aya nisbətən"
  color="green"
/>
<StatCard
  title="Yeni Sifarişlər"
  value={89}
  icon={<ShoppingBag />}
  change={-3.2}
  color="blue"
/>
```

---

### DataTable

Admin/Vendor panel üçün məlumat cədvəli.

**Fayl:** `src/components/ui/DataTable.tsx`

**Props:**

| Prop | Tip | Açıqlama |
|---|---|---|
| `columns` | `Column<T>[]` | Sütun konfiqurasiyası |
| `data` | `T[]` | Məlumatlar |
| `isLoading` | `boolean` | Skeleton göstər |
| `pagination` | `PaginationProps` | Səhifələmə |
| `onRowClick` | `(row: T) => void` | Sətir kliki |
| `selectable` | `boolean` | Checkbox seçim |
| `actions` | `Action[]` | Hər sətir əməliyyatları |

```tsx
const columns: Column<Product>[] = [
  {
    key:    'image',
    label:  'Şəkil',
    render: (p) => (
      <Image src={p.image.url} alt={p.name}
             width={40} height={40} className="rounded-lg object-cover" />
    ),
  },
  { key: 'name',  label: 'Ad',     sortable: true },
  { key: 'price', label: 'Qiymət', sortable: true,
    render: (p) => `₼${p.price.toFixed(2)}` },
  { key: 'stock', label: 'Stok',   sortable: true },
  {
    key:    'status',
    label:  'Status',
    render: (p) => (
      <Badge variant={p.isActive ? 'success' : 'neutral'}>
        {p.isActive ? 'Aktiv' : 'Deaktiv'}
      </Badge>
    ),
  },
];

<DataTable
  columns={columns}
  data={products}
  isLoading={isLoading}
  pagination={{ page, totalPages, onPageChange }}
  actions={[
    { label: 'Düzəlt', icon: <Pencil />,
      onClick: (p) => router.push(`/admin/products/${p.id}/edit`) },
    { label: 'Sil', icon: <Trash2 />,
      onClick: (p) => openDelete(p.id), variant: 'danger' },
  ]}
/>
```

---

### PageHeader

Admin/Vendor səhifə başlığı.

**Fayl:** `src/components/ui/PageHeader.tsx`

```tsx
<PageHeader
  title="Məhsullar"
  description="145 məhsul tapıldı"
  action={
    <Button icon={<Plus />} onClick={openCreate}>
      Yeni Məhsul
    </Button>
  }
/>
```

---

### SearchBar

Debounce axtarış inputu.

**Fayl:** `src/components/ui/SearchBar.tsx`

**Props:**

| Prop | Tip | Default | Açıqlama |
|---|---|---|---|
| `placeholder` | `string` | `'Axtar...'` | Placeholder |
| `onSearch` | `(q: string) => void` | — | Debounce callback (300ms) |
| `defaultValue` | `string` | — | URL-dən ilkin dəyər |

---

### LanguageSwitcher

Dil seçici — AZ / EN / RU.

**Fayl:** `src/components/ui/LanguageSwitcher.tsx`

**Xüsusiyyətlər:**
- `next-intl` `useRouter().replace()` — URL prefiksi dəyişir
- Seçilmiş dil vurğulanır
- Cookie-də `NEXT_LOCALE` saxlanır
- SEO: `/az/` `/en/` `/ru/` URL dəyişir

---

### PriceRange

Qiymət aralığı ikili slider.

**Fayl:** `src/components/ui/PriceRange.tsx`

**Props:**

| Prop | Tip | Açıqlama |
|---|---|---|
| `min` | `number` | Minimum |
| `max` | `number` | Maksimum |
| `defaultMin` | `number` | İlkin minimum |
| `defaultMax` | `number` | İlkin maksimum |
| `onChange` | `(min: number, max: number) => void` | Callback |
| `step` | `number` | Addım (default: 1) |

---

## 6. ProductSchema (SEO — Server Component)

**Fayl:** `src/components/shop/ProductSchema.tsx`

```typescript
// Server Component — 'use client' yoxdur
export function ProductSchema({ product }: { product: ProductDetail }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:        product.name,
    description: product.description,
    image:       product.images.map((img) => img.url),
    sku:         product.sku,
    brand:  { '@type': 'Brand', name: product.brand },
    offers: {
      '@type':         'Offer',
      url:              `https://shopflow.az/products/${product.slug}`,
      price:            product.price,
      priceCurrency:   'AZN',
      availability:     product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0],
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type':      'AggregateRating',
        ratingValue:   product.avgRating.toFixed(1),
        reviewCount:   product.reviewCount,
        bestRating:   '5',
        worstRating:  '1',
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

## 7. Komponent Qaydaları

```
ADLANDIRMA
  ✅  Komponent faylları:  PascalCase   → ProductCard.tsx
  ✅  Hook faylları:       camelCase    → useCart.ts
  ✅  Utility faylları:    camelCase    → formatPrice.ts
  ✅  Test faylları:       eyni ad      → ProductCard.test.tsx

STRUKTUR
  ✅  Hər komponent özünün faylında
  ✅  Bir komponent — bir məqsəd (SRP)
  ✅  TypeScript interface hər komponent üçün
  ✅  Default export (lazy loading üçün)
  ✅  forwardRef — form elementlərində (Input, Select)
  ✅  'use client' — yalnız zəruri hallarda

PERFORMANS
  ✅  next/image — bütün şəkillər, blur placeholder
  ✅  React.memo — ağır siyahı elementlərində
  ✅  useCallback — event handler-lər (siyahıda)
  ✅  useMemo — hesablamalar (cəm, endirim)
  ✅  Skeleton — bütün async məzmun üçün

STİL
  ✅  Tailwind utility classlar
  ✅  cn() helper — şərti siniflər
  ✅  className prop — xaricdən override mümkün
  ✅  Shadcn/ui — bazis primitives üçün

TİP TƏHLÜKƏSİZLİYİ
  ✅  TypeScript interface — hər component props
  ✅  Optional chaining (?.) istifadəsi
  ❌  any tipi — heç vaxt
  ❌  Non-null assertion (!) — yalnız zəruri hallarda
```
