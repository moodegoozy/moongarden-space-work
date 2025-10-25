import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function SearchBar() {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const navigate = useNavigate()

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert("الرجاء تحديد تاريخ الوصول والمغادرة")
      return
    }

    navigate(`/search?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
  }

  return (
    <div className="flex items-center justify-center bg-white rounded-2xl shadow-lg p-6 w-full max-w-5xl mx-auto -mt-10 z-20 relative">
      <div className="grid grid-cols-4 gap-4 w-full text-right">
        <div>
          <label className="block text-sm text-gray-600 mb-1">تاريخ الوصول</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="border rounded-lg p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">تاريخ المغادرة</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="border rounded-lg p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">عدد النزلاء</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="border rounded-lg p-2 w-full"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            بحث
          </button>
        </div>
      </div>
    </div>
  )
}
