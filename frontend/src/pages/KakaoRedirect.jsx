// ✅ frontend/src/pages/KakaoRedirect.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebaseConfig";

const REDIRECT_URI = "https://stocksrlab.netlify.app/kakao-login";
const BACKEND_TOKEN_ENDPOINT = "https://stocksrlab.cloudfunctions.net/createCustomToken"; // ⚠️ 여기 수정하세요

export default function KakaoRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    if (!code) return;

    const loginWithKakao = async () => {
      try {
        // 🔄 Functions로 Kakao Code 전달 → Custom Token 요청
        const res = await fetch(
          `${BACKEND_TOKEN_ENDPOINT}?code=${code}&redirect_uri=${REDIRECT_URI}`
        );
        const data = await res.json();

        if (!data.firebaseToken) throw new Error("토큰 없음");

        // 🔐 Firebase에 로그인
        await signInWithCustomToken(auth, data.firebaseToken);
        console.log("✅ Firebase 로그인 성공");

        // 👉 로그인 후 마이페이지 이동
        navigate("/mypage");
      } catch (e) {
        console.error("❌ 카카오 로그인 실패:", e);
        navigate("/login");
      }
    };

    loginWithKakao();
  }, [navigate]);

  return <p style={{ textAlign: "center", marginTop: "3rem" }}>카카오 로그인 중입니다...</p>;
}
