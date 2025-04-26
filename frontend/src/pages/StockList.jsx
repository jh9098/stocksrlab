import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function StockList() {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("전체");
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // 종목 데이터
        const context = import.meta.glob("../data/stocks/*.json");
        const entries = await Promise.all(
          Object.entries(context).map(async ([path, loader]) => {
            const json = await loader();
            const filename = path.split("/").pop().replace(".json", "");
            const code = json.code?.replace("A", "");
            return {
              id: filename,
              code,
              name: json.name,
              strategy: json.strategy,
              supportLines: json.supportLines,
              resistanceLines: json.resistanceLines,
              status: json.status || "진행중",
              createdAt: json.createdAt || filename.split("_").slice(1).join("_"),
            };
          })
        );

        // 📦 메타데이터 fetch
        const res = await fetch("/data/stock_metadata.json");
        const metadata = await res.json();

        // 병합
        const merged = entries.map((item) => ({
          ...item,
          industry: metadata[item.code]?.industry || "기타",
          products: metadata[item.code]?.products || "",
          homepage: metadata[item.code]?.homepage || "",
        }));

        setStocks(merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } catch (err) {
        console.error("🧨 데이터 로딩 실패", err);
      }
    };

    loadData();
  }, []);

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter(fid => fid !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const industries = ["전체", ...Array.from(new Set(stocks.map(s => s.industry)))];

  const filteredStocks = stocks.filter(stock =>
    (industryFilter === "전체" || stock.industry === industryFilter) &&
    (stock.name?.toLowerCase().includes(search.toLowerCase()) ||
     stock.code?.toLowerCase().includes(search.toLowerCase()))
  );

  const inProgress = filteredStocks.filter(s => s.status === "진행중");
  const completed = filteredStocks.filter(s => s.status === "완료");

  return (
    <div style={{ maxWidth: 960, margin: "auto", padding: "1rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>📋 전체 종목 리스트</h2>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="종목명 또는 코드 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
        >
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>

      <h3>✅ 진행중 종목</h3>
      {inProgress.length === 0 && <p style={{ color: "#888" }}>진행중인 종목이 없습니다.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {inProgress.map(stock => (
          <StockCard key={stock.id} stock={stock} isFavorite={favorites.includes(stock.id)} onToggle={() => toggleFavorite(stock.id)} />
        ))}
      </div>

      <hr style={{ margin: "3rem 0" }} />

      <h3>📁 완료된 종목</h3>
      {completed.length === 0 && <p style={{ color: "#888" }}>완료된 종목이 없습니다.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {completed.map(stock => (
          <StockCard key={stock.id} stock={stock} isFavorite={favorites.includes(stock.id)} onToggle={() => toggleFavorite(stock.id)} />
        ))}
      </div>
    </div>
  );
}

function StockCard({ stock, isFavorite, onToggle }) {
  return (
    <div className="stock-card enhanced">
      <div className="stock-card-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>{stock.name} <span className="code">({stock.code})</span></h3>
        <button
          onClick={onToggle}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="stock-card-body">
        <p><strong>업종:</strong> {stock.industry}</p>
        <p><strong>지지선:</strong> {stock.supportLines?.join(", ")}</p>
        <p><strong>저항선:</strong> {stock.resistanceLines?.join(", ")}</p>
        <p><strong>전략:</strong> {stock.strategy}</p>
        <p style={{ fontSize: "0.85rem", color: "gray" }}>등록일: {formatDate(stock.createdAt)}</p>
        {stock.status === "완료" && (
          <p style={{ fontSize: "0.85rem", color: "#999" }}>상태: 완료</p>
        )}
      </div>
      <div className="stock-card-footer">
        <Link to={`/stock/${stock.code}?v=${stock.id}`} className="chart-link">📊 차트 보기</Link>
      </div>
    </div>
  );
}

function formatDate(raw) {
  if (!raw) return "알 수 없음";
  if (raw.includes("_")) {
    const [date, time] = raw.split("_");
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)} ${time.slice(0, 2)}:${time.slice(2)}`;
  }
  return new Date(raw).toLocaleString();
}
