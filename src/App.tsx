// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"

// ✅ المكونات العامة
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import SearchBox from "./components/SearchBox"
import Footer from "./components/Footer"

// ✅ الصفحات العامة
import Rooms from "./pages/Rooms"
import Villas from "./pages/Villas"
import UnitDetails from "./pages/UnitDetails"
import SearchResults from "./pages/SearchResults"
import Review from "./pages/Review"
import BookingPage from "./pages/BookingPage"
import Amenities from "./pages/Amenities" // ✅ صفحة المرافق الجديدة

// ✅ الصفحة الرئيسية (ثيم موون قاردن)
import MoonGardenAman from "./pages/MoonGardenAman"

// ✅ Swiper
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

// ✅ صفحات الإدارة
import AdminLogin from "./pages/AdminLogin"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"

// ✅ صفحات تفاصيل نوع الوحدة (للعميل)
import RoomTypeDetails from "./pages/RoomTypeDetails"
import VillaTypeDetails from "./pages/VillaTypeDetails"

// ✅ صفحات فرعية للوحة التحكم
import BookingsPage from "./pages/dashboard/BookingsPage"
import RoomsPage from "./pages/dashboard/RoomsPage"
import OffersPage from "./pages/dashboard/OffersPage"
import ClientsPage from "./pages/dashboard/ClientsPage"
import VillasPage from "./pages/dashboard/VillasPage"
import AdminVillas from "./pages/AdminVillas"
import AdminRooms from "./pages/AdminRooms"
import StatsDashboard from "./pages/dashboard/StatsDashboard"
import FrontDesk from "./pages/dashboard/FrontDesk"
import GuestsPage from "./pages/dashboard/GuestsPage"
import RoomStatus from "./pages/dashboard/RoomStatus"
import InvoicesPage from "./pages/dashboard/InvoicesPage"
import HousekeepingPage from "./pages/dashboard/HousekeepingPage"
import ReportsPage from "./pages/dashboard/ReportsPage"
import SettingsPage from "./pages/dashboard/SettingsPage"
import RateManagementPage from "./pages/dashboard/RateManagementPage"
import ActivityLogPage from "./pages/dashboard/ActivityLogPage"

export default function App() {
  const [indexes, setIndexes] = useState([1, 2, 3, 4])
  const totalAds = 8

  useEffect(() => {
    const interval = setInterval(() => {
      setIndexes((prev) => prev.map((i) => (i >= totalAds ? 1 : i + 1)))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // ✅ واجهة كلاسيكية (اختيارية)
  const ClassicHome = (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <Navbar />
      <Hero />

      <section className="relative -mt-12 z-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SearchBox />
        </div>
      </section>

      <main className="flex-1 w-full py-16">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 5000 }}
          loop
          pagination={{ clickable: true }}
          className="w-full"
        >
          <SwiperSlide>
            <div className="flex w-full h-[600px]">
              {indexes.map((i, idx) => (
                <img
                  key={idx}
                  src={`/${i}.png`}
                  alt={`صورة ${i}`}
                  className="w-1/4 h-full object-cover transition-all duration-700"
                />
              ))}
            </div>
          </SwiperSlide>
        </Swiper>

        <section className="bg-gray-50 py-12 mt-10">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col justify-center text-right order-2 md:order-1">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
                استمتع برفاهية لا مثيل لها
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                اكتشف مجموعة متنوعة من المرافق الترفيهية المصممة لراحتك،
                من المسابح الهادئة إلى الصالات الرياضية الحديثة،
                مرورًا بالجلسات الخارجية والإطلالات الساحرة.
              </p>
              <button className="bg-[#2B2A28] text-white px-6 py-3 rounded-lg w-fit border-2 border-transparent hover:border-[var(--accent)] hover:shadow-lg transition">
                احجز الآن
              </button>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="/1.png"
                alt="إعلان ثابت"
                className="w-full h-[350px] object-cover rounded-lg shadow-md"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )

  return (
    <Router>
      <Routes>
        {/* 🏠 الصفحة الرئيسية */}
        <Route path="/" element={<MoonGardenAman />} />

        {/* ✨ صفحة المرافق والخدمات */}
        <Route path="/amenities" element={<Amenities />} />

        {/* الواجهة القديمة (اختيارية) */}
        <Route path="/classic" element={ClassicHome} />

        {/* صفحات عامة */}
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/villas" element={<Villas />} />
        <Route path="/room-type/:typeName" element={<RoomTypeDetails />} />
        <Route path="/villa-type/:typeName" element={<VillaTypeDetails />} />
        <Route path="/:type/:id" element={<UnitDetails />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/review" element={<Review />} />
        <Route path="/book" element={<BookingPage />} />

        {/* 🔐 صفحة تسجيل دخول الإدارة */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* 🧭 لوحة التحكم (صفحات محمية) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<StatsDashboard />} />
          <Route path="front-desk" element={<FrontDesk />} />
          <Route path="room-status" element={<RoomStatus />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="rooms/manage" element={<AdminRooms />} />
          <Route path="villas" element={<VillasPage />} />
          <Route path="villas/manage" element={<AdminVillas />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="housekeeping" element={<HousekeepingPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="rate-management" element={<RateManagementPage />} />
          <Route path="activity-log" element={<ActivityLogPage />} />
        </Route>
      </Routes>
    </Router>
  )
}
