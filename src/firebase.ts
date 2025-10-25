// src/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAOQ7zVrfQuk1NLmOR2SqnTNg9kA5TNxaA",
  authDomain: "moon-garden-e5ef7.firebaseapp.com",
  projectId: "moon-garden-e5ef7",
  // رجّعتها مثل ما طلبت
  storageBucket: "moon-garden-e5ef7.firebasestorage.app",
  messagingSenderId: "82363050677",
  appId: "1:82363050677:web:053a317f889105703eacfc",
  measurementId: "G-J36RVN2GPK",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics يعمل فقط بالمتصفح
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) analytics = getAnalytics(app);
    })
    .catch(() => {
      analytics = null;
    });
}

export { app, analytics };
