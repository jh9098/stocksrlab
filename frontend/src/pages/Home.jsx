import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import TradingViewWidget from "../components/TradingViewWidget";

const dataModules = import.meta.glob("../data/stocks/*.json", { eager: true });

export default function Home() {
  const [stocks, setStocks] = useState([]);
  const [market, setMarket] = useState(null);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const location = useLocation();

  useEffect(() => {
    const grouped = {};

    for (const path in dataModules) {
      const filename = path.split("/").pop().replace(".json", "");
      const parts = filename.split("_");
      if (parts.length !== 3) continue;

      const [code, date, time] = parts;
      const version = `${code}_${date}_${time}`;
      const data = dataModules[path]?.default;

      if (data.status !== "진행중") continue;

      if (!grouped[code]) grouped[code] = [];
      grouped[code].push({ ...data, version, code: code.replace("A", "") });
    }

    const latest = Object.values(grouped)
      .map(entries => entries.sort((a, b) => b.version.localeCompare(a.version))[0]);

    const sorted = latest
      .sort((a, b) => b.version.localeCompare(a.version))
      .slice(0, 3);

    setStocks(sorted);
  }, []);

  useEffect(() => {
    fetch("/data/market.json")
      .then(res => res.json())
      .then(setMarket)
      .catch(() => setMarket(null));
  }, []);

  const toggleFavorite = (code) => {
    const updated = favorites.includes(code)
      ? favorites.filter((c) => c !== code)
      : [...favorites, code];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const filteredStocks = stocks.filter(stock =>
    stock.name?.toLowerCase().includes(search.toLowerCase()) ||
    stock.code?.toLowerCase().includes(search.toLowerCase())
  );

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
      
      {/* 🧪 최근 분석된 종목 */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>🧪 최근 분석된 종목</h2>
        <div style={{ marginBottom: "1.5rem" }}>
          <input
            type="text"
            placeholder="종목명 또는 코드 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {filteredStocks.map(stock => (
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
                <p><strong>설명:</strong> {stock.detail}</p>
              </div>
              <div className="stock-card-footer">
                <Link to={`/stock/A${stock.code}?v=${stock.version}`} className="chart-link">
                  📊 차트 보기
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 📊 국내 지수 요약 */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>📊 국내 지수 요약</h2>
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

      {/* 📈 실시간 차트 */}
      <section style={{ marginBottom: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "400px", height: "300px" }}>
          <h3 style={{ textAlign: "center" }}>🇺🇸 SPY (S&P500)</h3>
          <TradingViewWidget symbol="AMEX:SPY" height={300} />
        </div>
        <div style={{ flex: 1, minWidth: "400px", height: "300px" }}>
          <h3 style={{ textAlign: "center" }}>🇺🇸 NASDAQ (나스닥)</h3>
          <TradingViewWidget symbol="IG:NASDAQ" height={300} />
        </div>
      </section>

      {/* 🎥 YouTube Shorts */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>🎥 YouTube Shorts</h2>
        <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem" }}>
          <iframe width="300" height="170" src="https://www.youtube.com/embed/02rQU7ngEjY" title="Shorts1" allowFullScreen></iframe>
          <iframe width="300" height="170" src="https://www.youtube.com/embed/14NbzG_9V1Y" title="Shorts2" allowFullScreen></iframe>
          <iframe width="300" height="170" src="https://www.youtube.com/embed/tf6QuIzxDhk" title="Shorts3" allowFullScreen></iframe>
        </div>
      </section>

      {/* 📢 광고 자리 (Placeholder) */}
      <section style={{ marginBottom: "2rem", textAlign: "center" }}>
        <div style={{ width: "100%", height: "250px", backgroundColor: "#f0f0f0", lineHeight: "250px", color: "#888" }}>
          [광고 자리]
        </div>
      </section>

      {/* 안내 문구 */}
      <footer style={{ fontSize: "0.8rem", color: "#888" }}>
        <hr style={{ margin: "3rem 0 1.5rem" }} />
        <p>※ 지지저항 Lab에서 제공하는 정보는 오류 및 지연이 있을 수 있으며, 이를 기반으로 한 투자에는 손실이 발생할 수 있습니다.</p>
        <p>※ 본 서비스는 비상업적 참고용이며, 투자 자문이나 매매 유도 목적이 아닙니다.</p>
        <p>※ 문의: stocksrlab@naver.com</p>
        <p style={{ marginTop: "1rem" }}>© 지지저항 Lab. All rights reserved.</p>
      </footer>

    </div>
  );
}
