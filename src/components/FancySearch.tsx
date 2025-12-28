import { useEffect, useMemo, useState } from "react"
import Flatpickr from "react-flatpickr"
import "flatpickr/dist/flatpickr.min.css"
import { useNavigate } from "react-router-dom"
import { db } from "@/firebase"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"

export default function FancySearch({ compact = false }: { compact?: boolean }) {
  const [searchText, setSearchText] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [type, setType] = useState("all")
  const [minPrice, setMinPrice] = useState<number | "">("")
  const [maxPrice, setMaxPrice] = useState<number | "">("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSug, setLoadingSug] = useState(false)

  const navigate = useNavigate()

  // جلب اقتراحات أسماء الوحدات وأيضًا حدود السعر (لتعبئة الـ slider إن رغبت لاحقًا)
  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      setLoadingSug(true)
      try {
        const roomsSnap = await getDocs(collection(db, "rooms"))
        const villasSnap = await getDocs(collection(db, "villas"))
        const names = new Set<string>()
        const prices: number[] = []

        roomsSnap.docs.forEach((d) => {
          const data = d.data() as any
          if (data.name) names.add(data.name)
          if (data.price) prices.push(Number(data.price))
        })
        villasSnap.docs.forEach((d) => {
          const data = d.data() as any
          if (data.name) names.add(data.name)
          if (data.price) prices.push(Number(data.price))
        })

        if (!mounted) return
        setSuggestions(Array.from(names).slice(0, 8))
        if (prices.length) {
          const min = Math.min(...prices)
          const max = Math.max(...prices)
          setMinPrice(min)
          setMaxPrice(max)
        }
      } catch (err) {
        console.error("خطأ بجلب الاقتراحات:", err)
      } finally {
        if (mounted) setLoadingSug(false)
      }
    }
    fetch()
    return () => {
      mounted = false
    }
  }, [])

  const filteredSuggestions = useMemo(() => {
    if (!searchText) return suggestions
    return suggestions.filter((s) => s.includes(searchText))
  }, [searchText, suggestions])

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert("الرجاء تحديد تاريخ الوصول والمغادرة")
      return
    }

    // نمرر كل الفلاتر في رابط البحث
    const params = new URLSearchParams()
    params.set("checkIn", checkIn)
    params.set("checkOut", checkOut)
    params.set("guests", String(guests || 1))
    params.set("type", type)
    // إضافات: تفصيل النزلاء
    params.set("adults", String(adults))
    params.set("children", String(children))
    params.set("rooms", String(roomsCount))

    if (searchText) params.set("q", searchText)
    if (minPrice !== "") params.set("minPrice", String(minPrice))
    if (maxPrice !== "") params.set("maxPrice", String(maxPrice))

    navigate(`/search?${params.toString()}`)
  }

  // تنسيقات مساعدة
  const formatDateDisplay = (d: string) => {
    try {
      const date = new Date(d)
      return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    } catch (e) {
      return ""
    }
  }

  // تفصيل النزلاء
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [roomsCount, setRoomsCount] = useState(1)
  const [guestOpen, setGuestOpen] = useState(false)

  // إغلاق لوحة النزلاء عند النقر خارجها
  useEffect(() => {
    function onDocClick(e: any) {
      const el = document.getElementById("fancy-guest-pop")
      if (!el) return
      if (!el.contains(e.target as Node) && !(e.target as HTMLElement).closest("#fancy-guest-btn")) {
        setGuestOpen(false)
      }
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [])

  const guestSummary = `${adults} Adult${children ? `, ${children} Child` : ""}, ${roomsCount} Room${roomsCount > 1 ? "s" : ""}`

  const [dateOpen, setDateOpen] = useState(false)

  // ensure checkOut is after checkIn
  useEffect(() => {
    if (checkIn && checkOut) {
      const a = new Date(checkIn)
      const b = new Date(checkOut)
      if (a >= b) {
        const next = new Date(a)
        next.setDate(next.getDate() + 1)
        setCheckOut(next.toISOString().slice(0, 10))
      }
    }
  }, [checkIn, checkOut])

  // click outside to close date popover
  useEffect(() => {
    function onDocClick(e: any) {
      const el = document.getElementById("fancy-date-pop")
      if (!el) return
      if (!el.contains(e.target as Node) && !(e.target as HTMLElement).closest("#fancy-date-btn")) {
        setDateOpen(false)
      }
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [])

  if (compact) {
    return (
      <div className="absolute left-0 right-0 top-full flex justify-center z-50 pointer-events-auto">
        <div className="max-w-6xl px-4">
          <div className="bg-black/85 text-white rounded-md shadow p-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5 cursor-pointer" id="fancy-guest-btn" onClick={() => setGuestOpen((s) => !s)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8 8 0 1116.88 6.196" />
              </svg>
              <div className="text-xs text-right">
                <div className="text-[11px] opacity-80">Guests</div>
                <div className="text-sm font-medium">{guestSummary}</div>
              </div>
            </div>

            <div className="w-px h-6 bg-white/20 hidden sm:block" />

            {/* desktop: clickable date areas that open popover; mobile: show inline date inputs */}
            <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5 cursor-pointer w-full sm:w-auto" id="fancy-date-btn" onClick={() => setDateOpen((s) => !s)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-xs text-right">
                <div className="text-[11px] opacity-80">Check-in</div>
                <div className="text-sm font-medium">{checkIn ? formatDateDisplay(checkIn) : "Add date"}</div>
              </div>

              <div className="mx-2 hidden sm:block w-px h-6 bg-white/20" />

              <div className="text-xs text-right hidden sm:block">
                <div className="text-[11px] opacity-80">Check-out</div>
                <div className="text-sm font-medium">{checkOut ? formatDateDisplay(checkOut) : "Add date"}</div>
              </div>

              {/* inline inputs (always visible in compact for reliability) */}
              <div className="flex gap-2 w-full items-center">
                <div className="w-36 sm:w-40">
                  <Flatpickr
                    value={checkIn || null}
                    options={{
                      dateFormat: "Y-m-d",
                      minDate: new Date().toISOString().slice(0, 10),
                      allowInput: true,
                    }}
                    onChange={(dates: Date[]) => {
                      const d = dates && dates[0] ? dates[0] : null
                      setCheckIn(d ? d.toISOString().slice(0, 10) : "")
                    }}
                    className="p-2 rounded bg-white text-black w-full"
                  />
                </div>
                <div className="w-36 sm:w-40">
                  <Flatpickr
                    value={checkOut || null}
                    options={{
                      dateFormat: "Y-m-d",
                      minDate: checkIn || new Date().toISOString().slice(0, 10),
                      allowInput: true,
                    }}
                    onChange={(dates: Date[]) => {
                      const d = dates && dates[0] ? dates[0] : null
                      setCheckOut(d ? d.toISOString().slice(0, 10) : "")
                    }}
                    className="p-2 rounded bg-white text-black w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1" />

            <button onClick={handleSearch} className="bg-[#b59d70] text-black px-6 py-2 rounded font-medium">Search</button>
          </div>

          {/* date popover for desktop */}
          {dateOpen && (
            <div id="fancy-date-pop" className="absolute right-10 mt-2 bg-white rounded-lg shadow-lg p-4 text-right z-50 w-80">
              <div className="mb-2 text-sm font-medium">اختر التواريخ</div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-600">تاريخ الوصول</label>
                <input type="date" value={checkIn} min={new Date().toISOString().slice(0,10)} onChange={(e)=>setCheckIn(e.target.value)} className="border rounded p-2" />
                <label className="text-xs text-gray-600">تاريخ المغادرة</label>
                <input type="date" value={checkOut} min={checkIn || new Date().toISOString().slice(0,10)} onChange={(e)=>setCheckOut(e.target.value)} className="border rounded p-2" />

                <div className="flex justify-between mt-3">
                  <button onClick={()=>{setDateOpen(false)}} className="text-sm text-gray-600">إلغاء</button>
                  <button onClick={()=>{setDateOpen(false)}} className="bg-[#2B2A28] text-white px-4 py-2 rounded">تطبيق</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto -mt-16 relative z-40 px-4">
      <div className="bg-black/80 backdrop-blur-sm rounded-3xl shadow-2xl p-3 flex items-center gap-4 text-white">
        {/* Guests */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 transition cursor-pointer text-right" id="fancy-guest-btn" onClick={() => setGuestOpen((s) => !s)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8 8 0 1116.88 6.196" />
          </svg>
          <div className="text-sm text-right">
            <div className="text-xs opacity-80">Guest or Rooms</div>
            <div className="font-medium">{guestSummary}</div>
          </div>
        </div>

        <div className="w-px h-8 bg-white/20" />

        {/* Check-in */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 transition text-right">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-sm text-right">
            <div className="text-xs opacity-80">Check-in</div>
            <div className="font-medium">{checkIn ? formatDateDisplay(checkIn) : "Add date"}</div>
          </div>
        </div>

        <div className="w-px h-8 bg-white/20" />

        {/* Check-out */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 transition text-right">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-sm text-right">
            <div className="text-xs opacity-80">Check-out</div>
            <div className="font-medium">{checkOut ? formatDateDisplay(checkOut) : "Add date"}</div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Search button */}
        <button onClick={handleSearch} className="bg-[#b59d70] text-black px-8 py-3 rounded-md font-semibold hover:opacity-90 transition">Search</button>
      </div>

      {/* guest popover */}
      {guestOpen && (
        <div id="fancy-guest-pop" className="absolute mt-2 right-6 bg-white rounded-lg shadow-lg p-4 text-right z-50 w-72">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium">النزلاء</div>
              <div className="text-xs text-gray-500">اختر عدد البالغين والأطفال والغرف</div>
            </div>
            <div className="text-sm font-medium">{guestSummary}</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">بالغين</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAdults((s) => Math.max(1, s - 1))} className="w-8 h-8 rounded-full border">-</button>
                <div className="w-6 text-center">{adults}</div>
                <button onClick={() => setAdults((s) => s + 1)} className="w-8 h-8 rounded-full border">+</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">أطفال</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setChildren((s) => Math.max(0, s - 1))} className="w-8 h-8 rounded-full border">-</button>
                <div className="w-6 text-center">{children}</div>
                <button onClick={() => setChildren((s) => s + 1)} className="w-8 h-8 rounded-full border">+</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">الغرف</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setRoomsCount((s) => Math.max(1, s - 1))} className="w-8 h-8 rounded-full border">-</button>
                <div className="w-6 text-center">{roomsCount}</div>
                <button onClick={() => setRoomsCount((s) => s + 1)} className="w-8 h-8 rounded-full border">+</button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <button onClick={() => { setAdults(1); setChildren(0); setRoomsCount(1); setGuestOpen(false); }} className="text-sm text-gray-600">إعادة</button>
            <button onClick={() => { setGuestOpen(false); }} className="bg-[#2B2A28] text-white px-4 py-2 rounded">تطبيق</button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-300 mt-2 text-right">يوفر نفس تجربة شريط البحث الفندقي، مع تحقق التوافر عند البحث.</p>
    </div>
  )
}
