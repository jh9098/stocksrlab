const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
require("dotenv").config();

admin.initializeApp();

// Cloud Function: /createCustomToken
exports.createCustomToken = functions.https.onRequest(async (req, res) => {
  const { code, redirect_uri } = req.query;

  if (!code || !redirect_uri) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // 🔄 카카오 Access Token 요청
    const tokenRes = await axios.post("https://kauth.kakao.com/oauth/token", null, {
      params: {
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_REST_API_KEY,
        redirect_uri,
        code,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token } = tokenRes.data;

    // 👤 사용자 정보 요청
    const userRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const kakaoUser = userRes.data;
    const uid = `kakao_${kakaoUser.id}`;

    // 🔐 Firebase Custom Token 발급
    const firebaseToken = await admin.auth().createCustomToken(uid);

    res.json({ firebaseToken });
  } catch (err) {
    console.error("❌ Custom Token 생성 실패:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
