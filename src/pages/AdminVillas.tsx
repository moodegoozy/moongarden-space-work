// src/pages/AdminVillas.tsx
import { useEffect, useState } from "react"
import { db, storage } from "@/firebase"
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

type Villa = {
  id?: string
  name: string
  price: number
  status: "متاح" | "محجوز" | "مؤكد"
  description?: string
  images?: string[]
}

export default function AdminVillas() {
  const [villas, setVillas] = useState<Villa[]>([])
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null)
  const [newImages, setNewImages] = useState<FileList | null>(null)

  // ✅ تحميل البيانات
  useEffect(() => {
    const loadVillas = async () => {
      const snap = await getDocs(collection(db, "villas"))
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Villa[]
      setVillas(list)
    }
    loadVillas()
  }, [])

  // ✅ إضافة فيلا جديدة
  const handleAdd = async () => {
    const newVilla: Villa = {
      name: "فيلا جديدة",
      price: 0,
      status: "متاح",
      description: "",
      images: [],
    }
    await addDoc(collection(db, "villas"), newVilla)
    window.location.reload()
  }

  // ✅ نسخ فيلا (نسخة آمنة بدون خطأ)
  const handleDuplicate = async (villa: Villa) => {
    try {
      // حذف id لو موجود
      const { id, ...rest } = villa

      // تجهيز النسخة الجديدة
      const duplicatedVilla: Villa = {
        ...rest,
        name: `${villa.name} (نسخة)`,
        price: Number(villa.price) || 0,
        status: villa.status || "متاح",
        description: villa.description || "",
        images: villa.images ? [...villa.images] : [],
      }

      // إضافة النسخة الجديدة إلى قاعدة البيانات
      await addDoc(collection(db, "villas"), duplicatedVilla)

      alert("✅ تم نسخ الفيلا بنجاح")
      window.location.reload()
    } catch (error: any) {
      console.error("❌ خطأ أثناء نسخ الفيلا:", error.message)
      alert("❌ حدث خطأ أثناء نسخ الفيلا، تحقق من البيانات أو الصور")
    }
  }

  // ✅ حذف فيلا كاملة
  const handleDelete = async (id?: string) => {
    if (!id) return
    if (confirm("هل أنت متأكد من حذف هذه الفيلا؟")) {
      await deleteDoc(doc(db, "villas", id))
      setVillas(villas.filter((v) => v.id !== id))
    }
  }

  // ✅ حذف صورة محددة من الفيلا
  const handleDeleteImage = async (villa: Villa, imageUrl: string) => {
    if (!villa.id || !villa.images) return

    if (confirm("هل تريد حذف هذه الصورة؟")) {
      try {
        // حذف الصورة من Firebase Storage
        const fileRef = ref(storage, imageUrl)
        await deleteObject(fileRef)

        // تحديث الصور في قاعدة البيانات
        const updatedImages = villa.images.filter((img) => img !== imageUrl)
        await updateDoc(doc(db, "villas", villa.id), { images: updatedImages })

        // تحديث الحالة في الواجهة
        setEditingVilla({ ...villa, images: updatedImages })
        setVillas((prev) =>
          prev.map((v) =>
            v.id === villa.id ? { ...v, images: updatedImages } : v
          )
        )

        alert("🗑️ تم حذف الصورة بنجاح")
      } catch (error) {
        console.error(error)
        alert("حدث خطأ أثناء حذف الصورة")
      }
    }
  }

  // ✅ حفظ التعديلات
  const handleSave = async () => {
    if (!editingVilla?.id) return

    let imageUrls = editingVilla.images || []

    // ✅ رفع الصور الجديدة
    if (newImages && newImages.length > 0) {
      const uploadPromises = Array.from(newImages).map(async (file) => {
        const imageRef = ref(storage, `villas/${editingVilla.id}-${file.name}`)
        await uploadBytes(imageRef, file)
        return await getDownloadURL(imageRef)
      })
      const uploadedUrls = await Promise.all(uploadPromises)
      imageUrls = [...imageUrls, ...uploadedUrls]
    }

    const updated = {
      ...editingVilla,
      images: imageUrls,
      price: Number(editingVilla.price),
    }

    await updateDoc(doc(db, "villas", editingVilla.id), updated)
    setEditingVilla(null)
    setNewImages(null)
    window.location.reload()
  }

  // ✅ واجهة العرض
  return (
    <div className="p-6 bg-gray-50 min-h-screen text-right">
      <div className="flex justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">إدارة الفلل والأجنحة</h1>
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ إضافة فيلا
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {villas.map((villa) => (
          <div
            key={villa.id}
            className="bg-white shadow rounded-lg p-4 border hover:shadow-lg transition"
          >
            {/* ✅ عرض عدة صور */}
            <div className="flex gap-2 overflow-x-auto mb-3">
              {(villa.images || ["/placeholder.png"]).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={villa.name}
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
            </div>

            <h3 className="font-bold text-lg mb-1">{villa.name}</h3>
            <p className="text-gray-600 mb-1">💰 {villa.price} ريال</p>
            <p className="text-gray-600 mb-3">📦 {villa.status}</p>

            <div className="flex justify-between gap-2">
              <button
                onClick={() => setEditingVilla(villa)}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              >
                تعديل
              </button>

              <button
                onClick={() => handleDuplicate(villa)}
                className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
              >
                نسخ
              </button>

              <button
                onClick={() => handleDelete(villa.id)}
                className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ نافذة التعديل */}
      {editingVilla && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg text-right">
            <h2 className="text-xl font-bold mb-4">✏️ تعديل بيانات الفيلا</h2>

            <label className="block mb-2">اسم الفيلا:</label>
            <input
              value={editingVilla.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingVilla({ ...editingVilla, name: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2">السعر:</label>
            <input
              type="number"
              value={editingVilla.price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingVilla({
                  ...editingVilla,
                  price: Number(e.target.value),
                })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2">الحالة:</label>
            <select
              value={editingVilla.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setEditingVilla({
                  ...editingVilla,
                  status: e.target.value as Villa["status"],
                })
              }
              className="border w-full p-2 rounded mb-3"
            >
              <option value="متاح">متاح</option>
              <option value="محجوز">محجوز</option>
              <option value="مؤكد">مؤكد</option>
            </select>

            <label className="block mb-2">الوصف:</label>
            <textarea
              value={editingVilla.description || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setEditingVilla({
                  ...editingVilla,
                  description: e.target.value,
                })
              }
              className="border w-full p-2 rounded mb-3"
            />

            {/* ✅ عرض الصور الحالية + زر حذف */}
            <label className="block mb-2">الصور الحالية:</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {(editingVilla.images || []).map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={img}
                    alt={`صورة ${i + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <button
                    onClick={() => handleDeleteImage(editingVilla, img)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                    title="حذف الصورة"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* ✅ رفع صور جديدة */}
            <label className="block mb-2">رفع صور جديدة:</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewImages(e.target.files)
              }
              className="mb-4"
            />

            <div className="flex justify-between">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                💾 حفظ التعديلات
              </button>
              <button
                onClick={() => setEditingVilla(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
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
