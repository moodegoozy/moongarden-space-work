# Copilot Instructions for AI Agents

## Architecture Overview
**Moon Garden** - نظام حجز فندقي (غرف وفلل) مبني بـ React 19 + TypeScript + Vite + Firebase.

```
User → Pages (Rooms/Villas/Search) → Firebase Firestore
                    ↓
              RoomCard component → UnitDetails → BookingForm → bookings collection
```

### Path Alias
استخدم `@/` للاستيراد من `src/`:
```ts
import { db } from "@/firebase"
import Footer from "@/components/Footer"
```

## Project Structure
| المسار | الغرض |
|--------|--------|
| `src/pages/` | صفحات التوجيه الرئيسية |
| `src/pages/dashboard/` | لوحة تحكم الإدارة (nested routes) |
| `src/components/` | مكونات مُعاد استخدامها |
| `src/firebase.ts` | تصدير `db`, `auth`, `storage` |
| `public/rooms/`, `public/villas/` | صور الوحدات (مجلدات بأسماء عربية) |

## Firebase Collections
```ts
// rooms & villas
{ name: string, price: number, status: "متاح"|"محجوز"|"مؤكد", images: string[], description?: string, capacity?: number }

// bookings
{ unitId: string, fullName: string, phone: string, checkIn: string, checkOut: string, guests: number, createdAt: Timestamp }

// offers (خصومات)
{ unitId: string, unitType: "room"|"villa", discount: number, discountType: "percent"|"amount", status: "نشط"|"منتهي" }
```

## Key Patterns

### 1. Firestore Data Fetching
```ts
const snap = await getDocs(collection(db, "rooms"))
const rooms = snap.docs.map(d => ({ id: d.id, ...d.data() }))
```

### 2. Dynamic Unit Routing
Route واحد لجميع الوحدات: `/:type/:id` حيث `type = "room" | "villa"`

### 3. Image Handling (مهم!)
```tsx
<img
  src={img}
  referrerPolicy="no-referrer"
  crossOrigin="anonymous"
  onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
/>
```

### 4. Date Conversion from Firestore
```ts
const date = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
```

### 5. Arabic Status Values (ثابتة)
- `"متاح"` → أخضر (green-600)
- `"محجوز"` → أصفر (yellow-600)
- `"مؤكد"` → أزرق (blue-600)

### 6. Search Availability Logic
في `SearchResults.tsx`: يستبعد الوحدات المحجوزة بفحص تداخل التواريخ:
```ts
if (datesOverlap(searchStart, searchEnd, bookingStart, bookingEnd)) {
  bookedIds.add(booking.unitId)
}
```

## Developer Commands
```bash
npm run dev          # تشغيل Vite dev server
npm run build        # بناء للإنتاج (يشمل clean)
npm run typecheck    # فحص TypeScript
npm run lint         # ESLint
```

## Adding Features

### إضافة صفحة dashboard جديدة
1. أنشئ الملف في `src/pages/dashboard/NewPage.tsx`
2. أضف Route داخل `<Route path="/dashboard">` في App.tsx

### إضافة حقل جديد للحجز
1. عدّل `BookingForm.tsx` (الـ state والـ form inputs)
2. الحقل يُرسل تلقائياً لـ Firestore عبر `addDoc`

## Important Notes
- **RTL Layout**: استخدم `dir="rtl"` و `text-right` في الـ containers
- **Swiper للصور**: كل الـ galleries تستخدم Swiper مع Pagination module
- **لوحة التحكم محمية**: عبر `ProtectedRoute` يتحقق من `localStorage.getItem("adminAuth")`
- **لا tests**: المشروع بدون اختبارات حالياً
