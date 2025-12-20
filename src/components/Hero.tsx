export default function Hero() {
  return (
    <section
      className="relative h-[65vh] min-h-[400px] w-full"
      style={{
        backgroundImage: "url('/banner-fixed.png')", // ✨ حط صورة البانر هنا
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ✅ Overlay للتعتيم */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ✅ المحتوى */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 h-full flex items-center">
        <div className="text-white text-center md:text-right w-full">
          <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg leading-snug golden-banner-title">
            إقامة فاخرة في قلب فندق ومنتجع حديقة القمر
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-100 max-w-2xl mx-auto md:mx-0">
            استكشف أجنحة وغرفًا أنيقة، خدمات راقية، وتجربة ضيافة لا تُنسى
          </p>
          <button className="mt-6 rounded-xl bg-blue-700 hover:bg-blue-800 px-8 py-3 text-white font-semibold shadow-lg transition">
            استكشف العروض
          </button>
        </div>
      </div>
    </section>
  )
}
