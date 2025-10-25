// src/pages/VillaDetails.tsx
import { useParams } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase"
import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"

export default function VillaDetails() {
  const { id } = useParams()
  const [villa, setVilla] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "villas", id!))
      if (snap.exists()) setVilla(snap.data())
    }
    load()
  }, [id])

  if (!villa) return <p>جارٍ التحميل...</p>

  return (
    <div className="max-w-4xl mx-auto py-10">
      <Swiper>
        {villa.images?.map((img: string, i: number) => (
          <SwiperSlide key={i}>
            <img src={img} className="w-full h-96 object-cover rounded-2xl" />
          </SwiperSlide>
        ))}
      </Swiper>

      <h2 className="text-3xl font-bold mt-6">{villa.name}</h2>
      <p className="text-lg mt-2 text-gray-700">السعر: {villa.price} ريال</p>
      <p className="text-gray-600 mt-4">{villa.description || "لا يوجد وصف"}</p>
      <button className="bg-blue-600 text-white px-6 py-3 rounded-xl mt-6 hover:bg-blue-700">
        احجز الآن
      </button>
    </div>
  )
}
