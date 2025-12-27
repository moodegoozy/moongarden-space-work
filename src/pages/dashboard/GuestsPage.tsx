// src/pages/dashboard/GuestsPage.tsx
// صفحة سجل النزلاء - نظام PMS
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, getDocs, query, orderBy } from "firebase/firestore"

type Guest = {
  id: string
  fullName: string
  phone: string
  nationalId?: string
  birthDate?: string
  email?: string
  totalBookings: number
  totalNights: number
  totalSpent: number
  lastVisit?: string
  firstVisit?: string
  status: "vip" | "regular" | "new"
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "vip" | "regular" | "new">("all")

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      const bookingsSnap = await getDocs(collection(db, "bookings"))
      const guestsMap = new Map<string, Guest>()

      bookingsSnap.docs.forEach((doc) => {
        const b = doc.data() as any
        const phone = b.phone || "غير معروف"
        const checkIn = b.checkIn ? new Date(b.checkIn) : null
        const checkOut = b.checkOut ? new Date(b.checkOut) : null
        const nights = checkIn && checkOut
          ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
          : 0

        if (guestsMap.has(phone)) {
          const existing = guestsMap.get(phone)!
          existing.totalBookings += 1
          existing.totalNights += nights
          existing.totalSpent += b.price || 0

          // تحديث الاسم ورقم الهوية إذا كانت موجودة
          if (b.fullName && b.fullName !== "—") existing.fullName = b.fullName
          if (b.nationalId) existing.nationalId = b.nationalId
          if (b.birthDate) existing.birthDate = b.birthDate
          if (b.email) existing.email = b.email

          // تحديث آخر وأول زيارة
          const visitDate = b.createdAt?.toDate?.()?.toISOString().split("T")[0]
          if (visitDate) {
            if (!existing.firstVisit || visitDate < existing.firstVisit) {
              existing.firstVisit = visitDate
            }
            if (!existing.lastVisit || visitDate > existing.lastVisit) {
              existing.lastVisit = visitDate
            }
          }

          // تحديث الحالة
          if (existing.totalBookings >= 5 || existing.totalSpent >= 10000) {
            existing.status = "vip"
          } else if (existing.totalBookings > 1) {
            existing.status = "regular"
          }
        } else {
          guestsMap.set(phone, {
            id: doc.id,
            fullName: b.fullName || "—",
            phone,
            nationalId: b.nationalId,
            birthDate: b.birthDate,
            email: b.email,
            totalBookings: 1,
            totalNights: nights,
            totalSpent: b.price || 0,
            lastVisit: b.createdAt?.toDate?.()?.toISOString().split("T")[0],
            firstVisit: b.createdAt?.toDate?.()?.toISOString().split("T")[0],
            status: "new",
          })
        }
      })

      const sortedGuests = Array.from(guestsMap.values()).sort((a, b) => {
        if (a.status === "vip" && b.status !== "vip") return -1
        if (b.status === "vip" && a.status !== "vip") return 1
        return b.totalSpent - a.totalSpent
      })

      setGuests(sortedGuests)
    } catch (err) {
      console.error("❌ خطأ:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone.includes(searchQuery) ||
      (guest.nationalId && guest.nationalId.includes(searchQuery))
    const matchesFilter = filterStatus === "all" || guest.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: guests.length,
    vip: guests.filter((g) => g.status === "vip").length,
    regular: guests.filter((g) => g.status === "regular").length,
    new: guests.filter((g) => g.status === "new").length,
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل سجل النزلاء...</p>
      </div>
    )
  }

  return (
    <div className="text-right">
      {/* الهيدر */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#42A5F5] to-[#1976D2] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2B2A28]">سجل النزلاء</h1>
            <p className="text-[#7C7469] text-sm">{guests.length} نزيل مسجل في النظام</p>
          </div>
        </div>
      </div>

      {/* إحصائيات النزلاء */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E8E1D6] p-4 text-center">
          <p className="text-2xl font-bold text-[#2B2A28]">{stats.total}</p>
          <p className="text-sm text-[#7C7469]">إجمالي النزلاء</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.vip}</p>
          <p className="text-sm text-amber-600">نزلاء VIP</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.regular}</p>
          <p className="text-sm text-blue-600">نزلاء متكررين</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.new}</p>
          <p className="text-sm text-green-600">نزلاء جدد</p>
        </div>
      </div>

      {/* البحث والفلترة */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="🔍 ابحث بالاسم أو الجوال أو رقم الهوية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 pr-12 rounded-xl border-2 border-[#E8E1D6] bg-white text-right text-[#2B2A28] placeholder-[#A09B93] focus:border-[#C6A76D] focus:ring-2 focus:ring-[#C6A76D]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7469] hover:text-[#C6A76D]"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(["all", "vip", "regular", "new"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? "bg-[#C6A76D] text-white"
                  : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:border-[#C6A76D]"
              }`}
            >
              {status === "all" && "الكل"}
              {status === "vip" && "⭐ VIP"}
              {status === "regular" && "متكرر"}
              {status === "new" && "جديد"}
            </button>
          ))}
        </div>
      </div>

      {/* جدول النزلاء */}
      <div className="bg-white rounded-2xl border border-[#E8E1D6] overflow-hidden shadow-sm">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">👥</span>
            <p className="text-[#7C7469] text-lg">لا يوجد نزلاء مطابقين للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-l from-[#FAF8F3] to-[#F6F1E9] border-b border-[#E8E1D6]">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">النزيل</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">رقم الهوية</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">الحجوزات</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">الليالي</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">إجمالي الإنفاق</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[#2B2A28]">آخر زيارة</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-[#2B2A28]">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest, idx) => (
                  <tr
                    key={guest.id}
                    className={`border-b border-[#E8E1D6]/50 hover:bg-[#FAF8F3]/50 transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#FDFCFA]"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          guest.status === "vip"
                            ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white"
                            : "bg-[#E8E1D6] text-[#7C7469]"
                        }`}>
                          {guest.status === "vip" ? "⭐" : "👤"}
                        </div>
                        <div>
                          <p className="font-bold text-[#2B2A28]">{guest.fullName}</p>
                          <p className="text-sm text-[#7C7469]">{guest.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#2B2A28]">{guest.nationalId || "—"}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {guest.totalBookings} حجز
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#2B2A28]">{guest.totalNights} ليلة</td>
                    <td className="px-6 py-4">
                      <span className="text-[#C6A76D] font-bold">{guest.totalSpent.toLocaleString()} ر.س</span>
                    </td>
                    <td className="px-6 py-4 text-[#7C7469]">{guest.lastVisit || "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        guest.status === "vip"
                          ? "bg-gradient-to-l from-amber-100 to-yellow-100 text-amber-700 border border-amber-300"
                          : guest.status === "regular"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {guest.status === "vip" && "⭐ VIP"}
                        {guest.status === "regular" && "متكرر"}
                        {guest.status === "new" && "جديد"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
