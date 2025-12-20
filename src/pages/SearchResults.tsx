import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"

function toDate(val: any): Date | null {
  if (!val) return null
  if (val?.toDate && typeof val.toDate === "function") return val.toDate()
  if (typeof val === "string") return new Date(val)
  if (val instanceof Date) return val
  return null
}

function datesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart <= bEnd && bStart <= aEnd
}

export default function SearchResults() {
  const [params] = useSearchParams()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const checkIn = params.get("checkIn")
  const checkOut = params.get("checkOut")
  const guests = Number(params.get("guests")) || 1
  const type = params.get("type") || "all"
  const q = (params.get("q") || "").trim()
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : null
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : null

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 🔎 اختر المجموعات حسب نوع البحث
        const toFetch = [] as { collectionName: string; docs: any[] }[]
        if (type === "room" || type === "all") {
          const roomsSnap = await getDocs(collection(db, "rooms"))
          toFetch.push({ collectionName: "rooms", docs: roomsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) })
        }
        if (type === "villa" || type === "all") {
          const villasSnap = await getDocs(collection(db, "villas"))
          toFetch.push({ collectionName: "villas", docs: villasSnap.docs.map((d) => ({ id: d.id, ...d.data() })) })
        }

        // 👀 إذا كانت هناك حجوزات، نحرص على استبعاد الوحدات المحجوزة خلال الفترة المطلوبة
        const bookedIds = new Set<string>()
        if (checkIn && checkOut) {
          try {
            const bookingsSnap = await getDocs(collection(db, "bookings"))
            bookingsSnap.docs.forEach((b) => {
              const bk = b.data() as any
              const bStart = toDate(bk.startDate)
              const bEnd = toDate(bk.endDate)
              if (!bStart || !bEnd) return
              const s = new Date(checkIn)
              const e = new Date(checkOut)
              if (datesOverlap(s, e, bStart, bEnd)) {
                if (bk.unitId) bookedIds.add(bk.unitId)
              }
            })
          } catch (err) {
            // إذا لم توجد مجموعة "bookings" أو حدث خطأ، نتجاهل الاستبعاد
            console.warn("تعذر جلب الحجوزات (إن وجدت):", err)
          }
        }

        // ✅ الآن نطبق الفلاتر: الحالة، السعر، الاسم، السعة، واستبعاد المحجوزين
        const allItems = toFetch.flatMap((f) => f.docs)
        const filtered = allItems
          .filter((item) => item.status === "متاح")
          .filter((item) => {
            if (minPrice !== null && item.price != null && Number(item.price) < minPrice) return false
            if (maxPrice !== null && item.price != null && Number(item.price) > maxPrice) return false
            return true
          })
          .filter((item) => {
            if (!q) return true
            return (item.name || "").toLowerCase().includes(q.toLowerCase()) || (item.description || "").toLowerCase().includes(q.toLowerCase())
          })
          .filter((item) => {
            // بعض البيانات قد لا تحتوي على سعة؛ إذا كانت موجودة نتحقق
            const cap = (item.capacity || item.maxGuests || item.guests) ? Number(item.capacity || item.maxGuests || item.guests) : null
            if (cap !== null && !isNaN(cap)) {
              return cap >= guests
            }
            return true
          })
          .filter((item) => !bookedIds.has(item.id))

        setResults(filtered)
      } catch (err) {
        console.error("خطأ أثناء البحث:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [checkIn, checkOut, guests, type, q, minPrice, maxPrice])

  if (loading) return <p className="text-center py-10">⏳ جاري البحث...</p>

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold mb-8 text-right text-gray-800">
        النتائج المتاحة {checkIn && checkOut ? `من ${checkIn} إلى ${checkOut}` : ""}
      </h2>

      {results.length === 0 ? (
        <p className="text-gray-500 text-center">لا توجد وحدات مطابقة لمرشحات البحث</p>
      ) : (
        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {results.map((r) => (
            <div
              key={r.id}
              className="bg-white border rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <img src={r.images?.[0] || "/placeholder.png"} alt={r.name} className="w-full h-56 object-cover" />
              <div className="p-4 text-right">
                <h3 className="font-bold text-lg mb-1">{r.name}</h3>
                <p className="text-gray-600 mb-1">{r.status}</p>
                <p className="text-black font-semibold">{r.price} ريال / الليلة</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
