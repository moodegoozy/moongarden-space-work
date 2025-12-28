// src/pages/dashboard/FrontDesk.tsx
// صفحة الاستقبال - نظام PMS
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore"
import Pagination, { paginateData } from "@/components/Pagination"

type Booking = {
  id: string
  fullName: string
  phone: string
  nationalId?: string
  birthDate?: string
  checkIn: string
  checkOut: string
  checkInTime?: string
  checkOutTime?: string
  actualCheckIn?: string
  actualCheckOut?: string
  guests: number
  price: number
  roomName?: string
  villaName?: string
  unitId?: string
  status: string
  type: "room" | "villa"
}

type Unit = {
  id: string
  name: string
  unitNumber?: string
  status: string
  type: "room" | "villa"
}

export default function FrontDesk() {
  const [todayArrivals, setTodayArrivals] = useState<Booking[]>([])
  const [todayDepartures, setTodayDepartures] = useState<Booking[]>([])
  const [currentGuests, setCurrentGuests] = useState<Booking[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"arrivals" | "departures" | "inhouse">("arrivals")
  const [arrivalsPage, setArrivalsPage] = useState(1)
  const [departuresPage, setDeparturesPage] = useState(1)
  const [inhousePage, setInhousePage] = useState(1)
  const itemsPerPage = 5

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // جلب جميع الحجوزات
      const bookingsSnap = await getDocs(collection(db, "bookings"))
      const allBookings = bookingsSnap.docs.map((d) => {
        const b = d.data() as any
        return {
          id: d.id,
          fullName: b.fullName || "—",
          phone: b.phone || "—",
          nationalId: b.nationalId || "",
          birthDate: b.birthDate || "",
          checkIn: b.checkIn || "",
          checkOut: b.checkOut || "",
          checkInTime: b.checkInTime || "14:00",
          checkOutTime: b.checkOutTime || "12:00",
          actualCheckIn: b.actualCheckIn || "",
          actualCheckOut: b.actualCheckOut || "",
          guests: b.guests || 1,
          price: b.price || 0,
          roomName: b.roomName,
          villaName: b.villaName,
          unitId: b.unitId,
          status: b.status || "مؤكد",
          type: b.type || "room",
        } as Booking
      })

      // الوصول اليوم (حجوزات بتاريخ وصول اليوم ولم يسجلوا دخول)
      const arrivals = allBookings.filter(
        (b) => b.checkIn === today && b.status !== "مسجل دخول" && b.status !== "ملغي"
      )
      setTodayArrivals(arrivals)

      // المغادرة اليوم (حجوزات بتاريخ خروج اليوم ومسجلين دخول)
      const departures = allBookings.filter(
        (b) => b.checkOut === today && b.status === "مسجل دخول"
      )
      setTodayDepartures(departures)

      // النزلاء الحاليين (مسجلين دخول)
      const inhouse = allBookings.filter((b) => b.status === "مسجل دخول")
      setCurrentGuests(inhouse)

      // جلب الوحدات
      const roomsSnap = await getDocs(collection(db, "rooms"))
      const villasSnap = await getDocs(collection(db, "villas"))
      const allUnits: Unit[] = [
        ...roomsSnap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          unitNumber: d.data().unitNumber,
          status: d.data().status,
          type: "room" as const,
        })),
        ...villasSnap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          unitNumber: d.data().unitNumber,
          status: d.data().status,
          type: "villa" as const,
        })),
      ]
      setUnits(allUnits)
    } catch (err) {
      console.error("❌ خطأ:", err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ تسجيل الدخول (Check-in)
  const handleCheckIn = async (booking: Booking) => {
    if (!confirm(`تأكيد تسجيل دخول ${booking.fullName}؟`)) return
    setProcessingId(booking.id)

    try {
      const now = new Date()
      const timeStr = now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })

      // تحديث الحجز
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "مسجل دخول",
        actualCheckIn: `${today} ${timeStr}`,
      })

      // تحديث حالة الوحدة
      if (booking.unitId) {
        const collectionName = booking.type === "room" ? "rooms" : "villas"
        await updateDoc(doc(db, collectionName, booking.unitId), {
          status: "محجوز",
        })
      }

      await fetchData()
      alert("✅ تم تسجيل الدخول بنجاح")
    } catch (err) {
      console.error("❌ خطأ:", err)
      alert("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setProcessingId(null)
    }
  }

  // ✅ تسجيل الخروج (Check-out)
  const handleCheckOut = async (booking: Booking) => {
    if (!confirm(`تأكيد تسجيل خروج ${booking.fullName}؟`)) return
    setProcessingId(booking.id)

    try {
      const now = new Date()
      const timeStr = now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })

      // تحديث الحجز
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "مغادر",
        actualCheckOut: `${today} ${timeStr}`,
      })

      // تحديث حالة الوحدة إلى متاح + متسخة (تحتاج تنظيف)
      if (booking.unitId) {
        const collectionName = booking.type === "room" ? "rooms" : "villas"
        await updateDoc(doc(db, collectionName, booking.unitId), {
          status: "متاح",
          housekeepingStatus: "متسخة", // 🧹 تعيين متسخة تلقائياً بعد الخروج
        })
      }

      await fetchData()
      alert("✅ تم تسجيل الخروج بنجاح\n🧹 الوحدة تحتاج تنظيف")
    } catch (err) {
      console.error("❌ خطأ:", err)
      alert("حدث خطأ أثناء تسجيل الخروج")
    } finally {
      setProcessingId(null)
    }
  }

  const getUnitName = (booking: Booking) => {
    return booking.roomName || booking.villaName || "—"
  }

  const getUnitNumber = (booking: Booking) => {
    const unit = units.find((u) => u.id === booking.unitId)
    return unit?.unitNumber || "—"
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل بيانات الاستقبال...</p>
      </div>
    )
  }

  return (
    <div className="text-right">
      {/* الهيدر */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#C6A76D] to-[#8B7355] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🏨</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2B2A28]">الاستقبال - Front Desk</h1>
            <p className="text-[#7C7469] text-sm">
              {new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* ملخص سريع */}
        <div className="flex gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center">
            <p className="text-green-600 font-bold text-xl">{todayArrivals.length}</p>
            <p className="text-green-600 text-xs">وصول اليوم</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-center">
            <p className="text-orange-600 font-bold text-xl">{todayDepartures.length}</p>
            <p className="text-orange-600 text-xs">مغادرة اليوم</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
            <p className="text-blue-600 font-bold text-xl">{currentGuests.length}</p>
            <p className="text-blue-600 text-xs">نزيل حالياً</p>
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 mb-6 border-b border-[#E8E1D6] pb-4">
        <button
          onClick={() => setActiveTab("arrivals")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "arrivals"
              ? "bg-gradient-to-l from-[#C6A76D] to-[#8B7355] text-white shadow-lg"
              : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:border-[#C6A76D]"
          }`}
        >
          🚪 الوصول ({todayArrivals.length})
        </button>
        <button
          onClick={() => setActiveTab("departures")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "departures"
              ? "bg-gradient-to-l from-[#C6A76D] to-[#8B7355] text-white shadow-lg"
              : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:border-[#C6A76D]"
          }`}
        >
          🚶 المغادرة ({todayDepartures.length})
        </button>
        <button
          onClick={() => setActiveTab("inhouse")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "inhouse"
              ? "bg-gradient-to-l from-[#C6A76D] to-[#8B7355] text-white shadow-lg"
              : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:border-[#C6A76D]"
          }`}
        >
          🏠 النزلاء الحاليين ({currentGuests.length})
        </button>
      </div>

      {/* المحتوى */}
      <div className="bg-white rounded-2xl border border-[#E8E1D6] overflow-hidden shadow-sm">
        {activeTab === "arrivals" && (
          <>
            {todayArrivals.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl mb-4 block">✨</span>
                <p className="text-[#7C7469] text-lg">لا يوجد وصول متوقع اليوم</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-l from-[#FAF8F3] to-[#F6F1E9] border-b border-[#E8E1D6]">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">النزيل</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">رقم الهوية</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">الوحدة</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">رقم الوحدة</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">الضيوف</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">المغادرة</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#2B2A28]">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginateData(todayArrivals, arrivalsPage, itemsPerPage).map((booking, idx) => (
                      <tr
                        key={booking.id}
                        className={`border-b border-[#E8E1D6]/50 hover:bg-[#FAF8F3]/50 transition ${
                          idx % 2 === 0 ? "bg-white" : "bg-[#FDFCFA]"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-[#2B2A28]">{booking.fullName}</p>
                            <p className="text-sm text-[#7C7469]">{booking.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#2B2A28]">{booking.nationalId || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            booking.type === "room" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                          }`}>
                            {getUnitName(booking)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#2B2A28] font-medium">{getUnitNumber(booking)}</td>
                        <td className="px-6 py-4 text-[#2B2A28]">{booking.guests} ضيف</td>
                        <td className="px-6 py-4 text-[#7C7469]">{booking.checkOut}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleCheckIn(booking)}
                            disabled={processingId === booking.id}
                            className="bg-gradient-to-l from-green-500 to-green-600 text-white px-5 py-2 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
                          >
                            {processingId === booking.id ? "جاري..." : "✓ تسجيل دخول"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {todayArrivals.length > 0 && (
              <Pagination
                currentPage={arrivalsPage}
                totalItems={todayArrivals.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setArrivalsPage}
              />
            )}
          </>
        )}

        {activeTab === "departures" && (
          <>
            {todayDepartures.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl mb-4 block">🌙</span>
                <p className="text-[#7C7469] text-lg">لا يوجد مغادرة متوقعة اليوم</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-l from-[#FAF8F3] to-[#F6F1E9] border-b border-[#E8E1D6]">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">النزيل</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">الوحدة</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">رقم الوحدة</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">وقت الدخول</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">ليالي</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">المبلغ</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#2B2A28]">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginateData(todayDepartures, departuresPage, itemsPerPage).map((booking, idx) => {
                      const nights = Math.ceil(
                        (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
                      )
                      return (
                        <tr
                          key={booking.id}
                          className={`border-b border-[#E8E1D6]/50 hover:bg-[#FAF8F3]/50 transition ${
                            idx % 2 === 0 ? "bg-white" : "bg-[#FDFCFA]"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-[#2B2A28]">{booking.fullName}</p>
                              <p className="text-sm text-[#7C7469]">{booking.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              booking.type === "room" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                            }`}>
                              {getUnitName(booking)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#2B2A28] font-medium">{getUnitNumber(booking)}</td>
                          <td className="px-6 py-4 text-[#7C7469]">{booking.actualCheckIn || "—"}</td>
                          <td className="px-6 py-4 text-[#2B2A28]">{nights} ليلة</td>
                          <td className="px-6 py-4 text-[#C6A76D] font-bold">{booking.price} ر.س</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleCheckOut(booking)}
                              disabled={processingId === booking.id}
                              className="bg-gradient-to-l from-orange-500 to-orange-600 text-white px-5 py-2 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
                            >
                              {processingId === booking.id ? "جاري..." : "🚶 تسجيل خروج"}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {todayDepartures.length > 0 && (
              <Pagination
                currentPage={departuresPage}
                totalItems={todayDepartures.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setDeparturesPage}
              />
            )}
          </>
        )}

        {activeTab === "inhouse" && (
          <>
            {currentGuests.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl mb-4 block">🏠</span>
                <p className="text-[#7C7469] text-lg">لا يوجد نزلاء حالياً</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-l from-[#FAF8F3] to-[#F6F1E9] border-b border-[#E8E1D6]">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">النزيل</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">الهوية</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">الوحدة</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">رقم الوحدة</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">تاريخ الدخول</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">تاريخ الخروج</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">الضيوف</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#2B2A28]">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginateData(currentGuests, inhousePage, itemsPerPage).map((booking, idx) => (
                      <tr
                        key={booking.id}
                        className={`border-b border-[#E8E1D6]/50 hover:bg-[#FAF8F3]/50 transition ${
                          idx % 2 === 0 ? "bg-white" : "bg-[#FDFCFA]"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-[#2B2A28]">{booking.fullName}</p>
                            <p className="text-sm text-[#7C7469]">{booking.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#2B2A28]">{booking.nationalId || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            booking.type === "room" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                          }`}>
                            {getUnitName(booking)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#2B2A28] font-medium">{getUnitNumber(booking)}</td>
                        <td className="px-6 py-4 text-[#7C7469]">{booking.checkIn}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.checkOut === today ? "bg-orange-100 text-orange-700" : "text-[#7C7469]"
                          }`}>
                            {booking.checkOut}
                            {booking.checkOut === today && " (اليوم)"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#2B2A28]">{booking.guests} ضيف</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleCheckOut(booking)}
                            disabled={processingId === booking.id}
                            className="bg-gradient-to-l from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition disabled:opacity-50"
                          >
                            {processingId === booking.id ? "جاري..." : "تسجيل خروج"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {currentGuests.length > 0 && (
              <Pagination
                currentPage={inhousePage}
                totalItems={currentGuests.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setInhousePage}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
