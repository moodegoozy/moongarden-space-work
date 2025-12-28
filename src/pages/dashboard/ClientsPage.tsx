import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"
import Pagination, { paginateData } from "@/components/Pagination"

type Client = {
  id: string
  fullName: string
  phone: string
  email?: string
  bookingsCount: number
  lastBooking?: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const bookingsSnap = await getDocs(collection(db, "bookings"))
        const clientsMap = new Map<string, Client>()

        bookingsSnap.docs.forEach((doc) => {
          const b = doc.data() as any
          const phone = b.phone || "غير معروف"
          
          if (clientsMap.has(phone)) {
            const existing = clientsMap.get(phone)!
            existing.bookingsCount += 1
            if (b.createdAt) {
              existing.lastBooking = b.createdAt?.toDate?.()?.toLocaleDateString("ar-SA") || existing.lastBooking
            }
          } else {
            clientsMap.set(phone, {
              id: doc.id,
              fullName: b.fullName || "—",
              phone,
              email: b.email,
              bookingsCount: 1,
              lastBooking: b.createdAt?.toDate?.()?.toLocaleDateString("ar-SA"),
            })
          }
        })

        setClients(Array.from(clientsMap.values()))
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل العملاء:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#7C7469]">جاري تحميل العملاء...</p>
      </div>
    )

  return (
    <div className="text-right">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#42A5F5] to-[#1976D2] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">👥</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2B2A28]">العملاء</h2>
            <p className="text-sm text-[#7C7469]">{clients.length} عميل مسجل</p>
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF8F3] rounded-2xl border border-[#E8E1D6]">
          <span className="text-5xl mb-4 block">👥</span>
          <p className="text-[#7C7469] text-lg">لا يوجد عملاء بعد</p>
          <p className="text-sm text-[#A48E78] mt-2">سيظهر العملاء هنا بعد أول حجز</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginateData(clients, currentPage, itemsPerPage).map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-2xl shadow-lg border border-[#E8E1D6] p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#C6A76D]/20 to-[#A48E78]/20 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[#2B2A28]">{client.fullName}</h3>
                  <p className="text-[#7C7469] text-sm">{client.phone}</p>
                  {client.email && (
                    <p className="text-[#7C7469] text-sm">{client.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E8E1D6] flex justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#C6A76D]">{client.bookingsCount}</p>
                  <p className="text-xs text-[#7C7469]">حجوزات</p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-[#7C7469]">آخر حجز</p>
                  <p className="text-sm font-medium text-[#2B2A28]">{client.lastBooking || "—"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination
        currentPage={currentPage}
        totalItems={clients.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
