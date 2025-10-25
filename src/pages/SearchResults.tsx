import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"

export default function SearchResults() {
  const [params] = useSearchParams()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const checkIn = params.get("checkIn")
  const checkOut = params.get("checkOut")
  const guests = Number(params.get("guests")) || 1

  useEffect(() => {
    const fetchData = async () => {
      const roomsSnap = await getDocs(collection(db, "rooms"))
      const villasSnap = await getDocs(collection(db, "villas"))
      const rooms = roomsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const villas = villasSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      
      // ✅ مثال بسيط (تصفية المتاحة فقط)
      const available = [...rooms, ...villas].filter((item) => item.status === "متاح")
      setResults(available)
      setLoading(false)
    }

    fetchData()
  }, [checkIn, checkOut, guests])

  if (loading) return <p className="text-center py-10">⏳ جاري البحث...</p>

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold mb-8 text-right text-gray-800">
        النتائج المتاحة من {checkIn} إلى {checkOut}
      </h2>

      {results.length === 0 ? (
        <p className="text-gray-500 text-center">لا توجد وحدات متاحة في هذه التواريخ</p>
      ) : (
        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {results.map((r) => (
            <div
              key={r.id}
              className="bg-white border rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <img src={r.images?.[0] || "/placeholder.png"} alt={r.name} className="w-full h-56 object-cover" />
              <div className="p-4 text-right">
                <h3 className="font-bold text-lg mb-1">{r.name}</h3>
                <p className="text-gray-600 mb-1">{r.status}</p>
                <p className="text-black font-semibold">{r.price} ريال / الليلة</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
