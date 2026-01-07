// src/pages/ContactUs.tsx
// صفحة تواصل معنا
import { Link } from "react-router-dom"

export default function ContactUs() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F6F1E9] text-[#2B2A28]">
      {/* الهيدر */}
      <section className="relative bg-[#2B2A28] text-[#FAF8F3] py-12 sm:py-20 text-center px-4">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">تواصل معنا</h1>
        <p className="text-[#E1DCCE] text-sm sm:text-lg max-w-2xl mx-auto">
          نسعد بتواصلكم معنا في أي وقت
        </p>
      </section>

      {/* المحتوى الرئيسي */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
          {/* معلومات الاتصال */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-[#E8E1D6] space-y-5 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2B2A28] border-b border-[#E8E1D6] pb-3 sm:pb-4">
              معلومات التواصل
            </h2>

            {/* الاسم التجاري */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6A76D]/20 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                🏨
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#7C7469]">الاسم التجاري</p>
                <p className="font-bold text-base sm:text-lg text-[#2B2A28]">منتجع حديقة القمر</p>
              </div>
            </div>

            {/* المدينة */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6A76D]/20 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                📍
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#7C7469]">الموقع</p>
                <p className="font-bold text-base sm:text-lg text-[#2B2A28]">جازان، المملكة العربية السعودية</p>
              </div>
            </div>

            {/* رقم الهاتف */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6A76D]/20 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                📱
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#7C7469]">رقم الهاتف</p>
                <a 
                  href="tel:+966573878878" 
                  className="font-bold text-base sm:text-lg text-[#2B2A28] hover:text-[#C6A76D] transition"
                  dir="ltr"
                >
                  0573878878
                </a>
              </div>
            </div>

            {/* أزرار التواصل */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 sm:pt-4">
              <a
                href="tel:+966573878878"
                className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2B2A28] text-white rounded-xl hover:bg-[#3d3c3a] transition text-center text-sm sm:text-base"
              >
                <span>📞</span>
                <span>اتصل الآن</span>
              </a>
              <a
                href="https://wa.me/966573878878"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#25D366] text-white rounded-xl hover:bg-[#1da851] transition text-center text-sm sm:text-base"
              >
                <span>💬</span>
                <span>واتساب</span>
              </a>
            </div>
          </div>

          {/* خريطة Google */}
          <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-[#E8E1D6]">
            <div className="p-3 sm:p-4 border-b border-[#E8E1D6]">
              <h2 className="text-lg sm:text-xl font-bold text-[#2B2A28]">📍 موقعنا على الخريطة</h2>
            </div>
            <div className="h-[280px] sm:h-[350px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15240.491534853842!2d42.61405165222697!3d17.261288869387876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15fd4dc6a734e53d%3A0xd4d6110cb5c2ccea!2z2YXYrNmF2Lkg2K3Yr9mK2YLYqSDYp9mE2YLZhdixINin2YTYqtis2KfYsdmKIE1PT04gR0FSREVOIEhPVEVMICYgUkVTSURFTkNF!5e0!3m2!1sar!2ssa!4v1767744838637!5m2!1sar!2ssa"
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
        </div>

        {/* زر العودة */}
        <div className="text-center mt-8 sm:mt-12">
          <Link
            to="/"
            className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-[#2B2A28] text-[#FAF8F3] rounded-full text-sm hover:opacity-90 transition"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </section>
    </div>
  )
}
