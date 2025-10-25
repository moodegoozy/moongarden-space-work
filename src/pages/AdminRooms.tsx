// src/pages/AdminRooms.tsx
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

export default function AdminRooms() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRoom, setEditingRoom] = useState<any | null>(null)
  const [newImages, setNewImages] = useState<FileList | null>(null)

  // ✅ تحميل بيانات الغرف من Firestore
  useEffect(() => {
    const fetchRooms = async () => {
      const snap = await getDocs(collection(db, "rooms"))
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setRooms(data)
      setLoading(false)
    }
    fetchRooms()
  }, [])

  // ✅ إضافة غرفة جديدة
  const handleAdd = async () => {
    const name = prompt("اسم الغرفة:")
    if (!name) return
    const price = Number(prompt("السعر بالريال:") || 0)

    const newRoom = {
      name,
      price,
      status: "متاح",
      description: "",
      images: [],
    }

    await addDoc(collection(db, "rooms"), newRoom)
    alert("✅ تمت إضافة الغرفة بنجاح")
    window.location.reload()
  }

  // ✅ حذف غرفة
  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الغرفة؟")) {
      await deleteDoc(doc(db, "rooms", id))
      setRooms(rooms.filter((r) => r.id !== id))
      alert("🗑️ تم حذف الغرفة بنجاح")
    }
  }

  // ✅ حفظ التعديلات مع دعم رفع عدة صور
  const handleSave = async () => {
    if (!editingRoom) return

    let updatedImages = editingRoom.images || []

    // ✅ في حال رفع أكثر من صورة
    if (newImages && newImages.length > 0) {
      const uploadPromises = Array.from(newImages).map(async (file) => {
        const imageRef = ref(storage, `rooms/${editingRoom.id}-${file.name}`)
        await uploadBytes(imageRef, file)
        return await getDownloadURL(imageRef)
      })

      const newUrls = await Promise.all(uploadPromises)
      updatedImages = [...newUrls, ...updatedImages] // نضيفهم مع القديمات
    }

    await updateDoc(doc(db, "rooms", editingRoom.id), {
      name: editingRoom.name,
      price: Number(editingRoom.price),
      status: editingRoom.status,
      description: editingRoom.description || "",
      images: updatedImages,
    })

    alert("✅ تم حفظ التعديلات بنجاح")
    setEditingRoom(null)
    setNewImages(null)
    window.location.reload()
  }

  if (loading)
    return <p className="p-8 text-center">⏳ جارٍ تحميل البيانات...</p>

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-right">
      {/* ✅ العنوان + زر الإضافة */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">إدارة الغرف</h1>
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          ➕ إضافة غرفة
        </button>
      </div>

      {/* ✅ عرض البطاقات */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          const firstImage =
            (room.images && room.images.length > 0
              ? room.images[0]
              : room.image) || "/placeholder.png"

          return (
            <div
              key={room.id}
              className="bg-white shadow rounded-lg p-4 border hover:shadow-lg transition"
            >
              <img
                src={firstImage}
                alt={room.name}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h3 className="font-bold text-lg mb-1">{room.name}</h3>
              <p className="text-gray-600 mb-1">💰 {room.price} ريال</p>
              <p className="text-gray-600 mb-3">📦 {room.status}</p>
              <div className="flex justify-between">
                <button
                  onClick={() => setEditingRoom(room)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  ✏️ تعديل
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  حذف
                </button>
              </div>
            </div>
          )
        })}

        {rooms.length === 0 && (
          <p className="text-center col-span-full text-gray-500">
            لا توجد غرف حالياً
          </p>
        )}
      </div>

      {/* ✅ نافذة التعديل */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg text-right">
            <h2 className="text-xl font-bold mb-4">✏️ تعديل بيانات الغرفة</h2>

            <label className="block mb-2">اسم الغرفة:</label>
            <input
              value={editingRoom.name}
              onChange={(e) =>
                setEditingRoom({ ...editingRoom, name: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2">السعر:</label>
            <input
              type="number"
              value={editingRoom.price}
              onChange={(e) =>
                setEditingRoom({ ...editingRoom, price: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2">الحالة:</label>
            <select
              value={editingRoom.status}
              onChange={(e) =>
                setEditingRoom({ ...editingRoom, status: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            >
              <option value="متاح">متاح</option>
              <option value="محجوز">محجوز</option>
              <option value="مؤكد">مؤكد</option>
            </select>

            <label className="block mb-2">الوصف:</label>
            <textarea
              value={editingRoom.description || ""}
              onChange={(e) =>
                setEditingRoom({ ...editingRoom, description: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2">رفع عدة صور:</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setNewImages(e.target.files)}
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
                onClick={() => setEditingRoom(null)}
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
