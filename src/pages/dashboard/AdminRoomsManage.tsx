import { useEffect, useState } from "react"
import { db, storage } from "@/firebase"
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function AdminRoomsManage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ تحميل بيانات الغرف
  useEffect(() => {
    const loadRooms = async () => {
      const snap = await getDocs(collection(db, "rooms"))
      setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    loadRooms()
  }, [])

  const handleUpdate = async (id: string, field: string, value: any) => {
    await updateDoc(doc(db, "rooms", id), { [field]: value })
    alert("تم التحديث ✅")
  }

  const handleImageUpload = async (id: string, file: File) => {
    const storageRef = ref(storage, `rooms/${id}/${file.name}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    await updateDoc(doc(db, "rooms", id), { image: url })
    alert("تم رفع الصورة ✅")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الغرفة؟")) return
    await deleteDoc(doc(db, "rooms", id))
    setRooms(rooms.filter((r) => r.id !== id))
  }

  if (loading) return <p className="p-8 text-center">جاري التحميل...</p>

  return (
    <div className="p-6 text-right">
      <h1 className="text-2xl font-bold mb-6">🛏️ إدارة الغرف</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white shadow rounded p-4 border">
            <img
              src={room.image || "/no-image.png"}
              alt={room.name}
              className="w-full h-48 object-cover rounded mb-3"
            />
            <h3 className="font-bold mb-2">{room.name}</h3>
            <p className="text-gray-600 mb-2">{room.price} ريال / الليلة</p>
            <p className="text-sm text-blue-600 mb-3">{room.status}</p>

            <label className="block mb-2 text-sm font-semibold">تغيير الصورة:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleImageUpload(room.id, e.target.files[0])
              }
              className="mb-3"
            />

            <input
              type="text"
              defaultValue={room.name}
              onBlur={(e) => handleUpdate(room.id, "name", e.target.value)}
              className="border p-1 w-full mb-2 rounded"
            />

            <input
              type="number"
              defaultValue={room.price}
              onBlur={(e) => handleUpdate(room.id, "price", Number(e.target.value))}
              className="border p-1 w-full mb-2 rounded"
            />

            <select
              defaultValue={room.status}
              onChange={(e) => handleUpdate(room.id, "status", e.target.value)}
              className="border p-1 w-full mb-2 rounded"
            >
              <option value="متاح">متاح</option>
              <option value="محجوز">محجوز</option>
              <option value="مؤكد">مؤكد</option>
            </select>

            <button
              onClick={() => handleDelete(room.id)}
              className="bg-red-600 text-white w-full py-2 rounded mt-2 hover:bg-red-700"
            >
              حذف الغرفة 🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
