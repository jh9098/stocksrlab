import { useState, useEffect } from "react";
import Select from "react-select";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import stockMeta from "../../public/data/stock_metadata.json";
import { useNavigate, useLocation } from "react-router-dom";

export default function RequestBoard() {
  const [stockOptions, setStockOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [requests, setRequests] = useState([]);
  const [top5, setTop5] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 로그인 여부 확인 (회원 전용 페이지)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login", { state: { from: location } });
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ 종목 옵션 구성
  useEffect(() => {
    const options = Object.entries(stockMeta).map(([code, data]) => ({
      value: code,
      label: `${data.company} (${code})`,
    }));
    setStockOptions(options);
  }, []);

  // ✅ 요청 등록 핸들러
  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인 후 등록해주세요");
      return;
    }
    if (!selected || !amount || !price) {
      alert("모든 항목을 입력해주세요");
      return;
    }

    const payload = {
      uid: user.uid,
      stockCode: selected.value,
      stockName: selected.label.split(" (")[0],
      amount: Number(amount),
      price: Number(price),
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "requests"), payload);
      alert("요청이 등록되었습니다!");
      setSelected(null);
      setAmount("");
      setPrice("");
      fetchRequests();
    } catch (err) {
      console.error("등록 실패", err);
    }
  };

  // ✅ 요청 리스트 및 TOP5 불러오기
  const fetchRequests = async () => {
    const snapshot = await getDocs(query(collection(db, "requests"), orderBy("createdAt", "desc")));
    const data = snapshot.docs.map(doc => doc.data());
    setRequests(data);

    const counts = {};
    data.forEach(req => {
      counts[req.stockCode] = (counts[req.stockCode] || 0) + 1;
    });

    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code, count]) => ({
        code,
        name: stockMeta[code]?.company || code,
        count,
      }));
    setTop5(top);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: "2rem" }}>
      <h2>📝 종목 요청 게시판</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label><strong>종목명</strong></label>
        <Select
          options={stockOptions}
          value={selected}
          onChange={setSelected}
          placeholder="종목명을 검색하세요"
          isClearable
        />
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label><strong>비중 (%)</strong></label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label><strong>평단가</strong></label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
      </div>

      <button onClick={handleSubmit} style={{ padding: "0.75rem 1.5rem" }}>
        요청 등록
      </button>

      <hr style={{ margin: "2rem 0" }} />

      <h3>🔥 요청 많은 종목 TOP 5</h3>
      <ul>
        {top5.map((item, idx) => (
          <li key={item.code}>
            {idx + 1}. {item.name} ({item.code}) - {item.count}회 요청
          </li>
        ))}
      </ul>

      <hr style={{ margin: "2rem 0" }} />

      <h3>📋 전체 요청 내역</h3>
      <ul>
        {requests.map((req, idx) => (
          <li key={idx}>
            {req.stockName} ({req.stockCode}) - 비중: {req.amount}% / 평단: {req.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
