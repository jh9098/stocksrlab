import { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { uploadStockJsonToGithub } from "../utils/uploadToGithub";
import { deleteStockJsonFromGithub } from "../utils/deleteFromGithub";

const dataModules = import.meta.glob("../data/stocks/*.json", { eager: true });
const ADMIN_UID = "4vqkhd7oznd8eP4eqylcHhlh3QY2";

export default function Admin() {
  const [form, setForm] = useState({
    code: "",
    name: "",
    strategy: "",
    supportLines: "",
    resistanceLines: "",
    youtubeUrl: "",
    threadsUrl: "",
  });
  const [stockOptions, setStockOptions] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [status, setStatus] = useState("");
  const [stocks, setStocks] = useState([]);
  const [editingVersion, setEditingVersion] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null); // null=로딩중, true/false=결정됨
  const navigate = useNavigate();

  // ✅ 관리자 접근 제한
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || user.uid !== ADMIN_UID) {
        alert("관리자 전용 페이지입니다.");
        navigate("/", { replace: true });
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ 메타데이터 fetch
  useEffect(() => {
    fetch("/data/stock_metadata.json")
      .then((res) => res.json())
      .then((data) => {
        setMetadata(data);
        const options = Object.entries(data).map(([code, info]) => ({
          value: code,
          label: `${info.company} (${code})`,
        }));
        setStockOptions(options);
      })
      .catch(() => setMetadata({}));
  }, []);

  // ✅ 기존 종목 불러오기
  useEffect(() => {
    const stockList = [];

    for (const path in dataModules) {
      const filename = path.split("/").pop().replace(".json", "");
      const parts = filename.split("_");
      if (parts.length !== 3) continue;

      const [code, date, time] = parts;
      const version = `${code}_${date}_${time}`;

      stockList.push({
        ...dataModules[path].default,
        version,
        code,
      });
    }

    stockList.sort((a, b) => b.version.localeCompare(a.version));
    setStocks(stockList);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (selected) => {
    const code = selected.value;
    const name = metadata[code]?.company || "";
    setForm({ ...form, code: "A" + code, name });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("🚀 업로드 중...");

    try {
      const payload = {
        ...form,
        supportLines: form.supportLines.split(",").map(Number),
        resistanceLines: form.resistanceLines.split(",").map(Number),
        status: "진행중",
      };

      let version = editingVersion;
      if (!version) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        version = `${payload.code.replace("A", "")}_${yyyy}${mm}${dd}_${hh}${min}`;
      }

      await uploadStockJsonToGithub(payload, version);
      setStatus("✅ 업로드 성공!");
      setForm({
        code: "",
        name: "",
        strategy: "",
        supportLines: "",
        resistanceLines: "",
        youtubeUrl: "",
        threadsUrl: "",
      });
      setEditingVersion(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setStatus("❌ 업로드 실패: " + err.message);
    }
  };

  const handleDelete = async (version) => {
    if (!window.confirm(`정말로 ${version}.json 파일을 삭제하시겠습니까?`)) return;
    try {
      await deleteStockJsonFromGithub(version);
      setStocks((prev) => prev.filter((s) => s.version !== version));
      setStatus("🗑️ 삭제 완료");
    } catch (err) {
      console.error(err);
      setStatus("❌ 삭제 실패: " + err.message);
    }
  };

  const handleEdit = (stock) => {
    setForm({
      code: stock.code.startsWith("A") ? stock.code : "A" + stock.code,
      name: stock.name,
      strategy: stock.strategy,
      supportLines: stock.supportLines.join(","),
      resistanceLines: stock.resistanceLines.join(","),
      youtubeUrl: stock.youtubeUrl || "",
      threadsUrl: stock.threadsUrl || "",
    });
    setEditingVersion(stock.version);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleComplete = async (stock) => {
    const updatedStock = { ...stock, status: "완료" };
    try {
      setStatus("✅ 완료 처리 중...");
      await uploadStockJsonToGithub(updatedStock, stock.version);
      setStatus("✅ 완료 처리 성공!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      setStatus("❌ 완료 처리 실패: " + err.message);
    }
  };

  const formatVersion = (version) => {
    const [code, date, time] = version.split("_");
    return `${code} / ${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)} ${time.slice(0, 2)}:${time.slice(2)}`;
  };

  // ✅ 관리자 권한 확인 중 로딩 처리
  if (isAuthorized === null) return <p>로딩 중...</p>;
  if (isAuthorized === false) return null;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h2>📈 종목분석 {editingVersion ? "수정" : "업로드"}</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>종목 검색</strong></label>
          <Select
            options={stockOptions}
            onChange={handleSelect}
            placeholder="종목명으로 검색하세요"
            isClearable
          />
        </div>

        {["code", "name", "strategy", "supportLines", "resistanceLines", "youtubeUrl", "threadsUrl"].map((key) => (
          <div key={key} style={{ marginBottom: "1rem" }}>
            <label><strong>{key}</strong></label>
            <input
              type="text"
              name={key}
              value={form[key]}
              onChange={handleChange}
              required={key !== "youtubeUrl" && key !== "threadsUrl"}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
        ))}

        <button type="submit" style={{ padding: "0.75rem 1.5rem" }}>
          {editingVersion ? "수정 저장" : "업로드"}
        </button>
        {editingVersion && (
          <button
            type="button"
            onClick={() => {
              setEditingVersion(null);
              setForm({
                code: "",
                name: "",
                strategy: "",
                supportLines: "",
                resistanceLines: "",
                youtubeUrl: "",
                threadsUrl: "",
              });
            }}
            style={{ marginLeft: "1rem" }}
          >
            취소
          </button>
        )}
      </form>

      {status && <p>{status}</p>}

      <h3 style={{ marginTop: "3rem" }}>🗂️ 등록된 종목 목록</h3>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.version} style={{ marginBottom: "0.75rem" }}>
            {stock.name} ({stock.code}) - {formatVersion(stock.version)}
            <button onClick={() => handleEdit(stock)} style={{ marginLeft: "1rem", color: "blue" }}>수정</button>
            <button onClick={() => handleDelete(stock.version)} style={{ marginLeft: "0.5rem", color: "red" }}>삭제</button>
            {stock.status !== "완료" ? (
              <button onClick={() => handleComplete(stock)} style={{ marginLeft: "0.5rem", color: "green" }}>완료 처리</button>
            ) : (
              <span style={{ marginLeft: "0.5rem", color: "gray" }}>✅ 완료됨</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
