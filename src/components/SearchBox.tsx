// src/components/SearchBox.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function SearchBox() {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const navigate = useNavigate()

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert("الرجاء تحديد تاريخ الوصول والمغادرة")
      return
    }

    // ✅ يرسل المستخدم لصفحة البحث مع البيانات في الرابط
    navigate(`/search?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      {/* ✅ تاريخ الوصول */}
      <div className="flex flex-col text-right w-full md:w-1/3">
        <label className="text-gray-600 mb-1">تاريخ الوصول</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {/* ✅ تاريخ المغادرة */}
      <div className="flex flex-col text-right w-full md:w-1/3">
        <label className="text-gray-600 mb-1">تاريخ المغادرة</label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {/* ✅ عدد النزلاء */}
      <div className="flex flex-col text-right w-full md:w-1/6">
        <label className="text-gray-600 mb-1">عدد النزلاء</label>
        <select
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ زر البحث */}
      <button
        onClick={handleSearch}
        className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all"
      >
        بحث
      </button>
    </div>
  )
}
