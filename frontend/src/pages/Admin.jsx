// ✅ Admin.jsx (일괄 저장/배포 + 수정 에러 수정 버전)
import { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { uploadStockJsonToGithub } from "../utils/uploadToGithub";
import { deleteStockJsonFromGithub } from "../utils/deleteFromGithub";
import { Helmet } from "react-helmet";

const dataModules = import.meta.glob("../data/stocks/*.json", { eager: true });
const ADMIN_UID = "4vqkhd7oznd8eP4eqylcHhlh3QY2";

export default function Admin() {
  const [form, setForm] = useState({
    code: "",
    name: "",
    strategy: "",
    detail: "",
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
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [pendingActions, setPendingActions] = useState([]);
  const [pendingNewStocks, setPendingNewStocks] = useState([]);
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
    const payload = {
      ...form,
      detail: form.detail, // 명시적으로 추가
      supportLines: form.supportLines.split(",").map(Number),
      resistanceLines: form.resistanceLines.split(",").map(Number),
      status: "진행중",
    };
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const version = `${payload.code.replace("A", "")}_${yyyy}${mm}${dd}_${hh}${min}`;

    if (autoDeploy) {
      setStatus("🚀 업로드 중...");
      try {
        await uploadStockJsonToGithub(payload, version);
        window.location.reload();
      } catch (err) {
        console.error(err);
        setStatus("❌ 업로드 실패: " + err.message);
      }
    } else {
      setPendingNewStocks(prev => [...prev, { payload, version }]);
      setStatus("📝 등록 대기 중...");
      setForm({ code: "", name: "", strategy: "",detail: "", supportLines: "", resistanceLines: "", youtubeUrl: "", threadsUrl: "" });
    }
  };

  const handleEdit = (stock) => {
    setForm({
      code: stock.code.startsWith("A") ? stock.code : "A" + stock.code,
      name: stock.name || "",
      strategy: stock.strategy || "",
      detail: stock.detail || "",
      supportLines: stock.supportLines?.join(",") || "",
      resistanceLines: stock.resistanceLines?.join(",") || "",
      youtubeUrl: stock.youtubeUrl || "",
      threadsUrl: stock.threadsUrl || "",
    });
    setEditingVersion(stock.version);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (version) => {
    if (autoDeploy) {
      if (!window.confirm(`${version} 파일을 삭제할까요?`)) return;
      try {
        await deleteStockJsonFromGithub(version);
        window.location.reload();
      } catch (err) {
        console.error(err);
        setStatus("❌ 삭제 실패: " + err.message);
      }
    } else {
      setPendingActions(prev => [...prev, { type: "delete", version }]);
      setStatus("📝 삭제 대기 중...");
    }
  };

  const handleComplete = async (stock) => {
    if (autoDeploy) {
      try {
        await uploadStockJsonToGithub({ ...stock, status: "완료" }, stock.version);
        window.location.reload();
      } catch (err) {
        console.error(err);
        setStatus("❌ 완료 처리 실패: " + err.message);
      }
    } else {
      setPendingActions(prev => [...prev, { type: "complete", stock }]);
      setStatus("📝 완료 대기 중...");
    }
  };

  const applyAllChanges = async () => {
    try {
      for (const { type, version, stock } of pendingActions) {
        if (type === "delete") {
          await deleteStockJsonFromGithub(version);
        } else if (type === "complete") {
          await uploadStockJsonToGithub({ ...stock, status: "완료" }, stock.version);
        }
      }
      for (const { payload, version } of pendingNewStocks) {
        await uploadStockJsonToGithub(payload, version);
      }
      alert("✅ 모든 변경사항 업로드 완료!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ 변경사항 적용 실패: " + err.message);
    }
  };

  const formatVersion = (v) => {
    const [code, date, time] = v.split("_");
    return `${code} / ${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)} ${time.slice(0, 2)}:${time.slice(2)}`;
  };

  if (isAuthorized === null) return <p>로딩 중...</p>;
  if (isAuthorized === false) return null;

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "auto" }}>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <h2>📈 종목 등록/수정</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input type="checkbox" checked={autoDeploy} onChange={() => setAutoDeploy(!autoDeploy)} />
          변경 즉시 Git 저장 및 배포 (OFF시 일괄 저장)
        </label>
      </div>

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

        <button type="submit">{editingVersion ? "수정 저장" : "신규 업로드"}</button>
        {editingVersion && (
          <button type="button" onClick={() => { setForm({ code: "", name: "", strategy: "",detail: "", supportLines: "", resistanceLines: "", youtubeUrl: "", threadsUrl: "" }); setEditingVersion(null); }}>취소</button>
        )}
      </form>

      {status && <p>{status}</p>}

      {!autoDeploy && (pendingActions.length > 0 || pendingNewStocks.length > 0) && (
        <button onClick={applyAllChanges} style={{ backgroundColor: "green", color: "white", padding: "0.75rem", marginBottom: "2rem" }}>
          🚀 변경사항 저장하기
        </button>
      )}

      <h3>🗂️ 등록된 전체 종목</h3>
      <ul>
        {stocks.map(stock => (
          <li key={stock.version} style={{ marginBottom: "1rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>{stock.name || "Unknown"}</strong> ({stock.code}) - {formatVersion(stock.version)}<br />
              🛡️ 지지선: {stock.supportLines?.join(", ") || "-"} / 🛡️ 저항선: {stock.resistanceLines?.join(", ") || "-"} / 📝 전략: {stock.strategy || "-"}  / 📝 설명: {stock.detail || "-"}
            </div>
            <button onClick={() => handleEdit(stock)} style={{ marginRight: "0.5rem", color: "blue" }}>수정</button>
            <button onClick={() => handleDelete(stock.version)} style={{ marginRight: "0.5rem", color: "red" }}>삭제</button>
            {stock.status !== "완료" ? (
              <button onClick={() => handleComplete(stock)} style={{ color: "green" }}>완료처리</button>
            ) : (
              <span style={{ marginLeft: "0.5rem", color: "gray" }}>✅ 완료됨</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
