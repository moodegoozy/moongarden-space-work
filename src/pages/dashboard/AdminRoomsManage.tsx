import { useEffect, useState } from "react"
import { db, storage } from "@/firebase"
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

type Room = {
  id: string
  name: string
  unitNumber?: string
  price: number
  status: string
  image?: string
  description?: string
}

export default function AdminRoomsManage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadRooms = async () => {
      const snap = await getDocs(collection(db, "rooms"))
      setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Room)))
      setLoading(false)
    }
    loadRooms()
  }, [])

  const handleAdd = async () => {
    const name = prompt("اسم الغرفة:")
    if (!name) return
    const price = Number(prompt("السعر بالريال:") || 0)
    await addDoc(collection(db, "rooms"), {
      name,
      price,
      status: "متاح",
      image: "",
      description: "",
    })
    alert("✅ تمت إضافة الغرفة بنجاح")
    window.location.reload()
  }

  const handleSave = async () => {
    if (!editingRoom) return
    setSaving(true)

    try {
      let imageUrl = editingRoom.image
      if (newImage) {
        const imageRef = ref(storage, `rooms/${editingRoom.id}-${newImage.name}`)
        await uploadBytes(imageRef, newImage)
        imageUrl = await getDownloadURL(imageRef)
      }

      await updateDoc(doc(db, "rooms", editingRoom.id), {
        name: editingRoom.name,
        unitNumber: editingRoom.unitNumber || "",
        price: Number(editingRoom.price),
        status: editingRoom.status,
        description: editingRoom.description || "",
        image: imageUrl,
      })

      setRooms((prev) =>
        prev.map((r) => (r.id === editingRoom.id ? { ...editingRoom, image: imageUrl } : r))
      )
      alert("✅ تم حفظ التعديلات بنجاح")
      setEditingRoom(null)
      setNewImage(null)
    } catch (err) {
      console.error("خطأ:", err)
      alert("حدث خطأ أثناء الحفظ")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الغرفة؟")) return
    await deleteDoc(doc(db, "rooms", id))
    setRooms(rooms.filter((r) => r.id !== id))
    alert("🗑️ تم حذف الغرفة")
  }

  const handleClone = async (room: Room) => {
    try {
      const clonedData = { ...room, name: `${room.name} (نسخة)` }
      delete (clonedData as any).id
      await addDoc(collection(db, "rooms"), clonedData)
      alert("✅ تم استنساخ الغرفة بنجاح")
      window.location.reload()
    } catch (error) {
      alert("حدث خطأ أثناء الاستنساخ")
    }
  }

  const statusColors: Record<string, string> = {
    "متاح": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "محجوز": "bg-amber-100 text-amber-700 border-amber-200",
    "مؤكد": "bg-sky-100 text-sky-700 border-sky-200",
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل الغرف...</p>
      </div>
    )
  }

  return (
    <div className="text-right">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#C6A76D] to-[#A48E78] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">🛏️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2B2A28]">إدارة الغرف</h2>
            <p className="text-sm text-[#7C7469]">{rooms.length} غرفة مسجلة</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-l from-[#C6A76D] to-[#A48E78] text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition shadow-md flex items-center gap-2"
        >
          <span>➕</span>
          <span>إضافة غرفة</span>
        </button>
      </div>

      {/* بطاقات الغرف */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-2xl border border-[#E8E1D6] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            {/* الصورة */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={room.image || "/placeholder.png"}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[room.status] || "bg-gray-100 text-gray-600"}`}>
                  {room.status}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* المحتوى */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#2B2A28] mb-1">{room.name}</h3>
                  <p className="text-sm text-[#7C7469]">🏠 رقم الوحدة: {room.unitNumber || "—"}</p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-[#C6A76D]">{room.price}</p>
                  <p className="text-xs text-[#7C7469]">ريال/الليلة</p>
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditingRoom(room)}
                  className="flex-1 bg-[#2B2A28] text-white py-2 rounded-xl text-sm hover:bg-[#3d3c3a] transition flex items-center justify-center gap-1"
                >
                  <span>✏️</span>
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleClone(room)}
                  className="flex-1 bg-[#E8E1D6] text-[#2B2A28] py-2 rounded-xl text-sm hover:bg-[#d9d2c7] transition flex items-center justify-center gap-1"
                >
                  <span>📋</span>
                  <span>نسخ</span>
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="px-4 bg-red-50 text-red-600 py-2 rounded-xl text-sm hover:bg-red-100 transition"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* نافذة التعديل */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAF8F3] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* رأس النافذة */}
            <div className="bg-gradient-to-l from-[#C6A76D] to-[#A48E78] p-5 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>✏️</span>
                <span>تعديل بيانات الغرفة</span>
              </h3>
            </div>

            {/* المحتوى */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">رقم الوحدة</label>
                  <input
                    type="text"
                    value={editingRoom.unitNumber || ""}
                    placeholder="مثال: 101"
                    onChange={(e) => setEditingRoom({ ...editingRoom, unitNumber: e.target.value })}
                    className="w-full border border-[#E8E1D6] rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7C7469] mb-1">السعر (ريال)</label>
                  <input
                    type="number"
                    value={editingRoom.price}
                    onChange={(e) => setEditingRoom({ ...editingRoom, price: Number(e.target.value) })}
                    className="w-full border border-[#E8E1D6] rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#7C7469] mb-1">اسم الغرفة</label>
                <input
                  type="text"
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  className="w-full border border-[#E8E1D6] rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#7C7469] mb-1">الحالة</label>
                <select
                  value={editingRoom.status}
                  onChange={(e) => setEditingRoom({ ...editingRoom, status: e.target.value })}
                  className="w-full border border-[#E8E1D6] rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D] transition"
                >
                  <option value="متاح">✅ متاح</option>
                  <option value="محجوز">🔒 محجوز</option>
                  <option value="مؤكد">✔️ مؤكد</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#7C7469] mb-1">الوصف</label>
                <textarea
                  value={editingRoom.description || ""}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  rows={3}
                  className="w-full border border-[#E8E1D6] rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D] transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#7C7469] mb-1">تغيير الصورة</label>
                <div className="border-2 border-dashed border-[#E8E1D6] rounded-xl p-4 text-center hover:border-[#C6A76D] transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                    className="hidden"
                    id="room-image-upload"
                  />
                  <label htmlFor="room-image-upload" className="cursor-pointer">
                    {newImage ? (
                      <p className="text-[#C6A76D] font-medium">📷 {newImage.name}</p>
                    ) : (
                      <p className="text-[#7C7469]">📷 اضغط لاختيار صورة</p>
                    )}
                  </label>
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-l from-[#C6A76D] to-[#A48E78] text-white py-3 rounded-xl hover:opacity-90 transition font-medium disabled:opacity-50"
                >
                  {saving ? "⏳ جاري الحفظ..." : "💾 حفظ التعديلات"}
                </button>
                <button
                  onClick={() => { setEditingRoom(null); setNewImage(null) }}
                  className="flex-1 bg-[#E8E1D6] text-[#2B2A28] py-3 rounded-xl hover:bg-[#d9d2c7] transition font-medium"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
