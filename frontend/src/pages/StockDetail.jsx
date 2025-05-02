import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ChartComponent from "../components/Chart";

const stockModules = import.meta.glob("../data/stocks/*.json", { eager: true });

export default function StockDetail() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const version = searchParams.get("v");
  const shortCode = code.replace("A", "");

  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("▶️ useEffect 시작됨");

    let selectedStock = null;

    if (version) {
      selectedStock = Object.entries(stockModules).find(([path]) =>
        path.includes(`${version}.json`)
      );
      console.log("🔍 version 매칭 결과:", selectedStock);
    }

    if (!selectedStock) {
      const matches = Object.entries(stockModules)
        .filter(([path]) => path.includes(`${shortCode}_`))
        .sort((a, b) => b[0].localeCompare(a[0]));
      if (matches.length > 0) selectedStock = matches[0];
      console.log("🔍 fallback 매칭 결과:", selectedStock);
    }

    if (!selectedStock) {
      console.log("❌ selectedStock 못 찾음");
      setStockData(null);
      setLoading(false);
      return;
    }

    const stock = selectedStock[1].default;
    setStockData(stock);
    console.log("📦 분석 stockData 로딩 완료");

    // ✅ index.json 하나만 fetch
    fetch("/data/crawled/index.json")
      .then(res => res.json())
      .then(json => {
        console.log("✅ json keys:", Object.keys(json));           // 🔍 확인
        console.log("✅ shortCode:", shortCode);                   // 🔍 확인
        const prices = json?.[shortCode] || [];
        console.log("✅ prices sample:", prices.slice(0, 3));      // 🔍 샘플 출력

        const parsed = prices
          .filter(d =>
            d.date &&
            Number.isFinite(d.open) &&
            Number.isFinite(d.high) &&
            Number.isFinite(d.low) &&
            Number.isFinite(d.price)
          )
          .map(d => ({
            time: new Date(d.date),
            open: Number(d.open),
            high: Number(d.high),
            low: Number(d.low),
            close: Number(d.price),
            volume: Number.isFinite(d.volume) ? d.volume : 0,
          }))
          .reverse();

        parsed.forEach((d, i) => {
          const keys = ['open', 'high', 'low', 'close'];
          for (const key of keys) {
            if (!Number.isFinite(d[key])) {
              console.error(`❌ 잘못된 데이터 발견 (index ${i}):`, d);
            }
          }
        });

        console.log("✅ 최종 parsed chart data length:", parsed.length);
        setChartData(parsed);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ 크롤링 데이터 로딩 실패:", err);
        setChartData([]);
        setLoading(false);
      });
  }, [shortCode, version]);

  useEffect(() => {
    fetch("/data/stock_metadata.json")
      .then(res => res.json())
      .then(json => setCompanyInfo(json[shortCode]))
      .catch(() => setCompanyInfo(null));
  }, [shortCode]);

  const formatVersionDate = ver => {
    if (!ver) return "";
    const parts = ver.split("_");
    if (parts.length !== 3) return "";
    const date = parts[1];
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
  };

  if (loading) return <p>📊 불러오는 중...</p>;
  if (!stockData) return <p>❌ 등록된 분석 종목이 아닙니다.</p>;
  if (!Array.isArray(chartData) || chartData.length === 0) return <p>❌ 차트 데이터가 없습니다.</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "960px", margin: "auto" }}>
      <h2>{stockData.name} ({stockData.code}) 분석</h2>
      {version && (
        <p style={{ fontSize: "0.9rem", color: "#888" }}>
          분석일: {formatVersionDate(version)}
        </p>
      )}

      <ChartComponent
        code={shortCode}
        supportLines={stockData.supportLines}
        resistanceLines={stockData.resistanceLines}
        chartData={chartData}
      />

      {companyInfo && (
        <div style={{ marginTop: "2rem" }}>
          <h3>🏢 회사 정보</h3>
          <ul>
            <li><strong>업종:</strong> {companyInfo.industry}</li>
            <li><strong>주요제품:</strong> {companyInfo.products}</li>
            <li><strong>홈페이지:</strong> <a href={companyInfo.homepage} target="_blank" rel="noreferrer">{companyInfo.homepage}</a></li>
          </ul>
        </div>
      )}

      <h3 style={{ marginTop: "2rem" }}>📝 매매 전략</h3>
      <p>{stockData.strategy || "등록된 전략이 없습니다."}</p>

      <h3 style={{ marginTop: "2rem" }}>🧐 종목 설명</h3>
      <p>{stockData.detail || "등록된 설명이 없습니다."}</p>

      <div style={{ marginTop: "1rem" }}>
        {stockData.youtubeUrl && (
          <p><a href={stockData.youtubeUrl} target="_blank" rel="noreferrer">▶️ YouTube 보기</a></p>
        )}
        {stockData.threadsUrl && (
          <p><a href={stockData.threadsUrl} target="_blank" rel="noreferrer">💬 Threads 보기</a></p>
        )}
      </div>
    </div>
  );
}
