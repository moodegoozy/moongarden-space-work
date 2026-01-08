// src/pages/dashboard/VisionMissionPage.tsx
// صفحة إدارة الرؤية والرسالة وآخر الأخبار
import { useEffect, useState } from "react"
import { db, storage } from "@/firebase"
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc, orderBy, query } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

type VisionMission = {
  vision: string
  visionTitle: string
  visionImage: string
  mission: string
  missionTitle: string
  missionImage: string
}

type NewsItem = {
  id: string
  title: string
  content: string
  image: string
  date: string
  order: number
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
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingVision, setUploadingVision] = useState(false)
  const [uploadingMission, setUploadingMission] = useState(false)
  const [uploadingNews, setUploadingNews] = useState(false)
  const [activeTab, setActiveTab] = useState<"vision" | "news">("vision")
  
  // حالة إضافة خبر جديد
  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    image: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null)

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب الرؤية والرسالة
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
        
        // جلب الأخبار
        const newsSnap = await getDocs(query(collection(db, "news"), orderBy("order", "asc")))
        const newsData = newsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as NewsItem[]
        setNews(newsData)
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

  // رفع صورة للخبر
  const handleUploadNewsImage = async (file: File) => {
    setUploadingNews(true)
    try {
      const fileName = `news/news_${Date.now()}_${file.name}`
      const storageRef = ref(storage, fileName)
      await uploadBytes(storageRef, file)
      const imageUrl = await getDownloadURL(storageRef)
      setNewNews({ ...newNews, image: imageUrl })
    } catch (err) {
      console.error("خطأ في رفع الصورة:", err)
      alert("❌ حدث خطأ أثناء رفع الصورة")
    } finally {
      setUploadingNews(false)
    }
  }

  // إضافة خبر جديد
  const handleAddNews = async () => {
    if (!newNews.title || !newNews.content) {
      alert("❌ يرجى إدخال العنوان والمحتوى")
      return
    }
    setSaving(true)
    try {
      const newsItem = {
        ...newNews,
        order: news.length,
        createdAt: new Date().toISOString(),
      }
      const docRef = await addDoc(collection(db, "news"), newsItem)
      setNews([...news, { id: docRef.id, ...newsItem }])
      setNewNews({ title: "", content: "", image: "", date: new Date().toISOString().split("T")[0] })
      alert("✅ تم إضافة الخبر بنجاح")
    } catch (err) {
      console.error("خطأ في إضافة الخبر:", err)
      alert("❌ حدث خطأ أثناء الإضافة")
    } finally {
      setSaving(false)
    }
  }

  // حذف خبر
  const handleDeleteNews = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return
    try {
      await deleteDoc(doc(db, "news", id))
      setNews(news.filter(n => n.id !== id))
      alert("✅ تم حذف الخبر")
    } catch (err) {
      console.error("خطأ في الحذف:", err)
      alert("❌ حدث خطأ أثناء الحذف")
    }
  }

  // تحديث خبر
  const handleUpdateNews = async (id: string, updatedData: Partial<NewsItem>) => {
    try {
      await updateDoc(doc(db, "news", id), updatedData)
      setNews(news.map(n => n.id === id ? { ...n, ...updatedData } : n))
      setEditingNewsId(null)
      alert("✅ تم تحديث الخبر")
    } catch (err) {
      console.error("خطأ في التحديث:", err)
      alert("❌ حدث خطأ أثناء التحديث")
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
        🎯 إدارة الرؤية والرسالة وآخر الأخبار
      </h1>

      {/* التبويبات */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("vision")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "vision"
              ? "bg-[#2B2A28] text-white"
              : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:bg-[#F6F1E9]"
          }`}
        >
          الرؤية والرسالة
        </button>
        <button
          onClick={() => setActiveTab("news")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "news"
              ? "bg-[#2B2A28] text-white"
              : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:bg-[#F6F1E9]"
          }`}
        >
          آخر الأخبار ({news.length})
        </button>
      </div>

      {/* تبويب الرؤية والرسالة */}
      {activeTab === "vision" && (
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
      )}

      {/* تبويب آخر الأخبار */}
      {activeTab === "news" && (
        <div className="space-y-6">
          {/* نموذج إضافة خبر جديد */}
          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-[#C6A76D]">📰 إضافة خبر جديد</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">عنوان الخبر *</label>
                <input
                  type="text"
                  value={newNews.title}
                  onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                  className="w-full border border-[#E8E1D6] rounded-lg p-3 text-sm"
                  placeholder="عنوان الخبر"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7C7469] mb-1">التاريخ</label>
                <input
                  type="date"
                  value={newNews.date}
                  onChange={(e) => setNewNews({ ...newNews, date: e.target.value })}
                  className="w-full border border-[#E8E1D6] rounded-lg p-3 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-[#7C7469] mb-1">محتوى الخبر *</label>
                <textarea
                  value={newNews.content}
                  onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                  rows={3}
                  className="w-full border border-[#E8E1D6] rounded-lg p-3 text-sm"
                  placeholder="تفاصيل الخبر..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-[#7C7469] mb-1">صورة الخبر (اختياري)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadNewsImage(file)
                    }}
                    className="flex-1 border border-[#E8E1D6] rounded-lg p-2 text-sm bg-white"
                    disabled={uploadingNews}
                  />
                  {uploadingNews && <span className="text-xs text-[#7C7469]">جاري الرفع...</span>}
                </div>
                {newNews.image && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={newNews.image}
                      alt="صورة الخبر"
                      className="w-32 h-20 object-cover rounded-lg border border-[#E8E1D6]"
                    />
                    <button
                      onClick={() => setNewNews({ ...newNews, image: "" })}
                      className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                    >
                      حذف
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleAddNews}
              disabled={saving || uploadingNews}
              className="mt-4 bg-[#C6A76D] text-white py-2 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? "جاري الإضافة..." : "➕ إضافة الخبر"}
            </button>
          </div>

          {/* قائمة الأخبار */}
          <div className="bg-white rounded-2xl border border-[#E8E1D6] p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-[#2B2A28]">📋 الأخبار الحالية ({news.length})</h2>
            
            {news.length === 0 ? (
              <p className="text-center text-[#7C7469] py-8">لا توجد أخبار حالياً</p>
            ) : (
              <div className="space-y-4">
                {news.map((item, index) => (
                  <div key={item.id} className="border border-[#E8E1D6] rounded-xl p-4 bg-[#FAF8F3]">
                    {editingNewsId === item.id ? (
                      // وضع التعديل
                      <div className="space-y-3">
                        <input
                          type="text"
                          defaultValue={item.title}
                          id={`edit-title-${item.id}`}
                          className="w-full border border-[#E8E1D6] rounded-lg p-2 text-sm"
                          placeholder="عنوان الخبر"
                        />
                        <textarea
                          defaultValue={item.content}
                          id={`edit-content-${item.id}`}
                          rows={2}
                          className="w-full border border-[#E8E1D6] rounded-lg p-2 text-sm"
                          placeholder="محتوى الخبر"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const title = (document.getElementById(`edit-title-${item.id}`) as HTMLInputElement)?.value
                              const content = (document.getElementById(`edit-content-${item.id}`) as HTMLTextAreaElement)?.value
                              if (title && content) {
                                handleUpdateNews(item.id, { title, content })
                              }
                            }}
                            className="bg-green-600 text-white px-4 py-1 rounded text-sm"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingNewsId(null)}
                            className="bg-gray-400 text-white px-4 py-1 rounded text-sm"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      // وضع العرض
                      <div className="flex gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs text-[#7C7469]">#{index + 1}</span>
                              <h3 className="font-bold text-[#2B2A28]">{item.title}</h3>
                              <p className="text-xs text-[#C6A76D] mt-1">{item.date}</p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => setEditingNewsId(item.id)}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                              >
                                تعديل
                              </button>
                              <button
                                onClick={() => handleDeleteNews(item.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-[#5E5B53] mt-2 line-clamp-2">{item.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* معاينة */}
      {activeTab === "vision" && (
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
      )}
    </div>
  )
}
