import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase" // ⚡️ لازم يكون عندك ملف firebase.ts

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // ✅ تسجيل الدخول بالبريد وكلمة المرور من Firebase Auth
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      const uid = userCred.user.uid

      // ✅ جلب بيانات المستخدم من Firestore
      const docRef = doc(db, "users", uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.role === "admin") {
          localStorage.setItem("adminAuth", "true")
          navigate("/dashboard")
        } else {
          setError("❌ ليس لديك صلاحيات دخول الإدارة")
        }
      } else {
        setError("❌ بيانات المستخدم غير موجودة في قاعدة البيانات")
      }
    } catch (err) {
      console.error(err)
      setError("❌ البريد أو كلمة المرور غير صحيحة")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        
        {/* ✅ الشعار + النص */}
        <div className="flex flex-col items-center mb-4">
          <img
            src="/logo.png"
            alt="شعار الفندق"
            className="h-20 w-auto mb-2"
          />
          <p className="text-lg font-bold tracking-wide text-gray-800">
            MOON GARDEN
          </p>
          <p className="text-sm text-gray-600 -mt-1 mb-4">
            HOTEL & RESIDENCE
          </p>
        </div>

        {/* ✅ عنوان تسجيل الدخول */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          تسجيل دخول الإدارة
        </h2>

        {/* ✅ نموذج تسجيل الدخول */}
        <form onSubmit={handleLogin} className="space-y-4 text-right">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            required
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            required
          />

          {/* ✅ رسالة الخطأ */}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  )
}
