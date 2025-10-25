import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-30 bg-white shadow-md">
      <div className="w-full flex items-center justify-between h-40 px-8">
        
        {/* ✅ التبويبات (يسار) */}
        <nav className="flex items-center">
          <ul className="flex gap-10 font-medium text-lg">
            <li>
              <Link to="/rooms" className="text-black hover:text-blue-800 transition">
                الغرف الفندقية
              </Link>
            </li>
            <li>
              <Link to="/villas" className="text-black hover:text-blue-800 transition">
                الفلل والأجنحة الفندقية
              </Link>
            </li>
            <li>
              <Link to="/services" className="text-black hover:text-blue-800 transition">
                المرافق والخدمات
              </Link>
            </li>
          </ul>
        </nav>

        {/* ✅ النص + الشعار (وسط) */}
        <Link to="/" className="flex items-center gap-1">
          <img
            src="/logo-text.png"
            alt="Moon Garden Text"
            className="h-[300px] object-contain"
          />
          <img
            src="/logo.png"
            alt="Moon Garden Logo"
            className="h-[160px] w-auto object-contain"
          />
        </Link>

        {/* ✅ دخول الإدارة (يمين) */}
        <div className="flex items-center">
          <Link
            to="/admin"
            className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            دخول الإدارة
          </Link>
        </div>
      </div>
    </header>
  )
}
