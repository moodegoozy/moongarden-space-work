// src/pages/dashboard/InvoicesPage.tsx
// نظام الفواتير - PMS
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"

type Invoice = {
  id: string
  invoiceNumber: string
  bookingId: string
  guestName: string
  guestPhone: string
  nationalId?: string
  unitName: string
  unitType: "room" | "villa"
  checkIn: string
  checkOut: string
  nights: number
  roomRate: number
  subtotal: number
  discount: number
  tax: number
  total: number
  paid: number
  balance: number
  status: "مسودة" | "صادرة" | "مدفوعة" | "مدفوعة جزئياً" | "ملغاة"
  paymentMethod?: "نقدي" | "بطاقة" | "تحويل" | "مدى"
  notes?: string
  createdAt: string
  items: InvoiceItem[]
}

type InvoiceItem = {
  description: string
  quantity: number
  unitPrice: number
  total: number
  type: "إقامة" | "خدمات" | "مطعم" | "غسيل" | "أخرى"
}

type Booking = {
  id: string
  fullName: string
  phone: string
  nationalId?: string
  checkIn: string
  checkOut: string
  roomName?: string
  villaName?: string
  unitId: string
  price: number
  status: string
  type: "room" | "villa"
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [newItem, setNewItem] = useState<InvoiceItem>({
    description: "",
    quantity: 1,
    unitPrice: 0,
    total: 0,
    type: "خدمات",
  })
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [invoiceForm, setInvoiceForm] = useState({
    discount: 0,
    tax: 15,
    paymentMethod: "نقدي" as "نقدي" | "بطاقة" | "تحويل" | "مدى",
    notes: "",
    paid: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // جلب الفواتير
      const invoicesSnap = await getDocs(
        query(collection(db, "invoices"), orderBy("createdAt", "desc"))
      )
      const invoicesData = invoicesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toLocaleDateString("ar-SA") || "—",
      })) as Invoice[]
      setInvoices(invoicesData)

      // جلب الحجوزات المؤهلة للفوترة (مسجل دخول أو مغادر)
      const bookingsSnap = await getDocs(collection(db, "bookings"))
      const bookingsData = bookingsSnap.docs
        .map((d) => {
          const b = d.data() as any
          return {
            id: d.id,
            fullName: b.fullName || "—",
            phone: b.phone || "—",
            nationalId: b.nationalId,
            checkIn: b.checkIn || "",
            checkOut: b.checkOut || "",
            roomName: b.roomName,
            villaName: b.villaName,
            unitId: b.unitId,
            price: b.price || 0,
            status: b.status || "",
            type: b.type || "room",
          } as Booking
        })
        .filter((b) => b.status === "مسجل دخول" || b.status === "مغادر")
      setBookings(bookingsData)
    } catch (err) {
      console.error("❌ خطأ:", err)
    } finally {
      setLoading(false)
    }
  }

  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
    return `INV-${year}${month}${day}-${random}`
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    const nights = calculateNights(booking.checkIn, booking.checkOut)
    const roomItem: InvoiceItem = {
      description: `إقامة - ${booking.roomName || booking.villaName}`,
      quantity: nights,
      unitPrice: booking.price,
      total: nights * booking.price,
      type: "إقامة",
    }
    setInvoiceItems([roomItem])
  }

  const addInvoiceItem = () => {
    if (!newItem.description) return
    const item = {
      ...newItem,
      total: newItem.quantity * newItem.unitPrice,
    }
    setInvoiceItems([...invoiceItems, item])
    setNewItem({ description: "", quantity: 1, unitPrice: 0, total: 0, type: "خدمات" })
  }

  const removeInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0)
    const discountAmount = invoiceForm.discount
    const taxAmount = ((subtotal - discountAmount) * invoiceForm.tax) / 100
    const total = subtotal - discountAmount + taxAmount
    const balance = total - invoiceForm.paid
    return { subtotal, discountAmount, taxAmount, total, balance }
  }

  const handleCreateInvoice = async () => {
    if (!selectedBooking || invoiceItems.length === 0) {
      alert("يرجى اختيار حجز وإضافة عناصر للفاتورة")
      return
    }

    const totals = calculateTotals()
    const nights = calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)

    const invoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      bookingId: selectedBooking.id,
      guestName: selectedBooking.fullName,
      guestPhone: selectedBooking.phone,
      nationalId: selectedBooking.nationalId || "",
      unitName: selectedBooking.roomName || selectedBooking.villaName || "—",
      unitType: selectedBooking.type,
      checkIn: selectedBooking.checkIn,
      checkOut: selectedBooking.checkOut,
      nights,
      roomRate: selectedBooking.price,
      subtotal: totals.subtotal,
      discount: invoiceForm.discount,
      tax: totals.taxAmount,
      total: totals.total,
      paid: invoiceForm.paid,
      balance: totals.balance,
      status: invoiceForm.paid >= totals.total ? "مدفوعة" : invoiceForm.paid > 0 ? "مدفوعة جزئياً" : "صادرة",
      paymentMethod: invoiceForm.paymentMethod,
      notes: invoiceForm.notes,
      items: invoiceItems,
      createdAt: serverTimestamp(),
    }

    try {
      await addDoc(collection(db, "invoices"), invoiceData)
      alert("✅ تم إنشاء الفاتورة بنجاح")
      setShowCreateModal(false)
      resetForm()
      fetchData()
    } catch (err) {
      console.error("❌ خطأ:", err)
      alert("حدث خطأ أثناء إنشاء الفاتورة")
    }
  }

  const handlePayment = async (invoice: Invoice, amount: number) => {
    const newPaid = invoice.paid + amount
    const newBalance = invoice.total - newPaid
    const newStatus = newBalance <= 0 ? "مدفوعة" : "مدفوعة جزئياً"

    try {
      await updateDoc(doc(db, "invoices", invoice.id), {
        paid: newPaid,
        balance: newBalance,
        status: newStatus,
      })
      fetchData()
      alert("✅ تم تسجيل الدفعة بنجاح")
    } catch (err) {
      console.error("❌ خطأ:", err)
    }
  }

  const resetForm = () => {
    setSelectedBooking(null)
    setInvoiceItems([])
    setInvoiceForm({ discount: 0, tax: 15, paymentMethod: "نقدي", notes: "", paid: 0 })
    setNewItem({ description: "", quantity: 1, unitPrice: 0, total: 0, type: "خدمات" })
  }

  const printInvoice = (invoice: Invoice) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; direction: rtl; }
          .header { text-align: center; border-bottom: 2px solid #C6A76D; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #2B2A28; margin: 0; font-size: 28px; }
          .header p { color: #7C7469; margin: 5px 0; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-info div { flex: 1; }
          .invoice-info label { color: #7C7469; font-size: 12px; }
          .invoice-info p { margin: 5px 0 15px; font-weight: bold; color: #2B2A28; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #F6F1E9; padding: 12px; text-align: right; border-bottom: 2px solid #E8E1D6; }
          td { padding: 12px; border-bottom: 1px solid #E8E1D6; }
          .totals { text-align: left; margin-top: 30px; }
          .totals table { width: 300px; margin-left: 0; }
          .totals td { padding: 8px 15px; }
          .totals .total-row { font-size: 18px; font-weight: bold; background: #C6A76D; color: white; }
          .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #E8E1D6; color: #7C7469; }
          .status { padding: 5px 15px; border-radius: 20px; font-size: 12px; }
          .status-paid { background: #DEF7EC; color: #03543F; }
          .status-pending { background: #FEF3C7; color: #92400E; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌙 Moon Garden</h1>
          <p>فاتورة ضريبية مبسطة</p>
        </div>
        
        <div class="invoice-info">
          <div>
            <label>رقم الفاتورة</label>
            <p>${invoice.invoiceNumber}</p>
            <label>التاريخ</label>
            <p>${invoice.createdAt}</p>
          </div>
          <div>
            <label>اسم النزيل</label>
            <p>${invoice.guestName}</p>
            <label>رقم الجوال</label>
            <p>${invoice.guestPhone}</p>
            ${invoice.nationalId ? `<label>رقم الهوية</label><p>${invoice.nationalId}</p>` : ""}
          </div>
          <div>
            <label>الوحدة</label>
            <p>${invoice.unitName}</p>
            <label>فترة الإقامة</label>
            <p>${invoice.checkIn} - ${invoice.checkOut}</p>
            <label>عدد الليالي</label>
            <p>${invoice.nights} ليلة</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>البيان</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.toLocaleString()} ر.س</td>
                <td>${item.total.toLocaleString()} ر.س</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr><td>المجموع الفرعي</td><td>${invoice.subtotal.toLocaleString()} ر.س</td></tr>
            ${invoice.discount > 0 ? `<tr><td>الخصم</td><td>-${invoice.discount.toLocaleString()} ر.س</td></tr>` : ""}
            <tr><td>ضريبة القيمة المضافة (15%)</td><td>${invoice.tax.toLocaleString()} ر.س</td></tr>
            <tr class="total-row"><td>الإجمالي</td><td>${invoice.total.toLocaleString()} ر.س</td></tr>
            <tr><td>المدفوع</td><td>${invoice.paid.toLocaleString()} ر.س</td></tr>
            <tr><td>المتبقي</td><td>${invoice.balance.toLocaleString()} ر.س</td></tr>
          </table>
        </div>

        <div class="footer">
          <p>شكراً لإقامتكم معنا - نتمنى لكم إقامة سعيدة</p>
          <p>Moon Garden Resort</p>
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.includes(searchQuery) ||
      inv.guestName.includes(searchQuery) ||
      inv.guestPhone.includes(searchQuery)
    const matchesStatus = filterStatus === "all" || inv.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "مدفوعة").length,
    pending: invoices.filter((i) => i.status === "صادرة" || i.status === "مدفوعة جزئياً").length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    paidAmount: invoices.reduce((sum, i) => sum + i.paid, 0),
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل الفواتير...</p>
      </div>
    )
  }

  return (
    <div className="text-right">
      {/* الهيدر */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#C6A76D] to-[#8B7355] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🧾</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2B2A28]">نظام الفواتير</h1>
            <p className="text-[#7C7469] text-sm">{invoices.length} فاتورة في النظام</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-l from-[#C6A76D] to-[#8B7355] text-white px-6 py-3 rounded-xl hover:shadow-lg transition flex items-center gap-2"
        >
          <span>➕</span> إنشاء فاتورة
        </button>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E8E1D6] p-4 text-center">
          <p className="text-2xl font-bold text-[#2B2A28]">{stats.total}</p>
          <p className="text-sm text-[#7C7469]">إجمالي الفواتير</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
          <p className="text-sm text-green-600">مدفوعة</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-yellow-600">معلقة</p>
        </div>
        <div className="bg-gradient-to-br from-[#C6A76D]/10 to-[#8B7355]/10 rounded-xl border border-[#C6A76D]/30 p-4 text-center">
          <p className="text-2xl font-bold text-[#C6A76D]">{stats.paidAmount.toLocaleString()}</p>
          <p className="text-sm text-[#8B7355]">المحصّل (ر.س)</p>
        </div>
      </div>

      {/* البحث والفلترة */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="🔍 ابحث برقم الفاتورة أو اسم النزيل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 rounded-xl border-2 border-[#E8E1D6] bg-white text-right focus:border-[#C6A76D] transition"
          />
        </div>
        <div className="flex gap-2">
          {["all", "مدفوعة", "صادرة", "مدفوعة جزئياً"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === s
                  ? "bg-[#C6A76D] text-white"
                  : "bg-white border border-[#E8E1D6] text-[#7C7469] hover:border-[#C6A76D]"
              }`}
            >
              {s === "all" ? "الكل" : s}
            </button>
          ))}
        </div>
      </div>

      {/* جدول الفواتير */}
      <div className="bg-white rounded-2xl border border-[#E8E1D6] overflow-hidden shadow-sm">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🧾</span>
            <p className="text-[#7C7469] text-lg">لا توجد فواتير</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-l from-[#FAF8F3] to-[#F6F1E9] border-b border-[#E8E1D6]">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-bold text-[#2B2A28]">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-[#2B2A28]">النزيل</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-[#2B2A28]">الوحدة</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-[#2B2A28]">الإجمالي</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-[#2B2A28]">المدفوع</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-[#2B2A28]">المتبقي</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-[#2B2A28]">الحالة</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-[#2B2A28]">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, idx) => (
                  <tr
                    key={invoice.id}
                    className={`border-b border-[#E8E1D6]/50 hover:bg-[#FAF8F3]/50 transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#FDFCFA]"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-[#C6A76D] font-medium">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#2B2A28]">{invoice.guestName}</p>
                      <p className="text-xs text-[#7C7469]">{invoice.guestPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-[#2B2A28]">{invoice.unitName}</td>
                    <td className="px-4 py-3 font-bold text-[#2B2A28]">{invoice.total.toLocaleString()} ر.س</td>
                    <td className="px-4 py-3 text-green-600">{invoice.paid.toLocaleString()} ر.س</td>
                    <td className="px-4 py-3 text-orange-600">{invoice.balance.toLocaleString()} ر.س</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          invoice.status === "مدفوعة"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "مدفوعة جزئياً"
                            ? "bg-yellow-100 text-yellow-700"
                            : invoice.status === "صادرة"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setShowViewModal(true)
                          }}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          title="عرض"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => printInvoice(invoice)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                          title="طباعة"
                        >
                          🖨️
                        </button>
                        {invoice.balance > 0 && (
                          <button
                            onClick={() => {
                              const amount = prompt("أدخل مبلغ الدفعة:")
                              if (amount) handlePayment(invoice, Number(amount))
                            }}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                            title="تسجيل دفعة"
                          >
                            💳
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal إنشاء فاتورة */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-l from-[#2B2A28] to-[#3D3A36] text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold">🧾 إنشاء فاتورة جديدة</h2>
            </div>

            <div className="p-6">
              {/* اختيار الحجز */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#2B2A28] mb-2">اختر الحجز:</label>
                <select
                  onChange={(e) => {
                    const booking = bookings.find((b) => b.id === e.target.value)
                    if (booking) handleSelectBooking(booking)
                  }}
                  className="w-full p-3 border-2 border-[#E8E1D6] rounded-xl focus:border-[#C6A76D]"
                >
                  <option value="">-- اختر حجز --</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} - {b.roomName || b.villaName} ({b.checkIn} إلى {b.checkOut})
                    </option>
                  ))}
                </select>
              </div>

              {selectedBooking && (
                <>
                  {/* معلومات النزيل */}
                  <div className="bg-[#FAF8F3] rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-[#7C7469]">النزيل:</span>
                        <p className="font-bold text-[#2B2A28]">{selectedBooking.fullName}</p>
                      </div>
                      <div>
                        <span className="text-[#7C7469]">الوحدة:</span>
                        <p className="font-bold text-[#2B2A28]">{selectedBooking.roomName || selectedBooking.villaName}</p>
                      </div>
                      <div>
                        <span className="text-[#7C7469]">الفترة:</span>
                        <p className="font-bold text-[#2B2A28]">{selectedBooking.checkIn} - {selectedBooking.checkOut}</p>
                      </div>
                    </div>
                  </div>

                  {/* عناصر الفاتورة */}
                  <div className="mb-6">
                    <h3 className="font-bold text-[#2B2A28] mb-3">عناصر الفاتورة:</h3>
                    <table className="w-full mb-4">
                      <thead className="bg-[#F6F1E9]">
                        <tr>
                          <th className="p-2 text-right text-sm">البيان</th>
                          <th className="p-2 text-right text-sm">النوع</th>
                          <th className="p-2 text-right text-sm">الكمية</th>
                          <th className="p-2 text-right text-sm">السعر</th>
                          <th className="p-2 text-right text-sm">الإجمالي</th>
                          <th className="p-2 text-center text-sm">حذف</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceItems.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2">{item.description}</td>
                            <td className="p-2">{item.type}</td>
                            <td className="p-2">{item.quantity}</td>
                            <td className="p-2">{item.unitPrice.toLocaleString()} ر.س</td>
                            <td className="p-2 font-bold">{item.total.toLocaleString()} ر.س</td>
                            <td className="p-2 text-center">
                              {idx > 0 && (
                                <button
                                  onClick={() => removeInvoiceItem(idx)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  🗑️
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* إضافة عنصر */}
                    <div className="grid grid-cols-5 gap-2 items-end">
                      <input
                        type="text"
                        placeholder="البيان"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        className="p-2 border rounded-lg"
                      />
                      <select
                        value={newItem.type}
                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                        className="p-2 border rounded-lg"
                      >
                        <option value="خدمات">خدمات</option>
                        <option value="مطعم">مطعم</option>
                        <option value="غسيل">غسيل</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                      <input
                        type="number"
                        placeholder="الكمية"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="السعر"
                        value={newItem.unitPrice}
                        onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                        className="p-2 border rounded-lg"
                      />
                      <button
                        onClick={addInvoiceItem}
                        className="p-2 bg-[#C6A76D] text-white rounded-lg hover:bg-[#8B7355]"
                      >
                        ➕
                      </button>
                    </div>
                  </div>

                  {/* الخصم والضريبة */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold mb-1">الخصم (ر.س)</label>
                      <input
                        type="number"
                        value={invoiceForm.discount}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: Number(e.target.value) })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">طريقة الدفع</label>
                      <select
                        value={invoiceForm.paymentMethod}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value as any })}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="نقدي">نقدي</option>
                        <option value="بطاقة">بطاقة ائتمان</option>
                        <option value="مدى">مدى</option>
                        <option value="تحويل">تحويل بنكي</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">المبلغ المدفوع</label>
                      <input
                        type="number"
                        value={invoiceForm.paid}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, paid: Number(e.target.value) })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  {/* الملخص */}
                  <div className="bg-gradient-to-br from-[#2B2A28] to-[#3D3A36] text-white rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span>المجموع الفرعي:</span>
                        <span>{calculateTotals().subtotal.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الخصم:</span>
                        <span>-{invoiceForm.discount.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ضريبة (15%):</span>
                        <span>{calculateTotals().taxAmount.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-[#C6A76D]">
                        <span>الإجمالي:</span>
                        <span>{calculateTotals().total.toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* الأزرار */}
              <div className="flex gap-4">
                <button
                  onClick={handleCreateInvoice}
                  disabled={!selectedBooking}
                  className="flex-1 bg-gradient-to-l from-green-500 to-green-600 text-white py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50"
                >
                  ✅ إنشاء الفاتورة
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal عرض الفاتورة */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-l from-[#2B2A28] to-[#3D3A36] text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">فاتورة {selectedInvoice.invoiceNumber}</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${
                selectedInvoice.status === "مدفوعة" ? "bg-green-500" : "bg-yellow-500"
              }`}>
                {selectedInvoice.status}
              </span>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[#7C7469] text-sm">النزيل</p>
                  <p className="font-bold text-lg">{selectedInvoice.guestName}</p>
                  <p className="text-[#7C7469]">{selectedInvoice.guestPhone}</p>
                </div>
                <div>
                  <p className="text-[#7C7469] text-sm">الوحدة</p>
                  <p className="font-bold text-lg">{selectedInvoice.unitName}</p>
                  <p className="text-[#7C7469]">{selectedInvoice.nights} ليلة</p>
                </div>
              </div>

              <table className="w-full mb-6">
                <thead className="bg-[#F6F1E9]">
                  <tr>
                    <th className="p-3 text-right">البيان</th>
                    <th className="p-3 text-right">الكمية</th>
                    <th className="p-3 text-right">السعر</th>
                    <th className="p-3 text-right">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">{item.unitPrice.toLocaleString()} ر.س</td>
                      <td className="p-3 font-bold">{item.total.toLocaleString()} ر.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-[#FAF8F3] rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span>{selectedInvoice.subtotal.toLocaleString()} ر.س</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم</span>
                    <span>-{selectedInvoice.discount.toLocaleString()} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>الضريبة (15%)</span>
                  <span>{selectedInvoice.tax.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>الإجمالي</span>
                  <span className="text-[#C6A76D]">{selectedInvoice.total.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>المدفوع</span>
                  <span>{selectedInvoice.paid.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-orange-600 font-bold">
                  <span>المتبقي</span>
                  <span>{selectedInvoice.balance.toLocaleString()} ر.س</span>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => printInvoice(selectedInvoice)}
                  className="flex-1 bg-[#2B2A28] text-white py-3 rounded-xl font-bold hover:bg-[#3D3A36]"
                >
                  🖨️ طباعة
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
