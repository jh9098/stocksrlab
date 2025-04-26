import { useState, useEffect } from "react";
import Select from "react-select";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { ADMIN_UIDS } from "../constants/roles"; // 추가!

export default function RequestBoard() {
  const [stockOptions, setStockOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [requests, setRequests] = useState([]);
  const [top5, setTop5] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login", { state: { from: location } });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch("/data/stock_metadata.json");
        const data = await res.json();
        const options = Object.entries(data).map(([code, item]) => ({
          value: code,
          label: `${item.company} (${code})`,
        }));
        setStockOptions(options);
      } catch (error) {
        console.error("❌ 종목 데이터 로딩 실패:", error);
      }
    };

    fetchStocks();
  }, []);

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
        name: data.find(d => d.stockCode === code)?.stockName || code,
        count,
      }));
    setTop5(top);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인 후 이용해주세요");
      return;
    }
    if (!selected || !amount || !price) {
      alert("모든 항목을 입력해주세요");
      return;
    }

    // ✅ 관리자 아니면 하루 1건 제한
    if (!ADMIN_UIDS.includes(user.uid)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const q = query(
        collection(db, "requests"),
        where("uid", "==", user.uid),
        where("createdAt", ">=", today.toISOString()),
        where("createdAt", "<", tomorrow.toISOString())
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        alert("🚫 하루에 1종목만 요청할 수 있습니다.");
        return;
      }
    }

    // Firestore에 등록
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
      alert("✅ 요청이 등록되었습니다!");
      setSelected(null);
      setAmount("");
      setPrice("");
      fetchRequests();
    } catch (err) {
      console.error("❌ 등록 실패:", err);
      alert("등록에 실패했습니다.");
    }
  };

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
    </div>
  );
}
