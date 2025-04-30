import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ChartComponent from "../components/Chart";

const stockModules = import.meta.glob("../data/stocks/*.json"); // lazy 로딩
const crawledModules = import.meta.glob("../data/crawled/*.json");

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
    let isMounted = true;
    const loadStockData = async () => {
      let selectedPath = null;

      if (version) {
        selectedPath = Object.keys(stockModules).find((path) =>
          path.includes(`${version}.json`)
        );
      }

      if (!selectedPath) {
        const matches = Object.keys(stockModules)
          .filter((path) => path.includes(`${shortCode}_`))
          .sort((a, b) => b.localeCompare(a));
        if (matches.length > 0) selectedPath = matches[0];
      }

      if (!selectedPath) {
        console.log("❌ 분석 stock JSON을 찾을 수 없음");
        if (isMounted) {
          setStockData(null);
          setLoading(false);
        }
        return;
      }

      const module = await stockModules[selectedPath]();
      if (isMounted) setStockData(module.default);

      // 🔄 크롤링 데이터도 동적으로 로딩
      const crawledPath = Object.keys(crawledModules).find((path) =>
        path.includes(`${shortCode}.json`)
      );

      let prices = [];
      if (crawledPath) {
        const crawledModule = await crawledModules[crawledPath]();
        prices = crawledModule.default?.prices || [];
      }

      const parsed = prices
        .filter(
          (d) =>
            d.date &&
            Number.isFinite(d.open) &&
            Number.isFinite(d.high) &&
            Number.isFinite(d.low) &&
            Number.isFinite(d.price)
        )
        .map((d) => ({
          time: new Date(d.date),
          open: Number(d.open),
          high: Number(d.high),
          low: Number(d.low),
          close: Number(d.price),
          volume: Number.isFinite(d.volume) ? d.volume : 0,
        }))
        .reverse();

      if (isMounted) {
        setChartData(parsed);
        setLoading(false);
      }
    };

    loadStockData();
    return () => {
      isMounted = false;
    };
  }, [shortCode, version]);

  useEffect(() => {
    fetch("/data/stock_metadata.json")
      .then((res) => res.json())
      .then((json) => setCompanyInfo(json[shortCode]))
      .catch(() => setCompanyInfo(null));
  }, [shortCode]);

  const formatVersionDate = (ver) => {
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
