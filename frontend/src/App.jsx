import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import NavBar from "./components/NavBar";
import NotFound from "./pages/NotFound";
import ThemeEnergy from "./pages/ThemeEnergy";

import './App.css';

// Lazy import
const Home = lazy(() => import("./pages/Home"));
const StockDetail = lazy(() => import("./pages/StockDetail"));
const Admin = lazy(() => import("./pages/Admin"));
const LinkLanding = lazy(() => import("./pages/LinkLanding"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const StockList = lazy(() => import("./pages/StockList"));
const Login = lazy(() => import("./pages/Login"));
const RequestBoard = lazy(() => import("./pages/RequestBoard"));
const MyPage = lazy(() => import("./pages/MyPage"));
const KakaoRedirect = lazy(() => import("./pages/KakaoRedirect"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>로딩중...</div>}>
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
          <Route path="*" element={<NotFound />} />
          <Route path="/theme/energy" element={<ThemeEnergy />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
