import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig.js";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import { ADMIN_UIDS } from "../constants/roles"; // 추가

const dataModules = import.meta.glob("../data/stocks/*.json", { eager: true });
import stockMeta from "../../public/data/stock_metadata.json";

export default function MyPage() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const navigate = useNavigate();

  const kakaoUser = JSON.parse(localStorage.getItem("kakaoUser"));

  // 로그인 감지 (Google 로그인 또는 Kakao 로그인 유저)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u && !kakaoUser) navigate("/login");
      else setUser(u || kakaoUser); // Firebase 또는 Kakao 사용자 저장
    });
    return () => unsub();
  }, [kakaoUser]);

  // 요청 종목
  useEffect(() => {
    if (!user?.uid) return;

    const fetchRequests = async () => {
      const q = query(
        collection(db, "requests"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());
      setRequests(data);
    };
    fetchRequests();
  }, [user]);

  // 즐겨찾기
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    setFavorites(saved ? JSON.parse(saved) : []);
  }, []);

  // 내가 업로드한 분석
  useEffect(() => {
    if (!user?.uid) return;

    const uploads = [];
    for (const path in dataModules) {
      try {
        const data = dataModules[path]?.default;
        const hasUploader = !!data?.uploadedBy;
        const hasVersion = !!data?.version;
        if (hasUploader && hasVersion && data.uploadedBy === user.uid) {
          uploads.push({ ...data, version: data.version });
        }
      } catch (e) {
        console.error(`❌ 분석 데이터 파싱 실패 (${path})`, e);
      }
    }
    setMyUploads(uploads);
  }, [user]);

  // 로그인 타입 구분
  const loginType = user?.providerData
    ? user.providerData[0]?.providerId === "google.com"
      ? "Google"
      : "기타"
    : "Kakao";

  return (
    <div style={{ maxWidth: "960px", margin: "auto", padding: "2rem" }}>
      <h2>👤 마이페이지</h2>

      {/* 유저 정보 */}
      {user && (
        <p>
          ✅{" "}
          <strong>
            {user.email || user.kakao_account?.email || user.id}
          </strong>{" "}
          님으로 로그인 중
        </p>
      )}

      <hr style={{ margin: "2rem 0" }} />

      {/* 내가 요청한 종목 */}
      <section>
        <h3>📝 내가 요청한 종목</h3>
        {requests.length === 0 ? (
          <p>요청 내역이 없습니다.</p>
        ) : (
          <ul>
            {requests.map((r, i) => (
              <li key={i}>
                {r.stockName} ({r.stockCode}) - 평단: {r.price} / 비중: {r.amount}% / 등록일:{" "}
                {r.createdAt.slice(0, 10)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr style={{ margin: "2rem 0" }} />

      {/* 즐겨찾는 종목 */}
      <section>
        <h3>❤️ 즐겨찾는 종목</h3>
        <ul>
          {favorites.map((code) => {
            try {
              const company = stockMeta[code]?.company || code;
              const validModules = Object.values(dataModules)
                .map((m) => m?.default)
                .filter((d) => d && d.code === code);

              const latest = validModules.sort((a, b) =>
                (b.version || "").localeCompare(a.version || "")
              )[0];

              return (
                <li key={code}>
                  {company} ({code}) -{" "}
                  {latest?.version ? (
                    <a href={`/stock/A${code}?v=${latest.version}`}>
                      📊 최신 분석 보기
                    </a>
                  ) : (
                    "버전 정보 없음"
                  )}
                </li>
              );
            } catch (e) {
              console.error(`⚠️ 종목 처리 중 오류 (${code})`, e);
              return <li key={code}>⚠️ {code} (표시 실패)</li>;
            }
          })}
        </ul>
      </section>

      {/* 내가 업로드한 분석 */}
      {myUploads.length > 0 && (
        <>
          <hr style={{ margin: "2rem 0" }} />
          <section>
            <h3>📤 내가 업로드한 종목 분석</h3>
            <ul>
              {myUploads.map((stock, i) => (
                <li key={i}>
                  {stock.name} ({stock.code}) - {stock.version}
                  <a
                    href={`/stock/A${stock.code}?v=${stock.version}`}
                    style={{ marginLeft: "1rem" }}
                  >
                    보기
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <hr style={{ margin: "2rem 0" }} />

      {/* 계정 정보 */}
      <section>
        <h3>⚙️ 계정 정보</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          <li>
            <strong>이메일:</strong>{" "}
            {user?.email || user?.kakao_account?.email || "없음"}
          </li>
          <li>
            <strong>UID:</strong> {user?.uid || user?.id}
          </li>
          <li>
            <strong>로그인 방식:</strong> {loginType}
          </li>
          <li>
            <strong>회원 등급:</strong> {ADMIN_UIDS.includes(user?.uid) ? "관리자" : "일반회원"}
          </li>

        </ul>
        <p style={{ fontSize: "0.9rem", color: "#888" }}>
          👉 탈퇴 기능은 추후 제공될 예정입니다.
        </p>
      </section>
    </div>
  );
}
