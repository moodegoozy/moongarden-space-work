import { FormEvent, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase"
import Footer from "../components/Footer"

interface ReviewEntry {
  id: string
  name: string
  phone: string
  message: string
  createdAt?: { seconds: number; nanoseconds: number }
}

export default function Review() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<ReviewEntry[]>([])

  useEffect(() => {
    const reviewsQuery = query(
      collection(db, "reviews"),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      const items: ReviewEntry[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name ?? "",
        phone: doc.data().phone ?? "",
        message: doc.data().message ?? "",
        createdAt: doc.data().createdAt,
      }))
      setReviews(items)
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError("فضلاً أكمل جميع الحقول قبل إرسال رأيك")
      return
    }

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "reviews"), {
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
      })

      setName("")
      setPhone("")
      setMessage("")
    } catch (err) {
      setError("حدث خطأ أثناء إرسال رأيك. حاول مرة أخرى")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F6F1E9] text-[#2B2A28] flex flex-col">
      {/* الهيدر */}
      <section className="relative bg-[#2B2A28] text-[#FAF8F3] py-12 sm:py-20 text-center px-4">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">آراء العملاء</h1>
        <p className="text-[#E1DCCE] text-sm sm:text-lg max-w-2xl mx-auto">
          نسعد دائماً بسماع آرائكم واقتراحاتكم لتحسين تجربتكم معنا
        </p>
      </section>

      {/* المحتوى الرئيسي */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid gap-6 sm:gap-10 md:grid-cols-5">
        {/* نموذج إرسال الرأي */}
        <div className="md:col-span-3 bg-white border border-[#E8E1D6] rounded-2xl shadow-sm p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#2B2A28]">✨ شاركنا رأيك</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-right">
                <label htmlFor="name" className="block text-sm font-medium text-[#2B2A28] mb-2">
                  الاسم الكامل
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-[#E8E1D6] px-4 py-3 text-right focus:border-[#C6A76D] focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/20 transition"
                  placeholder="أدخل اسمك"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <label htmlFor="phone" className="block text-sm font-medium text-[#2B2A28] mb-2">
                  رقم الجوال
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-[#E8E1D6] px-4 py-3 text-right focus:border-[#C6A76D] focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/20 transition"
                  placeholder="05xxxxxxxx"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="text-right">
              <label htmlFor="message" className="block text-sm font-medium text-[#2B2A28] mb-2">
                رأيك وتجربتك
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full min-h-[160px] rounded-xl border border-[#E8E1D6] px-4 py-3 text-right focus:border-[#C6A76D] focus:outline-none focus:ring-2 focus:ring-[#C6A76D]/20 transition"
                placeholder="شاركنا رأيك وتجربتك"
                dir="rtl"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-right">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#2B2A28] px-6 py-3 text-white font-semibold hover:bg-[#3d3c3a] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "جاري الإرسال..." : "إرسال رأيي"}
            </button>
          </form>
        </div>

        {/* آراء العملاء */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-[#2B2A28]">💬 آراء العملاء</h2>
          <p className="text-[#7C7469] text-sm">
            يتم تحديث القائمة تلقائياً بمجرد إضافة رأي جديد.
          </p>

          <div className="space-y-4 max-h-[540px] overflow-y-auto pr-2">
            {reviews.length === 0 && (
              <div className="rounded-2xl border border-[#E8E1D6] bg-[#FAF8F3] p-6 text-center text-[#7C7469]">
                لا توجد آراء بعد. كن أول من يشاركنا رأيه.
              </div>
            )}

            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-[#E8E1D6] bg-white p-5 shadow-sm text-right"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-[#2B2A28]">{review.name}</h3>
                  <span className="text-sm text-[#7C7469]">{review.phone}</span>
                </div>
                <p className="mt-3 text-[#5E5B53] leading-relaxed">{review.message}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* زر العودة */}
      <div className="text-center pb-12">
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-[#2B2A28] text-[#FAF8F3] rounded-full text-sm hover:opacity-90 transition"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>

      <Footer />
    </div>
  )
}
