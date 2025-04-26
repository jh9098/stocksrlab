export default function LinkLanding() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>지지저항 Lab</h1>
      <p>지지선과 저항선으로 타점을 잡는 기술적 분석 플랫폼</p>

      <div style={{ marginTop: "2rem" }}>
        <a href="/" style={btn}>📊 주식 분석 사이트</a><br /><br />
        <a href="https://www.youtube.com/@stocksrlab" target="_blank" style={btn}>▶️ YouTube Shorts</a><br /><br />
        <a href="https://open.kakao.com/me/stocksrlab" target="_blank" style={btn}>💬 카카오 오픈채팅방</a>
      </div>

      <div style={{ marginTop: "3rem", fontSize: "0.9rem", color: "#777" }}>
        Threads에서 오신 여러분 환영합니다!
      </div>
    </div>
  );
}

const btn = {
  display: "inline-block",
  padding: "1rem 2rem",
  fontSize: "1rem",
  background: "#111",
  color: "#fff",
  borderRadius: "8px",
  textDecoration: "none"
};
