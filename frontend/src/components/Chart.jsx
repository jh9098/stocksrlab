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
        time: Math.floor(d.time.getTime() / 1000), // lightweight-charts는 초 단위 timestamp
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
      .sort((a, b) => a.time - b.time)
      .filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);

    if (refinedData.length === 0) return;

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
