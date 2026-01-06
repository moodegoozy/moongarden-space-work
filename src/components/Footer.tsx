import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E8E1D6] bg-[#FAF8F3]">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* قسم تواصل معنا + الخريطة */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* معلومات الاتصال */}
          <div className="text-right space-y-4">
            <h3 className="text-xl font-bold text-[#2B2A28] flex items-center gap-2 justify-end">
              تواصل معنا
              <span>📞</span>
            </h3>
            <div className="space-y-3 text-[#7C7469]">
              <p className="flex items-center gap-2 justify-end">
                <span className="font-semibold text-[#2B2A28]">منتجع حديقة القمر</span>
                <span>🏨</span>
              </p>
              <p className="flex items-center gap-2 justify-end">
                <span>جازان، المملكة العربية السعودية</span>
                <span>📍</span>
              </p>
              <a 
                href="tel:+966573878878" 
                className="flex items-center gap-2 justify-end hover:text-[#C6A76D] transition"
              >
                <span dir="ltr">0573878878</span>
                <span>📱</span>
              </a>
              <a 
                href="https://wa.me/966573878878" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm hover:bg-[#1da851] transition"
              >
                تواصل عبر واتساب
                <span>💬</span>
              </a>
            </div>
          </div>

          {/* خريطة Google */}
          <div className="rounded-2xl overflow-hidden border border-[#E8E1D6] shadow-sm h-[250px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3789.5!2d42.55!3d16.89!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDUzJzI0LjAiTiA0MsKwMzMnMDAuMCJF!5e0!3m2!1sar!2ssa!4v1704067200000!5m2!1sar!2ssa"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="موقع منتجع حديقة القمر"
            ></iframe>
          </div>
        </div>

        {/* الخط الفاصل */}
        <div className="border-t border-[#E8E1D6] pt-6">
          <div className="flex flex-col items-center gap-4 text-center text-xs sm:text-sm text-[#7C7469]">
            {/* الروابط */}
            <ul className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              <li className="hover:text-[#2B2A28] cursor-pointer transition">سياسة الخصوصية</li>
              <li className="hover:text-[#2B2A28] cursor-pointer transition">الشروط والأحكام</li>
              <li>
                <Link to="/contact" className="hover:text-[#2B2A28] transition">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link to="/review" className="hover:text-[#2B2A28] transition">
                  آراء العملاء
                </Link>
              </li>
            </ul>
            {/* حقوق النشر */}
            <p className="text-[10px] sm:text-xs">© {new Date().getFullYear()} منتجع حديقة القمر — جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
