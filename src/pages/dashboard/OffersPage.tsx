import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore"
import { db } from "@/firebase"
import Pagination, { paginateData } from "@/components/Pagination"

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([]) // ✅ يشمل الغرف والفلل
  const [loading, setLoading] = useState(true)
  const [editingOffer, setEditingOffer] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // ✅ تحميل البيانات + فحص انتهاء العروض
  useEffect(() => {
    const fetchData = async () => {
      try {
        const offersSnap = await getDocs(collection(db, "offers"))
        const roomsSnap = await getDocs(collection(db, "rooms"))
        const villasSnap = await getDocs(collection(db, "villas"))

        const allOffers = offersSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        setOffers(allOffers)

        const allUnits = [
          ...roomsSnap.docs.map((d) => ({
            id: d.id,
            name: d.data().name,
            type: "room",
            price: d.data().price,
          })),
          ...villasSnap.docs.map((d) => ({
            id: d.id,
            name: d.data().name,
            type: "villa",
            price: d.data().price,
          })),
        ]
        setUnits(allUnits)

        // ✅ فحص تلقائي للعروض المنتهية
        await checkExpiredOffers(allOffers)
      } catch (error) {
        console.error("❌ خطأ أثناء تحميل البيانات:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ✅ دالة تطبيق الخصم على الوحدة
  const applyDiscount = async (offer: any) => {
    if (!offer.unitId || !offer.unitType) return
    const ref = doc(db, offer.unitType === "villa" ? "villas" : "rooms", offer.unitId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return

    const data = snap.data()
    const currentPrice = data.price || 0
    const discountValue = Number(offer.discount) || 0

    const newPrice =
      offer.discountType === "amount"
        ? currentPrice - discountValue
        : currentPrice - (currentPrice * discountValue) / 100

    if (!offer.originalPrice) {
      await updateDoc(doc(db, "offers", offer.id), {
        originalPrice: currentPrice,
      })
    }

    await updateDoc(ref, { price: newPrice })
    console.log("✅ تم تحديث السعر الجديد:", newPrice)
  }

  // ✅ دالة لإرجاع السعر الأصلي
  const revertOriginalPrice = async (offer: any) => {
    if (!offer.unitId || !offer.unitType || !offer.originalPrice) return
    const ref = doc(db, offer.unitType === "villa" ? "villas" : "rooms", offer.unitId)
    await updateDoc(ref, { price: offer.originalPrice })
    console.log("🔄 تم إعادة السعر الأصلي:", offer.originalPrice)
  }

  // ✅ فحص تلقائي للعروض المنتهية بالتاريخ
  const checkExpiredOffers = async (offersList: any[]) => {
    const today = new Date().toISOString().split("T")[0]
    for (const offer of offersList) {
      if (offer.endDate && offer.endDate < today && offer.status === "نشط") {
        console.log("⚠️ عرض منتهي تلقائي:", offer.name)
        await updateDoc(doc(db, "offers", offer.id), { status: "منتهي" })
        await revertOriginalPrice(offer)
      }
    }
  }

  // ✅ إضافة عرض جديد
  const handleAdd = async () => {
    const name = prompt("اسم العرض:")
    if (!name) return
    const discount = prompt("نسبة الخصم (٪) أو المبلغ:")
    const discountType = window.confirm("هل هذا الخصم بالنسبة المئوية؟")
      ? "percent"
      : "amount"

    const newOffer = {
      name,
      discount,
      discountType,
      unitId: "",
      unitType: "",
      originalPrice: null,
      startDate: "",
      endDate: "",
      status: "نشط",
      createdAt: new Date().toISOString(),
    }

    const docRef = await addDoc(collection(db, "offers"), newOffer)
    alert("✅ تمت إضافة العرض بنجاح")
    setOffers([...offers, { id: docRef.id, ...newOffer }])
  }

  // ✅ حذف عرض
  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف العرض؟")) {
      await deleteDoc(doc(db, "offers", id))
      setOffers(offers.filter((o) => o.id !== id))
    }
  }

  // ✅ حفظ التعديل
  const handleSave = async () => {
    if (!editingOffer) return

    await updateDoc(doc(db, "offers", editingOffer.id), { ...editingOffer })

    if (editingOffer.status === "نشط") {
      await applyDiscount(editingOffer)
    }

    if (editingOffer.status === "منتهي") {
      await revertOriginalPrice(editingOffer)
    }

    alert("✅ تم حفظ التعديلات وتحديث الأسعار بنجاح")
    setEditingOffer(null)
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل العروض...</p>
      </div>
    )

  return (
    <div className="text-right">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#AB47BC] to-[#7B1FA2] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">🎁</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2B2A28]">إدارة العروض</h2>
            <p className="text-sm text-[#7C7469]">{offers.length} عرض مسجل</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-l from-[#7CB342] to-[#558B2F] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md flex items-center gap-2"
        >
          <span>➕</span> إضافة عرض
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-[#FAF8F3] rounded-2xl border border-[#E8E1D6]">
            <span className="text-5xl mb-4 block">🎁</span>
            <p className="text-[#7C7469] text-lg">لا توجد عروض حالياً</p>
          </div>
        ) : (
          paginateData(offers, currentPage, itemsPerPage).map((offer) => {
            const relatedUnit = units.find((u) => u.id === offer.unitId)
            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl shadow-lg border border-[#E8E1D6] p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#AB47BC]/10 to-transparent rounded-bl-full"></div>
                
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    offer.status === "منتهي" 
                      ? "bg-red-100 text-red-700" 
                      : "bg-green-100 text-green-700"
                  }`}>
                    {offer.status}
                  </span>
                  <h3 className="font-bold text-lg text-[#2B2A28]">{offer.name}</h3>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-[#7C7469] flex items-center justify-end gap-2">
                    <span className="font-semibold text-[#C6A76D]">{offer.discount}{offer.discountType === "percent" ? "%" : " ريال"}</span>
                    <span>💰 الخصم:</span>
                  </p>
                  <p className="text-[#7C7469] flex items-center justify-end gap-2">
                    <span className="font-medium">
                      {relatedUnit
                        ? `${relatedUnit.type === "villa" ? "🏡" : "🛏️"} ${relatedUnit.name}`
                        : "غير محددة"}
                    </span>
                    <span>🏠 الوحدة:</span>
                  </p>
                  <p className="text-[#7C7469] text-sm">
                    📅 {offer.startDate || "—"} إلى {offer.endDate || "—"}
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#E8E1D6]">
                  <button
                    onClick={() => setEditingOffer(offer)}
                    className="flex-1 bg-gradient-to-l from-[#C6A76D]/20 to-[#A48E78]/20 text-[#2B2A28] py-2 rounded-lg font-medium hover:from-[#C6A76D]/30 hover:to-[#A48E78]/30 transition-all"
                  >
                    ✏️ تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 transition-all"
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={offers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* ✅ نافذة التعديل */}
      {editingOffer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl text-right overflow-hidden">
            {/* رأس النافذة */}
            <div className="bg-gradient-to-l from-[#C6A76D] to-[#A48E78] p-5">
              <h2 className="text-xl font-bold text-[#2B2A28]">✏️ تعديل العرض</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-[#2B2A28] font-medium">اسم العرض:</label>
                <input
                  value={editingOffer.name}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, name: e.target.value })
                  }
                  className="border border-[#E8E1D6] w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D]"
                />
              </div>

              <div>
                <label className="block mb-2 text-[#2B2A28] font-medium">نسبة الخصم أو المبلغ:</label>
                <input
                  value={editingOffer.discount}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, discount: e.target.value })
                  }
                  className="border border-[#E8E1D6] w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D]"
                />
              </div>

              <div>
                <label className="block mb-2 text-[#2B2A28] font-medium">نوع الخصم:</label>
                <select
                  value={editingOffer.discountType || "percent"}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, discountType: e.target.value })
                  }
                  className="border border-[#E8E1D6] w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D] bg-white"
                >
                  <option value="percent">٪ نسبة مئوية</option>
                  <option value="amount">💵 مبلغ ثابت</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-[#2B2A28] font-medium">الوحدة المرتبطة:</label>
                <select
                  value={
                    editingOffer.unitId
                      ? `${editingOffer.unitId}|${editingOffer.unitType}`
                      : ""
                  }
                  onChange={(e) => {
                    const [id, type] = e.target.value.split("|")
                    setEditingOffer({
                      ...editingOffer,
                      unitId: id,
                      unitType: type,
                    })
                  }}
                  className="border border-[#E8E1D6] w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D] bg-white"
                >
                  <option value="">— اختر الوحدة —</option>
                  {units.map((u) => (
                    <option key={u.id} value={`${u.id}|${u.type}`}>
                      {u.type === "villa" ? `🏡 ${u.name}` : `🛏️ ${u.name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-[#2B2A28] font-medium">تاريخ البداية:</label>
                  <input
                    type="date"
                    value={editingOffer.startDate || ""}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, startDate: e.target.value })
                    }
                    className="border border-[#E8E1D6] w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[#2B2A28] font-medium">تاريخ النهاية:</label>
                  <input
                    type="date"
                    value={editingOffer.endDate || ""}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, endDate: e.target.value })
                    }
                    className="border border-[#E8E1D6] w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[#2B2A28] font-medium">الحالة:</label>
                <select
                  value={editingOffer.status}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, status: e.target.value })
                  }
                  className="border border-[#E8E1D6] w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/50 focus:border-[#C6A76D] bg-white"
                >
                  <option value="نشط">نشط</option>
                  <option value="منتهي">منتهي</option>
                </select>
              </div>
            </div>

            {/* أزرار الإجراء */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-l from-[#7CB342] to-[#558B2F] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md"
              >
                💾 حفظ التعديلات
              </button>
              <button
                onClick={() => setEditingOffer(null)}
                className="flex-1 bg-[#E8E1D6] text-[#2B2A28] py-3 rounded-xl font-semibold hover:bg-[#DDD5C7] transition-all"
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
