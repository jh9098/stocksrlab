import { useRef, useState, useEffect } from "react";

export default function LazyYoutube({ videoId, width = 300, height = 170 }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoaded(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width, height, background: "#000" }}>
      {loaded && (
        <iframe
          loading="lazy"
          width={width}
          height={height}
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
}
