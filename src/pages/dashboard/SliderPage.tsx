// src/pages/dashboard/SliderPage.tsx
// صفحة إدارة سلايدر الصفحة الرئيسية
import { useEffect, useState } from "react"
import { db, storage } from "@/firebase"
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

type SliderItem = {
  id: string
  image: string
  title?: string
  subtitle?: string
  order: number
}

export default function SliderPage() {
  const [slides, setSlides] = useState<SliderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // حقول إضافة شريحة جديدة
  const [newTitle, setNewTitle] = useState("")
  const [newSubtitle, setNewSubtitle] = useState("")
  const [newFile, setNewFile] = useState<File | null>(null)

  // جلب الشرائح
  const fetchSlides = async () => {
    try {
      const snap = await getDocs(
        query(collection(db, "slider"), orderBy("order", "asc"))
      )
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as SliderItem[]
      setSlides(data)
    } catch (err) {
      console.error("خطأ في جلب الشرائح:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  // رفع صورة جديدة
  const handleUpload = async () => {
    if (!newFile) {
      alert("الرجاء اختيار صورة")
      return
    }

    setUploading(true)
    try {
      // رفع الصورة إلى Firebase Storage
      const fileName = `slider/${Date.now()}_${newFile.name}`
      const storageRef = ref(storage, fileName)
      await uploadBytes(storageRef, newFile)
      const imageUrl = await getDownloadURL(storageRef)

      // إضافة إلى Firestore
      await addDoc(collection(db, "slider"), {
        image: imageUrl,
        title: newTitle.trim() || "",
        subtitle: newSubtitle.trim() || "",
        order: slides.length + 1,
        createdAt: new Date(),
      })

      // تحديث القائمة
      await fetchSlides()
      setNewTitle("")
      setNewSubtitle("")
      setNewFile(null)
      alert("✅ تم إضافة الشريحة بنجاح")
    } catch (err) {
      console.error("خطأ في رفع الصورة:", err)
      alert("❌ حدث خطأ أثناء رفع الصورة")
    } finally {
      setUploading(false)
    }
  }

  // حذف شريحة
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الشريحة؟")) return
    try {
      await deleteDoc(doc(db, "slider", id))
      await fetchSlides()
    } catch (err) {
      console.error("خطأ في الحذف:", err)
    }
  }

  // تغيير الترتيب
  const handleOrderChange = async (id: string, newOrder: number) => {
    try {
      await updateDoc(doc(db, "slider", id), { order: newOrder })
      await fetchSlides()
    } catch (err) {
      console.error("خطأ في تحديث الترتيب:", err)
    }
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-[#2B2A28]">
        🖼️ إدارة سلايدر الصفحة الرئيسية
      </h1>

      {/* نموذج إضافة شريحة جديدة */}
      <div className="bg-white rounded-2xl border border-[#E8E1D6] p-4 sm:p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-[#2B2A28]">➕ إضافة شريحة جديدة</h2>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm text-[#7C7469] mb-1">الصورة *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewFile(e.target.files?.[0] || null)}
              className="w-full border border-[#E8E1D6] rounded-lg p-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-sm text-[#7C7469] mb-1">العنوان (اختياري)</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="عنوان الشريحة"
              className="w-full border border-[#E8E1D6] rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-[#7C7469] mb-1">العنوان الفرعي (اختياري)</label>
            <input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="وصف قصير"
              className="w-full border border-[#E8E1D6] rounded-lg p-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleUpload}
              disabled={uploading || !newFile}
              className="w-full bg-[#2B2A28] text-white py-2 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50 text-sm"
            >
              {uploading ? "جاري الرفع..." : "إضافة الشريحة"}
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الشرائح */}
      <div className="bg-white rounded-2xl border border-[#E8E1D6] p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-[#2B2A28]">
          📋 الشرائح الحالية ({slides.length})
        </h2>

        {loading ? (
          <p className="text-center text-[#7C7469] py-8">جاري التحميل...</p>
        ) : slides.length === 0 ? (
          <p className="text-center text-[#7C7469] py-8">لا توجد شرائح حالياً</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="border border-[#E8E1D6] rounded-xl overflow-hidden bg-[#FAF8F3]"
              >
                <img
                  src={slide.image}
                  alt={slide.title || "شريحة"}
                  className="w-full h-32 sm:h-40 object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
                />
                <div className="p-3">
                  {slide.title && (
                    <h3 className="font-bold text-sm text-[#2B2A28] mb-1">{slide.title}</h3>
                  )}
                  {slide.subtitle && (
                    <p className="text-xs text-[#7C7469] mb-2">{slide.subtitle}</p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <label className="text-xs text-[#7C7469]">الترتيب:</label>
                      <input
                        type="number"
                        min={1}
                        value={slide.order}
                        onChange={(e) => handleOrderChange(slide.id, Number(e.target.value))}
                        className="w-14 border border-[#E8E1D6] rounded px-2 py-1 text-xs text-center"
                      />
                    </div>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-bold"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
