import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { db } from "@/firebase"
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore"

type UnitInfo = {
  id: string
  name: string
  unitNumber?: string
  price: number
  status: string
  type: "room" | "villa"
}

type BookingFormProps = {
  unitId: string
  unitType?: "room" | "villa"
}

export default function BookingForm({ unitId, unitType = "room" }: BookingFormProps) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unitInfo, setUnitInfo] = useState<UnitInfo | null>(null)
  const [unitLoading, setUnitLoading] = useState(true)

  // جلب بيانات الوحدة
  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const collectionName = unitType === "villa" ? "villas" : "rooms"
        const unitDoc = await getDoc(doc(db, collectionName, unitId))
        if (unitDoc.exists()) {
          const data = unitDoc.data()
          setUnitInfo({
            id: unitDoc.id,
            name: data.name || "—",
            unitNumber: data.unitNumber || "",
            price: data.price || 0,
            status: data.status || "متاح",
            type: unitType,
          })
        }
      } catch (err) {
        console.error("❌ خطأ في جلب بيانات الوحدة:", err)
      } finally {
        setUnitLoading(false)
      }
    }
    fetchUnit()
  }, [unitId, unitType])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === "guests" ? Number(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // التحقق من أن الوحدة متاحة
    if (unitInfo && unitInfo.status !== "متاح") {
      alert("⚠️ عذراً، هذه الوحدة غير متاحة حالياً للحجز")
      return
    }

    setLoading(true)
    try {
      // إنشاء الحجز مع بيانات الوحدة
      await addDoc(collection(db, "bookings"), {
        ...form,
        unitId,
        unitNumber: unitInfo?.unitNumber || "",
        roomName: unitType === "room" ? unitInfo?.name : undefined,
        villaName: unitType === "villa" ? unitInfo?.name : undefined,
        price: unitInfo?.price || 0,
        type: unitType,
        status: "جديد",
        createdAt: serverTimestamp(),
      })

      // ✅ تغيير حالة الوحدة إلى "محجوز"
      const collectionName = unitType === "villa" ? "villas" : "rooms"
      await updateDoc(doc(db, collectionName, unitId), {
        status: "محجوز",
      })

      setSent(true)
    } catch (err) {
      console.error("❌ خطأ:", err)
      alert("حدث خطأ أثناء إرسال الحجز. حاول مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-8 text-green-800 text-center">
      <span className="text-4xl mb-3 block">✅</span>
      <h3 className="font-bold text-lg mb-2">تم إرسال طلب الحجز بنجاح!</h3>
      {unitInfo?.unitNumber && (
        <p className="text-green-700 font-medium">
          🏠 الوحدة رقم: <span className="text-xl font-bold">{unitInfo.unitNumber}</span>
        </p>
      )}
      <p className="text-sm mt-2">سيتم التواصل معك قريباً لتأكيد الحجز</p>
    </div>
  )

  // التحقق من حالة الوحدة
  if (!unitLoading && unitInfo && unitInfo.status !== "متاح") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8 text-yellow-800 text-center">
        <span className="text-4xl mb-3 block">⚠️</span>
        <h3 className="font-bold text-lg mb-2">هذه الوحدة غير متاحة حالياً</h3>
        <p className="text-sm">يرجى اختيار وحدة أخرى أو التواصل معنا</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-right">
      {/* عرض معلومات الوحدة */}
      {unitInfo && (
        <div className="bg-[#FAF8F3] border border-[#E8E1D6] rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex justify-between items-center">
            <span className="text-[#7C7469] text-sm">الوحدة:</span>
            <span className="font-bold text-[#2B2A28] text-sm sm:text-base">{unitInfo.name}</span>
          </div>
          {unitInfo.unitNumber && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-[#7C7469] text-sm">رقم الوحدة:</span>
              <span className="font-bold text-[#C6A76D] text-base sm:text-lg">{unitInfo.unitNumber}</span>
            </div>
          )}
          <div className="flex justify-between items-center mt-2">
            <span className="text-[#7C7469] text-sm">السعر/ليلة:</span>
            <span className="font-bold text-green-600 text-sm sm:text-base">{unitInfo.price} ريال</span>
          </div>
        </div>
      )}

      <div>
        <label className="block mb-1 text-[#7C7469] text-sm">الاسم الكامل:</label>
        <input
          type="text"
          name="fullName"
          required
          value={form.fullName}
          onChange={handleChange}
          className="border border-[#E8E1D6] w-full p-2 sm:p-2.5 rounded bg-white text-sm sm:text-base"
        />
      </div>
      <div>
        <label className="block mb-1 text-[#7C7469] text-sm">رقم الجوال:</label>
        <input
          type="tel"
          name="phone"
          required
          value={form.phone}
          onChange={handleChange}
          className="border border-[#E8E1D6] w-full p-2 sm:p-2.5 rounded bg-white text-sm sm:text-base"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block mb-1 text-[#7C7469] text-sm">تاريخ الوصول:</label>
          <input
            type="date"
            name="checkIn"
            required
            value={form.checkIn}
            onChange={handleChange}
            className="border border-[#E8E1D6] w-full p-2 sm:p-2.5 rounded bg-white text-sm"
          />
        </div>
        <div>
          <label className="block mb-1 text-[#7C7469] text-sm">تاريخ المغادرة:</label>
          <input
            type="date"
            name="checkOut"
            required
            value={form.checkOut}
            onChange={handleChange}
            className="border border-[#E8E1D6] w-full p-2 sm:p-2.5 rounded bg-white text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block mb-1 text-[#7C7469] text-sm">عدد الأشخاص:</label>
        <input
          type="number"
          name="guests"
          min={1}
          required
          value={form.guests}
          onChange={handleChange}
          className="border border-[#E8E1D6] w-full p-2 sm:p-2.5 rounded bg-white text-sm sm:text-base"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-[#2B2A28] text-[#FAF8F3] py-2.5 sm:py-3 rounded-full hover:opacity-90 transition text-sm sm:text-base"
        disabled={loading || unitLoading}
      >
        {loading ? "...جاري الإرسال" : "تأكيد الحجز"}
      </button>
    </form>
  )
}
