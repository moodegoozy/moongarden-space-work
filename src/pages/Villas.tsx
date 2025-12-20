import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import Footer from "../components/Footer"
import { db } from "@/firebase"
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

type Villa = {
  id: string
  name: string
  price: number
  status: "متاح" | "محجوز" | "مؤكد"
  description?: string
  images: string[]
}

type Offer = {
  id: string
  unitId: string
  unitType: "room" | "villa"
  discount: number
  discountType: "percent" | "amount"
  status: string
}

export default function Villas() {
  const [villas, setVillas] = useState<Villa[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState({
    fullName: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  })

  const location = useLocation()
  const isDashboard = location.pathname.includes("/dashboard")

  // ✅ تحميل بيانات الفلل والعروض
  useEffect(() => {
    const fetchData = async () => {
      try {
        const villasSnap = await getDocs(collection(db, "villas"))
        const offersSnap = await getDocs(collection(db, "offers"))

        const villasData = villasSnap.docs.map((doc) => {
          const v = doc.data()
          const images = Array.isArray(v.images)
            ? v.images
            : v.image
            ? [v.image]
            : ["/placeholder.png"]

          return {
            id: doc.id,
            name: v.name || "فيلا بدون اسم",
            price: Number(v.price) || 0,
            status: v.status || "متاح",
            description: v.description || "",
            images,
          } as Villa
        })

        const offersData = offersSnap.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
          .filter((o) => o.status === "نشط" && o.unitType === "villa")

        setVillas(villasData)
        setOffers(offersData)
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل الفلل أو العروض:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ✅ حساب السعر بعد الخصم
  const getDiscountedPrice = (villa: Villa) => {
    const offer = offers.find((o) => o.unitId === villa.id)
    if (!offer) return null

    const { discount, discountType } = offer
    const oldPrice = villa.price
    const newPrice =
      discountType === "percent"
        ? oldPrice - oldPrice * (discount / 100)
        : oldPrice - discount

    return { oldPrice, newPrice, offer }
  }

  // ✅ إرسال الحجز
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVilla) return

    try {
      await addDoc(collection(db, "bookings"), {
        ...bookingData,
        villaId: selectedVilla.id,
        villaName: selectedVilla.name,
        price: selectedVilla.price,
        status: "جديد",
        type: "villa",
        createdAt: serverTimestamp(),
      })

      alert("✅ تم إرسال طلب الحجز بنجاح! سيتم التواصل معك قريباً.")
      setShowBookingForm(false)
      setSelectedVilla(null)
      setBookingData({
        fullName: "",
        phone: "",
        checkIn: "",
        checkOut: "",
        guests: 1,
      })
    } catch (error) {
      console.error("❌ خطأ أثناء إرسال الحجز:", error)
      alert("حدث خطأ أثناء إرسال الحجز. حاول مرة أخرى.")
    }
  }

  if (loading)
    return <p className="text-center py-10 text-[#7C7469]">⏳ جاري تحميل الفلل...</p>

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#F6F1E9] text-[#2B2A28]">

      {/* ✅ هيدر مطابق للرئيسية */}
      <header className="sticky top-0 z-30 bg-[#FAF8F3]/90 backdrop-blur border-b border-[#E8E1D6]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Moon Garden logo" className="w-12 h-12 object-contain group-hover:scale-105 transition" />
            <div>
              <h1
                className="text-lg font-semibold tracking-tight"
                style={{ fontFamily: "'Playfair Display','Noto Naskh Arabic',serif" }}
              >
                MOON GARDEN
              </h1>
              <p className="text-[11px] text-[#7C7469] -mt-1">HOTEL & RESIDENCE</p>
            </div>
          </Link>

          {/* تبويبات سطح المكتب */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/rooms" className="hover:text-[#5E5B53]">الغرف الفندقية</Link>
            <Link to="/villas" className="hover:text-[#5E5B53]">الفلل والأجنحة الفندقية</Link>
            <Link to="/amenities" className="hover:text-[#5E5B53]">المرافق والخدمات</Link>
          </nav>
          {/* تبويبات الجوال */}
          <div className="md:hidden relative">
            <details className="relative">
              <summary className="list-none cursor-pointer px-3 py-2 rounded-lg bg-[#E8E1D6] text-[#2B2A28] font-bold flex items-center gap-2 shadow-sm">
                القائمة
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </summary>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E1D6] rounded-lg shadow-lg z-50 text-right">
                <Link to="/rooms" className="block px-4 py-3 hover:bg-[#F6F1E9]">الغرف الفندقية</Link>
                <Link to="/villas" className="block px-4 py-3 hover:bg-[#F6F1E9]">الفلل والأجنحة الفندقية</Link>
                <Link to="/amenities" className="block px-4 py-3 hover:bg-[#F6F1E9]">المرافق والخدمات</Link>
              </div>
            </details>
          </div>

          <a
            id="book"
            href="https://wa.me/966500000000"
            target="_blank"
            className="px-6 py-2.5 rounded-full bg-[#2F2E2B] text-[#FAF8F3] text-sm hover:opacity-90 transition"
          >
            احجز الآن
          </a>
        </div>
      </header>

      {/* ✅ بانر مطابق للغرف */}
      {!isDashboard && (
        <section
          className="relative h-[480px] bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(31,30,28,0.55), rgba(31,30,28,0.15)), url('/banner-fixed.png')",
          }}
        >
          <div className="text-center text-[#FAF8F3] px-4 drop-shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight golden-banner-title">
              الفلل والأجنحة الفندقية
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
              استمتع بإقامة فاخرة تجمع بين الراحة والخصوصية في Moon Garden.
            </p>
          </div>
        </section>
      )}

      {/* ✅ عرض الفلل */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center text-[#2B2A28]">
          اختر الفيلا أو الجناح المناسب لإقامتك
        </h2>
        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center golden-banner-title">
          الشاليهات الفاخرة
        </h2>

        {villas.length === 0 ? (
          <p className="text-center text-[#7C7469]">لا توجد فلل حالياً</p>
        ) : (
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {villas.map((villa) => {
              const discount = getDiscountedPrice(villa)
              return (
                <div
                  key={villa.id}
                  onClick={() => setSelectedVilla(villa)}
                  className="cursor-pointer bg-white border border-[#E8E1D6] rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden relative"
                >
                  {discount && (
                    <div className="absolute top-3 right-3 bg-green-700 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                      خصم {discount.offer.discount}
                      {discount.offer.discountType === "percent" ? "%" : " ريال"}
                    </div>
                  )}

                  <img
                    src={villa.images?.[0] || "/placeholder.png"}
                    alt={villa.name}
                    className="w-full h-56 object-cover"
                  />

                  <div className="p-4 text-right">
                    <h3 className="font-semibold text-lg mb-1">{villa.name}</h3>
                    <p className="text-[#7C7469] text-sm mb-2 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="inline w-4 h-4 text-yellow-700 mb-0.5">
                        <path d="M15.7 2.3a5 5 0 0 0-7.07 7.07l.35.35-6.36 6.36a1 1 0 0 0 0 1.42l1.42 1.42a1 1 0 0 0 1.42 0l6.36-6.36.35.35a5 5 0 1 0 7.07-7.07Zm-6.36 8.49 1.06-1.06 1.06 1.06-1.06 1.06-1.06-1.06ZM14 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
                      </svg>
                      {villa.status}
                    </p>

                    {discount ? (
                      <>
                        <p className="text-[#A48E78] line-through text-sm">
                          {discount.oldPrice} ريال
                        </p>
                        <p className="text-green-700 font-bold text-lg">
                          {discount.newPrice.toFixed(2)} ريال / الليلة 🎉
                        </p>
                      </>
                    ) : (
                      <p className="text-[#2B2A28] font-bold text-lg">
                        {villa.price} ريال / الليلة
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ✅ نافذة التفاصيل */}
      {selectedVilla && !showBookingForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#FAF8F3] rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden text-right relative border border-[#E8E1D6]">
            {/* زر الإغلاق */}
            <button
              onClick={() => setSelectedVilla(null)}
              className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#2B2A28] text-white text-lg font-bold hover:opacity-90 transition z-50"
              title="إغلاق"
            >
              ✕
            </button>

            <Swiper pagination={{ clickable: true }} modules={[Pagination]} className="w-full h-[400px] z-0">
              {selectedVilla.images?.map((img, i) => (
                <SwiperSlide key={i}>
                  <img src={img} alt={selectedVilla.name} className="w-full h-[400px] object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 text-[#2B2A28]">{selectedVilla.name}</h2>

              <p className="text-[#2B2A28] mb-3">
                💰 السعر: {selectedVilla.price} ريال / الليلة
              </p>

              <p className="text-[#7C7469] mb-4">
                🏷️ الحالة:{" "}
                <span
                  className={
                    selectedVilla.status === "متاح"
                      ? "text-green-700"
                      : selectedVilla.status === "محجوز"
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }
                >
                  {selectedVilla.status}
                </span>
              </p>

              <p className="text-[#5E5B53] leading-relaxed mb-6">
                {selectedVilla.description || "لا يوجد وصف لهذه الفيلا."}
              </p>

              <button
                onClick={() => setShowBookingForm(true)}
                className="bg-[#2B2A28] text-[#FAF8F3] px-6 py-3 rounded-full hover:opacity-90 transition"
              >
                احجز الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ نموذج الحجز */}
      {selectedVilla && showBookingForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#FAF8F3] rounded-2xl shadow-2xl w-full max-w-lg mx-4 text-right p-6 relative border border-[#E8E1D6]">
            <button
              onClick={() => setShowBookingForm(false)}
              className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#2B2A28] text-white text-xl font-bold hover:opacity-90 transition shadow-md z-50"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4 text-[#2B2A28]">
              🏡 حجز {selectedVilla.name}
            </h2>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-[#7C7469]">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={bookingData.fullName}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, fullName: e.target.value })
                  }
                  className="border border-[#E8E1D6] w-full p-2 rounded bg-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-[#7C7469]">رقم الجوال:</label>
                <input
                  type="tel"
                  required
                  value={bookingData.phone}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, phone: e.target.value })
                  }
                  className="border border-[#E8E1D6] w-full p-2 rounded bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[#7C7469]">تاريخ الوصول:</label>
                  <input
                    type="date"
                    required
                    value={bookingData.checkIn}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, checkIn: e.target.value })
                    }
                    className="border border-[#E8E1D6] w-full p-2 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#7C7469]">تاريخ المغادرة:</label>
                  <input
                    type="date"
                    required
                    value={bookingData.checkOut}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        checkOut: e.target.value,
                      })
                    }
                    className="border border-[#E8E1D6] w-full p-2 rounded bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[#7C7469]">عدد الأشخاص:</label>
                <input
                  type="number"
                  min={1}
                  value={bookingData.guests}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      guests: Number(e.target.value),
                    })
                  }
                  className="border border-[#E8E1D6] w-full p-2 rounded bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2B2A28] text-[#FAF8F3] py-3 rounded-full hover:opacity-90 transition"
              >
                تأكيد الحجز
              </button>
            </form>
          </div>
        </div>
      )}

      {!isDashboard && <Footer />}
    </div>
  )
}
