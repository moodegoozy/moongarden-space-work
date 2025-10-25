// src/scripts/uploadRooms.ts
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"

// ⚙️ إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyAOQ7zVrfQuk1NLmOR2SqnTNg9kA5TNxaA",
  authDomain: "moon-garden-e5ef7.firebaseapp.com",
  projectId: "moon-garden-e5ef7",
  storageBucket: "moon-garden-e5ef7.firebasestorage.app",
  messagingSenderId: "82363050677",
  appId: "1:82363050677:web:053a317f889105703eacfc",
  measurementId: "G-J36RVN2GPK",
}

// ✅ تهيئة Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ✅ الغرف المحلية (تقدر تعدلها حسب ما تريد ترفع)
const rooms = [
  {
    name: "غرفة ديلوكس مطلة على البحر",
    price: 900,
    status: "متاح",
    description: "غرفة فاخرة مع شرفة تطل على البحر، مثالية للاسترخاء.",
    images: ["/rooms/1.jpg", "/rooms/2.jpg"],
    type: "room",
  },
  {
    name: "جناح ملكي",
    price: 1800,
    status: "محجوز",
    description: "جناح فاخر بمسبح خاص ومساحة كبيرة للعائلات.",
    images: ["/rooms/royal1.jpg", "/rooms/royal2.jpg"],
    type: "room",
  },
  {
    name: "غرفة بريميوم كينغ",
    price: 1200,
    status: "متاح",
    description: "غرفة راقية بسرير كينغ وإطلالة بانورامية على المدينة.",
    images: ["/rooms/premium1.jpg", "/rooms/premium2.jpg"],
    type: "room",
  },
]

// ✅ رفع الغرف إلى Firestore
async function uploadRooms() {
  try {
    console.log("🚀 بدء رفع بيانات الغرف إلى Firestore...")

    for (const room of rooms) {
      await addDoc(collection(db, "rooms"), room)
      console.log(`✅ تم رفع الغرفة: ${room.name}`)
    }

    console.log("🎉 تم رفع جميع الغرف بنجاح ✅")
    process.exit(0)
  } catch (error) {
    console.error("❌ حدث خطأ أثناء الرفع:", error)
    process.exit(1)
  }
}

uploadRooms()
