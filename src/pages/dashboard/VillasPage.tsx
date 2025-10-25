// src/pages/dashboard/VillasPage.tsx
import { useEffect, useMemo, useState } from "react"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"

type Villa = {
  id: string
  name: string
  price: number
  status: "متاح" | "محجوز" | "مؤكد"
  images?: string[] // روابط مباشرة من Firebase Storage
  image?: string // لبعض الوثائق القديمة
}

function pickCover(v: Villa): string {
  // ✅ نحاول نجيب أول رابط صالح من الصور
  const arr = Array.isArray(v.images) ? v.images.filter(Boolean) : []
  if (arr.length > 0) return arr[0]!

  // ✅ توافق مع الحقول القديمة (image)
  if (v.image && v.image.trim() !== "") return v.image

  // ✅ fallback افتراضي
  return "/placeholder.png"
}

export default function VillasPage() {
  const [villas, setVillas] = useState<Villa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const snap = await getDocs(collection(db, "villas"))
        const data = snap.docs.map((d) => {
          const raw = d.data() as any
          return {
            id: d.id,
            name: raw?.name ?? "",
            price: Number(raw?.price) || 0,
            status: (raw?.status ?? "متاح") as Villa["status"],
            images: Array.isArray(raw?.images) ? raw.images : undefined,
            image: typeof raw?.image === "string" ? raw.image : undefined,
          }
        })
        setVillas(data)
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل الفلل:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchVillas()
  }, [])

  const withCovers = useMemo(
    () =>
      villas.map((v) => ({
        ...v,
        cover: pickCover(v),
      })),
    [villas]
  )

  if (loading) return <p className="text-center py-10">⏳ جاري التحميل...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-right">عرض الفلل والأجنحة</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {withCovers.map((villa) => (
          <div
            key={villa.id}
            className="bg-white rounded-lg shadow border p-4 text-right"
          >
            <img
              src={villa.cover}
              alt={villa.name}
              className="w-full h-48 object-cover rounded mb-3"
              loading="lazy"
              referrerPolicy="no-referrer" // ✅ تمنع رفض التحميل من Firebase
              crossOrigin="anonymous"
              onError={(e) => {
                console.warn("⚠️ فشل تحميل الصورة:", villa.cover)
                ;(e.target as HTMLImageElement).src = "/placeholder.png"
              }}
            />

            {villa.cover !== "/placeholder.png" && (
              <a
                href={villa.cover}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline block mb-1"
              >
                فتح الصورة في تبويب خارجي (للتجربة)
              </a>
            )}

            <h3 className="font-bold text-lg">{villa.name || "بدون اسم"}</h3>
            <p className="text-gray-600 mb-1">💰 {villa.price} ريال</p>
            <p className="text-gray-600">📦 {villa.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
