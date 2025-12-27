// src/pages/dashboard/StatsDashboard.tsx
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Link } from "react-router-dom"

export default function StatsDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    activeOffers: 0,
    totalVillas: 0,
    todayArrivals: 0,
    todayDepartures: 0,
    currentGuests: 0,
    totalGuests: 0,
    loading: true,
  })

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const loadStats = async () => {
      try {
        // ✅ الحجوزات
        const bookingsSnap = await getDocs(collection(db, "bookings"))
        const bookings = bookingsSnap.docs.map((d) => d.data() as any)
        const totalBookings = bookings.length

        // الوصول اليوم
        const todayArrivals = bookings.filter(
          (b) => b.checkIn === today && b.status !== "مسجل دخول" && b.status !== "ملغي"
        ).length

        // المغادرة اليوم
        const todayDepartures = bookings.filter(
          (b) => b.checkOut === today && b.status === "مسجل دخول"
        ).length

        // النزلاء الحاليين
        const currentGuests = bookings.filter((b) => b.status === "مسجل دخول").length

        // إجمالي النزلاء (فريد بناءً على رقم الجوال)
        const uniqueGuests = new Set(bookings.map((b) => b.phone).filter(Boolean))
        const totalGuests = uniqueGuests.size

        // ✅ الغرف
        const roomsSnap = await getDocs(collection(db, "rooms"))
        const rooms = roomsSnap.docs.map((d) => d.data() as any)
        const availableRooms = rooms.filter((r) => r.status === "متاح").length
        const occupiedRooms = rooms.filter((r) => r.status === "محجوز").length

        // ✅ الفلل
        const villasSnap = await getDocs(collection(db, "villas"))
        const totalVillas = villasSnap.size

        // ✅ العروض النشطة
        let activeOffers = 0
        try {
          const offersQuery = query(
            collection(db, "offers"),
            where("active", "==", true)
          )
          const offersSnap = await getDocs(offersQuery)
          activeOffers = offersSnap.size
        } catch {
          activeOffers = 0
        }

        setStats({
          totalBookings,
          availableRooms,
          occupiedRooms,
          activeOffers,
          totalVillas,
          todayArrivals,
          todayDepartures,
          currentGuests,
          totalGuests,
          loading: false,
        })
      } catch (err) {
        console.error("❌ خطأ في تحميل الإحصائيات:", err)
      }
    }

    loadStats()
  }, [])

  if (stats.loading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل الإحصائيات...</p>
      </div>
    )

  return (
    <div className="text-right">
      {/* العنوان */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold golden-banner-title mb-2" style={{ fontFamily: "'Playfair Display','Noto Naskh Arabic',serif" }}>
          نظام إدارة الفندق - PMS
        </h1>
        <p className="text-[#7C7469]">
          {new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* ملخص اليوم */}
      <div className="bg-gradient-to-l from-[#2B2A28] to-[#3D3A36] rounded-2xl p-6 mb-8 text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📅</span> ملخص اليوم
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/dashboard/front-desk" className="bg-white/10 backdrop-blur rounded-xl p-4 text-center hover:bg-white/20 transition">
            <p className="text-3xl font-bold text-green-400">{stats.todayArrivals}</p>
            <p className="text-sm text-white/80">🚪 وصول اليوم</p>
          </Link>
          <Link to="/dashboard/front-desk" className="bg-white/10 backdrop-blur rounded-xl p-4 text-center hover:bg-white/20 transition">
            <p className="text-3xl font-bold text-orange-400">{stats.todayDepartures}</p>
            <p className="text-sm text-white/80">🚶 مغادرة اليوم</p>
          </Link>
          <Link to="/dashboard/front-desk" className="bg-white/10 backdrop-blur rounded-xl p-4 text-center hover:bg-white/20 transition">
            <p className="text-3xl font-bold text-blue-400">{stats.currentGuests}</p>
            <p className="text-sm text-white/80">🏠 نزيل حالياً</p>
          </Link>
          <Link to="/dashboard/room-status" className="bg-white/10 backdrop-blur rounded-xl p-4 text-center hover:bg-white/20 transition">
            <p className="text-3xl font-bold text-[#C6A76D]">{stats.occupiedRooms}</p>
            <p className="text-sm text-white/80">🛏️ غرفة مشغولة</p>
          </Link>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* الحجوزات */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FAF8F3] to-white rounded-2xl shadow-lg p-6 border border-[#E8E1D6] group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#C6A76D]/20 to-transparent rounded-bl-full"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C6A76D] to-[#A48E78] rounded-xl flex items-center justify-center shadow-md mb-4">
              <span className="text-xl">📅</span>
            </div>
            <p className="text-[#7C7469] text-sm font-medium mb-1">إجمالي الحجوزات</p>
            <p className="text-3xl font-bold text-[#2B2A28]">{stats.totalBookings}</p>
          </div>
        </div>

        {/* الغرف المتاحة */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FAF8F3] to-white rounded-2xl shadow-lg p-6 border border-[#E8E1D6] group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#7CB342]/20 to-transparent rounded-bl-full"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-xl flex items-center justify-center shadow-md mb-4">
              <span className="text-xl">🏨</span>
            </div>
            <p className="text-[#7C7469] text-sm font-medium mb-1">الغرف المتاحة</p>
            <p className="text-3xl font-bold text-[#558B2F]">{stats.availableRooms}</p>
          </div>
        </div>

        {/* النزلاء */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FAF8F3] to-white rounded-2xl shadow-lg p-6 border border-[#E8E1D6] group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#42A5F5]/20 to-transparent rounded-bl-full"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#42A5F5] to-[#1976D2] rounded-xl flex items-center justify-center shadow-md mb-4">
              <span className="text-xl">👥</span>
            </div>
            <p className="text-[#7C7469] text-sm font-medium mb-1">إجمالي النزلاء</p>
            <p className="text-3xl font-bold text-[#1976D2]">{stats.totalGuests}</p>
          </div>
        </div>

        {/* الفلل */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FAF8F3] to-white rounded-2xl shadow-lg p-6 border border-[#E8E1D6] group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#AB47BC]/20 to-transparent rounded-bl-full"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#AB47BC] to-[#7B1FA2] rounded-xl flex items-center justify-center shadow-md mb-4">
              <span className="text-xl">🏡</span>
            </div>
            <p className="text-[#7C7469] text-sm font-medium mb-1">الفلل والشاليهات</p>
            <p className="text-3xl font-bold text-[#7B1FA2]">{stats.totalVillas}</p>
          </div>
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="pt-8 border-t border-[#E8E1D6]">
        <h3 className="text-lg font-semibold text-[#2B2A28] mb-4">الإجراءات السريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/dashboard/front-desk" className="flex items-center justify-center gap-2 bg-gradient-to-l from-green-500 to-green-600 text-white py-4 px-6 rounded-xl transition-all hover:shadow-lg hover:scale-[1.02]">
            <span>🏨</span> الاستقبال
          </Link>
          <Link to="/dashboard/bookings" className="flex items-center justify-center gap-2 bg-gradient-to-l from-[#C6A76D]/10 to-[#A48E78]/10 hover:from-[#C6A76D]/20 hover:to-[#A48E78]/20 text-[#2B2A28] py-4 px-6 rounded-xl transition-all border border-[#C6A76D]/30 hover:border-[#C6A76D]/50">
            <span>📅</span> الحجوزات
          </Link>
          <Link to="/dashboard/room-status" className="flex items-center justify-center gap-2 bg-gradient-to-l from-[#C6A76D]/10 to-[#A48E78]/10 hover:from-[#C6A76D]/20 hover:to-[#A48E78]/20 text-[#2B2A28] py-4 px-6 rounded-xl transition-all border border-[#C6A76D]/30 hover:border-[#C6A76D]/50">
            <span>🗂️</span> حالة الوحدات
          </Link>
          <Link to="/dashboard/guests" className="flex items-center justify-center gap-2 bg-gradient-to-l from-[#C6A76D]/10 to-[#A48E78]/10 hover:from-[#C6A76D]/20 hover:to-[#A48E78]/20 text-[#2B2A28] py-4 px-6 rounded-xl transition-all border border-[#C6A76D]/30 hover:border-[#C6A76D]/50">
            <span>👥</span> سجل النزلاء
          </Link>
        </div>
      </div>
    </div>
  )
}
