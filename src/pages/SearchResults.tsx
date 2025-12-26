import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"
import Footer from "@/components/Footer"

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
          .filter((item) => item.status !== "مقفلة") // استبعاد المقفلة
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F1E9]">
      <p className="text-center text-[#7C7469] text-lg">⏳ جاري البحث...</p>
    </div>
  )

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#F6F1E9] text-[#2B2A28]">
      {/* هيدر */}
      <header className="sticky top-0 z-30 bg-[#FAF8F3]/90 backdrop-blur border-b border-[#E8E1D6]">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <img src="/logo.png" alt="Moon Garden" className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition" />
            <div>
              <h1 className="text-sm sm:text-lg font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display','Noto Naskh Arabic',serif" }}>MOON GARDEN</h1>
              <p className="text-[9px] sm:text-[11px] text-[#7C7469] -mt-1">HOTEL & RESIDENCE</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/rooms" className="hover:text-[#5E5B53]">الغرف الفندقية</Link>
            <Link to="/villas" className="hover:text-[#5E5B53]">الفلل والأجنحة</Link>
            <Link to="/amenities" className="hover:text-[#5E5B53]">المرافق</Link>
          </nav>
          <div className="md:hidden">
            <details className="relative">
              <summary className="list-none cursor-pointer px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#E8E1D6] text-[#2B2A28] font-bold flex items-center gap-1 text-sm">
                القائمة
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </summary>
              <div className="absolute left-0 mt-2 w-44 bg-white border border-[#E8E1D6] rounded-lg shadow-lg z-50 text-right text-sm">
                <Link to="/rooms" className="block px-4 py-2.5 hover:bg-[#F6F1E9]">الغرف الفندقية</Link>
                <Link to="/villas" className="block px-4 py-2.5 hover:bg-[#F6F1E9]">الفلل والأجنحة</Link>
                <Link to="/amenities" className="block px-4 py-2.5 hover:bg-[#F6F1E9]">المرافق</Link>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* المحتوى */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-right golden-banner-title">
          النتائج المتاحة {checkIn && checkOut ? `من ${checkIn} إلى ${checkOut}` : ""}
        </h2>

        {results.length === 0 ? (
          <p className="text-[#7C7469] text-center py-10">لا توجد وحدات مطابقة لمرشحات البحث</p>
        ) : (
          <div className="grid gap-6 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-[#E8E1D6] rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
            >
              <img src={r.images?.[0] || "/placeholder.png"} alt={r.name} className="w-full h-48 sm:h-56 object-cover" />
              <div className="p-3 sm:p-4 text-right flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-1">{r.name}</h3>
                  <p className="text-[#7C7469] text-sm mb-1">{r.status}</p>
                  <p className="text-[#2B2A28] font-semibold">{r.price} ريال / الليلة</p>
                </div>
                <Link
                  to={`/book?unitId=${r.id}`}
                  className="mt-3 sm:mt-4 block w-full text-center bg-gradient-to-l from-[#C6A76D] to-[#A48E78] text-white font-bold py-2 sm:py-2.5 rounded-full shadow hover:opacity-90 transition-colors text-sm sm:text-base"
                  style={{letterSpacing: '0.04em'}}
                >
                  احجز الآن
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      </main>

      <Footer />
    </div>
  )
}
