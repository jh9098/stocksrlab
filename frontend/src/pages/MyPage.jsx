import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig.js";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import { ADMIN_UIDS } from "../constants/roles";

const dataModules = import.meta.glob("../data/stocks/*.json", { eager: true });
import stockMeta from "../../public/data/stock_metadata.json";

export default function MyPage() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [uploads, setUploads] = useState([]);
  const navigate = useNavigate();

  const kakaoUser = JSON.parse(localStorage.getItem("kakaoUser"));

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u && !kakaoUser) navigate("/login");
      else setUser(u || kakaoUser);
    });
    return () => unsub();
  }, [kakaoUser, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    setFavorites(saved ? JSON.parse(saved) : []);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

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
      } catch (err) {
        console.error("❌ 요청 불러오기 실패", err);
      }
    };

    fetchRequests();
  }, [user]);

  useEffect(() => {
    const userUploads = [];
    for (const path in dataModules) {
      const data = dataModules[path]?.default;
      if (data?.uploadedBy === user?.uid) {
        const filename = path.split("/").pop().replace(".json", "");
        userUploads.push({ ...data, id: filename });
      }
    }
    setUploads(userUploads);
  }, [user]);

  const handleDeleteAccount = async () => {
    if (window.confirm("정말 탈퇴하시겠습니까? 탈퇴하면 복구할 수 없습니다.")) {
      try {
        if (auth.currentUser) {
          await deleteUser(auth.currentUser);
        } else if (localStorage.getItem("kakaoUser")) {
          localStorage.removeItem("kakaoUser");
        }
        alert("✅ 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
        window.location.href = "/";
      } catch (err) {
        console.error("❌ 탈퇴 실패", err);
        alert("탈퇴에 실패했습니다. 다시 로그인 후 시도해주세요.");
      }
    }
  };

  const favoriteStocks = favorites.map(code => {
    const found = Object.values(dataModules)
      .map(m => m?.default)
      .filter(d => d && d.code?.replace("A", "") === code)
      .sort((a, b) => (b.version || "").localeCompare(a.version || ""))[0];

    return {
      code,
      company: stockMeta[code]?.company || "Unknown",
      supportLines: found?.supportLines || [],
      resistanceLines: found?.resistanceLines || [],
      strategy: found?.strategy || "",
      version: found?.version || null,
    };
  });

  return (
    <div style={{ maxWidth: "960px", margin: "auto", padding: "2rem" }}>
      <h2>👤 마이페이지</h2>

      {/* 사용자 정보 */}
      {user && (
        <p>
          ✅ <strong>{user.email || user.kakao_account?.email || user.id}</strong> 님으로 로그인 중
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
                  {r.stockName} ({r.stockCode}) - 평단: {r.price}원 / 비중: {r.amount}% / 등록일: {createdAt}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <hr style={{ margin: "2rem 0" }} />

      {/* 즐겨찾기 종목 */}
      <section>
        <h3>❤️ 즐겨찾는 종목</h3>
        {favoriteStocks.length === 0 ? (
          <p>즐겨찾는 종목이 없습니다.</p>
        ) : (
          <ul>
            {favoriteStocks.map((stock, i) => (
              <li key={i} style={{ marginBottom: "1rem" }}>
                <strong>{stock.company}</strong> ({stock.code})<br />
                <div>🛡️ 지지선: {stock.supportLines.join(", ") || "없음"}</div>
                <div>🛡️ 저항선: {stock.resistanceLines.join(", ") || "없음"}</div>
                <div>📝 전략: {stock.strategy || "등록된 전략 없음"}</div>
                {stock.version ? (
                  <a
                    href={`/stock/A${stock.code}?v=${stock.version}`}
                    style={{ display: "inline-block", marginTop: "0.5rem" }}
                  >
                    📊 최신 분석 보기
                  </a>
                ) : (
                  <div style={{ color: "#888", marginTop: "0.5rem" }}>분석 데이터 없음</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 내가 업로드한 분석 */}
      {uploads.length > 0 && (
        <>
          <hr style={{ margin: "2rem 0" }} />
          <section>
            <h3>📤 내가 업로드한 종목 분석</h3>
            <ul>
              {uploads.map((stock, i) => (
                <li key={i}>
                  {stock.name} ({stock.code}) - {stock.version}
                  <a
                    href={`/stock/A${stock.code}?v=${stock.id}`}
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
          <li><strong>이메일:</strong> {user?.email || user?.kakao_account?.email || "없음"}</li>
          <li><strong>UID:</strong> {user?.uid || user?.id}</li>
          <li><strong>로그인 방식:</strong> {user?.providerData ? "Google" : "Kakao"}</li>
          <li><strong>회원 등급:</strong> {ADMIN_UIDS.includes(user?.uid) ? "관리자" : "일반회원"}</li>
        </ul>
      </section>

      <button
        onClick={handleDeleteAccount}
        style={{ marginTop: "1rem", padding: "0.5rem 1.5rem", backgroundColor: "red", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >
        회원 탈퇴
      </button>
    </div>
  );
}
