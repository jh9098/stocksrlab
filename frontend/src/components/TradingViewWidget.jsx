import React, { useEffect, useRef, memo } from "react";

function TradingViewWidget({ symbol = "NASDAQ:NDX", height = 300 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "light",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      hide_volume: true,
      support_host: "https://www.tradingview.com",
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = ""; // 기존 내용 비우고
      containerRef.current.appendChild(script);
    }
  }, [symbol]); // symbol이 바뀔 때마다 다시 로드

  return (
    <div 
      className="tradingview-widget-container" 
      ref={containerRef} 
      style={{ height, width: "100%" }}
    >
      <div 
        className="tradingview-widget-container__widget" 
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

export default memo(TradingViewWidget);
