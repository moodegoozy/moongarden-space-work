import HotelSearchBar from "@/components/HotelSearchBar"
// src/pages/MoonGardenAman.tsx
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { db } from "@/firebase"
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

import MapSection from "@/components/MapSection"

// مصادر الصور
const heroImg = "/banner-fixed.png"

type SliderItem = {
  id: string
  image: string
  title?: string
  subtitle?: string
  order: number
}

type VisionMission = {
  vision: string
  visionTitle: string
  visionImage: string
  mission: string
  missionTitle: string
  missionImage: string
}

type NewsItem = {
  id: string
  title: string
  content: string
  image: string
  date: string
  order: number
}

export default function MoonGardenAman() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [amenityImage, setAmenityImage] = useState("/1.png") // صورة افتراضية
  const [slides, setSlides] = useState<SliderItem[]>([])
  const [visionMission, setVisionMission] = useState<VisionMission | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])

  // ✅ نسحب بيانات الغرف وصورة المرافق والسلايدر والرؤية والرسالة والأخبار من Firestore (بالتوازي)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب جميع البيانات بالتوازي لتسريع التحميل
        const [roomsSnap, amenitiesSnap, sliderSnap, vmDoc, newsSnap] = await Promise.all([
          getDocs(collection(db, "rooms")),
          getDocs(query(collection(db, "amenities"), orderBy("order", "asc"), limit(1))),
          getDocs(query(collection(db, "slider"), orderBy("order", "asc"))),
          getDoc(doc(db, "settings", "vision_mission")),
          getDocs(query(collection(db, "news"), orderBy("order", "asc")))
        ])

        // معالجة الغرف
        const data = roomsSnap.docs.map((doc) => {
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

        // معالجة المرافق
        if (!amenitiesSnap.empty) {
          const firstAmenity = amenitiesSnap.docs[0].data()
          if (firstAmenity.image) {
            setAmenityImage(firstAmenity.image)
          }
        }

        // معالجة السلايدر
        const sliderData = sliderSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as SliderItem[]
        setSlides(sliderData)

        // معالجة الرؤية والرسالة
        if (vmDoc.exists()) {
          setVisionMission(vmDoc.data() as VisionMission)
        }

        // معالجة الأخبار
        const newsData = newsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as NewsItem[]
        setNews(newsData)
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل البيانات:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-[#F6F1E9] text-[#2B2A28]">
      {/* الشريط العلوي */}
      <div className="w-full bg-[#A48E78] text-[#FAF8F3] text-[10px] sm:text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 py-2">
          <p className="opacity-90 hidden sm:block">موون قاردن – هدوء وفخامة طبيعية</p>
          <p className="opacity-90 sm:hidden">موون قاردن</p>
          <div className="flex gap-3 sm:gap-4">
            <a href="tel:+966573878878" className="hover:underline">
              اتصل بنا
            </a>
            <a href="#location" className="hover:underline hidden sm:inline">
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          {/* شعار الفندق */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/logo.png" alt="Moon Garden logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            <div>
              <h1
                className="text-sm sm:text-lg font-semibold tracking-tight"
                style={{ fontFamily: "'Playfair Display','Noto Naskh Arabic',serif" }}
              >
                MOON GARDEN
              </h1>
              <p className="text-[9px] sm:text-[11px] text-[#7C7469] -mt-1">HOTEL & RESIDENCE</p>
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
              <div className="absolute left-0 mt-2 w-48 bg-white border border-[#E8E1D6] rounded-lg shadow-lg z-50 text-right">
                <Link to="/rooms" className="block px-4 py-3 hover:bg-[#F6F1E9]">الأجنحة والغرف الفندقية</Link>
                <Link to="/villas" className="block px-4 py-3 hover:bg-[#F6F1E9]">الشاليهات</Link>
                <Link to="/amenities" className="block px-4 py-3 hover:bg-[#F6F1E9]">المرافق والخدمات</Link>
                <Link to="/admin-login" className="block px-4 py-3 hover:bg-[#F6F1E9]">دخول الإدارة</Link>
              </div>
            </details>
          </div>

          {/* ✅ زر تواصل مباشر عبر واتساب */}
          <a
            href="https://wa.me/966573878878"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-block px-4 lg:px-6 py-2 lg:py-2.5 rounded-full bg-[#2B2A28] text-[#FAF8F3] text-xs lg:text-sm hover:opacity-90 transition"
          >
            تواصل مباشر
          </a>
        </div>
      </header>

      {/* البانر الرئيسي */}
      <section className="relative min-h-[350px] sm:min-h-[450px] md:min-h-[550px] overflow-hidden">
        {/* صورة الخلفية - تظهر كاملة على الجوال */}
        <img
          src={heroImg}
          alt="Moon Garden Banner"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* طبقة التظليل */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(31,30,28,0.55)] via-[rgba(31,30,28,0.35)] to-[rgba(31,30,28,0.15)]" />
        <div className="relative max-w-7xl mx-auto px-4 pt-16 sm:pt-24 pb-40 sm:pb-56 text-[#FAF8F3]">
          <h2
            className="text-2xl sm:text-4xl md:text-6xl font-semibold leading-tight drop-shadow-lg bg-gradient-to-l from-[#C6A76D] via-[#E2C891] to-[#A48E78] bg-clip-text text-transparent golden-banner-title"
            style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            سكينةٌ تامة… رفاهية طبيعية
          </h2>
          <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base text-[#F0ECE5]/90 drop-shadow-md">
            ملاذٌ هادئ يقدّم فيلات خاصة وتجارب عافية مستوحاة من الطبيعة في قلب جازان.
          </p>
        </div>
      </section>

      {/* ✅ بانر الرؤية والرسالة وآخر الأخبار - متحرك */}
      {(visionMission && (visionMission.vision || visionMission.mission)) || news.length > 0 ? (
        <section className="relative w-full py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 10000, disableOnInteraction: false }}
              loop={(visionMission?.vision && visionMission?.mission) || news.length > 0}
              pagination={{ clickable: true }}
              className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* الرؤية */}
              {visionMission.vision && (
                <SwiperSlide>
                  <div 
                    className="relative min-h-[280px] sm:min-h-[350px] md:min-h-[420px] w-full"
                    style={{
                      backgroundImage: visionMission.visionImage ? `url(${visionMission.visionImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: visionMission.visionImage ? 'transparent' : '#1a1918',
                    }}
                  >
                    {/* طبقة التظليل الفاخرة */}
                    <div className={`absolute inset-0 ${visionMission.visionImage ? 'bg-gradient-to-t from-black/80 via-black/50 to-black/30' : 'bg-gradient-to-br from-[#1a1918] via-[#2B2A28] to-[#1a1918]'}`} />
                    
                    {/* خطوط ديكور ذهبية */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent opacity-60"></div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8 sm:p-12 md:p-16">
                      {/* عنوان فرعي صغير */}
                      <p className="text-[#C6A76D] text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4 font-light">Moon Garden</p>
                      
                      {/* خط ديكور */}
                      <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent mb-4 sm:mb-6"></div>
                      
                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg" style={{ fontFamily: "'Playfair Display', 'Noto Naskh Arabic', serif" }}>
                        {visionMission.visionTitle || "رؤيتنا"}
                      </h3>
                      
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-4xl drop-shadow-md font-light">
                        {visionMission.vision}
                      </p>
                      
                      {/* خط ديكور سفلي */}
                      <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent mt-6 sm:mt-8"></div>
                    </div>
                  </div>
                </SwiperSlide>
              )}

              {/* الرسالة */}
              {visionMission.mission && (
                <SwiperSlide>
                  <div 
                    className="relative min-h-[280px] sm:min-h-[350px] md:min-h-[420px] w-full"
                    style={{
                      backgroundImage: visionMission.missionImage ? `url(${visionMission.missionImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: visionMission.missionImage ? 'transparent' : '#1a1918',
                    }}
                  >
                    {/* طبقة التظليل الفاخرة */}
                    <div className={`absolute inset-0 ${visionMission.missionImage ? 'bg-gradient-to-t from-black/80 via-black/50 to-black/30' : 'bg-gradient-to-br from-[#1a1918] via-[#2B2A28] to-[#1a1918]'}`} />
                    
                    {/* خطوط ديكور ذهبية */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent opacity-60"></div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8 sm:p-12 md:p-16">
                      {/* عنوان فرعي صغير */}
                      <p className="text-[#C6A76D] text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4 font-light">Moon Garden</p>
                      
                      {/* خط ديكور */}
                      <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent mb-4 sm:mb-6"></div>
                      
                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg" style={{ fontFamily: "'Playfair Display', 'Noto Naskh Arabic', serif" }}>
                        {visionMission.missionTitle || "رسالتنا"}
                      </h3>
                      
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-4xl drop-shadow-md font-light">
                        {visionMission.mission}
                      </p>
                      
                      {/* خط ديكور سفلي */}
                      <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent mt-6 sm:mt-8"></div>
                    </div>
                  </div>
                </SwiperSlide>
              )}

              {/* آخر الأخبار - في نفس السلايدر */}
              {news.map((item) => (
                <SwiperSlide key={item.id}>
                  <div 
                    className="relative min-h-[280px] sm:min-h-[350px] md:min-h-[420px] w-full"
                    style={{
                      backgroundImage: item.image ? `url(${item.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: item.image ? 'transparent' : '#1a1918',
                    }}
                  >
                    {/* طبقة التظليل الفاخرة */}
                    <div className={`absolute inset-0 ${item.image ? 'bg-gradient-to-t from-black/80 via-black/50 to-black/30' : 'bg-gradient-to-br from-[#1a1918] via-[#2B2A28] to-[#1a1918]'}`} />
                    
                    {/* خطوط ديكور ذهبية */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent opacity-60"></div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8 sm:p-12 md:p-16">
                      {/* عنوان فرعي صغير */}
                      <p className="text-[#C6A76D] text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4 font-light">آخر الأخبار • {item.date}</p>
                      
                      {/* خط ديكور */}
                      <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent mb-4 sm:mb-6"></div>
                      
                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg" style={{ fontFamily: "'Playfair Display', 'Noto Naskh Arabic', serif" }}>
                        {item.title}
                      </h3>
                      
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-4xl drop-shadow-md font-light">
                        {item.content}
                      </p>
                      
                      {/* خط ديكور سفلي */}
                      <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#C6A76D] to-transparent mt-6 sm:mt-8"></div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      ) : null}

      {/* شريط بحث فندقي كلاسيكي */}
      <section className="z-20 relative w-full px-4" style={{marginTop: '24px', position: 'relative'}}>
        <div className="max-w-3xl mx-auto pt-6 md:pt-10">
          <HotelSearchBar />
        </div>
      </section>

      {/* ✅ سلايدر الصور العريض */}
      {slides.length > 0 && (
        <section className="w-full py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              loop={slides.length > 1}
              pagination={{ clickable: true }}
              className="w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg"
            >
              {slides.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <div className="relative h-48 sm:h-64 md:h-80 lg:h-96">
                    <img
                      src={slide.image}
                      alt={slide.title || "صورة"}
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
                    />
                    {/* النص على الصورة */}
                    {(slide.title || slide.subtitle) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                        <div className="p-4 sm:p-6 md:p-8 text-white">
                          {slide.title && (
                            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                              {slide.title}
                            </h3>
                          )}
                          {slide.subtitle && (
                            <p className="text-xs sm:text-sm md:text-base opacity-90 drop-shadow-md">
                              {slide.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* ✅ الغرف (مسحوبة من Firestore) */}
      <section id="stay" className="max-w-7xl mx-auto px-4 pt-8 sm:pt-16">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">الأجنحة والغرف الفندقية</h3>
        <p className="text-[#7C7469] mb-6 text-sm sm:text-base">اختر من مجموعتنا المتنوعة بما يناسبك.</p>

        {loading ? (
          <p className="text-center text-[#7C7469]">جاري تحميل الغرف...</p>
        ) : rooms.length === 0 ? (
          <p className="text-center text-[#7C7469]">لا توجد غرف حالياً</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {rooms.slice(0, 6).map((room) => (
              <article
                key={room.id}
                className="rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#E8E1D6] shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={room.images?.[0] || "/placeholder.png"}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 sm:p-5">
                  <h4 className="font-medium text-sm sm:text-base line-clamp-2">{room.name}</h4>
                  <p className="text-[#7C7469] text-xs sm:text-sm mt-1">السعر: {room.price} ريال</p>
                  <Link
                    to="/rooms"
                    className="mt-3 sm:mt-4 inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#E8E1D6] text-xs sm:text-sm hover:bg-[#F3EFE7]"
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
      <section id="amenities" className="max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
          <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-[#E8E1D6] order-2 md:order-1">
            <img 
              className="w-full h-40 sm:h-48 md:h-full object-cover" 
              src={amenityImage} 
              alt="المرافق" 
              onError={(e) => ((e.target as HTMLImageElement).src = "/1.png")}
            />
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">المرافق والخدمات</h3>
            <p className="text-[#7C7469] mt-2 sm:mt-3 text-xs sm:text-sm md:text-base">
              يقدم موون قاردن مجموعة من المرافق الراقية التي تشمل المسبح، المطعم، مركز اللياقة،
              قاعات الاجتماعات، ومناطق الجلسات الخارجية لإقامة مثالية مليئة بالراحة والاستجمام.
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
              <Link
                to="/amenities"
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full bg-[#2F2E2B] text-[#FAF8F3] text-xs sm:text-sm"
              >
                استعرض المرافق
              </Link>
              <a href="#stay" className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full border border-[#E8E1D6] text-xs sm:text-sm">
                الغرف
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* الخريطة التفاعلية */}
      <MapSection />

      {/* الفوتر */}
      <footer className="bg-[#FAF8F3] border-t border-[#E8E1D6]">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <img src="/logo.png" alt="Moon Garden logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain mb-2 sm:mb-3" />
            <p className="text-[10px] sm:text-xs md:text-sm text-[var(--muted)] mt-2 sm:mt-3">
              ملاذٌ خاص بإيقاع هادئ، حيث الأناقة الطبيعية.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">روابط</p>
            <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs md:text-sm text-[var(--muted)]">
              <li>
                <Link to="/rooms" className="hover:text-[var(--accent)] hover:underline">
                  الغرف
                </Link>
              </li>
              <li>
                <Link to="/villas" className="hover:text-[var(--accent)] hover:underline">
                  الشاليهات
                </Link>
              </li>
              <li>
                <Link to="/amenities" className="hover:text-[var(--accent)] hover:underline">
                  المرافق
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[var(--accent)] hover:underline">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link to="/review" className="hover:text-[var(--accent)] hover:underline">
                  آراء العملاء
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">التواصل</p>
            <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs md:text-sm text-[#7C7469]">
              <li>
                <a href="tel:+966173266662" className="hover:text-[var(--accent)]">
                  0173266662
                </a>
              </li>
              <li className="break-all">moongarden95@gmail.com</li>
              <li>
                <a href="https://wa.me/966173266662" className="hover:text-[#5E5B53]">
                  واتساب
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-[9px] sm:text-[10px] md:text-xs text-[var(--muted)] py-3 sm:py-4 md:py-6 border-t border-[#E8E1D6]">
          © {new Date().getFullYear()} Moon Garden – جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  )
}
