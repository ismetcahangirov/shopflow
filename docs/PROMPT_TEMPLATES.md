# PROMPT_TEMPLATES.md — Agent Prompt Şablonları

> **Layihə:** ShopFlow E-Commerce Platform
> **Bu fayl nədir:** Sahib agentə hər vəziyyətdə hansı promptu verəcəyini buradan kopyalayır.
> **Qayda:** Şablonları있는 그대로 kopyala — lazım olan hissələri `[ ]` içindəki yerə yaz.

---

## 🟢 Yeni Söhbət Başladıqda (Ən Çox İşlədilən)

```
AI_AGENT_CONTEXT.md və TODO.md fayllarını oxu.
Növbəti tapşırığı götür, yeni branch aç, tamamla, push et.
Bitdikdə mənə xəbər ver.
```

---

## 🔵 Xüsusi Mərhələ Vermək İstədikdə

```
AI_AGENT_CONTEXT.md və TODO.md fayllarını oxu.
Mərhələ [N] — [mərhələ adı] tapşırığını götür.
Yeni branch aç, tamamla, push et. Bitdikdə xəbər ver.
```

**Nümunə:**
```
AI_AGENT_CONTEXT.md və TODO.md fayllarını oxu.
Mərhələ 2.1 — Auth Backend tapşırığını götür.
Yeni branch aç, tamamla, push et. Bitdikdə xəbər ver.
```

---

## 🟡 PR Birləşdikdən Sonra (Növbəti Tapşırığa Keç)

```
PR birləşdi. AI_AGENT_CONTEXT.md və TODO.md-ə bax, növbəti tapşırığa keç.
```

---

## 🔴 Xəta Olduqda (Test / TypeScript / Lint)

```
[xəta mesajı]

Yuxarıdakı xətanı düzəlt. TypeScript / test / lint keçdikdən sonra push et.
```

**Nümunə:**
```
TypeError: Cannot read properties of undefined (reading 'id')
  at orderController.ts:45

Yuxarıdakı xətanı düzəlt. TypeScript / test / lint keçdikdən sonra push et.
```

---

## 🟠 Kod Review İstədikdə (grill-code skill)

```
[kod parçası]

Bu kodu grill et. Hər problemi tap, izah et, düzəlt.
```

---

## 🟠 Dəyişiklik Təhlükəsizliyini Yoxladıqda (safe-code-check skill)

```
[dəyişdirilmək istənən kod və ya fayl adı]

Bu dəyişiklik mövcud funksionallığı pozacaqmı? Tam analiz et.
```

---

## 🟠 Kodu Sadələşdirmək İstədikdə (simplify-code skill)

```
[kod parçası]

Bu kodu sadələşdir. Davranışı qoru, mürəkkəbliyi at.
```

---

## ⚪ Sənəd Soruşmaq İstədikdə

```
[sənəd adı] faylını oxu və [sual] izah et.
```

**Nümunə:**
```
PAYMENT.md faylını oxu və Stripe webhook-un idempotency yoxlamasını izah et.
```

---

## ⚪ Cari Vəziyyəti Soruşmaq İstədikdə

```
AI_AGENT_CONTEXT.md-ə bax. Layihə hazırda hansı mərhələdədir? Növbəti nədir?
```

---

## ⚪ Tapşırıq Yarımçıq Qalıbsa

```
Son tapşırıq yarımçıq qaldı. AI_AGENT_CONTEXT.md və TODO.md-ə bax.
[~] işarəli tapşırığı tap, davam et, tamamla, push et.
```

---

## ⚪ Yeni Xüsusiyyət Əlavə Etmək İstədikdə (planda olmayan)

```
Mövcud arxitekturaya [xüsusiyyət adı] əlavə etmək istəyirəm.
ARCHITECTURE.md, API.md və DATABASE.md-ə bax.
Bu xüsusiyyəti mövcud strukturla uyğun şəkildə necə əlavə etmək olar? Planı göstər, sonra icazə al.
```

---

## ⚪ Debug İstədikdə

```
Aşağıdakı xəta baş verir:

[xəta mesajı + stack trace]

Fayllar: [əlaqəli fayl adları]

Sənədləri oxu, xətanın səbəbini tap, düzəlt, test et.
```

---

> **Qeyd:** Bütün promptlarda agent avtomatik olaraq:
> - Əlaqəli sənədi oxuyur (WORKFLOW.md-dəki cədvəl əsasında)
> - TypeScript yoxlayır
> - Testləri keçirir
> - TODO.md və AI_AGENT_CONTEXT.md-i yeniləyir
> - Push edir və xəbər verir
