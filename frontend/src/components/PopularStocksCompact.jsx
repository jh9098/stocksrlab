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
    <div className="mt-8 p-4 border rounded-xl bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">🔥 인기 검색 종목 Top 10</h2>
      <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
        {stocks.map((stock) => (
          <Link
            to={`/chart/${stock.code}`}
            key={stock.code}
            className="border rounded-lg p-2 hover:bg-gray-50"
          >
            <div className="font-semibold">
              {stock.rank}. {stock.name}
            </div>
            <div className="text-gray-600 text-xs">
              종목코드: {stock.code}
            </div>
            <div className="text-blue-600 font-bold">{stock.price}원</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
