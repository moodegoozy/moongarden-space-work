import { FormEvent, useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase"

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
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gray-50 border-b border-black/5">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <div className="mx-auto mb-6 inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-medium uppercase tracking-widest text-gray-700">
              Moon Garden
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              شاركنا رأيك حول مون قاردن
            </h1>
            <p className="text-gray-600 leading-relaxed">
              نسعد دائماً بسماع آرائكم واقتراحاتكم لتحسين تجربتكم معنا.
              اكتب رأيك بالأسفل وسيظهر مع آراء العملاء الآخرين.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12 grid gap-12 md:grid-cols-5">
          <div className="md:col-span-3 bg-white border border-black/10 rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">اكتب رأيك</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-right">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-lg border border-black/10 px-4 py-3 text-right focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="أدخل اسمك"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الجوال
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-lg border border-black/10 px-4 py-3 text-right focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="05xxxxxxxx"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="text-right">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  رأيك وتجربتك
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full min-h-[160px] rounded-lg border border-black/10 px-4 py-3 text-right focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="شاركنا رأيك وتجربتك"
                  dir="rtl"
                />
              </div>

              {error && <p className="text-red-500 text-sm text-right">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-black px-6 py-3 text-white font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "جاري الإرسال..." : "إرسال رأيي"}
              </button>
            </form>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">آراء العملاء السابقة</h2>
            <p className="text-gray-600 text-sm">
              يتم تحديث القائمة تلقائياً بمجرد إضافة رأي جديد.
            </p>

            <div className="space-y-4 max-h-[540px] overflow-y-auto pr-2">
              {reviews.length === 0 && (
                <div className="rounded-xl border border-black/10 bg-gray-50 p-6 text-center text-gray-500">
                  لا توجد آراء بعد. كن أول من يشاركنا رأيه.
                </div>
              )}

              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-black/10 bg-white p-5 shadow-sm text-right"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-gray-900">{review.name}</h3>
                    <span className="text-sm text-gray-500">{review.phone}</span>
                  </div>
                  <p className="mt-3 text-gray-700 leading-relaxed">{review.message}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
