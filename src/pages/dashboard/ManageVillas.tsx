// src/pages/ManageVillas.tsx
import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore"
import { db, storage } from "@/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function ManageVillas() {
  const [villas, setVillas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVilla, setEditingVilla] = useState<any | null>(null)
  const [newImage, setNewImage] = useState<File | null>(null)

  useEffect(() => {
    const fetchVillas = async () => {
      const snap = await getDocs(collection(db, "villas"))
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setVillas(data)
      setLoading(false)
    }
    fetchVillas()
  }, [])

  const handleAdd = async () => {
    const name = prompt("اسم الفيلا:")
    if (!name) return
    const price = Number(prompt("السعر بالريال:") || 0)
    await addDoc(collection(db, "villas"), {
      name,
      price,
      status: "متاح",
      image: "",
      description: "",
    })
    alert("✅ تمت إضافة الفيلا بنجاح")
    window.location.reload()
  }

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الفيلا؟")) {
      await deleteDoc(doc(db, "villas", id))
      setVillas(villas.filter((v) => v.id !== id))
      alert("🗑️ تم حذف الفيلا بنجاح")
    }
  }

  // ✅ استنساخ الفيلا
  const handleClone = async (villa: any) => {
    try {
      const clonedData = {
        ...villa,
        name: `${villa.name} (نسخة)`,
        createdAt: new Date().toISOString(),
      }
      delete clonedData.id // نحذف المعرف القديم
      await addDoc(collection(db, "villas"), clonedData)
      alert("✅ تم استنساخ الفيلا بنجاح")
      window.location.reload()
    } catch (error) {
      console.error("❌ خطأ أثناء الاستنساخ:", error)
      alert("حدث خطأ أثناء استنساخ الفيلا.")
    }
  }

  const handleSave = async () => {
    if (!editingVilla) return

    let imageUrl = editingVilla.image
    if (newImage) {
      const imageRef = ref(storage, `villas/${editingVilla.id}-${newImage.name}`)
      await uploadBytes(imageRef, newImage)
      imageUrl = await getDownloadURL(imageRef)
    }

    await updateDoc(doc(db, "villas", editingVilla.id), {
      name: editingVilla.name,
      price: Number(editingVilla.price),
      status: editingVilla.status,
      description: editingVilla.description || "",
      image: imageUrl,
    })

    alert("✅ تم حفظ التعديلات بنجاح")
    setEditingVilla(null)
    setNewImage(null)
    window.location.reload()
  }

  if (loading) return <p className="text-center">⏳ تحميل البيانات...</p>

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-right">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الفلل والأجنحة</h1>
        <button
          onClick={handleAdd}
          className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          ➕ إضافة فيلا
        </button>
      </div>

      {/* ✅ بطاقات عرض الفلل */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {villas.map((villa) => (
          <div
            key={villa.id}
            className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={villa.image || "/placeholder.png"}
              alt={villa.name}
              className="w-full h-48 object-cover rounded mb-3"
            />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1 text-gray-900">{villa.name}</h3>
              <p className="text-gray-600 mb-1">💰 {villa.price} ريال</p>
              <p className="text-gray-600 mb-3">📦 {villa.status}</p>

              <div className="flex justify-between gap-2">
                {/* زر التعديل */}
                <button
                  onClick={() => setEditingVilla(villa)}
                  className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-black transition"
                >
                  ✏️ تعديل
                </button>

                {/* ✅ زر الاستنساخ */}
                <button
                  onClick={() => handleClone(villa)}
                  className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition"
                >
                  ⚡ استنساخ
                </button>

                {/* زر الحذف */}
                <button
                  onClick={() => handleDelete(villa.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition"
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ نافذة تعديل البيانات */}
      {editingVilla && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg text-right">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              ✏️ تعديل بيانات الفيلا
            </h2>

            <label className="block mb-2 font-medium">اسم الفيلا:</label>
            <input
              value={editingVilla.name}
              onChange={(e) =>
                setEditingVilla({ ...editingVilla, name: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2 font-medium">السعر:</label>
            <input
              type="number"
              value={editingVilla.price}
              onChange={(e) =>
                setEditingVilla({ ...editingVilla, price: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2 font-medium">الحالة:</label>
            <select
              value={editingVilla.status}
              onChange={(e) =>
                setEditingVilla({ ...editingVilla, status: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            >
              <option value="متاح">متاح</option>
              <option value="محجوز">محجوز</option>
              <option value="مؤكد">مؤكد</option>
            </select>

            <label className="block mb-2 font-medium">الوصف:</label>
            <textarea
              value={editingVilla.description || ""}
              onChange={(e) =>
                setEditingVilla({
                  ...editingVilla,
                  description: e.target.value,
                })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2 font-medium">تغيير الصورة:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files?.[0] || null)}
              className="mb-4"
            />

            <div className="flex justify-between">
              <button
                onClick={handleSave}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
              >
                💾 حفظ التعديلات
              </button>
              <button
                onClick={() => setEditingVilla(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
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
