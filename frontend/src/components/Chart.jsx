import { useEffect, useRef } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";

export default function ChartComponent({
  chartData,
  supportLines = [],
  resistanceLines = [],
}) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(chartData) || chartData.length === 0) return;

    const refinedData = chartData
      .filter(d =>
        d.time instanceof Date &&
        Number.isFinite(d.open) &&
        Number.isFinite(d.high) &&
        Number.isFinite(d.low) &&
        Number.isFinite(d.close)
      )
      .map(d => ({
        time: Math.floor(d.time.getTime() / 1000),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
      .sort((a, b) => a.time - b.time)
      .filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);

    if (refinedData.length === 0) return;

    // ✅ 렌더링 최적화: requestAnimationFrame 내부에서 차트 생성
    const rafId = requestAnimationFrame(() => {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { type: "Solid", color: "#ffffff" },
          textColor: "#000000",
        },
        grid: {
          vertLines: { color: "#e0e0e0" },
          horzLines: { color: "#e0e0e0" },
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
      chart.timeScale().fitContent(); // ✅ 축 자동 확대 방지

      // 지지선 그리기
      supportLines.forEach(price => {
        const supportLine = chart.addLineSeries({ color: "#00aa00", lineWidth: 1 });
        supportLine.setData(refinedData.map(d => ({ time: d.time, value: price })));
      });

      // 저항선 그리기
      resistanceLines.forEach(price => {
        const resistanceLine = chart.addLineSeries({ color: "#aa0000", lineWidth: 1 });
        resistanceLine.setData(refinedData.map(d => ({ time: d.time, value: price })));
      });

      const resizeObserver = new ResizeObserver(() => {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      });

      resizeObserver.observe(chartContainerRef.current);

      // 정리
      return () => {
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        chart.remove();
      };
    });

    // 만일 requestAnimationFrame 전에 컴포넌트 언마운트되면 취소
    return () => cancelAnimationFrame(rafId);
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
