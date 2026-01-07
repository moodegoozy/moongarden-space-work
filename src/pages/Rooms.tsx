import React, { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Footer from "../components/Footer"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"
import "swiper/css"
import "swiper/css/pagination"

type Room = {
  id: string
  name: string
  price: number
  status: "متاح" | "محجوز" | "مؤكد" | "مقفلة"
  description?: string
  images: string[]
  unitNumber?: string
}

type Offer = {
  id: string
  unitId: string
  unitType: "room" | "villa"
  discount: number
  discountType: "percent" | "amount"
  status: string
}

// ✅ نوع مجمّع للعرض للعميل
type RoomType = {
  typeName: string
  price: number
  description: string
  images: string[]
  totalUnits: number
  availableUnits: number
  hasDiscount: boolean
  discountInfo?: { discount: number; discountType: "percent" | "amount"; newPrice: number }
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const location = useLocation()
  const isDashboard = location.pathname.includes("/dashboard")

  // ✅ تحميل الغرف والعروض من Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsSnap = await getDocs(collection(db, "rooms"))
        const offersSnap = await getDocs(collection(db, "offers"))

        const roomsData = roomsSnap.docs.map((doc) => {
          const room = doc.data()
          const images = Array.isArray(room.images)
            ? room.images
            : room.image
            ? [room.image]
            : ["/placeholder.png"]

          return {
            id: doc.id,
            name: room.name || "غرفة بدون اسم",
            price: Number(room.price) || 0,
            status: room.status || "متاح",
            description: room.description || "",
            images,
            unitNumber: room.unitNumber || "",
          } as Room
        })

        const offersData = offersSnap.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
          .filter((o) => o.status === "نشط" && o.unitType === "room")

        setRooms(roomsData)
        setOffers(offersData)

        // ✅ تجميع الغرف حسب الاسم (النوع) - إخفاء الوحدات المقفلة
        const grouped: Record<string, Room[]> = {}
        roomsData.filter(r => r.status !== "مقفلة").forEach((room) => {
          if (!grouped[room.name]) {
            grouped[room.name] = []
          }
          grouped[room.name].push(room)
        })

        // ✅ تحويل لأنواع مجمّعة
        const types: RoomType[] = Object.entries(grouped).map(([typeName, units]) => {
          const firstUnit = units[0]
          const availableUnits = units.filter(u => u.status === "متاح").length
          
          // البحث عن خصم لأي وحدة من هذا النوع
          const unitWithOffer = units.find(u => offersData.some(o => o.unitId === u.id))
          const offer = unitWithOffer ? offersData.find(o => o.unitId === unitWithOffer.id) : null
          
          let discountInfo = undefined
          if (offer) {
            const newPrice = offer.discountType === "percent"
              ? firstUnit.price - firstUnit.price * (offer.discount / 100)
              : firstUnit.price - offer.discount
            discountInfo = {
              discount: offer.discount,
              discountType: offer.discountType,
              newPrice,
            }
          }

          return {
            typeName,
            price: firstUnit.price,
            description: firstUnit.description || "",
            images: firstUnit.images,
            totalUnits: units.length,
            availableUnits,
            hasDiscount: !!offer,
            discountInfo,
          }
        })

        setRoomTypes(types)
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل الغرف أو العروض:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ✅ الانتقال لصفحة تفاصيل نوع الوحدة
  const handleTypeClick = (typeName: string) => {
    navigate(`/room-type/${encodeURIComponent(typeName)}`)
  }

  if (loading)
    return <p className="text-center py-10 text-[#7C7469]">⏳ جاري تحميل الغرف...</p>

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#F6F1E9] text-[#2B2A28]">

      {/* ✅ هيدر مطابق للرئيسية */}
      <header className="sticky top-0 z-30 bg-[#FAF8F3]/90 backdrop-blur border-b border-[#E8E1D6]">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <img src="/logo.png" alt="Moon Garden logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition" />
            <div>
              <h1
                className="text-sm sm:text-lg font-semibold tracking-tight"
                style={{ fontFamily: "'Playfair Display','Noto Naskh Arabic',serif" }}
              >
                MOON GARDEN
              </h1>
              <p className="text-[9px] sm:text-[11px] text-[#7C7469] -mt-1">HOTEL & RESIDENCE</p>
            </div>
          </Link>

          {/* تبويبات سطح المكتب */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/rooms" className="hover:text-[#5E5B53] font-semibold text-[#C6A76D]">الغرف الفندقية</Link>
            <Link to="/villas" className="hover:text-[#5E5B53]">الفلل والأجنحة الفندقية</Link>
            <Link to="/amenities" className="hover:text-[#5E5B53]">المرافق والخدمات</Link>
          </nav>
          {/* تبويبات الجوال */}
          <div className="md:hidden relative">
            <details className="relative">
              <summary className="list-none cursor-pointer px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#E8E1D6] text-[#2B2A28] font-bold flex items-center gap-1 shadow-sm text-sm">
                القائمة
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </summary>
              <div className="absolute left-0 mt-2 w-44 bg-white border border-[#E8E1D6] rounded-lg shadow-lg z-50 text-right text-sm">
                <Link to="/rooms" className="block px-4 py-2.5 hover:bg-[#F6F1E9] font-semibold text-[#C6A76D]">الغرف الفندقية</Link>
                <Link to="/villas" className="block px-4 py-2.5 hover:bg-[#F6F1E9]">الفلل والأجنحة الفندقية</Link>
                <Link to="/amenities" className="block px-4 py-2.5 hover:bg-[#F6F1E9]">المرافق والخدمات</Link>
              </div>
            </details>
          </div>

          <a
            id="book"
            href="https://wa.me/966500000000"
            target="_blank"
            className="hidden sm:block px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#2F2E2B] text-[#FAF8F3] text-xs sm:text-sm hover:opacity-90 transition"
          >
            احجز الآن
          </a>
        </div>
      </header>

      {/* ✅ بانر */}
      {!isDashboard && (
        <section
          className="relative h-[280px] sm:h-[380px] md:h-[480px] bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(31,30,28,0.55), rgba(31,30,28,0.15)), url('/banner-fixed.png')",
          }}
        >
          <div className="text-center text-[#FAF8F3] px-4 drop-shadow-lg">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 tracking-tight golden-banner-title">
              الأجنحة والغرف الفندقية
            </h1>
            <p className="text-sm sm:text-lg md:text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
              اكتشف مجموعتنا الراقية من الغرف المصممة بعناية لتمنحك الراحة والفخامة.
            </p>
          </div>
        </section>
      )}

      {/* ✅ عرض أنواع الغرف (بطاقة واحدة لكل نوع) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-10 text-center golden-banner-title">
          الأجنحة والغرف الفندقية
        </h2>

        {roomTypes.length === 0 ? (
          <p className="text-center text-[#7C7469]">لا توجد غرف حالياً</p>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-10 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {roomTypes.map((roomType) => (
              <div
                key={roomType.typeName}
                onClick={() => handleTypeClick(roomType.typeName)}
                className="cursor-pointer bg-white border border-[#E8E1D6] rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden relative"
              >
                {/* شارة الخصم */}
                {roomType.hasDiscount && roomType.discountInfo && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-green-700 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md z-10">
                    خصم {roomType.discountInfo.discount}
                    {roomType.discountInfo.discountType === "percent" ? "%" : " ريال"}
                  </div>
                )}

                {/* شارة عدد الوحدات المتاحة */}
                <div className={`absolute top-2 sm:top-3 left-2 sm:left-3 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md z-10 ${
                  roomType.availableUnits > 0 ? "bg-[#C6A76D]" : "bg-red-600"
                }`}>
                  {roomType.availableUnits > 0 
                    ? `${roomType.availableUnits} متاحة` 
                    : "غير متاحة"}
                </div>

                <img
                  src={roomType.images?.[0] || "/placeholder.png"}
                  alt={roomType.typeName}
                  className="w-full h-40 sm:h-56 object-cover"
                />

                <div className="p-3 sm:p-4 text-right">
                  <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2">{roomType.typeName}</h3>
                  
                  <p className="text-[#7C7469] text-xs sm:text-sm mb-2">
                    🛏️ {roomType.totalUnits} وحدات من هذا النوع
                  </p>

                  {roomType.hasDiscount && roomType.discountInfo ? (
                    <>
                      <p className="text-[#A48E78] line-through text-xs sm:text-sm">
                        {roomType.price} ريال
                      </p>
                      <p className="text-green-700 font-bold text-sm sm:text-lg">
                        {roomType.discountInfo.newPrice.toFixed(0)} ريال / الليلة 🎉
                      </p>
                    </>
                  ) : (
                    <p className="text-[#2B2A28] font-bold text-sm sm:text-lg">
                      {roomType.price} ريال / الليلة
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {!isDashboard && <Footer />}
    </div>
  )
}
