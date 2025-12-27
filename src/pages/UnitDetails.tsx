import { useParams } from "react-router-dom"
import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import BookingForm from "@/components/BookingForm"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function UnitDetails() {
  const { id, type } = useParams()
  const [unit, setUnit] = useState<any>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, type === "villa" ? "villas" : "rooms", id!))
      if (snap.exists()) setUnit({ id: snap.id, ...snap.data() })
    }
    load()
  }, [id, type])

  if (!unit) return <p className="text-center py-20">جارٍ التحميل...</p>

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto py-10 text-right px-4">
        <Swiper pagination={{ clickable: true }} modules={[Pagination]} className="w-full h-96 rounded-xl">
          {unit.images?.map((img: string, i: number) => (
            <SwiperSlide key={i}>
              <img src={img} className="w-full h-96 object-cover rounded-xl" alt={unit.name} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#2B2A28]">{unit.name}</h2>
            {unit.unitNumber && (
              <p className="text-[#C6A76D] font-bold mt-1">🏠 رقم الوحدة: {unit.unitNumber}</p>
            )}
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-green-600">{unit.price} ريال</p>
            <p className="text-sm text-[#7C7469]">لليلة الواحدة</p>
          </div>
        </div>

        {/* حالة الوحدة */}
        <div className="mt-4">
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            unit.status === "متاح" 
              ? "bg-green-100 text-green-700" 
              : unit.status === "مقفلة"
              ? "bg-gray-100 text-gray-600"
              : "bg-yellow-100 text-yellow-700"
          }`}>
            {unit.status === "متاح" ? "✅ متاح للحجز" : unit.status === "مقفلة" ? "🔒 مقفلة" : "⏳ محجوزة"}
          </span>
        </div>

        <p className="mt-6 text-gray-600 leading-relaxed">
          {unit.description || "لم تتم إضافة وصف بعد"}
        </p>

        {/* زر الحجز */}
        {unit.status === "متاح" ? (
          <button 
            onClick={() => setShowBookingForm(!showBookingForm)}
            className="bg-[#2B2A28] text-white px-8 py-3 rounded-xl mt-6 hover:bg-[#3d3c3a] transition flex items-center gap-2"
          >
            <span>📅</span>
            <span>{showBookingForm ? "إخفاء نموذج الحجز" : "احجز الآن"}</span>
          </button>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6 text-yellow-800 text-center">
            ⚠️ هذه الوحدة غير متاحة حالياً للحجز
          </div>
        )}

        {/* نموذج الحجز */}
        {showBookingForm && unit.status === "متاح" && (
          <div className="mt-6 bg-white border border-[#E8E1D6] rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-[#2B2A28] mb-4">📝 نموذج الحجز</h3>
            <BookingForm unitId={id!} unitType={type as "room" | "villa"} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
