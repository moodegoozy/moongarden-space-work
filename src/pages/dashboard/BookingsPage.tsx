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
    <div className="p-8 bg-gray-50 min-h-screen text-right">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">إدارة الحجوزات</h2>

      {loading ? (
        <p className="text-gray-600 text-center">⏳ جاري تحميل الحجوزات...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500 text-center">لا توجد حجوزات حالياً</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl bg-white">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                <th className="py-3 px-4 border-b">الاسم</th>
                <th className="py-3 px-4 border-b">رقم الجوال</th>
                <th className="py-3 px-4 border-b">نوع الحجز</th>
                <th className="py-3 px-4 border-b">الوحدة</th>
                <th className="py-3 px-4 border-b">من</th>
                <th className="py-3 px-4 border-b">إلى</th>
                <th className="py-3 px-4 border-b">عدد النزلاء</th>
                <th className="py-3 px-4 border-b">السعر</th>
                <th className="py-3 px-4 border-b">الحالة</th>
                <th className="py-3 px-4 border-b">تعديل الحالة</th>
                <th className="py-3 px-4 border-b">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="text-gray-800 hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{b.fullName}</td>
                  <td className="py-3 px-4 border-b">{b.phone}</td>
                  <td className="py-3 px-4 border-b">
                    {b.type === "room" ? "غرفة" : "فيلا"}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {b.roomName || b.villaName || "—"}
                  </td>
                  <td className="py-3 px-4 border-b">{b.checkIn}</td>
                  <td className="py-3 px-4 border-b">{b.checkOut}</td>
                  <td className="py-3 px-4 border-b">{b.guests}</td>
                  <td className="py-3 px-4 border-b">{b.price} ريال</td>
                  <td
                    className={`py-3 px-4 border-b font-semibold ${
                      b.status === "جديد"
                        ? "text-blue-600"
                        : b.status === "تم تسجيل الوصول"
                        ? "text-green-600"
                        : b.status === "ملغي"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {b.status}
                  </td>

                  {/* ✅ قائمة تعديل الحالة */}
                  <td className="py-3 px-4 border-b">
                    <select
                      className="border rounded px-2 py-1 text-sm"
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

                  <td className="py-3 px-4 border-b text-gray-500">
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
