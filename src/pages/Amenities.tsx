// src/pages/Amenities.tsx
import React, { useState } from "react"
import { motion } from "framer-motion"

const amenitiesData = [
  { title: "المسبح الخارجي", image: "/1.png" },
  { title: "المطعم الفاخر", image: "/2.png" },
  { title: "مركز اللياقة", image: "/3.png" },
  { title: "قاعات الاجتماعات", image: "/4.png" },
  { title: "الحديقة والجلسات الخارجية", image: "/5.png" },
  { title: "الاستقبال", image: "/6.png" },
  { title: "الكافيه", image: "/7.png" },
  { title: "الممرات والإطلالات", image: "/8.png" },
]

export default function Amenities() {
  return (
    <div dir="rtl" className="bg-[#F6F1E9] text-[#2B2A28] min-h-screen">
      {/* ✅ الهيدر */}
      <section className="relative bg-[#2B2A28] text-[#FAF8F3] py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">المرافق والخدمات</h1>
        <p className="text-[#E1DCCE] text-lg max-w-2xl mx-auto">
          اكتشف المرافق التي تجعل إقامتك في موون قاردن تجربة متكاملة تجمع بين الراحة والرفاهية.
        </p>
      </section>

      {/* ✅ شبكة الصور */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {amenitiesData.map((item, index) => (
            <AmenityCard key={index} title={item.title} image={item.image} delay={index * 0.1} />
          ))}
        </div>
      </section>

      {/* ✅ زر العودة */}
      <div className="text-center pb-12">
        <a
          href="/"
          className="inline-block px-8 py-3 bg-[#2B2A28] text-[#FAF8F3] rounded-full text-sm hover:opacity-90 transition"
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
        className="w-full h-56 object-cover"
        onError={() => {
          if (src !== "/placeholder.png") setSrc("/placeholder.png")
        }}
      />
      <div className="p-4 text-center">
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
    </motion.div>
  )
}
