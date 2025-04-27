// ✅ Admin.jsx (완성 리팩토링)
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
  const [stocks, setStocks] = useState([]);
  const [editingVersion, setEditingVersion] = useState(null);
  const [status, setStatus] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user || user.uid !== ADMIN_UID) {
        alert("관리자 전용 페이지입니다.");
        navigate("/", { replace: true });
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetch("/data/stock_metadata.json")
      .then(res => res.json())
      .then((meta) => {
        setMetadata(meta);
        const opts = Object.entries(meta).map(([code, info]) => ({
          value: code,
          label: `${info.company} (${code})`
        }));
        setStockOptions(opts);
      })
      .catch(() => setMetadata({}));
  }, []);

  useEffect(() => {
    const loaded = [];
    for (const path in dataModules) {
      const filename = path.split("/").pop().replace(".json", "");
      const [code, date, time] = filename.split("_");
      if (!code || !date || !time) continue;
      const version = `${code}_${date}_${time}`;
      const data = dataModules[path]?.default;
      loaded.push({ ...data, version, code });
    }
    loaded.sort((a, b) => b.version.localeCompare(a.version));
    setStocks(loaded);
  }, []);

  const handleSelect = (selected) => {
    const code = selected?.value || "";
    const name = metadata[code]?.company || "";
    setForm({ ...form, code: "A" + code, name });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      setForm({ code: "", name: "", strategy: "", supportLines: "", resistanceLines: "", youtubeUrl: "", threadsUrl: "" });
      setEditingVersion(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setStatus("❌ 업로드 실패: " + err.message);
    }
  };

  const handleEdit = (stock) => {
    setForm({
      code: stock.code.startsWith("A") ? stock.code : "A" + stock.code,
      name: stock.name || "",
      strategy: stock.strategy || "",
      supportLines: stock.supportLines?.join(",") || "",
      resistanceLines: stock.resistanceLines?.join(",") || "",
      youtubeUrl: stock.youtubeUrl || "",
      threadsUrl: stock.threadsUrl || "",
    });
    setEditingVersion(stock.version);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (version) => {
    if (!window.confirm(`${version} 파일을 삭제할까요?`)) return;
    try {
      await deleteStockJsonFromGithub(version);
      setStatus("🗑️ 삭제 완료");
      setStocks(prev => prev.filter(s => s.version !== version));
    } catch (err) {
      console.error(err);
      setStatus("❌ 삭제 실패: " + err.message);
    }
  };

  const handleComplete = async (stock) => {
    try {
      setStatus("✅ 완료 처리 중...");
      await uploadStockJsonToGithub({ ...stock, status: "완료" }, stock.version);
      setStatus("✅ 완료 처리 성공!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      setStatus("❌ 완료 처리 실패: " + err.message);
    }
  };

  const formatVersion = (v) => {
    const [code, date, time] = v.split("_");
    return `${code} / ${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6)} ${time.slice(0,2)}:${time.slice(2)}`;
  };

  if (isAuthorized === null) return <p>로딩 중...</p>;
  if (isAuthorized === false) return null;

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h2>📈 종목 등록/수정</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <Select options={stockOptions} onChange={handleSelect} placeholder="종목 검색" isClearable style={{ marginBottom: "1rem" }} />

        {Object.keys(form).map(key => (
          <div key={key} style={{ marginBottom: "1rem" }}>
            <label><strong>{key}</strong></label>
            <input
              name={key}
              value={form[key]}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.5rem" }}
              required={key !== "youtubeUrl" && key !== "threadsUrl"}
            />
          </div>
        ))}

        <button type="submit">{editingVersion ? "수정 저장" : "업로드"}</button>
        {editingVersion && (
          <button type="button" onClick={() => { setForm({ code: "", name: "", strategy: "", supportLines: "", resistanceLines: "", youtubeUrl: "", threadsUrl: "" }); setEditingVersion(null); }}>취소</button>
        )}
      </form>

      {status && <p>{status}</p>}

      <h3>🗂️ 등록된 전체 종목</h3>
      <ul>
        {stocks.map(stock => (
          <li key={stock.version} style={{ marginBottom: "0.75rem" }}>
            {stock.name || "Unknown"} ({stock.code}) - {formatVersion(stock.version)}
            <button onClick={() => handleEdit(stock)} style={{ marginLeft: "1rem", color: "blue" }}>수정</button>
            <button onClick={() => handleDelete(stock.version)} style={{ marginLeft: "0.5rem", color: "red" }}>삭제</button>
            {stock.status !== "완료" ? (
              <button onClick={() => handleComplete(stock)} style={{ marginLeft: "0.5rem", color: "green" }}>완료처리</button>
            ) : (
              <span style={{ marginLeft: "0.5rem", color: "gray" }}>✅ 완료됨</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
