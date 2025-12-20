import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { db, auth } from "@/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { signOut } from "firebase/auth"

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const isDefault = location.pathname === "/dashboard"

  const [stats, setStats] = useState({
    totalBookings: 0,
    availableRooms: 0,
    activeOffers: 0,
    loading: true,
    lastUpdated: "",
  })

  const links = [
    { to: "/dashboard/bookings", label: "📅 الحجوزات" },
    { to: "/dashboard/rooms", label: "🏨 عرض الغرف" },
    { to: "/dashboard/rooms/manage", label: "🛠️ إدارة الغرف" },
    { to: "/dashboard/villas", label: "🏡 عرض الفلل والأجنحة" },
    { to: "/dashboard/villas/manage", label: "⚙️ إدارة الفلل والأجنحة" },
    { to: "/dashboard/offers", label: "🎁 العروض" },
    { to: "/dashboard/clients", label: "👥 العملاء" },
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
    <div className="min-h-screen flex flex-row-reverse bg-gradient-to-br from-gray-100 to-gray-200">
      {/* ✅ الشريط الجانبي */}
      <aside className="w-72 bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-6 flex flex-col justify-between shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-right mb-8 text-yellow-400 tracking-wider">
            🌙 Moon Garden
          </h2>

          <nav className="flex flex-col gap-3 text-right">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`py-2 px-3 rounded-lg transition font-medium ${
                  location.pathname === link.to
                    ? "bg-yellow-500 text-black shadow-md"
                    : "hover:bg-gray-700 hover:text-yellow-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ✅ زر تسجيل الخروج */}
        <div className="mt-8 border-t border-gray-700 pt-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-all shadow-lg"
          >
            🚪 تسجيل خروج
          </button>
          <p className="text-sm text-gray-400 text-center mt-4">
            © {new Date().getFullYear()} Moon Garden Group
          </p>
        </div>
      </aside>

      {/* ✅ المحتوى الرئيسي */}
      <main className="flex-1 p-10">
        {/* ✅ الشريط العلوي */}
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">
            لوحة تحكم Moon Garden ✨
          </h1>
          <p className="text-sm text-gray-500">
            آخر تحديث: <span className="text-gray-700">{stats.lastUpdated}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          {isDefault ? (
            stats.loading ? (
              <p className="text-center text-gray-500 py-10">
                ⏳ جاري تحميل الإحصائيات...
              </p>
            ) : (
              <div className="grid md:grid-cols-3 gap-8 text-right">
                {/* 🟦 الحجوزات */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl shadow-lg p-6 transform hover:scale-[1.02] transition">
                  <h3 className="font-semibold mb-2 text-lg">إجمالي الحجوزات</h3>
                  <p className="text-4xl font-extrabold">{stats.totalBookings}</p>
                  <p className="text-sm mt-2 text-blue-100">📅 عدد الحجوزات المسجلة</p>
                </div>

                {/* 🟩 الغرف المتاحة */}
                <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-2xl shadow-lg p-6 transform hover:scale-[1.02] transition">
                  <h3 className="font-semibold mb-2 text-lg">الغرف المتاحة</h3>
                  <p className="text-4xl font-extrabold">{stats.availableRooms}</p>
                  <p className="text-sm mt-2 text-green-100">🏨 غرف جاهزة للحجز الآن</p>
                </div>

                {/* 🟣 العروض النشطة */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-2xl shadow-lg p-6 transform hover:scale-[1.02] transition">
                  <h3 className="font-semibold mb-2 text-lg">العروض النشطة</h3>
                  <p className="text-4xl font-extrabold">{stats.activeOffers}</p>
                  <p className="text-sm mt-2 text-purple-100">🎁 عروض حالية متاحة للعملاء</p>
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
