// src/components/RoomCard.tsx
import { Link } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

type Props = {
  id: string
  name: string
  price: number
  status: "متاح" | "محجوز" | "مؤكد" | "مقفلة"
  type?: "room" | "villa"
  images: string[]
}

export default function RoomCard({ id, name, price, status, type = "room", images }: Props) {
  // ✅ ألوان الحالة
  const statusColors: Record<string, string> = {
    "متاح": "text-green-600",
    "محجوز": "text-yellow-600",
    "مؤكد": "text-blue-600",
    "مقفلة": "text-gray-500",
  }

  // ✅ تأكد من وجود صور صالحة
  const validImages =
    Array.isArray(images) && images.length > 0
      ? images.filter((img) => typeof img === "string" && img.trim() !== "")
      : ["/placeholder.png"]

  return (
    <Link to={`/${type}/${id}`}>
      <div className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl transition-transform hover:-translate-y-1 cursor-pointer">
        {/* ✅ سلايدر الصور */}
        <Swiper pagination={{ clickable: true }} modules={[Pagination]} className="w-full h-56">
          {validImages.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img}
                alt={name}
                className="w-full h-56 object-cover rounded-md"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                loading="lazy"
                onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ✅ التفاصيل */}
        <div className="p-4 text-right">
          <h3 className="text-lg font-bold text-black mb-1">{name}</h3>
          <p className="text-gray-600 text-sm mb-1">💰 {price} ريال / الليلة</p>
          <p className={`text-sm font-semibold flex items-center gap-1 ${statusColors[status]} mb-4`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="inline w-4 h-4 text-yellow-700 mb-0.5">
              <path d="M15.7 2.3a5 5 0 0 0-7.07 7.07l.35.35-6.36 6.36a1 1 0 0 0 0 1.42l1.42 1.42a1 1 0 0 0 1.42 0l6.36-6.36.35.35a5 5 0 1 0 7.07-7.07Zm-6.36 8.49 1.06-1.06 1.06 1.06-1.06 1.06-1.06-1.06ZM14 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </svg>
            {status}
          </p>

          <button className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
            احجز الآن
          </button>
        </div>
      </div>
    </Link>
  )
}
