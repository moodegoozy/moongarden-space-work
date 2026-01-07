// src/pages/Amenities.tsx
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"

type Amenity = {
  id: string
  title: string
  image: string
  order?: number
}

export default function Amenities() {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const snap = await getDocs(collection(db, "amenities"))
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Amenity[]
        setAmenities(data.sort((a, b) => (a.order || 0) - (b.order || 0)))
      } catch (err) {
        console.error("خطأ في جلب المرافق:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAmenities()
  }, [])
  return (
    <div dir="rtl" className="bg-[#F6F1E9] text-[#2B2A28] min-h-screen">
      {/* ✅ الهيدر */}
      <section className="relative bg-[#2B2A28] text-[#FAF8F3] py-12 sm:py-24 text-center px-4">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">المرافق والخدمات</h1>
        <p className="text-[#E1DCCE] text-sm sm:text-lg max-w-2xl mx-auto">
          اكتشف المرافق التي تجعل إقامتك في موون قاردن تجربة متكاملة تجمع بين الراحة والرفاهية.
        </p>
      </section>

      {/* ✅ شبكة الصور */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#7C7469]">جاري تحميل المرافق...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
            {amenities.map((item, index) => (
              <AmenityCard key={item.id} title={item.title} image={item.image} delay={index * 0.1} />
            ))}
          </div>
        )}
      </section>

      {/* ✅ زر العودة */}
      <div className="text-center pb-8 sm:pb-12">
        <a
          href="/"
          className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-[#2B2A28] text-[#FAF8F3] rounded-full text-sm hover:opacity-90 transition"
        >
          العودة إلى الصفحة الرئيسية
        </a>
      </div>
    </div>
  )
}

// ✅ مكون الصورة مع معالجة الخطأ مرة واحدة فقط
const AmenityCard = ({
  title,
  image,
  delay,
}: {
  title: string
  image: string
  delay: number
}) => {
  const [src, setSrc] = useState(image)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="rounded-2xl overflow-hidden shadow-md border border-[#E8E1D6] bg-white hover:shadow-xl transition transform hover:scale-[1.02]"
    >
      <img
        src={src}
        alt={title}
        className="w-full h-36 sm:h-56 object-cover"
        onError={() => {
          if (src !== "/placeholder.png") setSrc("/placeholder.png")
        }}
      />
      <div className="p-3 sm:p-4 text-center">
        <h3 className="font-semibold text-sm sm:text-lg">{title}</h3>
      </div>
    </motion.div>
  )
}
