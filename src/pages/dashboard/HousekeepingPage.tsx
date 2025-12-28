// src/pages/dashboard/HousekeepingPage.tsx
// نظام التدبير المنزلي (Housekeeping) - إدارة نظافة وصيانة الوحدات
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore"
import Pagination, { paginateData } from "@/components/Pagination"

type Unit = {
  id: string
  name: string
  unitNumber?: string
  type: "room" | "villa"
  status: "متاح" | "محجوز" | "مؤكد" | "مقفلة" | "مسجل دخول" | "مغادر"
  housekeepingStatus: "نظيفة" | "متسخة" | "قيد التنظيف" | "تحت الفحص" | "تحت الصيانة"
  lastCleaned?: string
  notes?: string
  priority?: "عادي" | "عاجل" | "VIP"
}

type HousekeepingTask = {
  id: string
  unitId: string
  unitName: string
  unitNumber?: string
  unitType: "room" | "villa"
  taskType: "تنظيف" | "تنظيف عميق" | "صيانة" | "فحص"
  status: "معلق" | "قيد التنفيذ" | "مكتمل"
  priority: "عادي" | "عاجل" | "VIP"
  assignedTo?: string
  notes?: string
  createdAt: string
  completedAt?: string
}

export default function HousekeepingPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "maintenance">("overview")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [tasksPage, setTasksPage] = useState(1)
  const itemsPerPage = 6
  const [taskForm, setTaskForm] = useState({
    taskType: "تنظيف" as "تنظيف" | "تنظيف عميق" | "صيانة" | "فحص",
    priority: "عادي" as "عادي" | "عاجل" | "VIP",
    assignedTo: "",
    notes: "",
  })

  // فريق التنظيف
  const housekeepingStaff = [
    "أحمد محمد",
    "فاطمة علي",
    "خالد سعيد",
    "نورة عبدالله",
    "محمد حسن",
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // جلب الغرف
      const roomsSnap = await getDocs(collection(db, "rooms"))
      const roomsData = roomsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        type: "room" as const,
        unitNumber: d.data().unitNumber || "",
        housekeepingStatus: d.data().housekeepingStatus || "نظيفة",
      })) as Unit[]

      // جلب الفلل
      const villasSnap = await getDocs(collection(db, "villas"))
      const villasData = villasSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        type: "villa" as const,
        unitNumber: d.data().unitNumber || "",
        housekeepingStatus: d.data().housekeepingStatus || "نظيفة",
      })) as Unit[]

      setUnits([...roomsData, ...villasData])

      // جلب المهام
      const tasksSnap = await getDocs(
        query(collection(db, "housekeepingTasks"), orderBy("createdAt", "desc"))
      )
      const tasksData = tasksSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        unitNumber: d.data().unitNumber || "",
        createdAt: d.data().createdAt?.toDate?.()?.toLocaleDateString("ar-SA") || "—",
        completedAt: d.data().completedAt?.toDate?.()?.toLocaleDateString("ar-SA"),
      })) as HousekeepingTask[]

      setTasks(tasksData)
    } catch (err) {
      console.error("❌ خطأ:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateUnitHousekeepingStatus = async (
    unit: Unit,
    newStatus: "نظيفة" | "متسخة" | "قيد التنظيف" | "تحت الفحص" | "تحت الصيانة"
  ) => {
    const collectionName = unit.type === "room" ? "rooms" : "villas"
    try {
      await updateDoc(doc(db, collectionName, unit.id), {
        housekeepingStatus: newStatus,
        lastCleaned: newStatus === "نظيفة" ? new Date().toISOString() : unit.lastCleaned,
      })
      fetchData()
    } catch (err) {
      console.error("❌ خطأ:", err)
    }
  }

  const createTask = async () => {
    if (!selectedUnit) return

    try {
      await addDoc(collection(db, "housekeepingTasks"), {
        unitId: selectedUnit.id,
        unitName: selectedUnit.name,
        unitNumber: selectedUnit.unitNumber || "",
        unitType: selectedUnit.type,
        taskType: taskForm.taskType,
        status: "معلق",
        priority: taskForm.priority,
        assignedTo: taskForm.assignedTo,
        notes: taskForm.notes,
        createdAt: serverTimestamp(),
      })

      // تحديث حالة الوحدة
      if (taskForm.taskType === "تنظيف" || taskForm.taskType === "تنظيف عميق") {
        await updateUnitHousekeepingStatus(selectedUnit, "قيد التنظيف")
      } else if (taskForm.taskType === "صيانة") {
        await updateUnitHousekeepingStatus(selectedUnit, "تحت الصيانة")
      } else if (taskForm.taskType === "فحص") {
        await updateUnitHousekeepingStatus(selectedUnit, "تحت الفحص")
      }

      setShowTaskModal(false)
      resetTaskForm()
      fetchData()
      alert("✅ تم إنشاء المهمة بنجاح")
    } catch (err) {
      console.error("❌ خطأ:", err)
    }
  }

  const updateTaskStatus = async (task: HousekeepingTask, newStatus: "قيد التنفيذ" | "مكتمل") => {
    try {
      const updateData: any = { status: newStatus }
      if (newStatus === "مكتمل") {
        updateData.completedAt = serverTimestamp()
      }

      await updateDoc(doc(db, "housekeepingTasks", task.id), updateData)

      // إذا اكتملت المهمة، تحديث حالة الوحدة
      if (newStatus === "مكتمل") {
        const unit = units.find((u) => u.id === task.unitId)
        if (unit) {
          await updateUnitHousekeepingStatus(unit, "نظيفة")
        }
      }

      fetchData()
    } catch (err) {
      console.error("❌ خطأ:", err)
    }
  }

  const markDirtyAfterCheckout = async (unit: Unit) => {
    await updateUnitHousekeepingStatus(unit, "متسخة")
    // إنشاء مهمة تنظيف تلقائياً
    await addDoc(collection(db, "housekeepingTasks"), {
      unitId: unit.id,
      unitName: unit.name,
      unitNumber: unit.unitNumber || "",
      unitType: unit.type,
      taskType: "تنظيف",
      status: "معلق",
      priority: "عاجل",
      notes: "مهمة تلقائية بعد مغادرة النزيل",
      createdAt: serverTimestamp(),
    })
    fetchData()
  }

  const resetTaskForm = () => {
    setSelectedUnit(null)
    setTaskForm({
      taskType: "تنظيف",
      priority: "عادي",
      assignedTo: "",
      notes: "",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نظيفة":
        return "bg-green-500"
      case "متسخة":
        return "bg-red-500"
      case "قيد التنظيف":
        return "bg-yellow-500"
      case "تحت الفحص":
        return "bg-blue-500"
      case "تحت الصيانة":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case "نظيفة":
        return "bg-green-100 border-green-300 text-green-700"
      case "متسخة":
        return "bg-red-100 border-red-300 text-red-700"
      case "قيد التنظيف":
        return "bg-yellow-100 border-yellow-300 text-yellow-700"
      case "تحت الفحص":
        return "bg-blue-100 border-blue-300 text-blue-700"
      case "تحت الصيانة":
        return "bg-orange-100 border-orange-300 text-orange-700"
      default:
        return "bg-gray-100 border-gray-300 text-gray-700"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "VIP":
        return "bg-purple-100 text-purple-700"
      case "عاجل":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredUnits = units.filter((u) => {
    if (filterStatus === "all") return true
    return u.housekeepingStatus === filterStatus
  })

  const pendingTasks = tasks.filter((t) => t.status !== "مكتمل")

  const stats = {
    clean: units.filter((u) => u.housekeepingStatus === "نظيفة").length,
    dirty: units.filter((u) => u.housekeepingStatus === "متسخة").length,
    cleaning: units.filter((u) => u.housekeepingStatus === "قيد التنظيف").length,
    maintenance: units.filter((u) => u.housekeepingStatus === "تحت الصيانة").length,
    pendingTasks: pendingTasks.length,
    urgentTasks: pendingTasks.filter((t) => t.priority === "عاجل" || t.priority === "VIP").length,
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل البيانات...</p>
      </div>
    )
  }

  return (
    <div className="text-right">
      {/* الهيدر */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#C6A76D] to-[#8B7355] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🧹</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2B2A28]">التدبير المنزلي</h1>
            <p className="text-[#7C7469] text-sm">إدارة نظافة وصيانة الوحدات</p>
          </div>
        </div>

        {/* التنبيهات العاجلة */}
        {stats.urgentTasks > 0 && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
            <span>⚠️</span>
            <span className="font-bold">{stats.urgentTasks} مهمة عاجلة</span>
          </div>
        )}
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
          <div className="w-10 h-10 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-white text-lg">✓</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.clean}</p>
          <p className="text-sm text-green-600">نظيفة</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
          <div className="w-10 h-10 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-white text-lg">✗</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.dirty}</p>
          <p className="text-sm text-red-600">متسخة</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-center">
          <div className="w-10 h-10 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-white text-lg">🧹</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.cleaning}</p>
          <p className="text-sm text-yellow-600">قيد التنظيف</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
          <div className="w-10 h-10 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-white text-lg">🔧</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
          <p className="text-sm text-orange-600">صيانة</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-white text-lg">📋</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.pendingTasks}</p>
          <p className="text-sm text-blue-600">مهام معلقة</p>
        </div>
        <div className="bg-gradient-to-br from-[#C6A76D]/10 to-[#8B7355]/10 rounded-xl border border-[#C6A76D]/30 p-4 text-center">
          <div className="w-10 h-10 bg-[#C6A76D] rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-white text-lg">📊</span>
          </div>
          <p className="text-2xl font-bold text-[#C6A76D]">{units.length}</p>
          <p className="text-sm text-[#8B7355]">إجمالي الوحدات</p>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: "overview", label: "نظرة عامة", icon: "🏨" },
          { id: "tasks", label: "المهام", icon: "📋" },
          { id: "maintenance", label: "الصيانة", icon: "🔧" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-gradient-to-l from-[#C6A76D] to-[#8B7355] text-white shadow-lg"
                : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:border-[#C6A76D]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id === "tasks" && pendingTasks.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingTasks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* المحتوى حسب التبويب */}
      {activeTab === "overview" && (
        <div>
          {/* فلتر الحالة */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {["all", "نظيفة", "متسخة", "قيد التنظيف", "تحت الفحص", "تحت الصيانة"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === s
                    ? getStatusColor(s === "all" ? "نظيفة" : s) + " text-white"
                    : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:border-[#C6A76D]"
                }`}
              >
                {s === "all" ? "الكل" : s}
              </button>
            ))}
          </div>

          {/* شبكة الوحدات */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paginateData(filteredUnits, currentPage, itemsPerPage).map((unit) => (
              <div
                key={unit.id}
                className={`relative rounded-2xl border-2 p-4 transition hover:shadow-lg cursor-pointer ${getStatusBg(
                  unit.housekeepingStatus
                )}`}
              >
                {/* شارة النوع */}
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-white/80 px-2 py-0.5 rounded-full">
                    {unit.type === "room" ? "غرفة" : "فيلا"}
                  </span>
                </div>

                {/* الحالة */}
                <div className={`w-4 h-4 rounded-full absolute top-2 right-2 ${getStatusColor(unit.housekeepingStatus)}`}></div>

                {/* الاسم ورقم الوحدة */}
                <div className="mt-4 text-center">
                  {unit.unitNumber && (
                    <p className="text-lg font-bold text-[#C6A76D] mb-1">{unit.unitNumber}</p>
                  )}
                  <p className="font-bold text-sm truncate">{unit.name}</p>
                  <p className="text-xs mt-1 opacity-75">{unit.housekeepingStatus}</p>
                </div>

                {/* الأزرار السريعة */}
                <div className="flex gap-1 mt-3 justify-center">
                  {unit.housekeepingStatus === "متسخة" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateUnitHousekeepingStatus(unit, "قيد التنظيف")
                      }}
                      className="p-1.5 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600"
                      title="بدء التنظيف"
                    >
                      🧹
                    </button>
                  )}
                  {unit.housekeepingStatus === "قيد التنظيف" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateUnitHousekeepingStatus(unit, "تحت الفحص")
                      }}
                      className="p-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600"
                      title="إرسال للفحص"
                    >
                      🔍
                    </button>
                  )}
                  {unit.housekeepingStatus === "تحت الفحص" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateUnitHousekeepingStatus(unit, "نظيفة")
                      }}
                      className="p-1.5 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600"
                      title="تأكيد النظافة"
                    >
                      ✓
                    </button>
                  )}
                  {unit.housekeepingStatus === "نظيفة" && unit.status === "مغادر" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        markDirtyAfterCheckout(unit)
                      }}
                      className="p-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
                      title="تعيين متسخة"
                    >
                      ✗
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedUnit(unit)
                      setShowTaskModal(true)
                    }}
                    className="p-1.5 bg-[#C6A76D] text-white rounded-lg text-xs hover:bg-[#8B7355]"
                    title="إنشاء مهمة"
                  >
                    ➕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredUnits.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="bg-white rounded-2xl border border-[#E8E1D6] overflow-hidden">
          {pendingTasks.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">✅</span>
              <p className="text-[#7C7469] text-lg">لا توجد مهام معلقة</p>
            </div>
          ) : (
            <>
            <div className="divide-y divide-[#E8E1D6]">
              {paginateData(pendingTasks, tasksPage, itemsPerPage).map((task) => (
                <div
                  key={task.id}
                  className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                        task.taskType === "تنظيف"
                          ? "bg-yellow-100"
                          : task.taskType === "صيانة"
                          ? "bg-orange-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {task.taskType === "تنظيف" || task.taskType === "تنظيف عميق"
                        ? "🧹"
                        : task.taskType === "صيانة"
                        ? "🔧"
                        : "🔍"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {task.unitNumber && (
                          <span className="px-2 py-0.5 bg-[#C6A76D] text-white rounded-lg text-sm font-bold">{task.unitNumber}</span>
                        )}
                        <p className="font-bold text-[#2B2A28]">{task.unitName}</p>
                      </div>
                      <p className="text-sm text-[#7C7469]">{task.taskType}</p>
                      {task.assignedTo && (
                        <p className="text-xs text-[#7C7469]">👤 {task.assignedTo}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        task.status === "معلق"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {task.status}
                    </span>

                    <div className="flex gap-2">
                      {task.status === "معلق" && (
                        <button
                          onClick={() => updateTaskStatus(task, "قيد التنفيذ")}
                          className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
                        >
                          ▶️ بدء
                        </button>
                      )}
                      {task.status === "قيد التنفيذ" && (
                        <button
                          onClick={() => updateTaskStatus(task, "مكتمل")}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                        >
                          ✅ إنهاء
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={tasksPage}
              totalItems={pendingTasks.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setTasksPage}
            />
            </>
          )}
        </div>
      )}

      {activeTab === "maintenance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* الوحدات تحت الصيانة */}
          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>🔧</span> تحت الصيانة
            </h3>
            {units.filter((u) => u.housekeepingStatus === "تحت الصيانة").length === 0 ? (
              <p className="text-center text-[#7C7469] py-8">لا توجد وحدات تحت الصيانة</p>
            ) : (
              <div className="space-y-3">
                {units
                  .filter((u) => u.housekeepingStatus === "تحت الصيانة")
                  .map((unit) => (
                    <div
                      key={unit.id}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-200"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          {unit.unitNumber && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white rounded-lg text-sm font-bold">{unit.unitNumber}</span>
                          )}
                          <p className="font-bold">{unit.name}</p>
                        </div>
                        <p className="text-sm text-orange-600">
                          {unit.type === "room" ? "غرفة" : "فيلا"}
                        </p>
                      </div>
                      <button
                        onClick={() => updateUnitHousekeepingStatus(unit, "نظيفة")}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                      >
                        ✅ انتهاء
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* إحصائيات الصيانة */}
          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>📊</span> إحصائيات الصيانة
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-[#FAF8F3] rounded-xl">
                <span>مهام الصيانة المعلقة</span>
                <span className="font-bold text-orange-600">
                  {tasks.filter((t) => t.taskType === "صيانة" && t.status !== "مكتمل").length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#FAF8F3] rounded-xl">
                <span>مهام الصيانة المكتملة</span>
                <span className="font-bold text-green-600">
                  {tasks.filter((t) => t.taskType === "صيانة" && t.status === "مكتمل").length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#FAF8F3] rounded-xl">
                <span>الوحدات خارج الخدمة</span>
                <span className="font-bold text-red-600">{stats.maintenance}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal إنشاء مهمة */}
      {showTaskModal && selectedUnit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-l from-[#2B2A28] to-[#3D3A36] text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold">إنشاء مهمة جديدة</h2>
              <div className="flex items-center gap-2 mt-1">
                {selectedUnit.unitNumber && (
                  <span className="px-2 py-0.5 bg-[#C6A76D] text-white rounded-lg text-sm font-bold">{selectedUnit.unitNumber}</span>
                )}
                <p className="text-[#C6A76D]">{selectedUnit.name}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2B2A28] mb-2">نوع المهمة</label>
                <select
                  value={taskForm.taskType}
                  onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value as any })}
                  className="w-full p-3 border-2 border-[#E8E1D6] rounded-xl focus:border-[#C6A76D]"
                >
                  <option value="تنظيف">تنظيف</option>
                  <option value="تنظيف عميق">تنظيف عميق</option>
                  <option value="صيانة">صيانة</option>
                  <option value="فحص">فحص</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2B2A28] mb-2">الأولوية</label>
                <div className="flex gap-2">
                  {["عادي", "عاجل", "VIP"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setTaskForm({ ...taskForm, priority: p as any })}
                      className={`flex-1 py-2 rounded-xl font-medium transition ${
                        taskForm.priority === p
                          ? p === "VIP"
                            ? "bg-purple-500 text-white"
                            : p === "عاجل"
                            ? "bg-red-500 text-white"
                            : "bg-[#C6A76D] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2B2A28] mb-2">تعيين إلى</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full p-3 border-2 border-[#E8E1D6] rounded-xl focus:border-[#C6A76D]"
                >
                  <option value="">-- اختياري --</option>
                  {housekeepingStaff.map((staff) => (
                    <option key={staff} value={staff}>
                      {staff}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2B2A28] mb-2">ملاحظات</label>
                <textarea
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                  className="w-full p-3 border-2 border-[#E8E1D6] rounded-xl focus:border-[#C6A76D]"
                  rows={3}
                  placeholder="أي ملاحظات إضافية..."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={createTask}
                  className="flex-1 bg-gradient-to-l from-[#C6A76D] to-[#8B7355] text-white py-3 rounded-xl font-bold hover:shadow-lg"
                >
                  ✅ إنشاء المهمة
                </button>
                <button
                  onClick={() => {
                    setShowTaskModal(false)
                    resetTaskForm()
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
