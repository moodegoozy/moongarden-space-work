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

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([]) // ✅ يشمل الغرف والفلل
  const [loading, setLoading] = useState(true)
  const [editingOffer, setEditingOffer] = useState<any | null>(null)

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
    return <p className="text-center p-6">⏳ جاري تحميل البيانات...</p>

  return (
    <div className="p-8 text-right">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة العروض</h1>
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ إضافة عرض
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const relatedUnit = units.find((u) => u.id === offer.unitId)
          return (
            <div
              key={offer.id}
              className="bg-white shadow rounded-lg p-4 border hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg mb-1">{offer.name}</h3>
              <p className="text-gray-600">💰 الخصم: {offer.discount}</p>
              <p className="text-gray-600">
                🏠 الوحدة:{" "}
                {relatedUnit
                  ? `${relatedUnit.type === "villa" ? "🏡" : "🛏️"} ${relatedUnit.name}`
                  : "غير محددة"}
              </p>
              <p className="text-gray-600">
                📅 {offer.startDate || "—"} إلى {offer.endDate || "—"}
              </p>
              <p
                className={`text-sm font-bold ${
                  offer.status === "منتهي" ? "text-red-600" : "text-green-600"
                }`}
              >
                ⚡ الحالة: {offer.status}
              </p>

              <div className="flex justify-between mt-3">
                <button
                  onClick={() => setEditingOffer(offer)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  حذف
                </button>
              </div>
            </div>
          )
        })}

        {offers.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            لا توجد عروض حالياً
          </p>
        )}
      </div>

      {/* ✅ نافذة التعديل */}
      {editingOffer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg text-right">
            <h2 className="text-xl font-bold mb-4">✏️ تعديل العرض</h2>

            <label className="block mb-2">اسم العرض:</label>
            <input
              value={editingOffer.name}
              onChange={(e) =>
                setEditingOffer({ ...editingOffer, name: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2">نسبة الخصم أو المبلغ:</label>
            <input
              value={editingOffer.discount}
              onChange={(e) =>
                setEditingOffer({ ...editingOffer, discount: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2">نوع الخصم:</label>
            <select
              value={editingOffer.discountType || "percent"}
              onChange={(e) =>
                setEditingOffer({ ...editingOffer, discountType: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            >
              <option value="percent">٪ نسبة مئوية</option>
              <option value="amount">💵 مبلغ ثابت</option>
            </select>

            <label className="block mb-2">الوحدة المرتبطة:</label>
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
              className="border w-full p-2 rounded mb-3"
            >
              <option value="">— اختر الوحدة —</option>
              {units.map((u) => (
                <option key={u.id} value={`${u.id}|${u.type}`}>
                  {u.type === "villa" ? `🏡 ${u.name}` : `🛏️ ${u.name}`}
                </option>
              ))}
            </select>

            <label className="block mb-2">تاريخ البداية:</label>
            <input
              type="date"
              value={editingOffer.startDate || ""}
              onChange={(e) =>
                setEditingOffer({ ...editingOffer, startDate: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2">تاريخ النهاية:</label>
            <input
              type="date"
              value={editingOffer.endDate || ""}
              onChange={(e) =>
                setEditingOffer({ ...editingOffer, endDate: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />

            <label className="block mb-2">الحالة:</label>
            <select
              value={editingOffer.status}
              onChange={(e) =>
                setEditingOffer({ ...editingOffer, status: e.target.value })
              }
              className="border w-full p-2 rounded mb-4"
            >
              <option value="نشط">نشط</option>
              <option value="منتهي">منتهي</option>
            </select>

            <div className="flex justify-between">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                💾 حفظ التعديلات
              </button>
              <button
                onClick={() => setEditingOffer(null)}
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
