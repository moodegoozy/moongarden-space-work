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
  addDoc,
  serverTimestamp,
} from "firebase/firestore"

type Booking = {
  id: string
  fullName: string
  phone: string
  checkIn: string
  checkOut: string
  checkInTime?: string
  checkOutTime?: string
  guests: number
  price: number
  roomName?: string
  villaName?: string
  unitId?: string
  status: string
  type: "room" | "villa"
  nationalId?: string
  birthDate?: string
  createdAt?: string
}

type Unit = {
  id: string
  name: string
  type: "room" | "villa"
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [manualForm, setManualForm] = useState({
    fullName: "",
    phone: "",
    nationalId: "",
    birthDate: "",
    checkIn: "",
    checkOut: "",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    guests: 1,
    price: 0,
    unitId: "",
    type: "room" as "room" | "villa",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب الحجوزات
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
            checkInTime: b.checkInTime || "",
            checkOutTime: b.checkOutTime || "",
            guests: b.guests || 0,
            price: b.price || 0,
            roomName: b.roomName,
            villaName: b.villaName,
            unitId: b.unitId,
            status: b.status || "جديد",
            type: b.type || "room",
            nationalId: b.nationalId || "",
            birthDate: b.birthDate || "",
            createdAt: b.createdAt?.toDate
              ? b.createdAt.toDate().toLocaleString("ar-SA")
              : "—",
          } as Booking
        })
        setBookings(data)

        // جلب الوحدات (الغرف والفلل)
        const roomsSnap = await getDocs(collection(db, "rooms"))
        const villasSnap = await getDocs(collection(db, "villas"))
        const allUnits: Unit[] = [
          ...roomsSnap.docs.map((d) => ({ id: d.id, name: d.data().name, type: "room" as const })),
          ...villasSnap.docs.map((d) => ({ id: d.id, name: d.data().name, type: "villa" as const })),
        ]
        setUnits(allUnits)
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل البيانات:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  // ✅ إنشاء حجز يدوي
  const handleManualBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedUnit = units.find((u) => u.id === manualForm.unitId)
      await addDoc(collection(db, "bookings"), {
        ...manualForm,
        roomName: manualForm.type === "room" ? selectedUnit?.name : undefined,
        villaName: manualForm.type === "villa" ? selectedUnit?.name : undefined,
        status: "جديد",
        createdAt: serverTimestamp(),
      })
      alert("✅ تم إنشاء الحجز بنجاح")
      setShowManualForm(false)
      setManualForm({
        fullName: "",
        phone: "",
        nationalId: "",
        birthDate: "",
        checkIn: "",
        checkOut: "",
        checkInTime: "14:00",
        checkOutTime: "12:00",
        guests: 1,
        price: 0,
        unitId: "",
        type: "room",
      })
      window.location.reload()
    } catch (err) {
      console.error("❌ خطأ أثناء إنشاء الحجز:", err)
      alert("حدث خطأ أثناء إنشاء الحجز")
    }
  }

  // ✅ تحديث بيانات الحجز (للحجوزات القادمة من العملاء)
  const handleUpdateBooking = async () => {
    if (!editingBooking) return
    try {
      const bookingRef = doc(db, "bookings", editingBooking.id)
      await updateDoc(bookingRef, {
        fullName: editingBooking.fullName,
        nationalId: editingBooking.nationalId,
        birthDate: editingBooking.birthDate,
        guests: editingBooking.guests,
        checkInTime: editingBooking.checkInTime,
        checkOutTime: editingBooking.checkOutTime,
      })
      setBookings((prev) =>
        prev.map((b) => (b.id === editingBooking.id ? editingBooking : b))
      )
      alert("✅ تم تحديث بيانات الحجز بنجاح")
      setEditingBooking(null)
    } catch (err) {
      console.error("❌ خطأ أثناء تحديث الحجز:", err)
      alert("حدث خطأ أثناء تحديث الحجز")
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
        <button
          onClick={() => setShowManualForm(true)}
          className="bg-[#2B2A28] text-white px-5 py-2.5 rounded-xl hover:bg-[#3d3c3a] transition flex items-center gap-2"
        >
          <span>➕</span>
          <span>إنشاء حجز يدوي</span>
        </button>
      </div>

      {/* نموذج الحجز اليدوي */}
      {showManualForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E8E1D6]">
              <h3 className="text-xl font-bold text-[#2B2A28]">📝 إنشاء حجز يدوي</h3>
            </div>
            <form onSubmit={handleManualBooking} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.fullName}
                    onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">رقم الجوال *</label>
                  <input
                    type="tel"
                    required
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">رقم الهوية *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.nationalId}
                    onChange={(e) => setManualForm({ ...manualForm, nationalId: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">تاريخ الميلاد *</label>
                  <input
                    type="date"
                    required
                    value={manualForm.birthDate}
                    onChange={(e) => setManualForm({ ...manualForm, birthDate: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">نوع الوحدة *</label>
                  <select
                    required
                    value={manualForm.type}
                    onChange={(e) => setManualForm({ ...manualForm, type: e.target.value as "room" | "villa", unitId: "" })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  >
                    <option value="room">غرفة</option>
                    <option value="villa">فيلا</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">اختر الوحدة *</label>
                  <select
                    required
                    value={manualForm.unitId}
                    onChange={(e) => setManualForm({ ...manualForm, unitId: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  >
                    <option value="">-- اختر --</option>
                    {units.filter((u) => u.type === manualForm.type).map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">تاريخ الوصول *</label>
                  <input
                    type="date"
                    required
                    value={manualForm.checkIn}
                    onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">تاريخ المغادرة *</label>
                  <input
                    type="date"
                    required
                    value={manualForm.checkOut}
                    onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">ساعة الوصول *</label>
                  <input
                    type="time"
                    required
                    value={manualForm.checkInTime}
                    onChange={(e) => setManualForm({ ...manualForm, checkInTime: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">ساعة الخروج *</label>
                  <input
                    type="time"
                    required
                    value={manualForm.checkOutTime}
                    onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">عدد الضيوف *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={manualForm.guests}
                    onChange={(e) => setManualForm({ ...manualForm, guests: Number(e.target.value) })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">السعر (ريال)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualForm.price}
                    onChange={(e) => setManualForm({ ...manualForm, price: Number(e.target.value) })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#2B2A28] text-white py-2.5 rounded-xl hover:bg-[#3d3c3a] transition"
                >
                  ✅ إنشاء الحجز
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تعديل بيانات الحجز */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-[#E8E1D6]">
              <h3 className="text-xl font-bold text-[#2B2A28]">✏️ تعديل بيانات الحجز</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#7C7469] mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={editingBooking.fullName}
                  onChange={(e) => setEditingBooking({ ...editingBooking, fullName: e.target.value })}
                  className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7C7469] mb-1">رقم الهوية</label>
                <input
                  type="text"
                  value={editingBooking.nationalId || ""}
                  onChange={(e) => setEditingBooking({ ...editingBooking, nationalId: e.target.value })}
                  className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7C7469] mb-1">تاريخ الميلاد</label>
                <input
                  type="date"
                  value={editingBooking.birthDate || ""}
                  onChange={(e) => setEditingBooking({ ...editingBooking, birthDate: e.target.value })}
                  className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7C7469] mb-1">عدد الضيوف</label>
                <input
                  type="number"
                  min={1}
                  value={editingBooking.guests}
                  onChange={(e) => setEditingBooking({ ...editingBooking, guests: Number(e.target.value) })}
                  className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">ساعة الوصول</label>
                  <input
                    type="time"
                    value={editingBooking.checkInTime || ""}
                    onChange={(e) => setEditingBooking({ ...editingBooking, checkInTime: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">ساعة الخروج</label>
                  <input
                    type="time"
                    value={editingBooking.checkOutTime || ""}
                    onChange={(e) => setEditingBooking({ ...editingBooking, checkOutTime: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateBooking}
                  className="flex-1 bg-[#2B2A28] text-white py-2.5 rounded-xl hover:bg-[#3d3c3a] transition"
                >
                  💾 حفظ التعديلات
                </button>
                <button
                  onClick={() => setEditingBooking(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">رقم الهوية</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">نوع الحجز</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">الوحدة</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">من</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">إلى</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">ساعة الوصول</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">ساعة الخروج</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">عدد النزلاء</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">السعر</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">الحالة</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">تعديل الحالة</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">إجراءات</th>
                <th className="py-4 px-4 border-b border-[#E8E1D6] font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {bookings.map((b) => (
                <tr key={b.id} className="text-[#2B2A28] hover:bg-[#FAF8F3] transition-colors">
                  <td className="py-4 px-4 border-b border-[#E8E1D6] font-medium">{b.fullName}</td>
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">{b.phone}</td>
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">{b.nationalId || "—"}</td>
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
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">{b.checkInTime || "—"}</td>
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">{b.checkOutTime || "—"}</td>
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

                  {/* زر التعديل */}
                  <td className="py-4 px-4 border-b border-[#E8E1D6]">
                    <button
                      onClick={() => setEditingBooking(b)}
                      className="bg-[#2B2A28] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#3d3c3a] transition"
                    >
                      ✏️ تعديل
                    </button>
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
