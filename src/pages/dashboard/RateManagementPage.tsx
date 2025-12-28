// src/pages/dashboard/RateManagementPage.tsx
// إدارة الأسعار الموسمية - نظام PMS
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore"

type SeasonRate = {
  id: string
  name: string
  startDate: string
  endDate: string
  rateType: "percent" | "fixed"
  rateValue: number
  isIncrease: boolean
  appliesTo: "all" | "rooms" | "villas"
  status: "نشط" | "منتهي" | "قادم"
  priority: number
  notes?: string
}

type SpecialDay = {
  id: string
  name: string
  date: string
  rateType: "percent" | "fixed"
  rateValue: number
  isIncrease: boolean
  appliesTo: "all" | "rooms" | "villas"
}

type WeekendRate = {
  enabled: boolean
  days: string[]
  rateType: "percent" | "fixed"
  rateValue: number
  isIncrease: boolean
}

export default function RateManagementPage() {
  const [seasonRates, setSeasonRates] = useState<SeasonRate[]>([])
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([])
  const [weekendRate, setWeekendRate] = useState<WeekendRate>({
    enabled: false,
    days: ["الجمعة", "السبت"],
    rateType: "percent",
    rateValue: 20,
    isIncrease: true,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"seasons" | "weekends" | "special">("seasons")
  const [showModal, setShowModal] = useState(false)
  const [editingRate, setEditingRate] = useState<SeasonRate | null>(null)
  const [form, setForm] = useState<Partial<SeasonRate>>({
    name: "",
    startDate: "",
    endDate: "",
    rateType: "percent",
    rateValue: 20,
    isIncrease: true,
    appliesTo: "all",
    priority: 1,
    notes: "",
  })

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // جلب الأسعار الموسمية
      const ratesSnap = await getDocs(
        query(collection(db, "seasonRates"), orderBy("startDate", "asc"))
      )
      const rates = ratesSnap.docs.map((d) => {
        const data = d.data()
        let status: "نشط" | "منتهي" | "قادم" = "قادم"
        if (data.endDate < today) {
          status = "منتهي"
        } else if (data.startDate <= today && data.endDate >= today) {
          status = "نشط"
        }
        return {
          id: d.id,
          ...data,
          status,
        } as SeasonRate
      })
      setSeasonRates(rates)

      // جلب الأيام الخاصة
      const specialSnap = await getDocs(collection(db, "specialDays"))
      const special = specialSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as SpecialDay[]
      setSpecialDays(special)

      // جلب إعدادات نهاية الأسبوع
      const weekendDoc = await getDocs(collection(db, "settings"))
      const weekendSettings = weekendDoc.docs.find(d => d.id === "weekendRate")
      if (weekendSettings) {
        setWeekendRate(weekendSettings.data() as WeekendRate)
      }
    } catch (err) {
      console.error("❌ خطأ:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRate = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      alert("⚠️ يرجى تعبئة جميع الحقول المطلوبة")
      return
    }

    try {
      if (editingRate) {
        await updateDoc(doc(db, "seasonRates", editingRate.id), form)
      } else {
        await addDoc(collection(db, "seasonRates"), {
          ...form,
          createdAt: serverTimestamp(),
        })
      }
      setShowModal(false)
      setEditingRate(null)
      setForm({
        name: "",
        startDate: "",
        endDate: "",
        rateType: "percent",
        rateValue: 20,
        isIncrease: true,
        appliesTo: "all",
        priority: 1,
        notes: "",
      })
      fetchData()
    } catch (err) {
      console.error("❌ خطأ:", err)
      alert("حدث خطأ أثناء الحفظ")
    }
  }

  const handleDeleteRate = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السعر؟")) return
    try {
      await deleteDoc(doc(db, "seasonRates", id))
      fetchData()
    } catch (err) {
      console.error("❌ خطأ:", err)
    }
  }

  const saveWeekendRate = async () => {
    try {
      const docRef = doc(db, "settings", "weekendRate")
      await updateDoc(docRef, weekendRate).catch(async () => {
        await addDoc(collection(db, "settings"), { ...weekendRate, id: "weekendRate" })
      })
      alert("✅ تم حفظ إعدادات نهاية الأسبوع")
    } catch (err) {
      console.error("❌ خطأ:", err)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C6A76D] border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-[#7C7469]">جاري التحميل...</p>
      </div>
    )
  }

  const activeSeasons = seasonRates.filter((r) => r.status === "نشط")
  const upcomingSeasons = seasonRates.filter((r) => r.status === "قادم")

  return (
    <div className="p-4 md:p-6 text-right">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2B2A28]">💰 إدارة الأسعار</h1>
      </div>

      {/* ملخص الأسعار النشطة */}
      {activeSeasons.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-green-800 mb-2">🎯 الأسعار النشطة حالياً:</h3>
          <div className="flex flex-wrap gap-2">
            {activeSeasons.map((rate) => (
              <span
                key={rate.id}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
              >
                {rate.name}: {rate.isIncrease ? "+" : "-"}
                {rate.rateValue}
                {rate.rateType === "percent" ? "%" : " ريال"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* التبويبات */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "seasons", label: "📅 المواسم", count: seasonRates.length },
          { key: "weekends", label: "🗓️ نهاية الأسبوع", count: null },
          { key: "special", label: "⭐ الأيام الخاصة", count: specialDays.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              activeTab === tab.key
                ? "bg-[#2B2A28] text-white"
                : "bg-[#E8E1D6] text-[#2B2A28] hover:bg-[#d4cdc2]"
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="mr-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* تبويب المواسم */}
      {activeTab === "seasons" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">📅 الأسعار الموسمية</h2>
            <button
              onClick={() => {
                setEditingRate(null)
                setForm({
                  name: "",
                  startDate: "",
                  endDate: "",
                  rateType: "percent",
                  rateValue: 20,
                  isIncrease: true,
                  appliesTo: "all",
                  priority: 1,
                  notes: "",
                })
                setShowModal(true)
              }}
              className="bg-[#C6A76D] text-white px-4 py-2 rounded-xl hover:bg-[#b5965c] transition"
            >
              ➕ إضافة موسم
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E1D6] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#FAF8F3]">
                <tr>
                  <th className="p-3 text-right">الموسم</th>
                  <th className="p-3 text-right">الفترة</th>
                  <th className="p-3 text-right">التعديل</th>
                  <th className="p-3 text-right">يطبق على</th>
                  <th className="p-3 text-right">الحالة</th>
                  <th className="p-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {seasonRates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#7C7469]">
                      لا توجد مواسم مضافة
                    </td>
                  </tr>
                ) : (
                  seasonRates.map((rate) => (
                    <tr key={rate.id} className="border-t border-[#E8E1D6] hover:bg-[#FAF8F3]">
                      <td className="p-3 font-bold">{rate.name}</td>
                      <td className="p-3 text-sm text-[#7C7469]">
                        {rate.startDate} → {rate.endDate}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-bold ${
                            rate.isIncrease
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {rate.isIncrease ? "+" : "-"}
                          {rate.rateValue}
                          {rate.rateType === "percent" ? "%" : " ريال"}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        {rate.appliesTo === "all"
                          ? "الكل"
                          : rate.appliesTo === "rooms"
                          ? "الغرف"
                          : "الفلل"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            rate.status === "نشط"
                              ? "bg-green-100 text-green-700"
                              : rate.status === "قادم"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {rate.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingRate(rate)
                              setForm(rate)
                              setShowModal(true)
                            }}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDeleteRate(rate.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* أمثلة المواسم */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-blue-800 mb-2">💡 أمثلة على المواسم:</h3>
            <div className="grid md:grid-cols-3 gap-2 text-sm text-blue-700">
              <div className="bg-white rounded-lg p-2">
                <p className="font-bold">🌸 موسم الربيع</p>
                <p>مارس - مايو: +15%</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="font-bold">☀️ موسم الصيف</p>
                <p>يونيو - أغسطس: +25%</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="font-bold">🎄 موسم الشتاء</p>
                <p>ديسمبر - فبراير: -10%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تبويب نهاية الأسبوع */}
      {activeTab === "weekends" && (
        <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
          <h2 className="text-xl font-bold mb-4">🗓️ أسعار نهاية الأسبوع</h2>

          <div className="flex items-center gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={weekendRate.enabled}
                onChange={(e) =>
                  setWeekendRate({ ...weekendRate, enabled: e.target.checked })
                }
                className="w-5 h-5 rounded accent-[#C6A76D]"
              />
              <span className="font-bold">تفعيل أسعار نهاية الأسبوع</span>
            </label>
          </div>

          {weekendRate.enabled && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-[#7C7469] mb-2">أيام نهاية الأسبوع:</label>
                <div className="flex flex-wrap gap-2">
                  {["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map(
                    (day) => (
                      <button
                        key={day}
                        onClick={() => {
                          const days = weekendRate.days.includes(day)
                            ? weekendRate.days.filter((d) => d !== day)
                            : [...weekendRate.days, day]
                          setWeekendRate({ ...weekendRate, days })
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                          weekendRate.days.includes(day)
                            ? "bg-[#C6A76D] text-white"
                            : "bg-[#E8E1D6] text-[#2B2A28]"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#7C7469] mb-1">نوع التعديل:</label>
                  <select
                    value={`${weekendRate.isIncrease ? "+" : "-"}${weekendRate.rateType}`}
                    onChange={(e) => {
                      const val = e.target.value
                      setWeekendRate({
                        ...weekendRate,
                        isIncrease: val.startsWith("+"),
                        rateType: val.includes("percent") ? "percent" : "fixed",
                      })
                    }}
                    className="w-full p-3 border border-[#E8E1D6] rounded-xl"
                  >
                    <option value="+percent">زيادة نسبة %</option>
                    <option value="+fixed">زيادة مبلغ ثابت</option>
                    <option value="-percent">خصم نسبة %</option>
                    <option value="-fixed">خصم مبلغ ثابت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#7C7469] mb-1">القيمة:</label>
                  <input
                    type="number"
                    value={weekendRate.rateValue}
                    onChange={(e) =>
                      setWeekendRate({ ...weekendRate, rateValue: Number(e.target.value) })
                    }
                    className="w-full p-3 border border-[#E8E1D6] rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={saveWeekendRate}
            className="mt-6 bg-[#C6A76D] text-white px-6 py-2.5 rounded-xl hover:bg-[#b5965c] transition"
          >
            💾 حفظ الإعدادات
          </button>
        </div>
      )}

      {/* تبويب الأيام الخاصة */}
      {activeTab === "special" && (
        <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
          <h2 className="text-xl font-bold mb-4">⭐ الأيام الخاصة والعطلات</h2>
          <p className="text-[#7C7469] mb-4">
            أضف أسعاراً خاصة للعطلات والمناسبات (عيد الفطر، عيد الأضحى، اليوم الوطني، إلخ)
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "عيد الفطر", icon: "🌙" },
              { name: "عيد الأضحى", icon: "🐑" },
              { name: "اليوم الوطني", icon: "🇸🇦" },
              { name: "يوم التأسيس", icon: "🏛️" },
              { name: "رأس السنة", icon: "🎉" },
              { name: "إجازة الربيع", icon: "🌸" },
            ].map((holiday) => (
              <div
                key={holiday.name}
                className="bg-[#FAF8F3] border border-[#E8E1D6] rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{holiday.icon}</span>
                  <span className="font-bold">{holiday.name}</span>
                </div>
                <p className="text-sm text-[#7C7469]">
                  اضغط لإضافة سعر خاص لهذه المناسبة
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* نافذة إضافة/تعديل موسم */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingRate ? "✏️ تعديل الموسم" : "➕ إضافة موسم جديد"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">اسم الموسم</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl"
                  placeholder="مثال: موسم الصيف"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#7C7469] mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full p-3 border border-[#E8E1D6] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#7C7469] mb-1">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full p-3 border border-[#E8E1D6] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#7C7469] mb-1">نوع التعديل</label>
                  <select
                    value={`${form.isIncrease ? "+" : "-"}${form.rateType}`}
                    onChange={(e) => {
                      const val = e.target.value
                      setForm({
                        ...form,
                        isIncrease: val.startsWith("+"),
                        rateType: val.includes("percent") ? "percent" : "fixed",
                      })
                    }}
                    className="w-full p-3 border border-[#E8E1D6] rounded-xl"
                  >
                    <option value="+percent">زيادة نسبة %</option>
                    <option value="+fixed">زيادة مبلغ ثابت</option>
                    <option value="-percent">خصم نسبة %</option>
                    <option value="-fixed">خصم مبلغ ثابت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#7C7469] mb-1">القيمة</label>
                  <input
                    type="number"
                    value={form.rateValue}
                    onChange={(e) => setForm({ ...form, rateValue: Number(e.target.value) })}
                    className="w-full p-3 border border-[#E8E1D6] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#7C7469] mb-1">يطبق على</label>
                <select
                  value={form.appliesTo}
                  onChange={(e) => setForm({ ...form, appliesTo: e.target.value as any })}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl"
                >
                  <option value="all">جميع الوحدات</option>
                  <option value="rooms">الغرف فقط</option>
                  <option value="villas">الفلل فقط</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#7C7469] mb-1">ملاحظات (اختياري)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveRate}
                className="flex-1 bg-[#C6A76D] text-white py-3 rounded-xl hover:bg-[#b5965c] transition font-bold"
              >
                💾 حفظ
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingRate(null)
                }}
                className="flex-1 bg-[#E8E1D6] text-[#2B2A28] py-3 rounded-xl hover:bg-[#d4cdc2] transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
