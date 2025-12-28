import { useEffect, useState } from "react"
import RoomCard from "../../components/RoomCard"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Link } from "react-router-dom"
import Pagination, { paginateData } from "@/components/Pagination"

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

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
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل الغرف...</p>
      </div>
    )

  return (
    <div className="text-right">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#C6A76D] to-[#A48E78] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">🏨</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2B2A28]">عرض الغرف</h2>
            <p className="text-sm text-[#7C7469]">{rooms.length} غرفة مسجلة</p>
          </div>
        </div>
        <Link
          to="/dashboard/rooms/manage"
          className="bg-gradient-to-l from-[#C6A76D] to-[#A48E78] text-[#2B2A28] px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md flex items-center gap-2"
        >
          <span>🛠️</span> إدارة الغرف
        </Link>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF8F3] rounded-2xl border border-[#E8E1D6]">
          <span className="text-5xl mb-4 block">🏨</span>
          <p className="text-[#7C7469] text-lg">لا توجد غرف حالياً</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginateData(rooms, currentPage, itemsPerPage).map((room) => (
              <RoomCard key={room.id} {...room} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={rooms.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  )
}
