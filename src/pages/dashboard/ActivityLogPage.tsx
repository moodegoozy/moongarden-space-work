// src/pages/dashboard/ActivityLogPage.tsx
// سجل النشاط - تتبع جميع الإجراءات في النظام
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from "firebase/firestore"
import Pagination, { paginateData } from "@/components/Pagination"

type ActivityLog = {
  id: string
  action: string
  actionType: "booking" | "checkin" | "checkout" | "payment" | "housekeeping" | "status" | "invoice" | "guest" | "other"
  description: string
  userId?: string
  userName?: string
  relatedId?: string
  relatedType?: string
  timestamp: string
  metadata?: any
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      // بناء سجل النشاط من الحجوزات والفواتير
      const activities: ActivityLog[] = []

      // جلب الحجوزات
      const bookingsSnap = await getDocs(
        query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(100))
      )
      bookingsSnap.docs.forEach((d) => {
        const b = d.data()
        const createdAt = b.createdAt?.toDate?.() || new Date()
        
        activities.push({
          id: `booking-${d.id}`,
          action: "حجز جديد",
          actionType: "booking",
          description: `حجز جديد من ${b.fullName || "—"} - ${b.roomName || b.villaName || "—"}`,
          relatedId: d.id,
          relatedType: "booking",
          timestamp: createdAt.toISOString(),
        })

        if (b.status === "مسجل دخول" && b.actualCheckIn) {
          activities.push({
            id: `checkin-${d.id}`,
            action: "تسجيل دخول",
            actionType: "checkin",
            description: `تسجيل دخول ${b.fullName || "—"} - ${b.roomName || b.villaName || "—"}`,
            relatedId: d.id,
            relatedType: "booking",
            timestamp: b.actualCheckIn,
          })
        }

        if (b.status === "مغادر" && b.actualCheckOut) {
          activities.push({
            id: `checkout-${d.id}`,
            action: "تسجيل خروج",
            actionType: "checkout",
            description: `تسجيل خروج ${b.fullName || "—"} - ${b.roomName || b.villaName || "—"}`,
            relatedId: d.id,
            relatedType: "booking",
            timestamp: b.actualCheckOut,
          })
        }
      })

      // جلب الفواتير
      const invoicesSnap = await getDocs(
        query(collection(db, "invoices"), orderBy("createdAt", "desc"), limit(50))
      )
      invoicesSnap.docs.forEach((d) => {
        const inv = d.data()
        const createdAt = inv.createdAt?.toDate?.() || new Date()
        
        activities.push({
          id: `invoice-${d.id}`,
          action: inv.status === "مدفوعة" ? "فاتورة مدفوعة" : "إنشاء فاتورة",
          actionType: "invoice",
          description: `فاتورة #${inv.invoiceNumber || d.id.slice(-6)} - ${inv.guestName || "—"} (${inv.total || 0} ريال)`,
          relatedId: d.id,
          relatedType: "invoice",
          timestamp: createdAt.toISOString(),
        })
      })

      // جلب مهام التدبير المنزلي
      const housekeepingSnap = await getDocs(
        query(collection(db, "housekeepingTasks"), orderBy("createdAt", "desc"), limit(50))
      )
      housekeepingSnap.docs.forEach((d) => {
        const task = d.data()
        const createdAt = task.createdAt?.toDate?.() || new Date()
        
        activities.push({
          id: `housekeeping-${d.id}`,
          action: task.status === "مكتمل" ? "مهمة مكتملة" : "مهمة جديدة",
          actionType: "housekeeping",
          description: `${task.taskType || "تنظيف"} - ${task.unitName || "—"}`,
          relatedId: d.id,
          relatedType: "housekeeping",
          timestamp: createdAt.toISOString(),
        })
      })

      // ترتيب حسب التاريخ
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setLogs(activities)
    } catch (err) {
      console.error("❌ خطأ:", err)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case "booking": return "📅"
      case "checkin": return "✅"
      case "checkout": return "🚪"
      case "payment": return "💳"
      case "housekeeping": return "🧹"
      case "invoice": return "🧾"
      case "status": return "🔄"
      case "guest": return "👤"
      default: return "📋"
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case "booking": return "bg-blue-100 text-blue-700"
      case "checkin": return "bg-green-100 text-green-700"
      case "checkout": return "bg-orange-100 text-orange-700"
      case "payment": return "bg-purple-100 text-purple-700"
      case "housekeeping": return "bg-cyan-100 text-cyan-700"
      case "invoice": return "bg-yellow-100 text-yellow-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (filterType !== "all" && log.actionType !== filterType) return false
    if (filterDate && !log.timestamp.startsWith(filterDate)) return false
    if (searchQuery && !log.description.includes(searchQuery) && !log.action.includes(searchQuery)) {
      return false
    }
    return true
  })

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "—"
    }
  }

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return "الآن"
      if (minutes < 60) return `منذ ${minutes} دقيقة`
      if (hours < 24) return `منذ ${hours} ساعة`
      if (days < 7) return `منذ ${days} يوم`
      return formatDate(isoString)
    } catch {
      return "—"
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C6A76D] border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-[#7C7469]">جاري تحميل سجل النشاط...</p>
      </div>
    )
  }

  // إحصائيات سريعة
  const todayLogs = logs.filter((l) => l.timestamp.startsWith(new Date().toISOString().split("T")[0]))
  const bookingsToday = todayLogs.filter((l) => l.actionType === "booking").length
  const checkinsToday = todayLogs.filter((l) => l.actionType === "checkin").length
  const checkoutsToday = todayLogs.filter((l) => l.actionType === "checkout").length

  return (
    <div className="p-4 md:p-6 text-right">
      <h1 className="text-2xl md:text-3xl font-bold text-[#2B2A28] mb-6">📋 سجل النشاط</h1>

      {/* إحصائيات اليوم */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{bookingsToday}</p>
          <p className="text-sm text-blue-700">حجوزات اليوم</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{checkinsToday}</p>
          <p className="text-sm text-green-700">تسجيل دخول</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{checkoutsToday}</p>
          <p className="text-sm text-orange-700">تسجيل خروج</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{todayLogs.length}</p>
          <p className="text-sm text-purple-700">إجمالي اليوم</p>
        </div>
      </div>

      {/* الفلاتر */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="🔍 بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
        >
          <option value="all">كل الأنشطة</option>
          <option value="booking">الحجوزات</option>
          <option value="checkin">تسجيل الدخول</option>
          <option value="checkout">تسجيل الخروج</option>
          <option value="invoice">الفواتير</option>
          <option value="housekeeping">التدبير المنزلي</option>
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
        />
      </div>

      {/* قائمة الأنشطة */}
      <div className="bg-white rounded-2xl border border-[#E8E1D6] overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-[#7C7469]">
            <p className="text-4xl mb-4">📭</p>
            <p>لا توجد أنشطة مطابقة</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E1D6]">
            {paginateData(filteredLogs, currentPage, itemsPerPage).map((log) => (
              <div key={log.id} className="p-4 hover:bg-[#FAF8F3] transition">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getActionIcon(log.actionType)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getActionColor(log.actionType)}`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-[#7C7469]">
                        {getRelativeTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-[#2B2A28] mt-1">{log.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredLogs.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
