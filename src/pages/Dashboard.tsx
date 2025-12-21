import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { db, auth } from "@/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { signOut } from "firebase/auth"

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const isDefault = location.pathname === "/dashboard"
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [stats, setStats] = useState({
    totalBookings: 0,
    availableRooms: 0,
    activeOffers: 0,
    loading: true,
    lastUpdated: "",
  })

  const links = [
    { to: "/dashboard", label: "📊 الإحصائيات", icon: "📊" },
    { to: "/dashboard/bookings", label: "📅 الحجوزات", icon: "📅" },
    { to: "/dashboard/rooms", label: "🏨 عرض الغرف", icon: "🏨" },
    { to: "/dashboard/rooms/manage", label: "🛠️ إدارة الغرف", icon: "🛠️" },
    { to: "/dashboard/villas", label: "🏡 عرض الفلل", icon: "🏡" },
    { to: "/dashboard/villas/manage", label: "⚙️ إدارة الفلل", icon: "⚙️" },
    { to: "/dashboard/offers", label: "🎁 العروض", icon: "🎁" },
    { to: "/dashboard/clients", label: "👥 العملاء", icon: "👥" },
  ]

  // ✅ تحميل الإحصائيات
  useEffect(() => {
    const loadStats = async () => {
      try {
        const bookingsSnap = await getDocs(collection(db, "bookings"))
        const totalBookings = bookingsSnap.size

        const roomsQuery = query(collection(db, "rooms"), where("status", "==", "متاح"))
        const roomsSnap = await getDocs(roomsQuery)
        const availableRooms = roomsSnap.size

        const offersQuery = query(collection(db, "offers"), where("status", "==", "نشط"))
        const offersSnap = await getDocs(offersQuery)
        const activeOffers = offersSnap.size

        const now = new Date().toLocaleString("ar-SA")

        setStats({
          totalBookings,
          availableRooms,
          activeOffers,
          loading: false,
          lastUpdated: now,
        })
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل الإحصائيات:", err)
      }
    }
    loadStats()
  }, [])

  // ✅ تسجيل الخروج
  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/") // ✅ يرجع للصفحة الرئيسية بعد تسجيل الخروج
    } catch (err) {
      console.error("❌ خطأ أثناء تسجيل الخروج:", err)
      alert("حدث خطأ أثناء تسجيل الخروج، حاول مرة أخرى.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-[#F6F1E9]">
      {/* ✅ زر فتح القائمة للجوال */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-l from-[#2B2A28] to-[#3D3A36] p-4 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-2 rounded-lg bg-[#C6A76D]/20 hover:bg-[#C6A76D]/30 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[#C6A76D] font-bold text-sm">Moon Garden</span>
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
      </div>

      {/* ✅ الخلفية المعتمة عند فتح القائمة */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ✅ الشريط الجانبي الفخم */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50
        w-72 bg-gradient-to-b from-[#2B2A28] via-[#3D3A36] to-[#2B2A28] text-white 
        p-6 flex flex-col justify-between shadow-2xl border-l border-[#C6A76D]/30
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* الشعار */}
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[#C6A76D]/40">
            <img src="/logo.png" alt="Moon Garden" className="w-12 h-12 lg:w-14 lg:h-14 object-contain" />
            <div>
              <h2 className="text-xl font-bold tracking-wide golden-banner-title">
                MOON GARDEN
              </h2>
              <p className="text-[10px] text-[#C6A76D]/80 tracking-widest">لوحة التحكم</p>
            </div>
          </div>

          {/* روابط التنقل */}
          <nav className="flex flex-col gap-2 text-right">
            {links.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`py-3 px-4 rounded-xl transition-all duration-300 font-medium flex items-center justify-end gap-2 text-sm lg:text-base ${
                    isActive
                      ? "bg-gradient-to-l from-[#C6A76D] to-[#A48E78] text-[#2B2A28] shadow-lg"
                      : "hover:bg-[#C6A76D]/10 hover:text-[#E2C891] text-[#E8E1D6]"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* زر تسجيل الخروج */}
        <div className="mt-8 border-t border-[#C6A76D]/30 pt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-l from-[#8B4513] to-[#A0522D] text-white py-3 rounded-xl font-semibold hover:from-[#A0522D] hover:to-[#CD853F] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            تسجيل خروج
          </button>
          <div className="text-center mt-6">
            <p className="text-xs text-[#7C7469]">© {new Date().getFullYear()}</p>
            <p className="text-[10px] text-[#C6A76D]/60 mt-1">Moon Garden Group</p>
          </div>
        </div>
      </aside>

      {/* ✅ المحتوى الرئيسي */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto pt-20 lg:pt-8">
        {/* الشريط العلوي */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-sm border border-[#E8E1D6]">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#C6A76D] to-[#A48E78] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-xl lg:text-2xl">✨</span>
            </div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold text-[#2B2A28]" style={{ fontFamily: "'Playfair Display','Noto Naskh Arabic',serif" }}>
                لوحة تحكم Moon Garden
              </h1>
              <p className="text-xs lg:text-sm text-[#7C7469]">إدارة الحجوزات والوحدات</p>
            </div>
          </div>
          <div className="text-right sm:text-left">
            <p className="text-xs text-[#7C7469]">آخر تحديث</p>
            <p className="text-xs lg:text-sm font-medium text-[#2B2A28]">{stats.lastUpdated || "—"}</p>
          </div>
        </div>

        {/* المحتوى */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 lg:p-8 border border-[#E8E1D6] min-h-[calc(100vh-280px)] lg:min-h-[calc(100vh-200px)]">
          {isDefault ? (
            stats.loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#7C7469]">جاري تحميل الإحصائيات...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* عنوان القسم */}
                <div className="text-center mb-6 lg:mb-10">
                  <h2 className="text-xl lg:text-3xl font-bold golden-banner-title mb-2" style={{ fontFamily: "'Playfair Display','Noto Naskh Arabic',serif" }}>
                    نظرة عامة على النظام
                  </h2>
                  <p className="text-[#7C7469] text-sm lg:text-base">إحصائيات سريعة لأداء المنشأة</p>
                </div>

                {/* بطاقات الإحصائيات */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 text-right">
                  {/* الحجوزات */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#FAF8F3] to-white rounded-2xl shadow-lg p-4 lg:p-6 border border-[#E8E1D6] group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-br from-[#C6A76D]/20 to-transparent rounded-bl-full"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3 lg:mb-4">
                        <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-[#C6A76D] to-[#A48E78] rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-lg lg:text-2xl">📅</span>
                        </div>
                        <div className="text-right">
                          <h3 className="text-[#7C7469] text-xs lg:text-sm font-medium">إجمالي الحجوزات</h3>
                          <p className="text-2xl lg:text-4xl font-bold text-[#2B2A28] mt-1">{stats.totalBookings}</p>
                        </div>
                      </div>
                      <div className="pt-3 lg:pt-4 border-t border-[#E8E1D6]">
                        <p className="text-[10px] lg:text-xs text-[#A48E78]">📊 حجوزات مسجلة</p>
                      </div>
                    </div>
                  </div>

                  {/* الغرف المتاحة */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#FAF8F3] to-white rounded-2xl shadow-lg p-4 lg:p-6 border border-[#E8E1D6] group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-br from-[#7CB342]/20 to-transparent rounded-bl-full"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3 lg:mb-4">
                        <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-lg lg:text-2xl">🏨</span>
                        </div>
                        <div className="text-right">
                          <h3 className="text-[#7C7469] text-xs lg:text-sm font-medium">الغرف المتاحة</h3>
                          <p className="text-2xl lg:text-4xl font-bold text-[#558B2F] mt-1">{stats.availableRooms}</p>
                        </div>
                      </div>
                      <div className="pt-3 lg:pt-4 border-t border-[#E8E1D6]">
                        <p className="text-[10px] lg:text-xs text-[#7CB342]">✅ جاهزة للحجز</p>
                      </div>
                    </div>
                  </div>

                  {/* العروض النشطة */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#FAF8F3] to-white rounded-2xl shadow-lg p-4 lg:p-6 border border-[#E8E1D6] group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-br from-[#AB47BC]/20 to-transparent rounded-bl-full"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3 lg:mb-4">
                        <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-[#AB47BC] to-[#7B1FA2] rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-lg lg:text-2xl">🎁</span>
                        </div>
                        <div className="text-right">
                          <h3 className="text-[#7C7469] text-xs lg:text-sm font-medium">العروض النشطة</h3>
                          <p className="text-2xl lg:text-4xl font-bold text-[#7B1FA2] mt-1">{stats.activeOffers}</p>
                        </div>
                      </div>
                      <div className="pt-3 lg:pt-4 border-t border-[#E8E1D6]">
                        <p className="text-[10px] lg:text-xs text-[#AB47BC]">🎉 عروض متاحة</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* روابط سريعة */}
                <div className="mt-6 lg:mt-10 pt-6 lg:pt-8 border-t border-[#E8E1D6]">
                  <h3 className="text-base lg:text-lg font-semibold text-[#2B2A28] mb-4 text-right">الإجراءات السريعة</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    <Link to="/dashboard/bookings" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center gap-2 bg-gradient-to-l from-[#C6A76D]/10 to-[#A48E78]/10 hover:from-[#C6A76D]/20 hover:to-[#A48E78]/20 text-[#2B2A28] py-3 lg:py-4 px-3 lg:px-6 rounded-xl transition-all border border-[#C6A76D]/30 hover:border-[#C6A76D]/50 text-xs lg:text-sm">
                      <span>📅</span> <span className="hidden sm:inline">عرض</span> الحجوزات
                    </Link>
                    <Link to="/dashboard/rooms/manage" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center gap-2 bg-gradient-to-l from-[#C6A76D]/10 to-[#A48E78]/10 hover:from-[#C6A76D]/20 hover:to-[#A48E78]/20 text-[#2B2A28] py-3 lg:py-4 px-3 lg:px-6 rounded-xl transition-all border border-[#C6A76D]/30 hover:border-[#C6A76D]/50 text-xs lg:text-sm">
                      <span>🛠️</span> <span className="hidden sm:inline">إدارة</span> الغرف
                    </Link>
                    <Link to="/dashboard/villas/manage" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center gap-2 bg-gradient-to-l from-[#C6A76D]/10 to-[#A48E78]/10 hover:from-[#C6A76D]/20 hover:to-[#A48E78]/20 text-[#2B2A28] py-3 lg:py-4 px-3 lg:px-6 rounded-xl transition-all border border-[#C6A76D]/30 hover:border-[#C6A76D]/50 text-xs lg:text-sm">
                      <span>🏡</span> <span className="hidden sm:inline">إدارة</span> الفلل
                    </Link>
                    <Link to="/dashboard/offers" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center gap-2 bg-gradient-to-l from-[#C6A76D]/10 to-[#A48E78]/10 hover:from-[#C6A76D]/20 hover:to-[#A48E78]/20 text-[#2B2A28] py-3 lg:py-4 px-3 lg:px-6 rounded-xl transition-all border border-[#C6A76D]/30 hover:border-[#C6A76D]/50 text-xs lg:text-sm">
                      <span>🎁</span> <span className="hidden sm:inline">إضافة</span> عرض
                    </Link>
                  </div>
                </div>
              </div>
            )
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  )
}
