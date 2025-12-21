// src/pages/dashboard/BookingsPage.tsx
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore"

type Booking = {
  id: string
  fullName: string
  phone: string
  checkIn: string
  checkOut: string
  guests: number
  price: number
  roomName?: string
  villaName?: string
  status: string
  type: "room" | "villa"
  createdAt?: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"))
        const snap = await getDocs(q)
        const data = snap.docs.map((doc) => {
          const b = doc.data() as any
          return {
            id: doc.id,
            fullName: b.fullName || "—",
            phone: b.phone || "—",
            checkIn: b.checkIn || "",
            checkOut: b.checkOut || "",
            guests: b.guests || 0,
            price: b.price || 0,
            roomName: b.roomName,
            villaName: b.villaName,
            status: b.status || "غير محدد",
            type: b.type || "room",
            createdAt: b.createdAt?.toDate
              ? b.createdAt.toDate().toLocaleString("ar-SA")
              : "—",
          } as Booking
        })
        setBookings(data)
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل الحجوزات:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // ✅ تغيير حالة الحجز
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id)
      const bookingRef = doc(db, "bookings", id)
      await updateDoc(bookingRef, { status: newStatus })

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      )

      alert("✅ تم تحديث حالة الحجز بنجاح")
    } catch (err) {
      console.error("❌ خطأ أثناء تحديث الحالة:", err)
      alert("حدث خطأ أثناء تحديث الحالة")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="text-right">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#C6A76D] to-[#A48E78] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">📅</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2B2A28]">إدارة الحجوزات</h2>
            <p className="text-sm text-[#7C7469]">{bookings.length} حجز مسجل</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#7C7469]">جاري تحميل الحجوزات...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF8F3] rounded-2xl border border-[#E8E1D6]">
          <span className="text-5xl mb-4 block">📭</span>
          <p className="text-[#7C7469] text-lg">لا توجد حجوزات حالياً</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E8E1D6] shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-l from-[#C6A76D]/10 to-[#A48E78]/10">
              <tr className="text-[#2B2A28]">
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">الاسم</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">رقم الجوال</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">نوع الحجز</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">الوحدة</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">من</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">إلى</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">عدد النزلاء</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">السعر</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">الحالة</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">تعديل الحالة</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {bookings.map((b) => (
                <tr key={b.id} className="text-[#2B2A28] hover:bg-[#FAF8F3] transition-colors">
                  <td className="py-4 px-4 border-b border-[#E8E1D6] font-medium">{b.fullName}</td>
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">{b.phone}</td>
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      b.type === "room" 
                        ? "bg-[#C6A76D]/20 text-[#8B7355]" 
                        : "bg-[#7CB342]/20 text-[#558B2F]"
                    }`}>
                      {b.type === "room" ? "غرفة" : "فيلا"}
                    </span>
                  </td>
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">
                    {b.roomName || b.villaName || "—"}
                  </td>
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">{b.checkIn}</td>
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">{b.checkOut}</td>
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">{b.guests}</td>
                  <td className="py-4 px-4 border-b border-[#E8E1D6] font-semibold text-[#C6A76D]">{b.price} ريال</td>
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      b.status === "جديد"
                        ? "bg-blue-100 text-blue-700"
                        : b.status === "تم تسجيل الوصول"
                        ? "bg-green-100 text-green-700"
                        : b.status === "ملغي"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {b.status}
                    </span>
                  </td>

                  {/* قائمة تعديل الحالة */}
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">
                    <select
                      className="border border-[#E8E1D6] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D]"
                      value={b.status}
                      onChange={(e) =>
                        handleStatusChange(b.id, e.target.value)
                      }
                      disabled={updatingId === b.id}
                    >
                      <option value="جديد">جديد</option>
                      <option value="تم تسجيل الوصول">تم تسجيل الوصول</option>
                      <option value="ملغي">ملغي</option>
                    </select>
                  </td>

                  <td className="py-4 px-4 border-b border-[#E8E1D6] text-[#7C7469] text-xs">
                    {b.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
