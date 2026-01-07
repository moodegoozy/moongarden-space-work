// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState, useEffect, lazy, Suspense } from "react"

// ✅ المكونات العامة (تحمّل مباشرة)
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import SearchBox from "./components/SearchBox"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"

// ✅ الصفحة الرئيسية (تحمّل مباشرة لأنها الأولى)
import MoonGardenAman from "./pages/MoonGardenAman"

// ✅ Swiper
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

// ✅ Lazy Loading للصفحات العامة
const Rooms = lazy(() => import("./pages/Rooms"))
const Villas = lazy(() => import("./pages/Villas"))
const UnitDetails = lazy(() => import("./pages/UnitDetails"))
const SearchResults = lazy(() => import("./pages/SearchResults"))
const Review = lazy(() => import("./pages/Review"))
const BookingPage = lazy(() => import("./pages/BookingPage"))
const Amenities = lazy(() => import("./pages/Amenities"))
const ContactUs = lazy(() => import("./pages/ContactUs"))
const RoomTypeDetails = lazy(() => import("./pages/RoomTypeDetails"))
const VillaTypeDetails = lazy(() => import("./pages/VillaTypeDetails"))

// ✅ Lazy Loading لصفحات الإدارة
const AdminLogin = lazy(() => import("./pages/AdminLogin"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const BookingsPage = lazy(() => import("./pages/dashboard/BookingsPage"))
const RoomsPage = lazy(() => import("./pages/dashboard/RoomsPage"))
const OffersPage = lazy(() => import("./pages/dashboard/OffersPage"))
const ClientsPage = lazy(() => import("./pages/dashboard/ClientsPage"))
const VillasPage = lazy(() => import("./pages/dashboard/VillasPage"))
const AdminVillas = lazy(() => import("./pages/AdminVillas"))
const AdminRooms = lazy(() => import("./pages/AdminRooms"))
const StatsDashboard = lazy(() => import("./pages/dashboard/StatsDashboard"))
const FrontDesk = lazy(() => import("./pages/dashboard/FrontDesk"))
const GuestsPage = lazy(() => import("./pages/dashboard/GuestsPage"))
const RoomStatus = lazy(() => import("./pages/dashboard/RoomStatus"))
const InvoicesPage = lazy(() => import("./pages/dashboard/InvoicesPage"))
const HousekeepingPage = lazy(() => import("./pages/dashboard/HousekeepingPage"))
const ReportsPage = lazy(() => import("./pages/dashboard/ReportsPage"))
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"))
const RateManagementPage = lazy(() => import("./pages/dashboard/RateManagementPage"))
const ActivityLogPage = lazy(() => import("./pages/dashboard/ActivityLogPage"))
const AmenitiesPage = lazy(() => import("./pages/dashboard/AmenitiesPage"))
const SliderPage = lazy(() => import("./pages/dashboard/SliderPage"))
const VisionMissionPage = lazy(() => import("./pages/dashboard/VisionMissionPage"))

// ✅ مكون التحميل
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F1E9]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#7C7469] text-sm">جاري التحميل...</p>
      </div>
    </div>
  )
}

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
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* 🏠 الصفحة الرئيسية */}
          <Route path="/" element={<MoonGardenAman />} />

          {/* ✨ صفحة المرافق والخدمات */}
          <Route path="/amenities" element={<Amenities />} />

          {/* ✨ صفحة تواصل معنا */}
          <Route path="/contact" element={<ContactUs />} />

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
            <Route path="amenities" element={<AmenitiesPage />} />
            <Route path="slider" element={<SliderPage />} />
            <Route path="vision-mission" element={<VisionMissionPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}
