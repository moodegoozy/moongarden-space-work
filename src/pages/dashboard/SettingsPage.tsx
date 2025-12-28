// src/pages/dashboard/SettingsPage.tsx
// إعدادات الفندق - نظام PMS
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"

type HotelSettings = {
  // معلومات الفندق
  hotelName: string
  hotelNameEn: string
  logo: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  website: string
  
  // المعلومات الضريبية
  taxNumber: string
  commercialRegister: string
  taxRate: number
  
  // أوقات الدخول والخروج
  defaultCheckInTime: string
  defaultCheckOutTime: string
  earlyCheckInFee: number
  lateCheckOutFee: number
  
  // الإعدادات المالية
  currency: string
  depositPercentage: number
  cancellationHours: number
  
  // إعدادات عامة
  maxGuestsPerRoom: number
  childrenAgeLimit: number
  
  // معلومات إضافية
  description: string
  policies: string
  
  // أرقام الطوارئ
  emergencyPhone: string
  policePhone: string
  ambulancePhone: string
  firePhone: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<HotelSettings>({
    hotelName: "Moon Garden",
    hotelNameEn: "Moon Garden Hotel & Residence",
    logo: "/logo.png",
    address: "",
    city: "أبها",
    country: "المملكة العربية السعودية",
    phone: "",
    email: "",
    website: "",
    taxNumber: "",
    commercialRegister: "",
    taxRate: 15,
    defaultCheckInTime: "14:00",
    defaultCheckOutTime: "12:00",
    earlyCheckInFee: 100,
    lateCheckOutFee: 100,
    currency: "SAR",
    depositPercentage: 25,
    cancellationHours: 24,
    maxGuestsPerRoom: 4,
    childrenAgeLimit: 12,
    description: "",
    policies: "",
    emergencyPhone: "911",
    policePhone: "999",
    ambulancePhone: "997",
    firePhone: "998",
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"general" | "financial" | "policies" | "emergency">("general")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const docRef = doc(db, "settings", "hotel")
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setSettings({ ...settings, ...docSnap.data() } as HotelSettings)
      }
    } catch (err) {
      console.error("❌ خطأ في تحميل الإعدادات:", err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const docRef = doc(db, "settings", "hotel")
      await setDoc(docRef, settings, { merge: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error("❌ خطأ في حفظ الإعدادات:", err)
      alert("حدث خطأ أثناء حفظ الإعدادات")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof HotelSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C6A76D] border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-[#7C7469]">جاري تحميل الإعدادات...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 text-right">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2B2A28]">⚙️ إعدادات الفندق</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`px-6 py-2.5 rounded-xl text-white font-bold transition ${
            saved 
              ? "bg-green-600" 
              : saving 
              ? "bg-gray-400" 
              : "bg-[#C6A76D] hover:bg-[#b5965c]"
          }`}
        >
          {saved ? "✅ تم الحفظ" : saving ? "⏳ جاري الحفظ..." : "💾 حفظ الإعدادات"}
        </button>
      </div>

      {/* التبويبات */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#E8E1D6] pb-4">
        {[
          { key: "general", label: "🏨 عام", icon: "🏨" },
          { key: "financial", label: "💰 مالي", icon: "💰" },
          { key: "policies", label: "📋 السياسات", icon: "📋" },
          { key: "emergency", label: "🚨 الطوارئ", icon: "🚨" },
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
          </button>
        ))}
      </div>

      {/* تبويب المعلومات العامة */}
      {activeTab === "general" && (
        <div className="grid gap-6">
          {/* معلومات الفندق */}
          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
            <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
              🏨 معلومات الفندق
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">اسم الفندق (عربي)</label>
                <input
                  type="text"
                  value={settings.hotelName}
                  onChange={(e) => handleChange("hotelName", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">اسم الفندق (إنجليزي)</label>
                <input
                  type="text"
                  value={settings.hotelNameEn}
                  onChange={(e) => handleChange("hotelNameEn", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[#7C7469] mb-1">العنوان</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                  placeholder="الشارع، الحي، الرمز البريدي"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">المدينة</label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">الدولة</label>
                <input
                  type="text"
                  value={settings.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                  placeholder="+966..."
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[#7C7469] mb-1">الموقع الإلكتروني</label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* أوقات الدخول والخروج */}
          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
            <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
              🕐 أوقات الدخول والخروج
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">وقت الدخول الافتراضي</label>
                <input
                  type="time"
                  value={settings.defaultCheckInTime}
                  onChange={(e) => handleChange("defaultCheckInTime", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">وقت الخروج الافتراضي</label>
                <input
                  type="time"
                  value={settings.defaultCheckOutTime}
                  onChange={(e) => handleChange("defaultCheckOutTime", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">رسوم الدخول المبكر (ريال)</label>
                <input
                  type="number"
                  value={settings.earlyCheckInFee}
                  onChange={(e) => handleChange("earlyCheckInFee", Number(e.target.value))}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">رسوم الخروج المتأخر (ريال)</label>
                <input
                  type="number"
                  value={settings.lateCheckOutFee}
                  onChange={(e) => handleChange("lateCheckOutFee", Number(e.target.value))}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* إعدادات الضيوف */}
          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
            <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
              👥 إعدادات الضيوف
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">الحد الأقصى للضيوف لكل غرفة</label>
                <input
                  type="number"
                  value={settings.maxGuestsPerRoom}
                  onChange={(e) => handleChange("maxGuestsPerRoom", Number(e.target.value))}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">عمر الطفل (أقل من)</label>
                <input
                  type="number"
                  value={settings.childrenAgeLimit}
                  onChange={(e) => handleChange("childrenAgeLimit", Number(e.target.value))}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تبويب الإعدادات المالية */}
      {activeTab === "financial" && (
        <div className="grid gap-6">
          {/* المعلومات الضريبية */}
          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
            <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
              🧾 المعلومات الضريبية
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">الرقم الضريبي</label>
                <input
                  type="text"
                  value={settings.taxNumber}
                  onChange={(e) => handleChange("taxNumber", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                  placeholder="3xxxxxxxxxx00003"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">السجل التجاري</label>
                <input
                  type="text"
                  value={settings.commercialRegister}
                  onChange={(e) => handleChange("commercialRegister", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">نسبة الضريبة (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleChange("taxRate", Number(e.target.value))}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">العملة</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                >
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                </select>
              </div>
            </div>
          </div>

          {/* الإعدادات المالية */}
          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
            <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
              💳 إعدادات الحجز والدفع
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">نسبة العربون (%)</label>
                <input
                  type="number"
                  value={settings.depositPercentage}
                  onChange={(e) => handleChange("depositPercentage", Number(e.target.value))}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">ساعات الإلغاء المجاني</label>
                <input
                  type="number"
                  value={settings.cancellationHours}
                  onChange={(e) => handleChange("cancellationHours", Number(e.target.value))}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none"
                />
                <p className="text-xs text-[#7C7469] mt-1">
                  عدد الساعات قبل تاريخ الوصول للإلغاء بدون رسوم
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تبويب السياسات */}
      {activeTab === "policies" && (
        <div className="grid gap-6">
          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
            <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
              📋 وصف الفندق
            </h2>
            <textarea
              value={settings.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none resize-none"
              placeholder="وصف مختصر عن الفندق والخدمات المقدمة..."
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
            <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
              📜 سياسات الفندق
            </h2>
            <textarea
              value={settings.policies}
              onChange={(e) => handleChange("policies", e.target.value)}
              rows={8}
              className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none resize-none"
              placeholder="سياسة الإلغاء، الحيوانات الأليفة، التدخين، إلخ..."
            />
          </div>
        </div>
      )}

      {/* تبويب الطوارئ */}
      {activeTab === "emergency" && (
        <div className="grid gap-6">
          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-6">
            <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
              🚨 أرقام الطوارئ
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">رقم الطوارئ العام</label>
                <input
                  type="tel"
                  value={settings.emergencyPhone}
                  onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none text-2xl font-bold text-red-600"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">رقم الشرطة</label>
                <input
                  type="tel"
                  value={settings.policePhone}
                  onChange={(e) => handleChange("policePhone", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none text-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">رقم الإسعاف</label>
                <input
                  type="tel"
                  value={settings.ambulancePhone}
                  onChange={(e) => handleChange("ambulancePhone", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none text-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">رقم الدفاع المدني</label>
                <input
                  type="tel"
                  value={settings.firePhone}
                  onChange={(e) => handleChange("firePhone", e.target.value)}
                  className="w-full p-3 border border-[#E8E1D6] rounded-xl focus:ring-2 focus:ring-[#C6A76D] focus:outline-none text-xl font-bold"
                />
              </div>
            </div>

            {/* معلومات الطوارئ */}
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-bold text-red-800 mb-2">⚠️ أرقام الطوارئ في المملكة العربية السعودية</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-red-600 font-bold text-lg">911</p>
                  <p className="text-[#7C7469]">الطوارئ</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-blue-600 font-bold text-lg">999</p>
                  <p className="text-[#7C7469]">الشرطة</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-green-600 font-bold text-lg">997</p>
                  <p className="text-[#7C7469]">الإسعاف</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-orange-600 font-bold text-lg">998</p>
                  <p className="text-[#7C7469]">الدفاع المدني</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
