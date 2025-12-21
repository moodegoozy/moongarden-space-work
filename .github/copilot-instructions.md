# Copilot Instructions for AI Agents

## Architecture Overview
**Moon Garden** - نظام حجز فندقي (غرف وفلل) مبني بـ React 19 + TypeScript + Vite + Firebase.

### Core Data Flow
```
Firebase Firestore → React Components → User Interface
     ↓                    ↓
  Collections:         Pages load via
  - rooms             getDocs/getDoc
  - villas            from @/firebase
  - bookings
  - offers
```

### Path Alias
استخدم `@/` للاستيراد من `src/` (مُعرَّف في [vite.config.ts](../vite.config.ts)):
```ts
import { db } from "@/firebase"
```

## Project Structure
| المسار | الغرض |
|--------|--------|
| `src/pages/` | صفحات التوجيه (Rooms, Villas, SearchResults, BookingPage) |
| `src/pages/dashboard/` | لوحة تحكم الإدارة (BookingsPage, RoomsPage, VillasPage) |
| `src/components/` | مكونات مُعاد استخدامها (RoomCard, FancySearch, Navbar) |
| `src/firebase.ts` | إعداد Firebase الموحد (auth, db, storage) |
| `public/rooms/`, `public/villas/` | صور الوحدات (مجلدات بأسماء عربية) |

## Firebase Collections Schema
```ts
// rooms & villas
{ name: string, price: number, status: "متاح"|"محجوز"|"مؤكد", images: string[], description?: string, capacity?: number }

// bookings
{ unitId: string, fullName: string, phone: string, checkIn: string, checkOut: string, guests: number, status: string, createdAt: Timestamp }

// offers
{ unitId: string, unitType: "room"|"villa", discount: number, discountType: "percent"|"amount", status: "نشط"|"منتهي" }
```

## Key Patterns

### 1. Unit Cards Pattern
كل وحدة (غرفة/فيلا) تُعرض عبر `RoomCard` مع Swiper للصور:
```tsx
<RoomCard id={room.id} name={room.name} price={room.price} status={room.status} type="room" images={room.images} />
```

### 2. Dynamic Routing
التوجيه الموحد للوحدات في [App.tsx](../src/App.tsx):
```tsx
<Route path="/:type/:id" element={<UnitDetails />} />  // type = "room" | "villa"
```

### 3. Search & Availability Filter
البحث يمر عبر `/search` مع query params، ويستبعد الوحدات المحجوزة:
```ts
// في SearchResults.tsx
const bookedIds = new Set<string>()
// يتحقق من تداخل التواريخ مع bookings collection
```

### 4. Protected Admin Routes
الحماية عبر `localStorage.getItem("adminAuth")`:
```tsx
<ProtectedRoute><Dashboard /></ProtectedRoute>
```

### 5. Arabic Status Values
الحالات تُكتب بالعربية دائماً:
- `"متاح"` (available) → أخضر
- `"محجوز"` (booked) → أصفر  
- `"مؤكد"` (confirmed) → أزرق

## Developer Commands
```bash
npm run dev          # تشغيل الخادم المحلي
npm run build        # بناء للإنتاج (يشمل clean)
npm run typecheck    # فحص TypeScript
npm run lint         # ESLint
npm run preview      # معاينة البناء
```

## Adding New Features

### إضافة نوع غرفة جديد
1. أضف مجلداً في `public/rooms/اسم-الغرفة/` مع الصور
2. أضف المستند في Firestore collection `rooms`

### إضافة صفحة dashboard جديدة
1. أنشئ الملف في `src/pages/dashboard/`
2. أضف Route داخل `<Route path="/dashboard">` في App.tsx

## Important Notes
- **التعامل مع الصور**: استخدم `referrerPolicy="no-referrer"` و `onError` للـ fallback
- **التواريخ من Firestore**: استخدم `toDate()` للتحويل من Timestamp
- **RTL**: الواجهة عربية، استخدم `text-right` و اتجاه RTL
- **لا tests**: المشروع لا يحتوي على اختبارات حالياً
