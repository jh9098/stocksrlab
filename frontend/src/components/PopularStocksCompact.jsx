import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PopularStocksCompact() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    import("../data/popular.json").then((mod) => {
      setStocks(mod.default);
    });
  }, []);

  return (
    <section style={{ marginTop: "4rem", marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1.3rem", marginBottom: "1.5rem", fontWeight: "bold" }}>
        🔥 인기 검색 종목 Top 10
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1.25rem" }}>
        {stocks.map((stock) => (
          <div
            key={stock.code}
            //to={`/chart/${stock.code}`}
            style={{
              textDecoration: "none",
              color: "#111",
              background: "#f9f9f9",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              fontSize: "0.95rem",
              fontWeight: 500,
              lineHeight: 1.4,
              transition: "background 0.2s",
            }}
            //onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
            //onMouseLeave={(e) => e.currentTarget.style.background = "#f9f9f9"}
          >
            {stock.rank}. {stock.name} ({stock.code}) : {stock.price} ({stock.rate})
          </div>
        ))}
      </div>
    </section>
  );
}
