// src/pages/dashboard/ReportsPage.tsx
// التقارير والإحصائيات - PMS Reports
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore"

type ReportType = "daily" | "weekly" | "monthly" | "custom"
type ReportCategory = "occupancy" | "revenue" | "bookings" | "housekeeping"

type DailyStats = {
  date: string
  checkIns: number
  checkOuts: number
  occupancy: number
  revenue: number
  rooms: { occupied: number; available: number }
  villas: { occupied: number; available: number }
}

type Booking = {
  id: string
  fullName: string
  checkIn: string
  checkOut: string
  price: number
  status: string
  type: "room" | "villa"
  roomName?: string
  villaName?: string
  createdAt: any
}

type Invoice = {
  id: string
  total: number
  paid: number
  status: string
  createdAt: any
  guestName: string
  unitType: "room" | "villa"
}

export default function ReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [roomsCount, setRoomsCount] = useState(0)
  const [villasCount, setVillasCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState<ReportType>("daily")
  const [reportCategory, setReportCategory] = useState<ReportCategory>("occupancy")
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // جلب الحجوزات
      const bookingsSnap = await getDocs(
        query(collection(db, "bookings"), orderBy("createdAt", "desc"))
      )
      const bookingsData = bookingsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Booking[]
      setBookings(bookingsData)

      // جلب الفواتير
      const invoicesSnap = await getDocs(collection(db, "invoices"))
      const invoicesData = invoicesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Invoice[]
      setInvoices(invoicesData)

      // جلب عدد الوحدات
      const roomsSnap = await getDocs(collection(db, "rooms"))
      setRoomsCount(roomsSnap.size)

      const villasSnap = await getDocs(collection(db, "villas"))
      setVillasCount(villasSnap.size)
    } catch (err) {
      console.error("❌ خطأ:", err)
    } finally {
      setLoading(false)
    }
  }

  // حساب الإحصائيات
  const calculateStats = () => {
    const today = new Date().toISOString().split("T")[0]
    const thisMonth = new Date().toISOString().slice(0, 7)
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .slice(0, 7)

    // الحجوزات اليوم
    const todayBookings = bookings.filter(
      (b) => b.checkIn <= today && b.checkOut > today && b.status !== "ملغي"
    )

    // إيرادات الشهر
    const monthlyRevenue = invoices
      .filter((i) => {
        const invoiceDate =
          i.createdAt?.toDate?.()?.toISOString?.().slice(0, 7) ||
          new Date(i.createdAt).toISOString().slice(0, 7)
        return invoiceDate === thisMonth
      })
      .reduce((sum, i) => sum + (i.paid || 0), 0)

    // إيرادات الشهر الماضي
    const lastMonthRevenue = invoices
      .filter((i) => {
        const invoiceDate =
          i.createdAt?.toDate?.()?.toISOString?.().slice(0, 7) ||
          new Date(i.createdAt).toISOString().slice(0, 7)
        return invoiceDate === lastMonth
      })
      .reduce((sum, i) => sum + (i.paid || 0), 0)

    // نسبة الإشغال اليوم
    const totalUnits = roomsCount + villasCount
    const occupiedUnits = todayBookings.length
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

    // متوسط سعر الليلة
    const confirmedBookings = bookings.filter(
      (b) => b.status !== "ملغي" && b.price > 0
    )
    const avgDailyRate =
      confirmedBookings.length > 0
        ? confirmedBookings.reduce((sum, b) => sum + b.price, 0) /
          confirmedBookings.length
        : 0

    // RevPAR (Revenue per available room)
    const revPAR = totalUnits > 0 ? monthlyRevenue / (totalUnits * 30) : 0

    return {
      todayOccupied: occupiedUnits,
      totalUnits,
      occupancyRate: occupancyRate.toFixed(1),
      monthlyRevenue,
      lastMonthRevenue,
      revenueGrowth:
        lastMonthRevenue > 0
          ? (((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
          : "0",
      avgDailyRate: avgDailyRate.toFixed(0),
      revPAR: revPAR.toFixed(0),
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter((b) => b.status === "مؤكد").length,
      checkInsToday: bookings.filter((b) => b.checkIn === today).length,
      checkOutsToday: bookings.filter((b) => b.checkOut === today).length,
      roomsRevenue: invoices
        .filter((i) => i.unitType === "room")
        .reduce((sum, i) => sum + (i.paid || 0), 0),
      villasRevenue: invoices
        .filter((i) => i.unitType === "villa")
        .reduce((sum, i) => sum + (i.paid || 0), 0),
    }
  }

  // بيانات الرسم البياني للأسبوع
  const getWeeklyData = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayName = date.toLocaleDateString("ar-SA", { weekday: "short" })

      const dayBookings = bookings.filter(
        (b) => b.checkIn <= dateStr && b.checkOut > dateStr && b.status !== "ملغي"
      )

      const dayInvoices = invoices.filter((inv) => {
        const invDate =
          inv.createdAt?.toDate?.()?.toISOString?.().split("T")[0] ||
          new Date(inv.createdAt).toISOString().split("T")[0]
        return invDate === dateStr
      })

      data.push({
        date: dateStr,
        day: dayName,
        occupancy: dayBookings.length,
        revenue: dayInvoices.reduce((sum, i) => sum + (i.paid || 0), 0),
      })
    }
    return data
  }

  // بيانات الرسم البياني للشهر
  const getMonthlyData = () => {
    const data = []
    const today = new Date()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

    for (let i = 1; i <= Math.min(today.getDate(), daysInMonth); i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i)
      const dateStr = date.toISOString().split("T")[0]

      const dayBookings = bookings.filter(
        (b) => b.checkIn <= dateStr && b.checkOut > dateStr && b.status !== "ملغي"
      )

      const dayInvoices = invoices.filter((inv) => {
        const invDate =
          inv.createdAt?.toDate?.()?.toISOString?.().split("T")[0] ||
          new Date(inv.createdAt).toISOString().split("T")[0]
        return invDate === dateStr
      })

      data.push({
        date: dateStr,
        day: i.toString(),
        occupancy: dayBookings.length,
        revenue: dayInvoices.reduce((sum, i) => sum + (i.paid || 0), 0),
      })
    }
    return data
  }

  const stats = calculateStats()
  const weeklyData = getWeeklyData()
  const monthlyData = getMonthlyData()

  // أعلى قيمة للرسم البياني
  const maxOccupancy = Math.max(...weeklyData.map((d) => d.occupancy), 1)
  const maxRevenue = Math.max(...weeklyData.map((d) => d.revenue), 1)

  const printReport = () => {
    window.print()
  }

  const exportToCSV = () => {
    const headers = ["التاريخ", "الإشغال", "الإيرادات"]
    const data = weeklyData.map((d) => [d.date, d.occupancy, d.revenue])
    const csv = [headers.join(","), ...data.map((row) => row.join(","))].join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `تقرير-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل التقارير...</p>
      </div>
    )
  }

  return (
    <div className="text-right print:p-4">
      {/* الهيدر */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#C6A76D] to-[#8B7355] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2B2A28]">التقارير والإحصائيات</h1>
            <p className="text-[#7C7469] text-sm">تحليل أداء الفندق</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 flex items-center gap-2"
          >
            <span>📥</span> تصدير Excel
          </button>
          <button
            onClick={printReport}
            className="bg-[#2B2A28] text-white px-4 py-2 rounded-xl hover:bg-[#3D3A36] flex items-center gap-2"
          >
            <span>🖨️</span> طباعة
          </button>
        </div>
      </div>

      {/* عنوان الطباعة */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold">🌙 Moon Garden</h1>
        <p className="text-gray-600">تقرير أداء الفندق - {new Date().toLocaleDateString("ar-SA")}</p>
      </div>

      {/* بطاقات KPIs الرئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* نسبة الإشغال */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📈</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">اليوم</span>
          </div>
          <p className="text-4xl font-bold">{stats.occupancyRate}%</p>
          <p className="text-blue-100 text-sm mt-1">نسبة الإشغال</p>
          <p className="text-xs text-blue-200 mt-2">
            {stats.todayOccupied} من {stats.totalUnits} وحدة
          </p>
        </div>

        {/* إيرادات الشهر */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">💰</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                Number(stats.revenueGrowth) >= 0 ? "bg-white/20" : "bg-red-400/50"
              }`}
            >
              {Number(stats.revenueGrowth) >= 0 ? "↑" : "↓"} {Math.abs(Number(stats.revenueGrowth))}%
            </span>
          </div>
          <p className="text-3xl font-bold">{stats.monthlyRevenue.toLocaleString()}</p>
          <p className="text-green-100 text-sm mt-1">إيرادات الشهر (ر.س)</p>
          <p className="text-xs text-green-200 mt-2">
            الشهر الماضي: {stats.lastMonthRevenue.toLocaleString()}
          </p>
        </div>

        {/* متوسط سعر الليلة */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🏷️</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">ADR</span>
          </div>
          <p className="text-4xl font-bold">{stats.avgDailyRate}</p>
          <p className="text-purple-100 text-sm mt-1">متوسط سعر الليلة (ر.س)</p>
        </div>

        {/* RevPAR */}
        <div className="bg-gradient-to-br from-[#C6A76D] to-[#8B7355] text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📊</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">RevPAR</span>
          </div>
          <p className="text-4xl font-bold">{stats.revPAR}</p>
          <p className="text-[#FAF8F3]/80 text-sm mt-1">العائد لكل غرفة (ر.س)</p>
        </div>
      </div>

      {/* إحصائيات اليوم */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#E8E1D6] p-4 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-xl">🛬</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.checkInsToday}</p>
          <p className="text-sm text-[#7C7469]">وصول اليوم</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E1D6] p-4 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-xl">🛫</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.checkOutsToday}</p>
          <p className="text-sm text-[#7C7469]">مغادرة اليوم</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E1D6] p-4 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.totalBookings}</p>
          <p className="text-sm text-[#7C7469]">إجمالي الحجوزات</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E1D6] p-4 text-center">
          <div className="w-12 h-12 bg-[#C6A76D]/20 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-xl">✅</span>
          </div>
          <p className="text-2xl font-bold text-[#C6A76D]">{stats.confirmedBookings}</p>
          <p className="text-sm text-[#7C7469]">حجوزات مؤكدة</p>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* رسم الإشغال الأسبوعي */}
        <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span>📈</span> الإشغال الأسبوعي
          </h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyData.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                  style={{ height: `${(d.occupancy / maxOccupancy) * 100}%`, minHeight: "8px" }}
                  title={`${d.occupancy} وحدة`}
                ></div>
                <p className="text-xs text-[#7C7469] mt-2">{d.day}</p>
                <p className="text-xs font-bold text-[#2B2A28]">{d.occupancy}</p>
              </div>
            ))}
          </div>
        </div>

        {/* رسم الإيرادات الأسبوعية */}
        <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span>💰</span> الإيرادات الأسبوعية
          </h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyData.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:from-green-600 hover:to-green-500"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: "8px" }}
                  title={`${d.revenue.toLocaleString()} ر.س`}
                ></div>
                <p className="text-xs text-[#7C7469] mt-2">{d.day}</p>
                <p className="text-xs font-bold text-[#2B2A28]">{(d.revenue / 1000).toFixed(1)}K</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* توزيع الإيرادات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* إيرادات حسب النوع */}
        <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span>🏨</span> الإيرادات حسب النوع
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#7C7469]">الغرف</span>
                <span className="font-bold">{stats.roomsRevenue.toLocaleString()} ر.س</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${
                      stats.roomsRevenue + stats.villasRevenue > 0
                        ? (stats.roomsRevenue /
                            (stats.roomsRevenue + stats.villasRevenue)) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#7C7469]">الفلل</span>
                <span className="font-bold">{stats.villasRevenue.toLocaleString()} ر.س</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C6A76D] rounded-full"
                  style={{
                    width: `${
                      stats.roomsRevenue + stats.villasRevenue > 0
                        ? (stats.villasRevenue /
                            (stats.roomsRevenue + stats.villasRevenue)) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* حالة الوحدات */}
        <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span>🚪</span> حالة الوحدات
          </h3>
          <div className="relative w-40 h-40 mx-auto">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#E8E1D6" strokeWidth="12" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#22C55E"
                strokeWidth="12"
                strokeDasharray={`${(stats.todayOccupied / stats.totalUnits) * 251.2} 251.2`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-[#2B2A28]">{stats.occupancyRate}%</p>
              <p className="text-xs text-[#7C7469]">إشغال</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-[#7C7469]">مشغول ({stats.todayOccupied})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <span className="text-xs text-[#7C7469]">متاح ({stats.totalUnits - stats.todayOccupied})</span>
            </div>
          </div>
        </div>

        {/* مقارنة شهرية */}
        <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span>📆</span> مقارنة شهرية
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-600">الشهر الحالي</p>
              <p className="text-2xl font-bold text-green-700">{stats.monthlyRevenue.toLocaleString()} ر.س</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600">الشهر الماضي</p>
              <p className="text-2xl font-bold text-gray-700">{stats.lastMonthRevenue.toLocaleString()} ر.س</p>
            </div>
            <div
              className={`p-4 rounded-xl border ${
                Number(stats.revenueGrowth) >= 0
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p className="text-sm text-gray-600">نسبة النمو</p>
              <p
                className={`text-2xl font-bold ${
                  Number(stats.revenueGrowth) >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                {Number(stats.revenueGrowth) >= 0 ? "↑" : "↓"} {Math.abs(Number(stats.revenueGrowth))}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* جدول آخر الحجوزات */}
      <div className="bg-white rounded-2xl border border-[#E8E1D6] overflow-hidden">
        <div className="p-4 bg-gradient-to-l from-[#FAF8F3] to-[#F6F1E9] border-b border-[#E8E1D6]">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span>📋</span> آخر الحجوزات
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAF8F3] border-b border-[#E8E1D6]">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-bold text-[#2B2A28]">النزيل</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-[#2B2A28]">الوحدة</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-[#2B2A28]">الوصول</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-[#2B2A28]">المغادرة</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-[#2B2A28]">السعر</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#2B2A28]">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 10).map((b, idx) => (
                <tr
                  key={b.id}
                  className={`border-b border-[#E8E1D6]/50 ${idx % 2 === 0 ? "bg-white" : "bg-[#FDFCFA]"}`}
                >
                  <td className="px-4 py-3 font-medium">{b.fullName}</td>
                  <td className="px-4 py-3 text-[#7C7469]">{b.roomName || b.villaName || "—"}</td>
                  <td className="px-4 py-3 text-[#7C7469]">{b.checkIn}</td>
                  <td className="px-4 py-3 text-[#7C7469]">{b.checkOut}</td>
                  <td className="px-4 py-3 font-bold">{b.price?.toLocaleString()} ر.س</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        b.status === "مؤكد"
                          ? "bg-blue-100 text-blue-700"
                          : b.status === "مسجل دخول"
                          ? "bg-green-100 text-green-700"
                          : b.status === "مغادر"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
