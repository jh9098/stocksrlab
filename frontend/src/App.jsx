import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react"; // ✅ 추가: lazy, Suspense import
import Home from "./pages/Home";
import StockDetail from "./pages/StockDetail";
// import Admin from "./pages/Admin"; // ❌ 기존 Admin import 제거
const Admin = lazy(() => import("./pages/Admin")); // ✅ lazy로 비동기 로딩
import LinkLanding from "./pages/LinkLanding";
import About from "./pages/About";
import Contact from "./pages/Contact";
import StockList from "./pages/StockList";
import Login from "./pages/Login";
import RequestBoard from "./pages/RequestBoard";
import MyPage from "./pages/MyPage";
import KakaoRedirect from "./pages/KakaoRedirect";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NavBar from "./components/NavBar";
import NotFound from "./pages/NotFound";

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stock/:code" element={<StockDetail />} />
        
        {/* ✅ Admin 페이지 비동기 로딩 */}
        <Route path="/admin" element={
          <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>관리자 페이지 로딩중...</div>}>
            <Admin />
          </Suspense>
        } />
        
        <Route path="/link" element={<LinkLanding />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/list" element={<StockList />} />
        <Route path="/request" element={<RequestBoard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/kakao-login" element={<KakaoRedirect />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        
        {/* 404 NotFound 페이지 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
