import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-600">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MoonGarden — جميع الحقوق محفوظة</p>
          <ul className="flex items-center gap-4">
            <li className="hover:text-blue-800 cursor-pointer">سياسة الخصوصية</li>
            <li className="hover:text-blue-800 cursor-pointer">الشروط والأحكام</li>
            <li className="hover:text-blue-800 cursor-pointer">تواصل معنا</li>
            <li>
              <Link
                to="/review"
                className="hover:text-blue-800 transition-colors"
              >
                آراء العملاء
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
