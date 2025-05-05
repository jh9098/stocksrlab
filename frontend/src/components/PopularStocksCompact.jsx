import { useEffect, useState } from "react";

export default function PopularStocksCompact() {
  const [stocks, setStocks] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    import("../data/popular.json").then((mod) => {
      setStocks(mod.default.stocks || []);
      setUpdatedAt(mod.default.updatedAt || "");
    });
  }, []);

  return (
    <section style={{ marginTop: "4rem", marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", fontWeight: "bold" }}>
        🔥 인기종목 Top 10       {updatedAt}
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1.25rem" }}>
        {stocks.map((stock) => (
          <div
            key={stock.code}
            style={{
              background: "#f9f9f9",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              fontSize: "0.95rem",
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {stock.rank}. {stock.name} ({stock.code}) : {stock.price} ({stock.rate})
          </div>
        ))}
      </div>
    </section>
  );
}
