import HotelSearchBar from "@/components/HotelSearchBar"
// src/pages/MoonGardenAman.tsx
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"

import MapSection from "@/components/MapSection"

// مصادر الصور
const heroImg = "/banner-fixed.png"
const wellnessImg = "/offers/1.jpg"

export default function MoonGardenAman() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ نسحب بيانات الغرف من Firestore (نفس rooms.tsx)
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const snap = await getDocs(collection(db, "rooms"))
        const data = snap.docs.map((doc) => {
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
          }
        })
        setRooms(data)
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل الغرف:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-[#F6F1E9] text-[#2B2A28]">
      {/* الشريط العلوي */}
      <div className="w-full bg-[#A48E78] text-[#FAF8F3] text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          <p className="opacity-90">موون قاردن – هدوء وفخامة طبيعية</p>
          <div className="flex gap-4">
            <a href="tel:+966573878878" className="hover:underline">
              اتصل بنا
            </a>
            <a href="#location" className="hover:underline">
              الموقع
            </a>
            <a href="#book" className="hover:underline">
              احجز
            </a>
          </div>
        </div>
      </div>

      {/* ✅ الهيدر */}
      <header className="sticky top-0 z-30 bg-[#FAF8F3]/90 backdrop-blur border-b border-[#E8E1D6]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* شعار الفندق */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Moon Garden logo" className="w-12 h-12 object-contain" />
            <div>
              <h1
                className="text-lg font-semibold tracking-tight"
                style={{ fontFamily: "'Playfair Display','Noto Naskh Arabic',serif" }}
              >
                MOON GARDEN
              </h1>
              <p className="text-[11px] text-[#7C7469] -mt-1">HOTEL & RESIDENCE</p>
            </div>
          </div>


          {/* تبويبات سطح المكتب */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#2B2A28]">
            <Link to="/rooms" className="hover:text-[var(--accent)] hover:underline">
              الأجنحة والغرف الفندقية
            </Link>
            <Link to="/villas" className="hover:text-[var(--accent)] hover:underline">
              الشاليهات
            </Link>
            <Link to="/amenities" className="hover:text-[var(--accent)] hover:underline">
              المرافق والخدمات
            </Link>
          </nav>
          {/* تبويبات الجوال */}
          <div className="md:hidden relative">
            <details className="relative">
              <summary className="list-none cursor-pointer px-3 py-2 rounded-lg bg-[#E8E1D6] text-[#2B2A28] font-bold flex items-center gap-2 shadow-sm">
                القائمة
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </summary>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E1D6] rounded-lg shadow-lg z-50 text-right">
                <Link to="/rooms" className="block px-4 py-3 hover:bg-[#F6F1E9]">الأجنحة والغرف الفندقية</Link>
                <Link to="/villas" className="block px-4 py-3 hover:bg-[#F6F1E9]">الشاليهات</Link>
                <Link to="/amenities" className="block px-4 py-3 hover:bg-[#F6F1E9]">المرافق والخدمات</Link>
                <Link to="/admin-login" className="block px-4 py-3 hover:bg-[#F6F1E9]">دخول الإدارة</Link>
              </div>
            </details>
          </div>

          {/* ✅ زر دخول الإدارة */}
          <Link
            to="/admin-login"
            className="px-6 py-2.5 rounded-full bg-[#2B2A28] text-[#FAF8F3] text-sm hover:opacity-90 transition"
          >
            دخول الإدارة
          </Link>
        </div>
      </header>

      {/* البانر الرئيسي */}
      <section className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `linear-gradient(rgba(31,30,28,0.55), rgba(31,30,28,0.15)), url('${heroImg}')`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-56 text-[#FAF8F3]">
          <h2
            className="text-4xl md:text-6xl font-semibold leading-tight drop-shadow-lg bg-gradient-to-l from-[#C6A76D] via-[#E2C891] to-[#A48E78] bg-clip-text text-transparent golden-banner-title"
            style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            سكينةٌ تامة… رفاهية طبيعية
          </h2>
          <p className="mt-5 max-w-2xl text-[#F0ECE5]/90 drop-shadow-md">
            ملاذٌ هادئ يقدّم فيلات خاصة وتجارب عافية مستوحاة من الطبيعة في قلب جازان.
          </p>
        </div>
      </section>


      {/* شريط بحث فندقي كلاسيكي */}
      <section className="z-20 relative max-w-3xl mx-auto w-full" style={{marginTop: '-48px', position: 'relative'}}>
        <div className="pt-8 md:pt-10">
          <HotelSearchBar />
        </div>
      </section>

      {/* ✅ الغرف (مسحوبة من Firestore) */}
      <section id="stay" className="max-w-7xl mx-auto px-4 pt-24">
        <h3 className="text-2xl md:text-3xl font-bold mb-2">الأجنحة والغرف الفندقية</h3>
        <p className="text-[#7C7469] mb-6">اختر من مجموعتنا المتنوعة بما يناسبك.</p>

        {loading ? (
          <p className="text-center text-[#7C7469]">جاري تحميل الغرف...</p>
        ) : rooms.length === 0 ? (
          <p className="text-center text-[#7C7469]">لا توجد غرف حالياً</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {rooms.slice(0, 6).map((room) => (
              <article
                key={room.id}
                className="rounded-2xl overflow-hidden bg-white border border-[#E8E1D6] shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={room.images?.[0] || "/placeholder.png"}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-medium">{room.name}</h4>
                  <p className="text-[#7C7469] text-sm mt-1">السعر: {room.price} ريال</p>
                  <Link
                    to="/rooms"
                    className="mt-4 inline-block px-4 py-2 rounded-full border border-[#E8E1D6] text-sm hover:bg-[#F3EFE7]"
                  >
                    استعراض جميع الغرف
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ✅ قسم المرافق والخدمات (مختصر يؤدي للصفحة الكاملة) */}
      <section id="amenities" className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="rounded-2xl overflow-hidden border border-[#E8E1D6]">
            <img className="w-full h-full object-cover" src={wellnessImg} alt="المرافق" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">المرافق والخدمات</h3>
            <p className="text-[#7C7469] mt-3">
              يقدم موون قاردن مجموعة من المرافق الراقية التي تشمل المسبح، المطعم، مركز اللياقة،
              قاعات الاجتماعات، ومناطق الجلسات الخارجية لإقامة مثالية مليئة بالراحة والاستجمام.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/amenities"
                className="px-6 py-3 rounded-full bg-[#2F2E2B] text-[#FAF8F3]"
              >
                استعرض جميع المرافق
              </Link>
              <a href="#stay" className="px-6 py-3 rounded-full border border-[#E8E1D6]">
                استعرض الغرف
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* الخريطة التفاعلية */}
      {/* Coordinates: 17.253845, 42.616934 */}
      <MapSection lat={17.253845} lng={42.616934} />

      {/* الفوتر */}
      <footer className="bg-[#FAF8F3] border-t border-[#E8E1D6]">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <img src="/logo.png" alt="Moon Garden logo" className="w-12 h-12 object-contain mb-3" />
            <p className="text-sm text-[var(--muted)] mt-3">
              ملاذٌ خاص بإيقاع هادئ، حيث الأناقة الطبيعية تحيط بك من كل جانب.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-3">روابط</p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                <Link to="/rooms" className="hover:text-[var(--accent)] hover:underline">
                  الأجنحة والغرف الفندقية
                </Link>
              </li>
              <li>
                <Link to="/villas" className="hover:text-[var(--accent)] hover:underline">
                  الشاليهات
                </Link>
              </li>
              <li>
                <Link to="/amenities" className="hover:text-[var(--accent)] hover:underline">
                  المرافق والخدمات
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3">التواصل</p>
            <ul className="space-y-2 text-sm text-[#7C7469]">
              <li>
                الهاتف:{" "}
                <a href="tel:+966573878878" className="hover:text-[var(--accent)]">
                  0573878878
                </a>
              </li>
              <li>الإيميل: moongarden95@gmail.com</li>
              <li>
                واتساب:{" "}
                <a href="https://wa.me/966573878878" className="hover:text-[#5E5B53]">
                  اضغط هنا
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-[var(--muted)] py-6 border-t border-[#E8E1D6]">
          © {new Date().getFullYear()} Moon Garden – جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  )
}
