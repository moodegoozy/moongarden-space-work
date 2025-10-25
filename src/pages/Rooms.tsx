import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import { useLocation } from "react-router-dom"
import "swiper/css"
import "swiper/css/pagination"

type Room = {
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

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
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

  // ✅ تحميل الغرف + العروض
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
          } as Room
        })

        const offersData = offersSnap.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
          .filter((o) => o.status === "نشط" && o.unitType === "room")

        setRooms(roomsData)
        setOffers(offersData)
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل الغرف أو العروض:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ✅ دالة لحساب السعر بعد الخصم
  const getDiscountedPrice = (room: Room) => {
    const offer = offers.find((o) => o.unitId === room.id)
    if (!offer) return null

    const { discount, discountType } = offer
    const oldPrice = room.price
    const newPrice =
      discountType === "percent"
        ? oldPrice - oldPrice * (discount / 100)
        : oldPrice - discount

    return { oldPrice, newPrice, offer }
  }

  // ✅ إرسال بيانات الحجز
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom) return

    try {
      await addDoc(collection(db, "bookings"), {
        fullName: bookingData.fullName,
        phone: bookingData.phone,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        price: selectedRoom.price,
        status: "جديد",
        type: "room",
        createdAt: serverTimestamp(),
      })

      alert("✅ تم إرسال طلب الحجز بنجاح! سيتم التواصل معك قريباً.")
      setShowBookingForm(false)
      setSelectedRoom(null)
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
    return <p className="text-center py-10 text-gray-600">⏳ جاري تحميل الغرف...</p>

  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-col">
      <Navbar />

      {/* ✅ بانر */}
      {!isDashboard && (
        <section
          className="relative h-[500px] bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: "url('/rooms-banner.png')" }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">الغرف الفندقية</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              اكتشف مجموعتنا الراقية من الغرف المصممة بعناية لتمنحك الراحة والفخامة.
            </p>
          </div>
        </section>
      )}

      {/* ✅ الغرف */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16">
        {!isDashboard && (
          <h2 className="text-2xl font-bold mb-10 text-center text-gray-800">
            اختر الغرفة المناسبة لإقامتك
          </h2>
        )}

        {rooms.length === 0 ? (
          <p className="text-center text-gray-500">لا توجد غرف حالياً</p>
        ) : (
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {rooms.map((room) => {
              const discount = getDiscountedPrice(room)
              return (
                <div
                  key={room.id}
                  onClick={() => !isDashboard && setSelectedRoom(room)}
                  className="cursor-pointer bg-white border rounded-xl shadow-md hover:shadow-xl transition overflow-hidden relative"
                >
                  {discount && (
                    <div className="absolute top-3 right-3 bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                      خصم {discount.offer.discount}
                      {discount.offer.discountType === "percent" ? "%" : " ريال"}
                    </div>
                  )}

                  <img
                    src={room.images?.[0] || "/placeholder.png"}
                    alt={room.name}
                    className="w-full h-56 object-cover"
                  />

                  <div className="p-4 text-right">
                    <h3 className="font-bold text-lg mb-2">{room.name}</h3>
                    <p className="text-gray-600 mb-1">📦 {room.status}</p>

                    {discount ? (
                      <>
                        <p className="text-red-500 line-through text-sm">
                          {discount.oldPrice} ريال
                        </p>
                        <p className="text-green-600 font-bold text-lg">
                          {discount.newPrice.toFixed(2)} ريال / الليلة 🎉
                        </p>
                      </>
                    ) : (
                      <p className="text-black font-bold text-lg">
                        {room.price} ريال / الليلة
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {!isDashboard && <Footer />}

      {/* ✅ نافذة التفاصيل */}
      {selectedRoom && !showBookingForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden text-right relative animate-fadeIn">
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/80 text-white text-xl font-bold hover:bg-black transition-all shadow-lg"
              style={{ backdropFilter: "blur(4px)" }}
              title="إغلاق"
            >
              ✕
            </button>

            <Swiper pagination={{ clickable: true }} modules={[Pagination]} className="w-full h-[400px]">
              {selectedRoom.images?.map((img, i) => (
                <SwiperSlide key={i}>
                  <img
                    src={img}
                    alt={selectedRoom.name}
                    className="w-full h-[400px] object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                {selectedRoom.name}
              </h2>

              {/* ✅ السعر داخل التفاصيل */}
              {(() => {
                const discount = getDiscountedPrice(selectedRoom)
                if (discount) {
                  return (
                    <div className="mb-3">
                      <p className="text-red-500 line-through text-sm">
                        السعر الأصلي: {discount.oldPrice} ريال
                      </p>
                      <p className="text-green-600 font-bold text-xl">
                        السعر بعد الخصم: {discount.newPrice.toFixed(2)} ريال / الليلة 🎉
                      </p>
                    </div>
                  )
                } else {
                  return (
                    <p className="text-gray-700 mb-3">
                      💰 السعر: {selectedRoom.price} ريال / الليلة
                    </p>
                  )
                }
              })()}

              <p className="text-gray-600 mb-4">
                🏷️ الحالة:{" "}
                <span
                  className={
                    selectedRoom.status === "متاح"
                      ? "text-green-600"
                      : selectedRoom.status === "محجوز"
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }
                >
                  {selectedRoom.status}
                </span>
              </p>

              <p className="text-gray-700 leading-relaxed">
                {selectedRoom.description || "لا يوجد وصف لهذه الغرفة."}
              </p>

              {!isDashboard && (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
                >
                  احجز الآن
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ نموذج الحجز */}
      {selectedRoom && showBookingForm && !isDashboard && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 text-right p-6 animate-fadeIn relative">
            <button
              onClick={() => setShowBookingForm(false)}
              className="absolute top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/80 text-white text-xl font-bold hover:bg-black transition-all shadow-lg"
              style={{ backdropFilter: "blur(4px)" }}
              title="إغلاق"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">🛏️ حجز {selectedRoom.name}</h2>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={bookingData.fullName}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, fullName: e.target.value })
                  }
                  className="border w-full p-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1">رقم الجوال:</label>
                <input
                  type="tel"
                  required
                  value={bookingData.phone}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, phone: e.target.value })
                  }
                  className="border w-full p-2 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">تاريخ الوصول:</label>
                  <input
                    type="date"
                    required
                    value={bookingData.checkIn}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, checkIn: e.target.value })
                    }
                    className="border w-full p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">تاريخ المغادرة:</label>
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
                    className="border w-full p-2 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">عدد الأشخاص:</label>
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
                  className="border w-full p-2 rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
              >
                تأكيد الحجز
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
