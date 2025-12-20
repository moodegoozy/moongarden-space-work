import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <>
    <header className="fixed inset-x-0 top-0 z-30 border-b border-black/5 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto grid h-20 max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-6 px-6 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center justify-self-start">
          <img
            src="/logo.png"
            alt="Moon Garden Logo"
            className="h-10 w-auto object-contain lg:h-12"
          />
        </Link>

        <Link to="/" className="flex items-center justify-self-center">
          <img
            src="/logo-text.png"
            alt="Moon Garden Text"
            className="h-7 w-auto object-contain lg:h-8"
          />
        </Link>

        <div className="flex items-center justify-self-end gap-6">
          {/* قائمة سطح المكتب */}
          <nav aria-label="القائمة الرئيسية" className="hidden md:flex items-center">
            <ul className="flex items-center gap-6 text-sm font-medium text-[#2B2A28]">
              <li>
                <Link to="/rooms" className="transition hover:text-[var(--accent)] hover:underline">
                  الغرف الفندقية
                </Link>
              </li>
              <li>
                <Link to="/villas" className="transition hover:text-[var(--accent)] hover:underline">
                  الفلل والأجنحة الفندقية
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition hover:text-[var(--accent)] hover:underline">
                  المرافق والخدمات
                </Link>
              </li>
            </ul>
          </nav>

          {/* قائمة الجوال */}
          <div className="md:hidden relative">
            <details className="relative">
              <summary className="list-none cursor-pointer px-3 py-2 rounded-lg bg-[#E8E1D6] text-[#2B2A28] font-bold flex items-center gap-2 shadow-sm">
                القائمة
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </summary>
              <div className="absolute left-0 mt-2 w-48 bg-white border border-[#E8E1D6] rounded-lg shadow-lg z-50 text-right">
                <Link to="/rooms" className="block px-4 py-3 hover:bg-[#F6F1E9]">الغرف الفندقية</Link>
                <Link to="/villas" className="block px-4 py-3 hover:bg-[#F6F1E9]">الفلل والأجنحة الفندقية</Link>
                <Link to="/services" className="block px-4 py-3 hover:bg-[#F6F1E9]">المرافق والخدمات</Link>
                <Link to="/admin" className="block px-4 py-3 hover:bg-[#F6F1E9]">دخول الإدارة</Link>
              </div>
            </details>
          </div>

          {/* زر دخول الإدارة لسطح المكتب */}
          <Link
            to="/admin"
            className="hidden md:inline rounded-full px-4 py-2 text-sm font-medium bg-[#2B2A28] text-[var(--accent)] transition hover:opacity-90 border-2 border-transparent hover:border-[var(--accent)]"
          >
            دخول الإدارة
          </Link>
        </div>
      </div>

      {/* Search bar (compact) — moved outside header to avoid stacking-context click issues */}
    </header>
    <div className="relative">

    </div>
    </>
  )
}
