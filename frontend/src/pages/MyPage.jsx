import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig.js";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import { ADMIN_UIDS } from "../constants/roles"; // 추가
import { deleteUser } from "firebase/auth";

const dataModules = import.meta.glob("../data/stocks/*.json", { eager: true });
import stockMeta from "../../public/data/stock_metadata.json";

export default function MyPage() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const navigate = useNavigate();

  const kakaoUser = JSON.parse(localStorage.getItem("kakaoUser"));
  const handleDeleteAccount = async () => {
    if (window.confirm("정말 탈퇴하시겠습니까? 탈퇴하면 복구할 수 없습니다.")) {
      const currentUser = auth.currentUser;
  
      if (currentUser) {
        try {
          await deleteUser(currentUser);
          alert("✅ 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
          window.location.href = "/";
        } catch (err) {
          console.error("❌ 탈퇴 실패:", err);
          alert("탈퇴에 실패했습니다. 다시 로그인 후 시도해주세요.");
        }
      } else if (localStorage.getItem("kakaoUser")) {
        // 카카오 사용자 처리
        localStorage.removeItem("kakaoUser");
        alert("✅ 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
        window.location.href = "/";
      } else {
        alert("로그인 정보가 없습니다.");
      }
    }
  };
  
  // 로그인 감지 (Google 로그인 또는 Kakao 로그인 유저)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u && !kakaoUser) navigate("/login");
      else setUser(u || kakaoUser); // Firebase 또는 Kakao 사용자 저장
    });
    return () => unsub();
  }, [kakaoUser, navigate]);

  // 요청 종목
  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, "requests"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data());
        setRequests(data);
      } catch (e) {
        console.error("❌ 요청 불러오기 실패", e);
      }
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
        if (data?.uploadedBy === user.uid && data?.version) {
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
            {requests.map((r, i) => {
              const createdAt =
                r.createdAt?.toDate?.() instanceof Date
                  ? r.createdAt.toDate().toISOString().slice(0, 10)
                  : (r.createdAt || "").slice(0, 10);

              return (
                <li key={i}>
                  {r.stockName} ({r.stockCode}) - 평단: {r.price}원 / 비중: {r.amount}% / 등록일: {createdAt || "날짜 없음"}
                </li>
              );
            })}
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
      </section>
      <button
        onClick={handleDeleteAccount}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1.5rem",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        회원 탈퇴
      </button>

    </div>
  );
}
