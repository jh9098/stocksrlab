import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import PopularStocksCompact from "../components/PopularStocksCompact";
import { Helmet } from "react-helmet";

export default function Home() {
  const themeLinkStyle = {
    padding: "0.5rem 0.8rem",
    backgroundColor: "#f0f0f0",
    borderRadius: "6px",
    textDecoration: "none",
    color: "#333",
    fontSize: "0.9rem",
    fontWeight: "bold"
  };

  const [stocks, setStocks] = useState([]);
  const [market, setMarket] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/" && performance.navigation.type !== 1) {
      window.location.reload();
    }
  }, [location.pathname]);
  useEffect(() => {
    // 이미 PartnersCoupang 객체가 있다면 바로 실행만
    if (window.PartnersCoupang) {
      new window.PartnersCoupang.G({
        id: 864271,
        trackingCode: "AF5962904",
        subId: null,
        template: "carousel",
        width: "680",
        height: "140",
      });
      return;
    }
  
    // 스크립트가 아직 없으면 body에 추가
    if (!document.getElementById("coupang-script")) {
      const script = document.createElement("script");
      script.id = "coupang-script";
      script.src = "https://ads-partners.coupang.com/g.js";
      script.async = true;
      script.onload = () => {
        if (window.PartnersCoupang) {
          new window.PartnersCoupang.G({
            id: 864271,
            trackingCode: "AF5962904",
            subId: null,
            template: "carousel",
            width: "680",
            height: "140",
          });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: "/",
        page_title: "Home Page",
      });
    }
  }, []);

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

  useEffect(() => {
    fetch("/data/market.json")
      .then((res) => res.json())
      .then(setMarket)
      .catch(() => {
        console.error("❌ market.json 로딩 실패");
        setMarket(null);
      });
  }, []);

  if (location.pathname === "/admin") return null;

  return (
    <div style={{ padding: "1rem", maxWidth: 1200, margin: "auto" }}>
      <Helmet>
        <title>지지저항 Lab - 주식 종목 분석</title>
        <meta name="description" content="기술적 분석 기반 종목 추천 및 테마 분석 제공" />
        <meta name="naver-site-verification" content="7baa2a8e2ba0fc1d05498252b674157c5a128911" />
      </Helmet>      
      {/* ✅ 쿠팡 광고 배너 (지수 요약 위) */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.85rem", color: "#777" }}>🛍️ 제휴 마케팅 광고</p>
        <div id="coupang-ad-banner" />
      </div>
      {/* 국내 지수 요약 */}
      <section style={{ marginBottom: "2rem" }}>
        <h2> 국내 지수 요약</h2>
        <div style={{ display: "flex", justifyContent: "start", gap: "2rem" }}>
          {market && (
            <>
              {formatIndex("KOSPI", market["KOSPI"])}
              {formatIndex("KOSDAQ", market["KOSDAQ"])}
              {formatIndex("NASDAQ", market["NASDAQ"])}
              {formatIndex("S&P500", market["S&P500"])}
            </>
          )}
        </div>
        <div style={{ fontSize: "0.85rem", color: "#888", marginTop: "0.5rem" }}>
          ⏱️ 기준: {market?.updatedAt || "-"}
        </div>
      </section>

      {/* 최근 등록된 종목 타이틀 */}
      <section style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>🧪 최근 등록된 종목들</h2>
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
      {/* ✅ 테마 분석 섹션 링크 추가 */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>📚 테마별 종목 분석</h2>
        <p style={{ fontSize: "0.95rem", color: "#555", marginBottom: "1rem" }}>
          주식 시장의 주요 테마를 중심으로 대장주 종목을 정리했습니다. 테마별로 선정해서 계속 업데이트 하고 확장될 예정입니다.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/theme/energy" style={themeLinkStyle}>⚡ 에너지/전력 인프라</Link>
          <Link to="/theme/forex" style={themeLinkStyle}>💱 원화 강세 수혜주</Link>
          <Link to="/theme/bci" style={themeLinkStyle}>🧠 BCI·뇌 인터페이스</Link>
          {/*
            <Link to="/theme/battery" style={themeLinkStyle}>🔋 2차전지</Link>
            <Link to="/theme/semicon" style={themeLinkStyle}>💾 반도체</Link>
            <Link to="/theme/etc" style={themeLinkStyle}>📌 기타 테마</Link>
          */}
        </div>
      </section>

      {/* ✅ 인기 검색 종목 섹션 */}
      <PopularStocksCompact />

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
