import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>404</h1>
      <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
        페이지를 찾을 수 없습니다.
      </p>
      <Link
        to="/"
        style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#1976d2",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "1rem",
        }}
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}