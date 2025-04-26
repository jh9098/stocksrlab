// 종목 카드 컴포넌트
import { Link } from "react-router-dom";

export default function StockCard({ stock }) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: "1rem", marginBottom: "1rem" }}>
      <h3>{stock.name} ({stock.code})</h3>
      <p><strong>지지선:</strong> {stock.supportLines.join(", ")}</p>
      <p><strong>저항선:</strong> {stock.resistanceLines.join(", ")}</p>
      <p><strong>전략:</strong> {stock.strategy}</p>
      <p><strong>업종:</strong> {stock.industry}</p>
      <p><strong>주요제품:</strong> {stock.products}</p>
      {stock.homepage && (
        <p>
          <a href={stock.homepage} target="_blank" rel="noreferrer" style={{ fontSize: "0.85rem" }}>
            홈페이지 방문
          </a>
        </p>
      )}
      <p>
        <Link to={`/stock/${stock.code}`}>[차트 보기]</Link>
        {stock.youtubeUrl && <> | <a href={stock.youtubeUrl} target="_blank">YouTube</a></>}
        {stock.threadsUrl && <> | <a href={stock.threadsUrl} target="_blank">Threads</a></>}
      </p>
    </div>
  );
}
