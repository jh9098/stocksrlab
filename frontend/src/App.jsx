import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StockDetail from "./pages/StockDetail";
import Admin from "./pages/Admin";
import LinkLanding from "./pages/LinkLanding";
import About from "./pages/About";
import Contact from "./pages/Contact";
import StockList from "./pages/StockList";
import Login from "./pages/Login";
import RequestBoard from "./pages/RequestBoard";
import MyPage from "./pages/MyPage";
import KakaoRedirect from "./pages/KakaoRedirect";
import Privacy from "./pages/Privacy"; // ✅ 개인정보 처리방침
import Terms from "./pages/Terms";     // ✅ 이용약관
import NavBar from "./components/NavBar";
import NotFound from "./pages/NotFound"; // ✅ 추가: 404 페이지

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stock/:code" element={<StockDetail />} />
        <Route path="/admin" element={<Admin />} />
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
        
        {/* ✅ 마지막에 추가: 존재하지 않는 경로 대응 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}