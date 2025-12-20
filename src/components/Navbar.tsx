import { Link } from "react-router-dom"
import FancySearch from "@/components/FancySearch"
export default function Navbar() {
  return (
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
          <nav aria-label="القائمة الرئيسية" className="flex items-center">
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

          <Link
            to="/admin"
            className="rounded-full px-4 py-2 text-sm font-medium bg-[#2B2A28] text-[var(--accent)] transition hover:opacity-90 border-2 border-transparent hover:border-[var(--accent)]"
          >
            دخول الإدارة
          </Link>
        </div>
      </div>

      {/* Search bar (compact) يظهر أسفل الشريط مباشرة */}
      <div className="relative">
        <FancySearch compact />
      </div>
    </header>
  )
}
