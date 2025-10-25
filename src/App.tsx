// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"

import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import SearchBox from "./components/SearchBox"
import Footer from "./components/Footer"
import Rooms from "./pages/Rooms"
import Villas from "./pages/Villas"
import UnitDetails from "./pages/UnitDetails"
import SearchResults from "./pages/SearchResults" // ✅ صفحة البحث الجديدة

// ✅ Swiper
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

// ✅ صفحات الإدارة
import AdminLogin from "./pages/AdminLogin"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"

// ✅ صفحات فرعية للوحة التحكم
import BookingsPage from "./pages/dashboard/BookingsPage"
import RoomsPage from "./pages/dashboard/RoomsPage"
import OffersPage from "./pages/dashboard/OffersPage"
import ClientsPage from "./pages/dashboard/ClientsPage"
import VillasPage from "./pages/dashboard/VillasPage"
import AdminVillas from "./pages/AdminVillas"
import AdminRooms from "./pages/AdminRooms"
import StatsDashboard from "./pages/dashboard/StatsDashboard"

export default function App() {
  const [indexes, setIndexes] = useState([1, 2, 3, 4])
  const totalAds = 8

  useEffect(() => {
    const interval = setInterval(() => {
      setIndexes((prev) => prev.map((i) => (i >= totalAds ? 1 : i + 1)))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Router>
      <Routes>
        {/* ✅ الصفحة الرئيسية */}
        <Route
          path="/"
          element={
            <div className="bg-white text-black min-h-screen flex flex-col">
              <Navbar />
              <Hero />

              {/* ✅ صندوق البحث */}
              <section className="relative -mt-12 z-20 px-4">
                <div className="max-w-6xl mx-auto">
                  <SearchBox />
                </div>
              </section>

              <main className="flex-1 w-full py-16">
                {/* ✅ البانر */}
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{ delay: 5000 }}
                  loop={true}
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

                {/* ✅ إعلان 1 */}
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
                      <button className="bg-black text-white px-6 py-3 rounded-lg w-fit hover:bg-gray-800 transition">
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

                {/* ✅ إعلان 2 */}
                <section className="bg-gray-50 py-12 mt-10">
                  <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <img
                        src={`/${indexes[0]}.png`}
                        alt={`صورة ${indexes[0]}`}
                        className="w-full h-[350px] md:h-[400px] object-cover rounded-lg shadow-md transition-all duration-700"
                      />
                    </div>
                    <div className="flex flex-col justify-center text-right">
                      <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
                        لحظات فريدة كل يوم
                      </h2>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        نوفر لك أجواء استثنائية تجمع بين الراحة والرفاهية
                        مع مرافق متكاملة تلبي احتياجات جميع أفراد العائلة.
                      </p>
                      <button className="bg-black text-white px-6 py-3 rounded-lg w-fit hover:bg-gray-800 transition">
                        استكشف المزيد
                      </button>
                    </div>
                  </div>
                </section>
              </main>

              <Footer />
            </div>
          }
        />

        {/* ✅ صفحة الغرف الفندقية */}
        <Route path="/rooms" element={<Rooms />} />

        {/* ✅ صفحة الفلل والأجنحة */}
        <Route path="/villas" element={<Villas />} />

        {/* ✅ تفاصيل الوحدة */}
        <Route path="/:type/:id" element={<UnitDetails />} />

        {/* ✅ صفحة نتائج البحث */}
        <Route path="/search" element={<SearchResults />} /> {/* ✅ جديد */}

        {/* ✅ تسجيل دخول الإدارة */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* ✅ لوحة التحكم مع الحماية */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<StatsDashboard />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="rooms/manage" element={<AdminRooms />} />
          <Route path="villas" element={<VillasPage />} />
          <Route path="villas/manage" element={<AdminVillas />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="clients" element={<ClientsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}
