import { useSearchParams, Link } from "react-router-dom"
import BookingForm from "@/components/BookingForm"
import Footer from "@/components/Footer"

export default function BookingPage() {
  const [params] = useSearchParams()
  const unitId = params.get("unitId")

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#F6F1E9] text-[#2B2A28]">
      {/* هيدر */}
      <header className="sticky top-0 z-30 bg-[#FAF8F3]/90 backdrop-blur border-b border-[#E8E1D6]">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <img src="/logo.png" alt="Moon Garden" className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition" />
            <div>
              <h1 className="text-sm sm:text-lg font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display','Noto Naskh Arabic',serif" }}>MOON GARDEN</h1>
              <p className="text-[9px] sm:text-[11px] text-[#7C7469] -mt-1">HOTEL & RESIDENCE</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/rooms" className="hover:text-[#5E5B53]">الغرف الفندقية</Link>
            <Link to="/villas" className="hover:text-[#5E5B53]">الفلل والأجنحة</Link>
          </nav>
          <div className="md:hidden">
            <details className="relative">
              <summary className="list-none cursor-pointer px-2 py-1.5 rounded-lg bg-[#E8E1D6] text-[#2B2A28] font-bold flex items-center gap-1 text-sm">
                القائمة
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </summary>
              <div className="absolute left-0 mt-2 w-44 bg-white border border-[#E8E1D6] rounded-lg shadow-lg z-50 text-right text-sm">
                <Link to="/rooms" className="block px-4 py-2.5 hover:bg-[#F6F1E9]">الغرف الفندقية</Link>
                <Link to="/villas" className="block px-4 py-2.5 hover:bg-[#F6F1E9]">الفلل والأجنحة</Link>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* المحتوى */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10 sm:py-20">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center golden-banner-title">طلب حجز</h1>
        {unitId ? (
          <div className="bg-white rounded-2xl border border-[#E8E1D6] shadow-sm p-4 sm:p-6">
            <BookingForm unitId={unitId} />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6 text-yellow-800 text-center">
            لم يتم تحديد وحدة للحجز.
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
