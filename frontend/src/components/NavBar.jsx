import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 960);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 960);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/");
  };

  const linkStyle = {
    color: "inherit",
    textDecoration: "none",
    fontWeight: "bold",
    whiteSpace: "nowrap"
  };

  const mainLinks = [
    { to: "/list", label: "📈 종목리스트" },
    { to: "/admin", label: "➕ 분석등록" },
    { to: "/request", label: "🗳️ 요청게시판" },
  ];

  const subLinks = [
    { to: "/link", label: "🧭 관련페이지" },
    { to: "/about", label: "❓ 소개" },
    { to: "/contact", label: "📞 문의" },
  ];

  const renderLinks = () => (
    <>
      {mainLinks.map((link) => (
        <Link key={link.to} to={link.to} style={linkStyle}>
          {link.label}
        </Link>
      ))}

      <div style={{ position: "relative" }}>
        <span
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}
        >
          📁 기타 ▾
        </span>

        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "2rem",
              background: "#fff",
              border: "1px solid #ddd",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              zIndex: 999,
              padding: "0.5rem",
              minWidth: "150px"
            }}
          >
            {subLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: "block",
                  padding: "0.5rem 0",
                  textDecoration: "none",
                  color: "#333"
                }}
                onClick={() => setShowDropdown(false)} // 닫기
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderUserLinks = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      {user ? (
        <>
          <Link to="/mypage" style={linkStyle}>👤 마이페이지</Link>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            🔓 로그아웃
          </button>
        </>
      ) : (
        <Link to="/login" style={linkStyle}>🔐 로그인</Link>
      )}
    </div>
  );

  return (
    <nav>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "1rem"
      }}>
        <Link to="/" style={{
          fontSize: "1.3rem",
          fontWeight: "bold",
          color: "inherit",
          textDecoration: "none"
        }}>
          📊 지지저항 Lab
        </Link>

        {!isMobile ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              {renderLinks()}
            </div>
            {renderUserLinks()}
          </>
        ) : (
          <button
            onClick={() => setOpen(!open)}
            style={{
              fontSize: "1.5rem",
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        )}
      </div>

      {/* 모바일 메뉴 */}
      {isMobile && open && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          paddingBottom: "1rem"
        }}>
          {renderLinks()}
          {renderUserLinks()}
        </div>
      )}
    </nav>
  );
}
