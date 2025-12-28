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
import Pagination, { paginateData } from "@/components/Pagination"

type Room = {
  id: string
  name: string
  unitNumber?: string
  price: number
  status: string
  description?: string
  images?: string[]
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [newImages, setNewImages] = useState<FileList | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // تصفية الغرف بناءً على البحث
  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.unitNumber && room.unitNumber.includes(searchQuery))
  )

  useEffect(() => {
    const fetchRooms = async () => {
      const snap = await getDocs(collection(db, "rooms"))
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Room))
      setRooms(data)
      setLoading(false)
    }
    fetchRooms()
  }, [])

  const handleAdd = async () => {
    const name = prompt("اسم الغرفة:")
    if (!name) return
    const price = Number(prompt("السعر بالريال:") || 0)
    await addDoc(collection(db, "rooms"), {
      name,
      price,
      status: "متاح",
      description: "",
      images: [],
    })
    alert("✅ تمت إضافة الغرفة بنجاح")
    window.location.reload()
  }

  const handleSave = async () => {
    if (!editingRoom) return
    setSaving(true)

    try {
      let updatedImages = editingRoom.images || []

      if (newImages && newImages.length > 0) {
        const uploadPromises = Array.from(newImages).map(async (file) => {
          const imageRef = ref(storage, `rooms/${editingRoom.id}-${file.name}`)
          await uploadBytes(imageRef, file)
          return await getDownloadURL(imageRef)
        })
        const newUrls = await Promise.all(uploadPromises)
        updatedImages = [...newUrls, ...updatedImages]
      }

      await updateDoc(doc(db, "rooms", editingRoom.id), {
        name: editingRoom.name,
        unitNumber: editingRoom.unitNumber || "",
        price: Number(editingRoom.price),
        status: editingRoom.status,
        description: editingRoom.description || "",
        images: updatedImages,
      })

      setRooms((prev) =>
        prev.map((r) => (r.id === editingRoom.id ? { ...editingRoom, images: updatedImages } : r))
      )
      alert("✅ تم حفظ التعديلات بنجاح")
      setEditingRoom(null)
      setNewImages(null)
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
      const { id, ...rest } = room
      await addDoc(collection(db, "rooms"), { ...rest, name: `${room.name} (نسخة)` })
      alert("✅ تم استنساخ الغرفة بنجاح")
      window.location.reload()
    } catch {
      alert("حدث خطأ أثناء الاستنساخ")
    }
  }

  const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
    "متاح": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    "محجوز": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    "مؤكد": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
    "مقفلة": { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300" },
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469] text-lg">جاري تحميل الغرف...</p>
      </div>
    )
  }

  return (
    <div className="text-right">
      {/* الهيدر */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#C6A76D] to-[#8B7355] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🛏️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2B2A28]">إدارة الغرف الفندقية</h1>
            <p className="text-[#7C7469] text-sm">{rooms.length} غرفة مسجلة في النظام</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-l from-[#C6A76D] to-[#8B7355] text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 font-medium"
        >
          <span className="text-lg">➕</span>
          <span>إضافة غرفة جديدة</span>
        </button>
      </div>

      {/* حقل البحث */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="🔍 ابحث باسم الغرفة أو رقم الوحدة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 pr-12 rounded-xl border-2 border-[#E8E1D6] bg-white text-right text-[#2B2A28] placeholder-[#A09B93] focus:border-[#C6A76D] focus:ring-2 focus:ring-[#C6A76D]/20 transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7469] hover:text-[#C6A76D] transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-[#7C7469] mt-2">
            عرض {filteredRooms.length} من {rooms.length} غرفة
          </p>
        )}
      </div>

      {/* البطاقات */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginateData(filteredRooms, currentPage, itemsPerPage).map((room) => {
          const firstImage = room.images?.[0] || "/placeholder.png"
          const status = statusConfig[room.status] || statusConfig["متاح"]

          return (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-[#E8E1D6] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              {/* الصورة */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={firstImage}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
                />
                {/* الحالة */}
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${status.bg} ${status.text} ${status.border} shadow-sm`}>
                    {room.status}
                  </span>
                </div>
                {/* رقم الوحدة */}
                {room.unitNumber && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 text-[#2B2A28] shadow-sm backdrop-blur-sm">
                      🏷️ {room.unitNumber}
                    </span>
                  </div>
                )}
                {/* التدرج */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* المحتوى */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-[#2B2A28] mb-2 line-clamp-1">{room.name}</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[#7C7469]">
                    <span>💰</span>
                    <span className="text-lg font-bold text-[#C6A76D]">{room.price}</span>
                    <span className="text-sm">ريال/الليلة</span>
                  </div>
                </div>

                {/* الأزرار */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingRoom(room)}
                    className="flex-1 bg-[#2B2A28] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3d3c3a] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>✏️</span>
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleClone(room)}
                    className="flex-1 bg-[#F6F1E9] text-[#2B2A28] py-2.5 rounded-xl text-sm font-medium hover:bg-[#E8E1D6] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📋</span>
                    <span>نسخ</span>
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="px-4 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredRooms.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {rooms.length === 0 && (
        <div className="text-center py-20 bg-[#FAF8F3] rounded-2xl border border-[#E8E1D6]">
          <span className="text-6xl mb-4 block">🛏️</span>
          <p className="text-[#7C7469] text-lg">لا توجد غرف حالياً</p>
          <button
            onClick={handleAdd}
            className="mt-4 bg-[#2B2A28] text-white px-6 py-2 rounded-xl hover:bg-[#3d3c3a] transition"
          >
            إضافة أول غرفة
          </button>
        </div>
      )}

      {/* نافذة التعديل */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAF8F3] rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* رأس النافذة */}
            <div className="bg-gradient-to-l from-[#C6A76D] to-[#8B7355] p-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">✏️</span>
                <span>تعديل بيانات الغرفة</span>
              </h3>
            </div>

            {/* المحتوى */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2B2A28] mb-2">رقم الوحدة</label>
                  <input
                    type="text"
                    value={editingRoom.unitNumber || ""}
                    placeholder="مثال: 101"
                    onChange={(e) => setEditingRoom({ ...editingRoom, unitNumber: e.target.value })}
                    className="w-full border-2 border-[#E8E1D6] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#C6A76D] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2B2A28] mb-2">السعر (ريال)</label>
                  <input
                    type="number"
                    value={editingRoom.price}
                    onChange={(e) => setEditingRoom({ ...editingRoom, price: Number(e.target.value) })}
                    className="w-full border-2 border-[#E8E1D6] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#C6A76D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2B2A28] mb-2">اسم الغرفة</label>
                <input
                  type="text"
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  className="w-full border-2 border-[#E8E1D6] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#C6A76D] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2B2A28] mb-2">الحالة</label>
                <div className="grid grid-cols-2 gap-3">
                  {["متاح", "محجوز", "مؤكد", "مقفلة"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditingRoom({ ...editingRoom, status: s })}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        editingRoom.status === s
                          ? "bg-[#2B2A28] text-white shadow-lg"
                          : "bg-white border-2 border-[#E8E1D6] text-[#7C7469] hover:border-[#C6A76D]"
                      }`}
                    >
                      {s === "متاح" && "✅ "}{s === "محجوز" && "🔒 "}{s === "مؤكد" && "✔️ "}{s === "مقفلة" && "⛔ "}{s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2B2A28] mb-2">الوصف</label>
                <textarea
                  value={editingRoom.description || ""}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  rows={3}
                  className="w-full border-2 border-[#E8E1D6] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#C6A76D] transition-colors resize-none"
                  placeholder="وصف مختصر للغرفة..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2B2A28] mb-2">إضافة صور جديدة</label>
                <label className="block border-2 border-dashed border-[#E8E1D6] rounded-xl p-6 text-center cursor-pointer hover:border-[#C6A76D] hover:bg-[#C6A76D]/5 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setNewImages(e.target.files)}
                    className="hidden"
                  />
                  {newImages && newImages.length > 0 ? (
                    <div className="text-[#C6A76D] font-medium">
                      <span className="text-2xl mb-2 block">📷</span>
                      تم اختيار {newImages.length} صورة
                    </div>
                  ) : (
                    <div className="text-[#7C7469]">
                      <span className="text-2xl mb-2 block">📷</span>
                      اضغط لاختيار صور
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* الأزرار */}
            <div className="p-6 bg-white border-t border-[#E8E1D6] flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-l from-[#C6A76D] to-[#8B7355] text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    جاري الحفظ...
                  </span>
                ) : (
                  "💾 حفظ التعديلات"
                )}
              </button>
              <button
                onClick={() => { setEditingRoom(null); setNewImages(null) }}
                className="flex-1 bg-[#E8E1D6] text-[#2B2A28] py-3.5 rounded-xl font-bold hover:bg-[#d9d2c7] transition-colors"
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
