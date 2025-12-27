import { useParams, Link } from "react-router-dom"
import { db } from "@/firebase"
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

type Villa = {
  id: string
  name: string
  price: number
  status: string
  description?: string
  images: string[]
  unitNumber?: string
}

export default function VillaTypeDetails() {
  const { typeName } = useParams()
  const decodedTypeName = decodeURIComponent(typeName || "")
  
  const [villas, setVillas] = useState<Villa[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSent, setBookingSent] = useState(false)
  
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  })

  useEffect(() => {
    const loadVillas = async () => {
      try {
        const snap = await getDocs(collection(db, "villas"))
        const allVillas = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        })) as Villa[]
        
        // فلترة الفلل حسب الاسم (النوع)
        const filtered = allVillas.filter(v => v.name === decodedTypeName && v.status !== "مقفلة")
        setVillas(filtered)
      } catch (err) {
        console.error("❌ خطأ في تحميل الفلل:", err)
      } finally {
        setLoading(false)
      }
    }
    loadVillas()
  }, [decodedTypeName])

  // ✅ البحث عن وحدة متاحة وحجزها
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingLoading(true)

    try {
      // البحث عن وحدة متاحة من نفس النوع
      const availableVilla = villas.find(v => v.status === "متاح")
      
      if (!availableVilla) {
        alert("⚠️ عذراً، لا توجد وحدات متاحة حالياً من هذا النوع. يرجى اختيار نوع آخر.")
        setBookingLoading(false)
        return
      }

      // إنشاء الحجز مع رقم الوحدة المحددة تلقائياً
      await addDoc(collection(db, "bookings"), {
        ...form,
        unitId: availableVilla.id,
        unitNumber: availableVilla.unitNumber || "",
        villaName: availableVilla.name,
        price: availableVilla.price,
        type: "villa",
        status: "جديد",
        createdAt: serverTimestamp(),
      })

      // ✅ تغيير حالة الوحدة إلى "محجوز"
      await updateDoc(doc(db, "villas", availableVilla.id), {
        status: "محجوز",
      })

      setBookingSent(true)
    } catch (err) {
      console.error("❌ خطأ في الحجز:", err)
      alert("حدث خطأ أثناء إرسال الحجز. حاول مرة أخرى.")
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return <p className="text-center py-20 text-[#7C7469]">⏳ جاري التحميل...</p>

  if (villas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <div>
            <p className="text-xl text-[#7C7469] mb-4">لم يتم العثور على فلل من هذا النوع</p>
            <Link to="/villas" className="text-[#C6A76D] hover:underline">
              ← العودة للفلل
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // أخذ بيانات أول وحدة للعرض (الصور والوصف والسعر)
  const displayVilla = villas[0]
  const availableCount = villas.filter(v => v.status === "متاح").length

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto py-10 text-right px-4">
        {/* معرض الصور */}
        <Swiper 
          pagination={{ clickable: true }} 
          modules={[Pagination]} 
          className="w-full h-80 sm:h-96 rounded-xl"
        >
          {displayVilla.images?.map((img: string, i: number) => (
            <SwiperSlide key={i}>
              <img 
                src={img} 
                className="w-full h-80 sm:h-96 object-cover rounded-xl" 
                alt={displayVilla.name} 
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* معلومات النوع */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2B2A28]">{decodedTypeName}</h2>
            <p className="text-[#7C7469] mt-1">🏡 {villas.length} وحدات من هذا النوع</p>
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-green-600">{displayVilla.price} ريال</p>
            <p className="text-sm text-[#7C7469]">لليلة الواحدة</p>
          </div>
        </div>

        {/* شارة التوفر */}
        <div className="mt-4">
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            availableCount > 0 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-600"
          }`}>
            {availableCount > 0 
              ? `✅ ${availableCount} وحدات متاحة للحجز` 
              : "❌ لا توجد وحدات متاحة حالياً"}
          </span>
        </div>

        {/* الوصف */}
        <p className="mt-6 text-gray-600 leading-relaxed">
          {displayVilla.description || "استمتع بإقامة مميزة في فللنا الفاخرة المصممة بعناية لتوفر لك الراحة والخصوصية."}
        </p>

        {/* زر الحجز */}
        {availableCount > 0 ? (
          <button 
            onClick={() => setShowBookingForm(!showBookingForm)}
            className="bg-[#2B2A28] text-white px-8 py-3 rounded-xl mt-6 hover:bg-[#3d3c3a] transition flex items-center gap-2"
          >
            <span>📅</span>
            <span>{showBookingForm ? "إخفاء نموذج الحجز" : "احجز الآن"}</span>
          </button>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6 text-yellow-800 text-center">
            ⚠️ جميع الوحدات من هذا النوع محجوزة حالياً
          </div>
        )}

        {/* نموذج الحجز */}
        {showBookingForm && availableCount > 0 && !bookingSent && (
          <div className="mt-6 bg-white border border-[#E8E1D6] rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-[#2B2A28] mb-4">📝 نموذج الحجز</h3>
            
            <div className="bg-[#FAF8F3] border border-[#E8E1D6] rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[#7C7469]">نوع الفيلا:</span>
                <span className="font-bold text-[#2B2A28]">{decodedTypeName}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[#7C7469]">السعر/ليلة:</span>
                <span className="font-bold text-green-600">{displayVilla.price} ريال</span>
              </div>
              <p className="text-xs text-[#C6A76D] mt-2 text-center">
                🔄 سيتم تخصيص وحدة متاحة تلقائياً عند تأكيد الحجز
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-[#7C7469]">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="border border-[#E8E1D6] w-full p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76D]"
                />
              </div>

              <div>
                <label className="block mb-1 text-[#7C7469]">رقم الجوال:</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="border border-[#E8E1D6] w-full p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[#7C7469]">تاريخ الوصول:</label>
                  <input
                    type="date"
                    required
                    value={form.checkIn}
                    onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                    className="border border-[#E8E1D6] w-full p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76D]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#7C7469]">تاريخ المغادرة:</label>
                  <input
                    type="date"
                    required
                    value={form.checkOut}
                    onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                    className="border border-[#E8E1D6] w-full p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76D]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[#7C7469]">عدد الأشخاص:</label>
                <input
                  type="number"
                  min={1}
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                  className="border border-[#E8E1D6] w-full p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76D]"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-[#2B2A28] text-white py-3 rounded-xl hover:bg-[#3d3c3a] transition disabled:opacity-50"
              >
                {bookingLoading ? "⏳ جاري الإرسال..." : "✅ تأكيد الحجز"}
              </button>
            </form>
          </div>
        )}

        {/* رسالة نجاح الحجز */}
        {bookingSent && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-6 text-green-800 text-center">
            <span className="text-4xl mb-3 block">✅</span>
            <h3 className="font-bold text-lg mb-2">تم إرسال طلب الحجز بنجاح!</h3>
            <p className="text-sm">سيتم التواصل معك قريباً لتأكيد الحجز</p>
            <Link 
              to="/villas" 
              className="inline-block mt-4 text-[#C6A76D] hover:underline"
            >
              ← العودة للفلل
            </Link>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}
