import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E8E1D6] bg-[#FAF8F3]">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 text-xs sm:text-sm text-[#7C7469]">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* الروابط */}
          <ul className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <li className="hover:text-[#2B2A28] cursor-pointer transition">سياسة الخصوصية</li>
            <li className="hover:text-[#2B2A28] cursor-pointer transition">الشروط والأحكام</li>
            <li className="hover:text-[#2B2A28] cursor-pointer transition">تواصل معنا</li>
            <li>
              <Link to="/review" className="hover:text-[#2B2A28] transition">
                آراء العملاء
              </Link>
            </li>
          </ul>
          {/* حقوق النشر */}
          <p className="text-[10px] sm:text-xs">© {new Date().getFullYear()} Moon Garden — جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  )
}
