// src/components/Offers.tsx
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, getDocs, orderBy, query } from "firebase/firestore"

type Offer = {
  id: string
  title: string
  subtitle?: string
  description?: string
  price?: number
  image?: string
  type?: "room" | "villa"
  status?: "نشط" | "منتهي"
  createdAt?: any
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // ✅ جلب العروض من Firestore مرتبة بالأحدث
        const q = query(collection(db, "offers"), orderBy("createdAt", "desc"))
        const snap = await getDocs(q)

        const data = snap.docs.map((doc) => {
          const offer = doc.data() as any

          // ✅ نتأكد من وجود صورة (تدعم فيلا أو غرفة)
          const imageUrl =
            offer.image && offer.image.startsWith("http")
              ? offer.image
              : "/placeholder.png"

          return {
            id: doc.id,
            title: offer.title || "عرض بدون عنوان",
            subtitle: offer.subtitle || "",
            description: offer.description || "",
            price: offer.price || 0,
            image: imageUrl,
            type: offer.type || "room", // 🔥 يفرق بين الغرف والفلل
            status: offer.status || "نشط",
            createdAt: offer.createdAt,
          } as Offer
        })

        // ✅ عرض العروض النشطة فقط سواء فلل أو غرف
        const activeOffers = data.filter((o) => o.status === "نشط")
        setOffers(activeOffers)
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل العروض:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  // ✅ في حال التحميل
  if (loading) {
    return (
      <section className="bg-white py-16 text-center">
        <p className="text-gray-600">⏳ جاري تحميل العروض...</p>
      </section>
    )
  }

  // ✅ في حال لا توجد عروض
  if (offers.length === 0) {
    return (
      <section className="bg-white py-16 text-center">
        <p className="text-gray-500">لا توجد عروض حالياً</p>
      </section>
    )
  }

  // ✅ عرض العروض
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-black">
          العروض الموصى بها
        </h2>

        {/* ✅ الشبكة */}
        <div className="grid gap-8 md:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              {/* ✅ الصورة */}
              <img
                src={offer.image || "/placeholder.png"}
                alt={offer.title}
                className="w-full h-56 object-cover"
              />

              {/* ✅ المحتوى */}
              <div className="p-6 flex flex-col gap-3 text-right">
                <span className="text-sm text-gray-500">
                  {offer.type === "villa"
                    ? "🏡 عرض خاص بالفلل"
                    : "🛏️ عرض خاص بالغرف"}
                </span>

                <h3 className="text-lg font-semibold text-black">{offer.title}</h3>

                {offer.subtitle && (
                  <p className="text-sm text-gray-600">{offer.subtitle}</p>
                )}

                {offer.description && (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {offer.description}
                  </p>
                )}

                <p className="text-black font-bold mt-2">
                  ابتداءً من {offer.price} ريال{" "}
                  <span className="text-gray-500">للليلة</span>
                </p>

                <button className="mt-4 border border-black text-black px-4 py-2 rounded-lg hover:bg-black hover:text-white transition">
                  عرض التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
