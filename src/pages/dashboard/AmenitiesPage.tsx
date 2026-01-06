// src/pages/dashboard/AmenitiesPage.tsx
// صفحة إدارة المرافق والخدمات
import { useEffect, useState } from "react"
import { db, storage } from "@/firebase"
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import Pagination, { paginateData } from "@/components/Pagination"

type Amenity = {
  id: string
  title: string
  image: string
  order?: number
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // بيانات افتراضية للمرافق
  const defaultAmenities = [
    { title: "المسبح الخارجي", image: "/1.png", order: 1 },
    { title: "المطعم الفاخر", image: "/2.png", order: 2 },
    { title: "مركز اللياقة", image: "/3.png", order: 3 },
    { title: "قاعات الاجتماعات", image: "/4.png", order: 4 },
    { title: "الحديقة والجلسات الخارجية", image: "/5.png", order: 5 },
    { title: "الاستقبال", image: "/6.png", order: 6 },
    { title: "الكافيه", image: "/7.png", order: 7 },
    { title: "الممرات والإطلالات", image: "/8.png", order: 8 },
  ]

  useEffect(() => {
    fetchAmenities()
  }, [])

  const fetchAmenities = async () => {
    try {
      const snap = await getDocs(collection(db, "amenities"))
      if (snap.empty) {
        // إذا لم تكن هناك بيانات، أضف البيانات الافتراضية
        for (const amenity of defaultAmenities) {
          await addDoc(collection(db, "amenities"), amenity)
        }
        // أعد الجلب
        const newSnap = await getDocs(collection(db, "amenities"))
        const data = newSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Amenity[]
        setAmenities(data.sort((a, b) => (a.order || 0) - (b.order || 0)))
      } else {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Amenity[]
        setAmenities(data.sort((a, b) => (a.order || 0) - (b.order || 0)))
      }
    } catch (err) {
      console.error("خطأ في جلب المرافق:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editingAmenity) return
    setSaving(true)

    try {
      let imageUrl = editingAmenity.image

      // رفع صورة جديدة إذا وجدت
      if (newImage) {
        const imageRef = ref(storage, `amenities/${Date.now()}_${newImage.name}`)
        await uploadBytes(imageRef, newImage)
        imageUrl = await getDownloadURL(imageRef)
      }

      const amenityRef = doc(db, "amenities", editingAmenity.id)
      await updateDoc(amenityRef, {
        title: editingAmenity.title,
        image: imageUrl,
        order: editingAmenity.order || 0,
      })

      setAmenities((prev) =>
        prev.map((a) =>
          a.id === editingAmenity.id
            ? { ...a, title: editingAmenity.title, image: imageUrl, order: editingAmenity.order }
            : a
        ).sort((a, b) => (a.order || 0) - (b.order || 0))
      )

      setEditingAmenity(null)
      setNewImage(null)
      alert("✅ تم حفظ التغييرات")
    } catch (err) {
      console.error("خطأ في الحفظ:", err)
      alert("❌ فشل في الحفظ")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المرفق؟")) return
    try {
      await deleteDoc(doc(db, "amenities", id))
      setAmenities((prev) => prev.filter((a) => a.id !== id))
      alert("✅ تم الحذف")
    } catch (err) {
      console.error("خطأ في الحذف:", err)
      alert("❌ فشل في الحذف")
    }
  }

  const handleAdd = async () => {
    try {
      const newAmenity = {
        title: "مرفق جديد",
        image: "/placeholder.png",
        order: amenities.length + 1,
      }
      const docRef = await addDoc(collection(db, "amenities"), newAmenity)
      setAmenities((prev) => [...prev, { id: docRef.id, ...newAmenity }])
      setEditingAmenity({ id: docRef.id, ...newAmenity })
    } catch (err) {
      console.error("خطأ في الإضافة:", err)
      alert("❌ فشل في الإضافة")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل المرافق...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* العنوان وزر الإضافة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2A28]">
            🏊 إدارة المرافق والخدمات
          </h1>
          <p className="text-[#7C7469] mt-1">تعديل صور وعناوين المرافق المعروضة للعملاء</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-[#2B2A28] text-white rounded-xl hover:bg-[#3d3c3a] transition flex items-center gap-2"
        >
          <span>➕</span>
          <span>إضافة مرفق</span>
        </button>
      </div>

      {/* شبكة المرافق */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginateData(amenities, currentPage, itemsPerPage).map((amenity) => (
          <div
            key={amenity.id}
            className="bg-white rounded-2xl border border-[#E8E1D6] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            {/* الصورة */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={amenity.image}
                alt={amenity.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
              />
              {/* رقم الترتيب */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#C6A76D] text-white shadow-sm">
                  #{amenity.order || 0}
                </span>
              </div>
            </div>

            {/* المعلومات */}
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-lg text-[#2B2A28] truncate">{amenity.title}</h3>

              {/* الأزرار */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingAmenity(amenity)}
                  className="flex-1 bg-[#2B2A28] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3d3c3a] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>✏️</span>
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDelete(amenity.id)}
                  className="px-4 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={amenities.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {amenities.length === 0 && (
        <div className="text-center py-20 bg-[#FAF8F3] rounded-2xl border border-[#E8E1D6]">
          <span className="text-6xl mb-4 block">🏊</span>
          <p className="text-[#7C7469] text-lg">لا توجد مرافق حالياً</p>
          <button
            onClick={handleAdd}
            className="mt-4 bg-[#2B2A28] text-white px-6 py-2 rounded-xl hover:bg-[#3d3c3a] transition"
          >
            إضافة أول مرفق
          </button>
        </div>
      )}

      {/* نافذة التعديل */}
      {editingAmenity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* رأس النافذة */}
            <div className="sticky top-0 bg-white border-b border-[#E8E1D6] px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#2B2A28]">✏️ تعديل المرفق</h2>
              <button
                onClick={() => {
                  setEditingAmenity(null)
                  setNewImage(null)
                }}
                className="text-[#7C7469] hover:text-[#2B2A28] text-2xl"
              >
                ✕
              </button>
            </div>

            {/* محتوى النافذة */}
            <div className="p-6 space-y-6">
              {/* معاينة الصورة */}
              <div className="relative rounded-xl overflow-hidden border border-[#E8E1D6]">
                <img
                  src={newImage ? URL.createObjectURL(newImage) : editingAmenity.image}
                  alt="معاينة"
                  className="w-full h-48 object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
                />
              </div>

              {/* رفع صورة جديدة */}
              <div>
                <label className="block text-sm font-medium text-[#2B2A28] mb-2">
                  📷 تغيير الصورة
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#C6A76D] file:text-white hover:file:bg-[#8B7355] cursor-pointer"
                />
              </div>

              {/* العنوان */}
              <div>
                <label className="block text-sm font-medium text-[#2B2A28] mb-2">
                  📝 عنوان المرفق
                </label>
                <input
                  type="text"
                  value={editingAmenity.title}
                  onChange={(e) =>
                    setEditingAmenity({ ...editingAmenity, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E1D6] focus:border-[#C6A76D] focus:ring-2 focus:ring-[#C6A76D]/20 transition text-right"
                  placeholder="مثال: المسبح الخارجي"
                />
              </div>

              {/* الترتيب */}
              <div>
                <label className="block text-sm font-medium text-[#2B2A28] mb-2">
                  🔢 الترتيب
                </label>
                <input
                  type="number"
                  value={editingAmenity.order || 0}
                  onChange={(e) =>
                    setEditingAmenity({ ...editingAmenity, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E1D6] focus:border-[#C6A76D] focus:ring-2 focus:ring-[#C6A76D]/20 transition text-right"
                  min="1"
                />
              </div>
            </div>

            {/* أزرار الحفظ */}
            <div className="sticky bottom-0 bg-white border-t border-[#E8E1D6] px-6 py-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#C6A76D] text-white py-3 rounded-xl font-medium hover:bg-[#8B7355] transition disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : "💾 حفظ التغييرات"}
              </button>
              <button
                onClick={() => {
                  setEditingAmenity(null)
                  setNewImage(null)
                }}
                className="px-6 py-3 bg-[#F6F1E9] text-[#2B2A28] rounded-xl font-medium hover:bg-[#E8E1D6] transition"
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
