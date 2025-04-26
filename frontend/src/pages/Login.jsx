// frontend/src/pages/Login.jsx

import { auth } from "../firebaseConfig.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const KAKAO_REDIRECT_URI = "https://stocksrlab.netlify.app/kakao-login";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) navigate("/mypage");
    });
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/mypage");
    } catch (error) {
      console.error("Google 로그인 실패:", error);
    }
  };

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "480px", margin: "auto", textAlign: "center" }}>
      <h2>로그인</h2>
      <button
        onClick={handleGoogleLogin}
        style={{
          backgroundColor: "#4285F4",
          color: "#fff",
          padding: "0.8rem 1.2rem",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          marginBottom: "1rem",
          cursor: "pointer",
        }}
      >
        Google로 시작하기
      </button>
      <br />
      <button
        onClick={handleKakaoLogin}
        style={{
          backgroundColor: "#FEE500",
          color: "#000",
          padding: "0.8rem 1.2rem",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        카카오로 시작하기
      </button>
    </div>
  );
}

// ✅ 반드시 이 줄이 있어야 export default로 App.jsx에서 인식됨
export default Login;
