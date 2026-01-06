// src/pages/ContactUs.tsx
// صفحة تواصل معنا
import { Link } from "react-router-dom"

export default function ContactUs() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F6F1E9] text-[#2B2A28]">
      {/* الهيدر */}
      <section className="relative bg-[#2B2A28] text-[#FAF8F3] py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">تواصل معنا</h1>
        <p className="text-[#E1DCCE] text-lg max-w-2xl mx-auto">
          نسعد بتواصلكم معنا في أي وقت
        </p>
      </section>

      {/* المحتوى الرئيسي */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10">
          {/* معلومات الاتصال */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E8E1D6] space-y-6">
            <h2 className="text-2xl font-bold text-[#2B2A28] border-b border-[#E8E1D6] pb-4">
              معلومات التواصل
            </h2>

            {/* الاسم التجاري */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#C6A76D]/20 rounded-xl flex items-center justify-center text-2xl">
                🏨
              </div>
              <div>
                <p className="text-sm text-[#7C7469]">الاسم التجاري</p>
                <p className="font-bold text-lg text-[#2B2A28]">منتجع حديقة القمر</p>
              </div>
            </div>

            {/* المدينة */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#C6A76D]/20 rounded-xl flex items-center justify-center text-2xl">
                📍
              </div>
              <div>
                <p className="text-sm text-[#7C7469]">الموقع</p>
                <p className="font-bold text-lg text-[#2B2A28]">جازان، المملكة العربية السعودية</p>
              </div>
            </div>

            {/* رقم الهاتف */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#C6A76D]/20 rounded-xl flex items-center justify-center text-2xl">
                📱
              </div>
              <div>
                <p className="text-sm text-[#7C7469]">رقم الهاتف</p>
                <a 
                  href="tel:+966573878878" 
                  className="font-bold text-lg text-[#2B2A28] hover:text-[#C6A76D] transition"
                  dir="ltr"
                >
                  0573878878
                </a>
              </div>
            </div>

            {/* أزرار التواصل */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a
                href="tel:+966573878878"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#2B2A28] text-white rounded-xl hover:bg-[#3d3c3a] transition text-center"
              >
                <span>📞</span>
                <span>اتصل الآن</span>
              </a>
              <a
                href="https://wa.me/966573878878"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl hover:bg-[#1da851] transition text-center"
              >
                <span>💬</span>
                <span>واتساب</span>
              </a>
            </div>
          </div>

          {/* خريطة Google */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-[#E8E1D6]">
            <div className="p-4 border-b border-[#E8E1D6]">
              <h2 className="text-xl font-bold text-[#2B2A28]">📍 موقعنا على الخريطة</h2>
            </div>
            <div className="h-[350px]">
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
        </div>

        {/* زر العودة */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-[#2B2A28] text-[#FAF8F3] rounded-full text-sm hover:opacity-90 transition"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </section>
    </div>
  )
}
