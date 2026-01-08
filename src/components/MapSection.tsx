import { useState, useCallback, useEffect } from "react"

export default function MapSection() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [key, setKey] = useState(0) // لإعادة تحميل الـ iframe
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    setRetryCount(0)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  // إعادة المحاولة التلقائية عند الفشل
  useEffect(() => {
    if (hasError && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setIsLoading(true)
        setHasError(false)
        setRetryCount(prev => prev + 1)
        setKey(prev => prev + 1)
      }, 2000) // انتظار 2 ثانية قبل إعادة المحاولة
      return () => clearTimeout(timer)
    }
  }, [hasError, retryCount])

  const handleManualRetry = useCallback(() => {
    setIsLoading(true)
    setHasError(false)
    setRetryCount(0)
    setKey(prev => prev + 1)
  }, [])

  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15240.491534853842!2d42.61405165222697!3d17.261288869387876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15fd4dc6a734e53d%3A0xd4d6110cb5c2ccea!2z2YXYrNmF2Lkg2K3Yr9mK2YLYqSDYp9mE2YLZhdixINin2YTYqtis2KfYsdmKIE1PT04gR0FSREVOIEhPVEVMICYgUkVTSURFTkNF!5e0!3m2!1sar!2ssa!4v1767744838637!5m2!1sar!2ssa"

  return (
    <section id="location" className="w-full bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-right">موقع المنتجع</h3>
        <p className="text-gray-600 text-right mb-4 sm:mb-6 text-sm sm:text-base">مجمع حديقة القمر التجاري — جازان، المملكة العربية السعودية</p>

        <div className="w-full h-[280px] sm:h-[400px] rounded-xl overflow-hidden border border-[#E8E1D6] relative bg-gray-100">
          {/* مؤشر التحميل */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-[#7C7469] text-sm">جاري تحميل الخريطة...</p>
              </div>
            </div>
          )}

          {/* رسالة إعادة المحاولة التلقائية */}
          {hasError && retryCount < maxRetries && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center p-4">
                <div className="w-10 h-10 border-4 border-[#C6A76D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-[#7C7469] text-sm">إعادة المحاولة... ({retryCount + 1}/{maxRetries})</p>
              </div>
            </div>
          )}

          {/* رسالة الخطأ النهائية بعد استنفاد المحاولات */}
          {hasError && retryCount >= maxRetries && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center p-4">
                <div className="text-4xl mb-3">🗺️</div>
                <p className="text-[#7C7469] text-sm mb-4">تعذر تحميل الخريطة</p>
                <button
                  onClick={handleManualRetry}
                  className="px-4 py-2 bg-[#2B2A28] text-white text-sm rounded-lg hover:bg-[#3D3A36] transition"
                >
                  إعادة المحاولة
                </button>
                <a
                  href="https://maps.google.com/?q=17.261288869387876,42.61405165222697"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3 text-[#C6A76D] text-sm hover:underline"
                >
                  فتح في خرائط جوجل ↗
                </a>
              </div>
            </div>
          )}

          <iframe
            key={key}
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="موقع منتجع حديقة القمر"
            onLoad={handleLoad}
            onError={handleError}
          ></iframe>
        </div>
      </div>
    </section>
  )
}
