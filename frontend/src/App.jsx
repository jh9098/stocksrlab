import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StockDetail from "./pages/StockDetail";
import Admin from "./pages/Admin";
import LinkLanding from "./pages/LinkLanding";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NavBar from "./components/NavBar";
import StockList from "./pages/StockList"; // 경로 확인 후 필요시 수정
import './App.css'; // ✅ 파일명 대소문자 포함 정확히
import Login from "./pages/Login";
import RequestBoard from "./pages/RequestBoard"; // ✅ 새로 만든 컴포넌트 import
import MyPage from "./pages/MyPage"; // ✅ 마이페이지 import
import KakaoRedirect from "./pages/KakaoRedirect"; // ✅ import 추가


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
      </Routes>
    </BrowserRouter>
  );
}
