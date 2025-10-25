import { useEffect, useState } from "react"
import RoomCard from "../../components/RoomCard"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ تحميل بيانات الغرف من Firestore
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const snap = await getDocs(collection(db, "rooms"))
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setRooms(data)
      } catch (err) {
        console.error("خطأ أثناء تحميل الغرف:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  if (loading)
    return <p className="text-center py-10 text-gray-500">⏳ جاري تحميل الغرف...</p>

  return (
    <div className="p-6 text-right">
      <h1 className="text-2xl font-bold mb-6">صفحة الغرف</h1>

      {rooms.length === 0 ? (
        <p className="text-gray-500">لا توجد غرف حالياً.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} {...room} />
          ))}
        </div>
      )}
    </div>
  )
}
