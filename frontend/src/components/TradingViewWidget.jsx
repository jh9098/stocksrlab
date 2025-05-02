import { useEffect, useRef, memo } from "react";

function TradingViewWidget({ symbol = "NASDAQ:NDX", height = 300 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.async = true;
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
        containerRef.current.appendChild(script);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ height, width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

export default function TradingViewWidget() {
  return null;
}

