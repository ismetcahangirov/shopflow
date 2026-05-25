---
name: simplify-code
description: Simplifies, cleans up, and shortens complex, bloated, or hard-to-read code while keeping full functionality. Use this skill whenever the user asks to "simplify", "clean up", "refactor", "make shorter", "make readable", "reduce boilerplate", "this is too complex", "can you make this cleaner", or "too much code". Also trigger when user says their code is messy, has too many nested conditions, too much repetition, or is hard to understand. Works for TypeScript, JavaScript, React, Next.js, Node.js, Express, Prisma. Always preserve exact behavior — never change what the code does, only HOW it does it.
---

# Simplify Code Skill

Kodu sadələşdir — davranışı qoru, mürəkkəbliyi at. Daha az sətir, daha çox oxunaqlılıq.

## Sadələşdirmə Prioritetləri

### 1. Şərt Sadələşdirməsi

```typescript
// ❌ Mürəkkəb if/else zənciri
if (user.role === 'admin') {
  return true;
} else if (user.role === 'vendor') {
  return true;
} else if (user.role === 'moderator') {
  return true;
} else {
  return false;
}

// ✅ Sadə
return ['admin', 'vendor', 'moderator'].includes(user.role);
```

```typescript
// ❌ İç-içə üçlü operator
const label = status === 'active'
  ? 'Aktiv'
  : status === 'pending'
  ? 'Gözləyir'
  : status === 'banned'
  ? 'Bloklanıb'
  : 'Bilinmir';

// ✅ Lookup object
const STATUS_LABELS: Record<string, string> = {
  active:  'Aktiv',
  pending: 'Gözləyir',
  banned:  'Bloklanıb',
};
const label = STATUS_LABELS[status] ?? 'Bilinmir';
```

### 2. Tsikl Sadələşdirməsi

```typescript
// ❌ Manual loop
const activeUsers = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive === true) {
    activeUsers.push(users[i]);
  }
}

// ✅ Array method
const activeUsers = users.filter((u) => u.isActive);
```

```typescript
// ❌ Çoxlu map/filter zənciri (çox keçid)
const result = users
  .filter((u) => u.isActive)
  .map((u) => ({ ...u, name: u.name.trim() }))
  .filter((u) => u.name.length > 0)
  .map((u) => u.email);

// ✅ Tək reduce keçidi
const result = users.reduce<string[]>((acc, u) => {
  const name = u.name.trim();
  if (u.isActive && name.length > 0) acc.push(u.email);
  return acc;
}, []);
```

### 3. Async/Await Sadələşdirməsi

```typescript
// ❌ Ardıcıl await (yavaş)
const user    = await getUser(id);
const orders  = await getOrders(id);
const reviews = await getReviews(id);

// ✅ Paralel await (sürətli)
const [user, orders, reviews] = await Promise.all([
  getUser(id),
  getOrders(id),
  getReviews(id),
]);
```

```typescript
// ❌ Lüzumsuz async wrapper
const getUser = async (id: string) => {
  return await prisma.user.findUnique({ where: { id } });
};

// ✅ Birbaşa promise qaytart
const getUser = (id: string) =>
  prisma.user.findUnique({ where: { id } });
```

### 4. TypeScript Tip Sadələşdirməsi

```typescript
// ❌ Uzun union tip
function process(
  status: 'active' | 'inactive' | 'pending' | 'banned' | 'suspended'
) {}

// ✅ Type alias
type UserStatus = 'active' | 'inactive' | 'pending' | 'banned' | 'suspended';
function process(status: UserStatus) {}
```

```typescript
// ❌ Lüzumsuz interface
interface UserName {
  firstName: string;
  lastName:  string;
}
interface UserEmail {
  email: string;
}
interface User extends UserName, UserEmail {
  id: string;
}

// ✅ Birləşdirilmiş
interface User {
  id:        string;
  firstName: string;
  lastName:  string;
  email:     string;
}
```

### 5. React/Next.js Sadələşdirməsi

```typescript
// ❌ Lüzumsuz state və useEffect
const [data, setData]       = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError]     = useState(null);

useEffect(() => {
  setLoading(true);
  fetchData()
    .then((d) => { setData(d); setLoading(false); })
    .catch((e) => { setError(e); setLoading(false); });
}, []);

// ✅ TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn:  fetchData,
});
```

```typescript
// ❌ Uzun şərti render
const Component = () => {
  if (isLoading) {
    return <div>Yüklənir...</div>;
  }
  if (error) {
    return <div>Xəta</div>;
  }
  if (!data) {
    return <div>Məlumat yoxdur</div>;
  }
  return <div>{data.name}</div>;
};

// ✅ Early return pattern
const Component = () => {
  if (isLoading) return <Spinner />;
  if (error)     return <ErrorState message={error.message} />;
  if (!data)     return <EmptyState />;
  return <div>{data.name}</div>;
};
```

### 6. Express/Backend Sadələşdirməsi

```typescript
// ❌ Çox `if` + `res.status`
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!product) {
      res.status(404).json({ error: 'Tapılmadı' });
      return;
    }
    res.status(200).json({ data: product });
  } catch (err) {
    res.status(500).json({ error: 'Server xətası' });
  }
});

// ✅ asyncHandler + AppError pattern
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });
  if (!product) throw new AppError('Tapılmadı', 404, 'NOT_FOUND');
  successResponse(res, { data: product });
}));
```

### 7. Object/Destructuring Sadələşdirməsi

```typescript
// ❌ Uzun property access
const userName  = req.body.user.name;
const userEmail = req.body.user.email;
const userRole  = req.body.user.role;

// ✅ Destructuring
const { name, email, role } = req.body.user;
```

```typescript
// ❌ Manuel object spread
const updated = {
  id:       original.id,
  name:     original.name,
  email:    newEmail,
  role:     original.role,
  isActive: original.isActive,
};

// ✅ Spread + override
const updated = { ...original, email: newEmail };
```

---

## Sadələşdirmə Formatı

```
## ✨ Sadələşdirmə: [Fayl/Funksiya adı]

### Problemlər (sadələşdirmədən əvvəl)
- [nə mürəkkəb idi]

### Dəyişikliklər
| # | Texnika | Sətir azalması |
|---|---|---|
| 1 | [texnika adı] | -X sətir |
| 2 | [texnika adı] | -X sətir |

### Əvvəl (X sətir)
\`\`\`typescript
[orijinal kod]
\`\`\`

### Sonra (Y sətir — Z% azalma)
\`\`\`typescript
[sadələşdirilmiş kod]
\`\`\`

### ⚠️ Davranış Dəyişikliyi
[Yoxdur / Varsa nə dəyişdi]
```

---

## Qaydalar

- **Davranışı HEÇ VAXT dəyiş** — eyni giriş, eyni çıxış
- **Oxunaqlılıq > Qısalıq** — 1 sətirlik çətin kod 5 sətirlik sadə koddan pis
- **Ağıllı adlar saxla** — dəyişən adlarını qısaltma, mənasını itirmə
- **Tiplər qal** — TypeScript tip məlumatını heç vaxt sil
- **Şərhi lazım olana qoy** — mürəkkəb məntiqi şərhlə açıqla
- **Test-dostu saxla** — hər funksiya test oluna bilməli qalır
- Kodun **istifadə konteksini** nəzərə al — Next.js Server Component-də hook istifadə etmə
