import { useParams } from "react-router-dom"
import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

export default function UnitDetails() {
  const { id, type } = useParams()
  const [unit, setUnit] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, type === "villa" ? "villas" : "rooms", id!))
      if (snap.exists()) setUnit(snap.data())
    }
    load()
  }, [id, type])

  if (!unit) return <p className="text-center py-20">جارٍ التحميل...</p>

  return (
    <div className="max-w-4xl mx-auto py-10 text-right px-4">
      <Swiper pagination={{ clickable: true }} modules={[Pagination]} className="w-full h-96 rounded-xl">
        {unit.images?.map((img: string, i: number) => (
          <SwiperSlide key={i}>
            <img src={img} className="w-full h-96 object-cover rounded-xl" alt={unit.name} />
          </SwiperSlide>
        ))}
      </Swiper>

      <h2 className="text-3xl font-bold mt-6">{unit.name}</h2>
      <p className="text-gray-700 text-lg mt-2">💰 {unit.price} ريال / الليلة</p>
      <p className="mt-4 text-gray-600 leading-relaxed">
        {unit.description || "لم تتم إضافة وصف بعد"}
      </p>

      <button className="bg-black text-white px-8 py-3 rounded-lg mt-6 hover:bg-gray-800 transition">
        احجز الآن
      </button>
    </div>
  )
}
