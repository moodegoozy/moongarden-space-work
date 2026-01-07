export default function MapSection() {
  return (
    <section id="location" className="w-full bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-right">موقع المنتجع</h3>
        <p className="text-gray-600 text-right mb-4 sm:mb-6 text-sm sm:text-base">مجمع حديقة القمر التجاري — جازان، المملكة العربية السعودية</p>

        <div className="w-full h-[280px] sm:h-[400px] rounded-xl overflow-hidden border border-[#E8E1D6]">
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
    </section>
  )
}
