// src/pages/dashboard/VillasPage.tsx
import { useEffect, useMemo, useState } from "react"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"
import Pagination, { paginateData } from "@/components/Pagination"

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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[#7C7469]">جاري تحميل الفلل...</p>
    </div>
  )

  return (
    <div className="text-right">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">🏡</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2B2A28]">عرض الفلل والأجنحة</h2>
            <p className="text-sm text-[#7C7469]">{villas.length} فيلا/جناح</p>
          </div>
        </div>
      </div>

      {withCovers.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF8F3] rounded-2xl border border-[#E8E1D6]">
          <span className="text-5xl mb-4 block">🏡</span>
          <p className="text-[#7C7469] text-lg">لا توجد فلل حالياً</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginateData(withCovers, currentPage, itemsPerPage).map((villa) => (
            <div
              key={villa.id}
              className="bg-white rounded-2xl shadow-lg border border-[#E8E1D6] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={villa.cover}
                  alt={villa.name}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.warn("⚠️ فشل تحميل الصورة:", villa.cover)
                    ;(e.target as HTMLImageElement).src = "/placeholder.png"
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    villa.status === "متاح" 
                      ? "bg-green-100 text-green-700" 
                      : villa.status === "محجوز"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {villa.status}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-[#2B2A28] mb-2">{villa.name || "بدون اسم"}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-[#C6A76D] font-bold text-lg">{villa.price} ريال</p>
                  <span className="text-[#7C7469] text-sm">/ الليلة</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={withCovers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </>
      )}
    </div>
  )
}
