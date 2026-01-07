# Copilot Instructions for AI Agents

## Architecture Overview
**Moon Garden** - نظام حجز فندقي (غرف وفلل) مبني بـ React 19 + TypeScript + Vite + Firebase.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Public Pages                    │  Admin Dashboard (Protected)    │
│  ────────────                    │  ─────────────────────────────   │
│  MoonGardenAman (/)              │  /dashboard/* (nested routes)   │
│  Rooms → RoomTypeDetails         │  StatsDashboard, BookingsPage   │
│  Villas → VillaTypeDetails       │  RoomsPage, VillasPage, etc.    │
│  UnitDetails → BookingForm       │                                 │
│  SearchResults                   │                                 │
└───────────────┬─────────────────────────────────┬───────────────────┘
                │                                 │
                ▼                                 ▼
        Firebase Firestore: rooms, villas, bookings, offers
```

### Path Alias
استخدم `@/` للاستيراد من `src/` (مُعرّف في vite.config.ts):
```ts
import { db } from "@/firebase"
import Footer from "@/components/Footer"
```

## Project Structure
| المسار | الغرض |
|--------|--------|
| `src/pages/` | صفحات التوجيه الرئيسية |
| `src/pages/dashboard/` | لوحة تحكم الإدارة (20+ صفحة فرعية) |
| `src/components/` | مكونات مُعاد استخدامها (BookingForm, RoomCard, Navbar) |
| `src/firebase.ts` | تصدير `db`, `auth`, `storage`, `analytics` |
| `public/rooms/`, `public/villas/` | صور الوحدات (مجلدات بأسماء عربية) |

## Firebase Collections Schema
```ts
// rooms & villas - نفس الـ schema
{ name: string, price: number, status: "متاح"|"محجوز"|"مؤكد"|"مقفلة", 
  images: string[], description?: string, capacity?: number, unitNumber?: string }

// bookings
{ unitId: string, unitNumber?: string, fullName: string, phone: string, 
  checkIn: string, checkOut: string, guests: number, price: number,
  type: "room"|"villa", status: "جديد"|"مؤكد"|"ملغي", createdAt: Timestamp }

// offers (خصومات)
{ unitId: string, unitType: "room"|"villa", discount: number, 
  discountType: "percent"|"amount", status: "نشط"|"منتهي", originalPrice?: number }
```

## Key Patterns

### 1. Firestore Data Fetching (مع id injection)
```ts
const snap = await getDocs(collection(db, "rooms"))
const rooms = snap.docs.map(d => ({ id: d.id, ...d.data() }))
```

### 2. Dynamic Unit Routing
Route واحد لجميع الوحدات في `App.tsx`:
```tsx
<Route path="/:type/:id" element={<UnitDetails />} />  // type = "room" | "villa"
```
في `UnitDetails.tsx` يُحدد الـ collection بناءً على `type`:
```ts
const collectionName = type === "villa" ? "villas" : "rooms"
```

### 3. Image Handling (مهم جداً!)
```tsx
<img
  src={img}
  referrerPolicy="no-referrer"
  crossOrigin="anonymous"
  loading="lazy"
  onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
/>
```

### 4. Date Conversion from Firestore
```ts
function toDate(val: any): Date | null {
  if (!val) return null
  if (val?.toDate && typeof val.toDate === "function") return val.toDate()
  if (typeof val === "string") return new Date(val)
  return null
}
```

### 5. Arabic Status Values & Colors (ثابتة - لا تغيّرها!)
```ts
const statusColors: Record<string, string> = {
  "متاح": "text-green-600",   // ✅ Available
  "محجوز": "text-yellow-600", // ⏳ Reserved
  "مؤكد": "text-blue-600",    // ✔️ Confirmed
  "مقفلة": "text-gray-500",   // 🔒 Locked (hidden from customers)
}
```

### 6. Booking Flow (Critical!)
عند إنشاء حجز في `BookingForm.tsx`:
1. إضافة document لـ `bookings` collection
2. تحديث حالة الوحدة إلى `"محجوز"` في `rooms`/`villas`
```ts
await addDoc(collection(db, "bookings"), { ...form, unitId, status: "جديد" })
await updateDoc(doc(db, collectionName, unitId), { status: "محجوز" })
```

### 7. Search Availability Logic
في `SearchResults.tsx`: يستبعد الوحدات المحجوزة بفحص تداخل التواريخ + المقفلة:
```ts
.filter((item) => item.status === "متاح")
.filter((item) => !bookedIds.has(item.id))
```

### 8. Room Types Grouping
الغرف تُجمّع بالاسم لعرضها للعميل، ثم تُفصّل في `RoomTypeDetails`:
```ts
const grouped: Record<string, Room[]> = {}
roomsData.filter(r => r.status !== "مقفلة").forEach((room) => {
  if (!grouped[room.name]) grouped[room.name] = []
  grouped[room.name].push(room)
})
```

## Developer Commands
```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # Clean + production build
npm run typecheck    # TypeScript check (no emit)
npm run lint         # ESLint
npm run clean        # Remove dist, caches, tsbuildinfo
```

## Adding Features

### إضافة صفحة dashboard جديدة
1. أنشئ الملف في `src/pages/dashboard/NewPage.tsx`
2. أضف Route داخل `<Route path="/dashboard">` في [App.tsx](src/App.tsx#L175-L196)

### إضافة حقل جديد للحجز
1. عدّل state و form في [BookingForm.tsx](src/components/BookingForm.tsx)
2. الحقل يُرسل تلقائياً لـ Firestore عبر `addDoc`

### إضافة collection جديد
1. استورد من `@/firebase`
2. اتبع نفس pattern: `getDocs`, `addDoc`, `updateDoc`, `doc`

## Important Notes
- **RTL Layout**: استخدم `dir="rtl"` و `text-right` في الـ containers
- **Swiper للصور**: كل الـ galleries تستخدم Swiper مع Pagination module
- **لوحة التحكم محمية**: عبر [ProtectedRoute](src/components/ProtectedRoute.tsx) يتحقق من `localStorage.getItem("adminAuth")`
- **Pagination مكوّن موحّد**: استخدم `Pagination` و `paginateData` من `@/components/Pagination`
- **لا tests**: المشروع بدون اختبارات حالياً
- **لا backend**: Firebase فقط (Firestore, Auth, Storage)
