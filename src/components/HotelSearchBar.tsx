import React, { useState } from "react";

const today = new Date().toISOString().split("T")[0];

const HotelSearchBar: React.FC = () => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.append("checkIn", checkIn);
    if (checkOut) params.append("checkOut", checkOut);
    params.append("adults", adults.toString());
    params.append("children", children.toString());
    if (query.trim()) params.append("q", query);
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-[#FAF8F3]/95 rounded-2xl shadow-xl p-4 sm:p-5 max-w-3xl mx-auto border-2 border-[var(--accent,#C6A76D)] backdrop-blur"
      style={{ fontFamily: "'Noto Naskh Arabic','Playfair Display',serif" }}
    >
      {/* الصف الأول: التواريخ */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex flex-col">
          <label className="text-[10px] sm:text-xs mb-1 font-semibold text-[#A48E78]">تاريخ الوصول</label>
          <input
            type="date"
            className="border-2 border-[#E8E1D6] rounded-lg px-2 py-2 sm:py-1.5 text-sm focus:border-[var(--accent,#C6A76D)] focus:ring-2 focus:ring-[var(--accent,#C6A76D)] transition w-full"
            min={today}
            value={checkIn}
            onChange={e => setCheckIn(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] sm:text-xs mb-1 font-semibold text-[#A48E78]">تاريخ المغادرة</label>
          <input
            type="date"
            className="border-2 border-[#E8E1D6] rounded-lg px-2 py-2 sm:py-1.5 text-sm focus:border-[var(--accent,#C6A76D)] focus:ring-2 focus:ring-[var(--accent,#C6A76D)] transition w-full"
            min={checkIn || today}
            value={checkOut}
            onChange={e => setCheckOut(e.target.value)}
            required
          />
        </div>
      </div>

      {/* الصف الثاني: عدد النزلاء */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex flex-col">
          <label className="text-[10px] sm:text-xs mb-1 font-semibold text-[#A48E78]">البالغين</label>
          <input
            type="number"
            className="border-2 border-[#E8E1D6] rounded-lg px-2 py-2 sm:py-1.5 text-sm focus:border-[var(--accent,#C6A76D)] focus:ring-2 focus:ring-[var(--accent,#C6A76D)] transition w-full"
            min={1}
            max={10}
            value={adults}
            onChange={e => setAdults(Number(e.target.value))}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] sm:text-xs mb-1 font-semibold text-[#A48E78]">الأطفال</label>
          <input
            type="number"
            className="border-2 border-[#E8E1D6] rounded-lg px-2 py-2 sm:py-1.5 text-sm focus:border-[var(--accent,#C6A76D)] focus:ring-2 focus:ring-[var(--accent,#C6A76D)] transition w-full"
            min={0}
            max={10}
            value={children}
            onChange={e => setChildren(Number(e.target.value))}
          />
        </div>
      </div>

      {/* الصف الثالث: البحث النصي */}
      <div className="flex flex-col mb-4">
        <label className="text-[10px] sm:text-xs mb-1 font-semibold text-[#A48E78]">بحث نصي (اختياري)</label>
        <input
          type="text"
          className="border-2 border-[#E8E1D6] rounded-lg px-3 py-2 sm:py-1.5 text-sm focus:border-[var(--accent,#C6A76D)] focus:ring-2 focus:ring-[var(--accent,#C6A76D)] transition w-full"
          placeholder="مثال: اطلالة بحرية"
          value={query}
          onChange={e => setQuery(e.target.value)}
          dir="auto"
        />
      </div>

      {/* زر البحث */}
      <button
        type="submit"
        className="w-full bg-gradient-to-l from-[#C6A76D] to-[#A48E78] text-white rounded-full px-6 py-3 font-bold shadow-md hover:opacity-90 transition-colors text-base sm:text-lg tracking-wide"
        style={{letterSpacing: '0.04em'}}
      >
        🔍 بحث عن التوفر
      </button>
    </form>
  );
};

export default HotelSearchBar;
