// src/pages/dashboard/VisionMissionPage.tsx
// صفحة إدارة الرؤية والرسالة مع صور الخلفية
import { useEffect, useState } from "react"
import { db, storage } from "@/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

type VisionMission = {
  vision: string
  visionTitle: string
  visionImage: string
  mission: string
  missionTitle: string
  missionImage: string
}

export default function VisionMissionPage() {
  const [data, setData] = useState<VisionMission>({
    vision: "",
    visionTitle: "رؤيتنا",
    visionImage: "",
    mission: "",
    missionTitle: "رسالتنا",
    missionImage: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingVision, setUploadingVision] = useState(false)
  const [uploadingMission, setUploadingMission] = useState(false)

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "settings", "vision_mission")
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          const existingData = snap.data() as VisionMission
          setData({
            vision: existingData.vision || "",
            visionTitle: existingData.visionTitle || "رؤيتنا",
            visionImage: existingData.visionImage || "",
            mission: existingData.mission || "",
            missionTitle: existingData.missionTitle || "رسالتنا",
            missionImage: existingData.missionImage || "",
          })
        }
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // رفع صورة الرؤية
  const handleUploadVisionImage = async (file: File) => {
    setUploadingVision(true)
    try {
      const fileName = `vision-mission/vision_${Date.now()}_${file.name}`
      const storageRef = ref(storage, fileName)
      await uploadBytes(storageRef, file)
      const imageUrl = await getDownloadURL(storageRef)
      setData({ ...data, visionImage: imageUrl })
    } catch (err) {
      console.error("خطأ في رفع الصورة:", err)
      alert("❌ حدث خطأ أثناء رفع الصورة")
    } finally {
      setUploadingVision(false)
    }
  }

  // رفع صورة الرسالة
  const handleUploadMissionImage = async (file: File) => {
    setUploadingMission(true)
    try {
      const fileName = `vision-mission/mission_${Date.now()}_${file.name}`
      const storageRef = ref(storage, fileName)
      await uploadBytes(storageRef, file)
      const imageUrl = await getDownloadURL(storageRef)
      setData({ ...data, missionImage: imageUrl })
    } catch (err) {
      console.error("خطأ في رفع الصورة:", err)
      alert("❌ حدث خطأ أثناء رفع الصورة")
    } finally {
      setUploadingMission(false)
    }
  }

  // حفظ البيانات
  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "vision_mission"), data)
      alert("✅ تم حفظ التغييرات بنجاح")
    } catch (err) {
      console.error("خطأ في الحفظ:", err)
      alert("❌ حدث خطأ أثناء الحفظ")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-[#7C7469]">
        جاري التحميل...
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-[#2B2A28]">
        🎯 إدارة الرؤية والرسالة
      </h1>

      <div className="bg-white rounded-2xl border border-[#E8E1D6] p-4 sm:p-6 shadow-sm space-y-6">
        {/* الرؤية */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-[#C6A76D]">👁️ الرؤية</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-[#7C7469] mb-1">عنوان الرؤية</label>
              <input
                type="text"
                value={data.visionTitle}
                onChange={(e) => setData({ ...data, visionTitle: e.target.value })}
                className="w-full border border-[#E8E1D6] rounded-lg p-3 text-sm"
                placeholder="رؤيتنا"
              />
            </div>
            <div>
              <label className="block text-sm text-[#7C7469] mb-1">صورة الخلفية</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadVisionImage(file)
                  }}
                  className="flex-1 border border-[#E8E1D6] rounded-lg p-2 text-sm bg-white"
                  disabled={uploadingVision}
                />
                {uploadingVision && <span className="text-xs text-[#7C7469]">جاري الرفع...</span>}
              </div>
              {data.visionImage && (
                <div className="mt-2 relative">
                  <img
                    src={data.visionImage}
                    alt="صورة الرؤية"
                    className="w-full h-20 object-cover rounded-lg border border-[#E8E1D6]"
                  />
                  <button
                    onClick={() => setData({ ...data, visionImage: "" })}
                    className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                  >
                    حذف
                  </button>
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-[#7C7469] mb-1">نص الرؤية</label>
              <textarea
                value={data.vision}
                onChange={(e) => setData({ ...data, vision: e.target.value })}
                rows={3}
                className="w-full border border-[#E8E1D6] rounded-lg p-3 text-sm"
                placeholder="أدخل نص الرؤية هنا..."
              />
            </div>
          </div>
        </div>

        {/* الرسالة */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-[#C6A76D]">📝 الرسالة</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-[#7C7469] mb-1">عنوان الرسالة</label>
              <input
                type="text"
                value={data.missionTitle}
                onChange={(e) => setData({ ...data, missionTitle: e.target.value })}
                className="w-full border border-[#E8E1D6] rounded-lg p-3 text-sm"
                placeholder="رسالتنا"
              />
            </div>
            <div>
              <label className="block text-sm text-[#7C7469] mb-1">صورة الخلفية</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadMissionImage(file)
                  }}
                  className="flex-1 border border-[#E8E1D6] rounded-lg p-2 text-sm bg-white"
                  disabled={uploadingMission}
                />
                {uploadingMission && <span className="text-xs text-[#7C7469]">جاري الرفع...</span>}
              </div>
              {data.missionImage && (
                <div className="mt-2 relative">
                  <img
                    src={data.missionImage}
                    alt="صورة الرسالة"
                    className="w-full h-20 object-cover rounded-lg border border-[#E8E1D6]"
                  />
                  <button
                    onClick={() => setData({ ...data, missionImage: "" })}
                    className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                  >
                    حذف
                  </button>
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-[#7C7469] mb-1">نص الرسالة</label>
              <textarea
                value={data.mission}
                onChange={(e) => setData({ ...data, mission: e.target.value })}
                rows={3}
                className="w-full border border-[#E8E1D6] rounded-lg p-3 text-sm"
                placeholder="أدخل نص الرسالة هنا..."
              />
            </div>
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="pt-4 border-t border-[#E8E1D6]">
          <button
            onClick={handleSave}
            disabled={saving || uploadingVision || uploadingMission}
            className="w-full sm:w-auto bg-[#2B2A28] text-white py-3 px-8 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "💾 حفظ التغييرات"}
          </button>
        </div>
      </div>

      {/* معاينة */}
      <div className="mt-6 bg-[#FAF8F3] rounded-2xl border border-[#E8E1D6] p-4 sm:p-6">
        <h2 className="text-lg font-bold mb-4 text-[#2B2A28]">👀 معاينة</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* معاينة الرؤية */}
          <div 
            className="rounded-xl p-4 border border-[#E8E1D6] relative overflow-hidden min-h-[150px]"
            style={{
              backgroundImage: data.visionImage ? `url(${data.visionImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {data.visionImage && <div className="absolute inset-0 bg-black/50" />}
            <div className={`relative z-10 ${data.visionImage ? 'text-white' : 'text-[#2B2A28]'}`}>
              <h3 className={`text-lg font-bold mb-2 ${data.visionImage ? 'text-[#E2C891]' : 'text-[#C6A76D]'}`}>
                {data.visionTitle || "رؤيتنا"}
              </h3>
              <p className={`text-sm leading-relaxed ${data.visionImage ? 'text-white/90' : 'text-[#5E5B53]'}`}>
                {data.vision || "لم يتم إضافة نص الرؤية بعد"}
              </p>
            </div>
          </div>

          {/* معاينة الرسالة */}
          <div 
            className="rounded-xl p-4 border border-[#E8E1D6] relative overflow-hidden min-h-[150px]"
            style={{
              backgroundImage: data.missionImage ? `url(${data.missionImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {data.missionImage && <div className="absolute inset-0 bg-black/50" />}
            <div className={`relative z-10 ${data.missionImage ? 'text-white' : 'text-[#2B2A28]'}`}>
              <h3 className={`text-lg font-bold mb-2 ${data.missionImage ? 'text-[#E2C891]' : 'text-[#C6A76D]'}`}>
                {data.missionTitle || "رسالتنا"}
              </h3>
              <p className={`text-sm leading-relaxed ${data.missionImage ? 'text-white/90' : 'text-[#5E5B53]'}`}>
                {data.mission || "لم يتم إضافة نص الرسالة بعد"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
