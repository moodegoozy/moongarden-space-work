// src/pages/dashboard/RoomStatus.tsx
// شاشة حالة الغرف والفلل - نظام PMS
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"

type Unit = {
  id: string
  name: string
  unitNumber?: string
  price: number
  status: string
  housekeepingStatus?: "نظيفة" | "متسخة" | "قيد التنظيف" | "تحت الفحص" | "تحت الصيانة"
  type: "room" | "villa"
  currentGuest?: string
  checkOut?: string
}

type Booking = {
  id: string
  fullName: string
  phone: string
  unitId: string
  checkIn: string
  checkOut: string
  status: string
}

export default function RoomStatus() {
  const [units, setUnits] = useState<Unit[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "rooms" | "villas">("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [housekeepingFilter, setHousekeepingFilter] = useState<string>("all")

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // جلب الحجوزات الحالية (مسجلين دخول)
      const bookingsSnap = await getDocs(collection(db, "bookings"))
      const activeBookings = bookingsSnap.docs
        .map((d) => {
          const b = d.data() as any
          return {
            id: d.id,
            fullName: b.fullName || "—",
            phone: b.phone || "—",
            unitId: b.unitId || "",
            checkIn: b.checkIn || "",
            checkOut: b.checkOut || "",
            status: b.status || "",
          }
        })
        .filter((b) => b.status === "مسجل دخول")
      setBookings(activeBookings)

      // جلب الغرف
      const roomsSnap = await getDocs(collection(db, "rooms"))
      const rooms = roomsSnap.docs.map((d) => {
        const r = d.data() as any
        const activeBooking = activeBookings.find((b) => b.unitId === d.id)
        return {
          id: d.id,
          name: r.name || "—",
          unitNumber: r.unitNumber || "",
          price: r.price || 0,
          status: r.status || "متاح",
          housekeepingStatus: r.housekeepingStatus || "نظيفة",
          type: "room" as const,
          currentGuest: activeBooking?.fullName,
          checkOut: activeBooking?.checkOut,
        }
      })

      // جلب الفلل
      const villasSnap = await getDocs(collection(db, "villas"))
      const villas = villasSnap.docs.map((d) => {
        const v = d.data() as any
        const activeBooking = activeBookings.find((b) => b.unitId === d.id)
        return {
          id: d.id,
          name: v.name || "—",
          unitNumber: v.unitNumber || "",
          price: v.price || 0,
          status: v.status || "متاح",
          housekeepingStatus: v.housekeepingStatus || "نظيفة",
          type: "villa" as const,
          currentGuest: activeBooking?.fullName,
          checkOut: activeBooking?.checkOut,
        }
      })

      setUnits([...rooms, ...villas])
    } catch (err) {
      console.error("❌ خطأ:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (unit: Unit, newStatus: string) => {
    try {
      const collectionName = unit.type === "room" ? "rooms" : "villas"
      await updateDoc(doc(db, collectionName, unit.id), { status: newStatus })
      await fetchData()
    } catch (err) {
      console.error("❌ خطأ:", err)
      alert("حدث خطأ أثناء تغيير الحالة")
    }
  }

  const handleHousekeepingChange = async (unit: Unit, newStatus: string) => {
    try {
      const collectionName = unit.type === "room" ? "rooms" : "villas"
      await updateDoc(doc(db, collectionName, unit.id), { housekeepingStatus: newStatus })
      await fetchData()
    } catch (err) {
      console.error("❌ خطأ:", err)
      alert("حدث خطأ أثناء تغيير حالة التنظيف")
    }
  }

  const filteredUnits = units.filter((unit) => {
    const matchesType = filter === "all" || (filter === "rooms" && unit.type === "room") || (filter === "villas" && unit.type === "villa")
    const matchesStatus = statusFilter === "all" || unit.status === statusFilter
    const matchesHousekeeping = housekeepingFilter === "all" || unit.housekeepingStatus === housekeepingFilter
    return matchesType && matchesStatus && matchesHousekeeping
  })

  const stats = {
    total: units.length,
    available: units.filter((u) => u.status === "متاح").length,
    occupied: units.filter((u) => u.status === "محجوز").length,
    locked: units.filter((u) => u.status === "مقفلة").length,
    dirty: units.filter((u) => u.housekeepingStatus === "متسخة").length,
    cleaning: units.filter((u) => u.housekeepingStatus === "قيد التنظيف").length,
  }

  const statusConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    "متاح": { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", icon: "✓" },
    "محجوز": { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200", icon: "👤" },
    "مؤكد": { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", icon: "📋" },
    "مقفلة": { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200", icon: "🔒" },
    "مسجل دخول": { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", icon: "🏠" },
    "مغادر": { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", icon: "🚪" },
  }

  const housekeepingConfig: Record<string, { bg: string; text: string; icon: string }> = {
    "نظيفة": { bg: "bg-green-500", text: "text-white", icon: "✓" },
    "متسخة": { bg: "bg-red-500", text: "text-white", icon: "✗" },
    "قيد التنظيف": { bg: "bg-yellow-500", text: "text-white", icon: "🧹" },
    "تحت الفحص": { bg: "bg-blue-500", text: "text-white", icon: "🔍" },
    "تحت الصيانة": { bg: "bg-orange-500", text: "text-white", icon: "🔧" },
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل حالة الوحدات...</p>
      </div>
    )
  }

  return (
    <div className="text-right">
      {/* الهيدر */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🗂️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2B2A28]">حالة الوحدات</h1>
            <p className="text-[#7C7469] text-sm">نظرة شاملة على حالة جميع الغرف والفلل</p>
          </div>
        </div>

        {/* ملخص الحالات */}
        <div className="flex gap-3 flex-wrap">
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center">
            <p className="text-green-600 font-bold text-xl">{stats.available}</p>
            <p className="text-green-600 text-xs">متاح</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-center">
            <p className="text-yellow-600 font-bold text-xl">{stats.occupied}</p>
            <p className="text-yellow-600 text-xs">مشغول</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-center">
            <p className="text-gray-500 font-bold text-xl">{stats.locked}</p>
            <p className="text-gray-500 text-xs">مقفل</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">
            <p className="text-red-600 font-bold text-xl">{stats.dirty}</p>
            <p className="text-red-600 text-xs">متسخة</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
            <p className="text-blue-600 font-bold text-xl">{stats.cleaning}</p>
            <p className="text-blue-600 text-xs">تنظيف</p>
          </div>
        </div>
      </div>

      {/* الفلاتر */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {(["all", "rooms", "villas"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? "bg-[#C6A76D] text-white"
                  : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:border-[#C6A76D]"
              }`}
            >
              {f === "all" && "🏠 الكل"}
              {f === "rooms" && "🛏️ الغرف"}
              {f === "villas" && "🏡 الفلل"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["all", "متاح", "محجوز", "مسجل دخول", "مقفلة"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === s
                  ? "bg-[#2B2A28] text-white"
                  : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:border-[#C6A76D]"
              }`}
            >
              {s === "all" ? "كل الحالات" : s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["all", "نظيفة", "متسخة", "قيد التنظيف", "تحت الصيانة"].map((h) => (
            <button
              key={h}
              onClick={() => setHousekeepingFilter(h)}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                housekeepingFilter === h
                  ? h === "متسخة" ? "bg-red-500 text-white" : h === "نظيفة" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                  : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:border-[#C6A76D]"
              }`}
            >
              {h === "all" ? "🧹 التنظيف" : h}
            </button>
          ))}
        </div>
      </div>

      {/* شبكة الوحدات */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredUnits.map((unit) => {
          const config = statusConfig[unit.status] || statusConfig["متاح"]
          const hkConfig = housekeepingConfig[unit.housekeepingStatus || "نظيفة"] || housekeepingConfig["نظيفة"]
          const isCheckoutToday = unit.checkOut === today

          return (
            <div
              key={unit.id}
              className={`relative rounded-2xl border-2 p-4 transition-all hover:shadow-lg cursor-pointer group ${config.bg} ${config.border}`}
            >
              {/* رقم الوحدة */}
              <div className="text-center mb-3">
                <p className="text-3xl font-bold text-[#2B2A28]">
                  {unit.unitNumber || "—"}
                </p>
                <p className="text-xs text-[#7C7469] truncate">{unit.name}</p>
              </div>

              {/* نوع الوحدة */}
              <div className="absolute top-2 right-2">
                <span className="text-lg">
                  {unit.type === "room" ? "🛏️" : "🏡"}
                </span>
              </div>

              {/* شارة التنظيف */}
              <div className="absolute top-2 left-2">
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${hkConfig.bg} ${hkConfig.text}`}>
                  {hkConfig.icon}
                </span>
              </div>

              {/* الحالة */}
              <div className={`text-center py-2 rounded-lg ${config.bg} border ${config.border}`}>
                <span className={`text-sm font-bold ${config.text}`}>
                  {config.icon} {unit.status}
                </span>
              </div>

              {/* حالة التنظيف */}
              <div className="text-center mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${hkConfig.bg} ${hkConfig.text}`}>
                  {unit.housekeepingStatus || "نظيفة"}
                </span>
              </div>

              {/* معلومات النزيل الحالي */}
              {unit.currentGuest && (
                <div className="mt-3 pt-3 border-t border-[#E8E1D6]">
                  <p className="text-xs text-[#7C7469]">النزيل:</p>
                  <p className="text-sm font-medium text-[#2B2A28] truncate">{unit.currentGuest}</p>
                  {unit.checkOut && (
                    <p className={`text-xs mt-1 ${isCheckoutToday ? "text-orange-600 font-bold" : "text-[#7C7469]"}`}>
                      الخروج: {unit.checkOut} {isCheckoutToday && "(اليوم)"}
                    </p>
                  )}
                </div>
              )}

              {/* قائمة تغيير الحالة */}
              <div className="absolute inset-0 bg-black/70 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                <div className="flex flex-col gap-1.5 w-full">
                  <p className="text-white text-xs font-bold text-center mb-1">تغيير الحالة:</p>
                  <div className="flex gap-1 justify-center flex-wrap">
                    {unit.status !== "متاح" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(unit, "متاح"); }}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                      >
                        متاح
                      </button>
                    )}
                    {unit.status !== "مقفلة" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(unit, "مقفلة"); }}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                      >
                        🔒 قفل
                      </button>
                    )}
                  </div>
                  <p className="text-white text-xs font-bold text-center mt-2 mb-1">التنظيف:</p>
                  <div className="flex gap-1 justify-center flex-wrap">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleHousekeepingChange(unit, "متسخة"); }}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      متسخة
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleHousekeepingChange(unit, "قيد التنظيف"); }}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                    >
                      تنظيف
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleHousekeepingChange(unit, "نظيفة"); }}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                    >
                      نظيفة
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleHousekeepingChange(unit, "تحت الصيانة"); }}
                      className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                    >
                      صيانة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredUnits.length === 0 && (
        <div className="text-center py-16 bg-[#FAF8F3] rounded-2xl border border-[#E8E1D6]">
          <span className="text-5xl mb-4 block">🏠</span>
          <p className="text-[#7C7469] text-lg">لا يوجد وحدات مطابقة للفلتر</p>
        </div>
      )}
    </div>
  )
}
