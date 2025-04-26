import { useEffect, useRef } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";

export default function ChartComponent({
  chartData,
  supportLines = [],
  resistanceLines = [],
}) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    console.log("📊 ChartComponent 렌더링 시작");

    if (!Array.isArray(chartData) || chartData.length === 0) {
      console.error("❌ chartData가 비어있습니다.");
      return;
    }

    // ✅ 데이터 정제: 유효성 검사 → timestamp 변환 → 정렬 → 중복 제거
    const refinedData = chartData
      .filter(
        (d) =>
          d.time instanceof Date &&
          Number.isFinite(d.open) &&
          Number.isFinite(d.high) &&
          Number.isFinite(d.low) &&
          Number.isFinite(d.close)
      )
      .map((d) => ({
        time: d.time.getTime() / 1000, // LightweightCharts expects seconds
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
      .sort((a, b) => a.time - b.time)
      .filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);

    if (refinedData.length === 0) {
      console.error("❌ 유효한 차트 데이터가 없습니다.");
      return;
    }

    // ✅ 차트 생성
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        textColor: "#d1d4dc",
        background: { type: "Solid", color: "#000000" },
      },
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      priceScale: { borderVisible: true },
      timeScale: {
        borderVisible: true,
        timeVisible: true,
      },
    });

    // ✅ 캔들 시리즈
    const candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(refinedData);

    // ✅ 지지선 시리즈
    supportLines.forEach((price) => {
      const supportLine = chart.addLineSeries({
        color: "#00ff00",
        lineWidth: 1,
      });
      supportLine.setData(
        refinedData.map((d) => ({ time: d.time, value: price }))
      );
    });

    // ✅ 저항선 시리즈
    resistanceLines.forEach((price) => {
      const resistanceLine = chart.addLineSeries({
        color: "red",
        lineWidth: 1,
      });
      resistanceLine.setData(
        refinedData.map((d) => ({ time: d.time, value: price }))
      );
    });

    // ✅ 반응형 리사이즈
    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [chartData, supportLines, resistanceLines]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "400px",
      }}
    />
  );
}
