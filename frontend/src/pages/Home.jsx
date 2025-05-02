import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import LazyYoutube from "../components/LazyYoutube";

export default function Home() {
  const [stocks, setStocks] = useState([]);
  const [market, setMarket] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [loadShorts, setLoadShorts] = useState(false);
  const location = useLocation();
  // ✅ 1. 광고 스크립트 삽입 useEffect
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    document.body.appendChild(script);
  }, []);

  // ✅ 2. 구글 애널리틱스
  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: "/",
        page_title: "Home Page",
      });
    }
  }, []);
  
  // ✅ 3. 종목 불러오기  
  useEffect(() => {
    const loadData = async () => {
      const modules = import.meta.glob("../data/stocks/*.json");
      const loadTasks = [];
  
      for (const path in modules) {
        const filename = path.split("/").pop().replace(".json", "");
        const parts = filename.split("_");
        if (parts.length !== 3) continue;
  
        const [code, date, time] = parts;
        const version = `${code}_${date}${time}`;
        const loadPromise = modules[path]().then(mod => {
          const data = mod.default;
          if (data.status !== "진행중") return null;
          return { ...data, version, code: code.replace("A", ""), sortKey: `${date}${time}` };
        });
        loadTasks.push(loadPromise);
      }
  
      const results = await Promise.all(loadTasks);
      const valid = results.filter(Boolean).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
      setStocks(valid);
    };
  
    loadData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoadShorts(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    const shortsTarget = document.getElementById("shorts-section");
    if (shortsTarget) observer.observe(shortsTarget);
    return () => observer.disconnect();
  }, []);

  const toggleFavorite = (code) => {
    const updated = favorites.includes(code)
      ? favorites.filter((c) => c !== code)
      : [...favorites, code];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const formatIndex = (label, data) => {
    if (!data) return <div><strong>{label}:</strong> -</div>;
    const direction = data.percent > 0 ? "🔺" : data.percent < 0 ? "🔻" : "";
    const color = data.percent > 0 ? "#d32f2f" : data.percent < 0 ? "#1976d2" : "#666";
    return (
      <div style={{ color, minWidth: "120px", textAlign: "center" }}>
        <strong>{label}:</strong><br />
        {data.price?.toLocaleString()} {direction} {data.percent}%
      </div>
    );
  };

  if (location.pathname === "/admin") return null;

  return (
    <div style={{ padding: "1rem", maxWidth: 1200, margin: "auto" }}>
      {/* 국내 지수 요약 */}
      <section style={{ marginBottom: "2rem" }}>
        <h2> 국내 지수 요약</h2>
        <div style={{ display: "flex", justifyContent: "start", gap: "2rem" }}>
          {market && (
            <>
              {formatIndex("KOSPI", market["KOSPI"])}
              {formatIndex("KOSDAQ", market["KOSDAQ"])}
            </>
          )}
        </div>
        <div style={{ fontSize: "0.85rem", color: "#888", marginTop: "0.5rem" }}>
          ⏱️ 기준: {market?.updatedAt || "-"}
        </div>
      </section>

      {/* 등록된 종목 전체 */}
      <section style={{ marginBottom: "2rem" }}>
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <Link
            to="/list"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#1976d2",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "0.95rem",
              display: "inline-block",
            }}
          >
            전체 종목 보기 ➔
          </Link>
        </div>

        <div className="stock-grid" style={{ gap: "1.5rem" }}>
          {stocks.map((stock) => (
            <div key={stock.version} className="stock-card enhanced">
              <div className="stock-card-header" style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>{stock.name} <span className="code">({stock.code})</span></h3>
                <button
                  onClick={() => toggleFavorite(stock.code)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  {favorites.includes(stock.code) ? "❤️" : "🤍"}
                </button>
              </div>
              <div className="stock-card-body">
                <p><strong>지지선:</strong> {stock.supportLines?.join(", ") || "없음"}</p>
                <p><strong>저항선:</strong> {stock.resistanceLines?.join(", ") || "없음"}</p>
                <p><strong>전략:</strong> {stock.strategy || "등록된 전략 없음"}</p>
                <p><strong>설명:</strong> {stock.detail || "등록된 설명 없음"}</p>
              </div>
              <div className="stock-card-footer">
                <Link to={`/stock/A${stock.code}?v=${stock.version}`} className="chart-link">
                  차트 보기
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* YouTube Shorts */}
      <section id="shorts-section" style={{ marginBottom: "2rem", marginTop: "4rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>YouTube Shorts</h2>
        {loadShorts && (
          <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem" }}>
            <LazyYoutube videoId="02rQU7ngEjY" />
            <LazyYoutube videoId="14NbzG_9V1Y" />
            <LazyYoutube videoId="tf6QuIzxDhk" />
          </div>
        )}
      </section>

      {/* 안내 문구 */}
      <footer style={{ fontSize: "0.8rem", color: "#888" }}>
        <hr style={{ margin: "3rem 0 1.5rem" }} />
        
        {/* ✅ 카카오 광고 삽입 영역 */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <ins className="kakao_ad_area"
            style={{ display: "none" }}
            data-ad-unit="DAN-nRdRmmXBtZEswN3e"
            data-ad-width="300"
            data-ad-height="250"
          ></ins>
        </div>
      
        <p>※ 지지저항 Lab에서 제공하는 정보는 오류 및 지연이 있을 수 있으며, 이를 기반으로 한 투자에는 손실이 발생할 수 있습니다.</p>
        <p>※ 본 서비스는 비상업적 참고용이며, 투자 자문이나 매매 유도 목적이 아닙니다.</p>
        <p>※ 문의: stocksrlab@naver.com</p>
        <p style={{ marginTop: "1rem" }}>© 지지저항 Lab. All rights reserved.</p>
      </footer>

    </div>
  );
}
