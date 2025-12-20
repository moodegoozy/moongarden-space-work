import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { db } from "@/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

export default function BookingForm({ unitId }: { unitId: string }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === "guests" ? Number(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, "bookings"), {
        ...form,
        unitId,
        createdAt: serverTimestamp(),
      })
      setSent(true)
    } catch (err) {
      alert("حدث خطأ أثناء إرسال الحجز. حاول مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="bg-green-50 border border-green-200 rounded p-6 mt-8 text-green-800 text-center">
      ✅ تم إرسال طلب الحجز بنجاح! سيتم التواصل معك قريباً.
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-right">
      <div>
        <label className="block mb-1 text-[#7C7469]">الاسم الكامل:</label>
        <input
          type="text"
          name="fullName"
          required
          value={form.fullName}
          onChange={handleChange}
          className="border border-[#E8E1D6] w-full p-2 rounded bg-white"
        />
      </div>
      <div>
        <label className="block mb-1 text-[#7C7469]">رقم الجوال:</label>
        <input
          type="tel"
          name="phone"
          required
          value={form.phone}
          onChange={handleChange}
          className="border border-[#E8E1D6] w-full p-2 rounded bg-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-[#7C7469]">تاريخ الوصول:</label>
          <input
            type="date"
            name="checkIn"
            required
            value={form.checkIn}
            onChange={handleChange}
            className="border border-[#E8E1D6] w-full p-2 rounded bg-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-[#7C7469]">تاريخ المغادرة:</label>
          <input
            type="date"
            name="checkOut"
            required
            value={form.checkOut}
            onChange={handleChange}
            className="border border-[#E8E1D6] w-full p-2 rounded bg-white"
          />
        </div>
      </div>
      <div>
        <label className="block mb-1 text-[#7C7469]">عدد الأشخاص:</label>
        <input
          type="number"
          name="guests"
          min={1}
          required
          value={form.guests}
          onChange={handleChange}
          className="border border-[#E8E1D6] w-full p-2 rounded bg-white"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-[#2B2A28] text-[#FAF8F3] py-3 rounded-full hover:opacity-90 transition"
        disabled={loading}
      >
        {loading ? "...جاري الإرسال" : "تأكيد الحجز"}
      </button>
    </form>
  )
}
