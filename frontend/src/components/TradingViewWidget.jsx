import React, { useEffect, useRef, memo } from "react";

function TradingViewWidget({ symbol = "NASDAQ:NDX", height = 300 }) {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "hide_volume": true,
        "support_host": "https://www.tradingview.com"
      }`;
    container.current.innerHTML = ""; // 초기화
    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height, width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewWidget);
