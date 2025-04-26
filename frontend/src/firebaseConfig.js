// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBy2mFehVzCvUNb618WVw9o2BMaj1LtvLw",
  authDomain: "stocksrlab.firebaseapp.com",
  projectId: "stocksrlab",
  storageBucket: "stocksrlab.firebasestorage.app",
  messagingSenderId: "312343343968",
  appId: "1:312343343968:web:4214d26194d97654bb6405",
  measurementId: "G-BNBT0SJ4B2"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore와 Auth 객체
export const db = getFirestore(app);
export const auth = getAuth(app);

// Google 로그인 함수 (원하는 곳에서 import하여 호출 가능)
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log("✅ 로그인 성공:", result.user);
    return result.user;
  } catch (error) {
    console.error("❌ 로그인 실패:", error);
    return null;
  }
};


// Firestore 오프라인 캐시 활성화
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('🔥 Firestore 캐시 활성화 완료');
  })
  .catch((err) => {
    console.error('캐시 활성화 실패', err);
  });