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
      console.warn("❌ chartData가 비어있습니다.");
      return;
    }

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
        time: Math.floor(d.time.getTime() / 1000),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
      .sort((a, b) => a.time - b.time)
      .filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);

    if (refinedData.length === 0) {
      console.warn("❌ 유효한 차트 데이터가 없습니다.");
      return;
    }

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

    const candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(refinedData);

    const renderHorizontalLine = (price, color) => {
      const lineSeries = chart.addLineSeries({ color, lineWidth: 1 });
      lineSeries.setData(
        refinedData.map((d) => ({ time: d.time, value: price }))
      );
    };

    supportLines.forEach((price) => renderHorizontalLine(price, "#00ff00"));
    resistanceLines.forEach((price) => renderHorizontalLine(price, "red"));

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
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
