// src/pages/dashboard/StatsDashboard.tsx
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"

export default function StatsDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    availableRooms: 0,
    activeOffers: 0,
    loading: true,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        // ✅ إجمالي الحجوزات
        const bookingsSnap = await getDocs(collection(db, "bookings"))
        const totalBookings = bookingsSnap.size

        // ✅ الغرف المتاحة فقط
        const roomsQuery = query(
          collection(db, "rooms"),
          where("status", "==", "متاح")
        )
        const roomsSnap = await getDocs(roomsQuery)
        const availableRooms = roomsSnap.size

        // ✅ العروض النشطة (اختياري)
        let activeOffers = 0
        try {
          const offersQuery = query(
            collection(db, "offers"),
            where("active", "==", true)
          )
          const offersSnap = await getDocs(offersQuery)
          activeOffers = offersSnap.size
        } catch {
          activeOffers = 0
        }

        setStats({
          totalBookings,
          availableRooms,
          activeOffers,
          loading: false,
        })
      } catch (err) {
        console.error("❌ خطأ في تحميل الإحصائيات:", err)
      }
    }

    loadStats()
  }, [])

  if (stats.loading)
    return (
      <p className="text-center text-gray-500 py-10">⏳ جاري تحميل الإحصائيات...</p>
    )

  return (
    <div className="p-8 bg-gray-100 min-h-screen text-right">
      <h1 className="text-3xl font-bold text-center mb-10">
        Moon Garden group
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* إجمالي الحجوزات */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-r-4 border-blue-500 text-center">
          <p className="text-gray-700 text-lg font-semibold mb-2">
            إجمالي الحجوزات
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalBookings}
          </p>
        </div>

        {/* الغرف المتاحة */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-r-4 border-green-500 text-center">
          <p className="text-gray-700 text-lg font-semibold mb-2">
            الغرف المتاحة
          </p>
          <p className="text-3xl font-bold text-green-600">
            {stats.availableRooms}
          </p>
        </div>

        {/* العروض النشطة */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-r-4 border-purple-500 text-center">
          <p className="text-gray-700 text-lg font-semibold mb-2">
            العروض النشطة
          </p>
          <p className="text-3xl font-bold text-purple-600">
            {stats.activeOffers}
          </p>
        </div>
      </div>
    </div>
  )
}
