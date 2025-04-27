// ✅ Admin.jsx (Git Auto Commit 모드 추가 리팩토링)
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
  const [gitAutoDeploy, setGitAutoDeploy] = useState(true);
  const [pendingActions, setPendingActions] = useState([]);
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
      .then(meta => {
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

    if (gitAutoDeploy) {
      setStatus("🚀 업로드 중...");
      try {
        await uploadStockJsonToGithub(payload, version);
        setStatus("✅ 업로드 성공!");
        window.location.reload();
      } catch (err) {
        console.error(err);
        setStatus("❌ 업로드 실패: " + err.message);
      }
    } else {
      setPendingActions(prev => [...prev, { type: "upload", payload, version }]);
      setStatus("📝 수정 대기 중...");
    }
    setForm({ code: "", name: "", strategy: "", supportLines: "", resistanceLines: "", youtubeUrl: "", threadsUrl: "" });
    setEditingVersion(null);
  };

  const handleDelete = (version) => {
    if (gitAutoDeploy) {
      if (window.confirm(`${version} 파일을 삭제할까요?`)) {
        deleteStockJsonFromGithub(version)
          .then(() => {
            setStatus("🗑️ 삭제 완료");
            window.location.reload();
          })
          .catch(err => {
            console.error(err);
            setStatus("❌ 삭제 실패: " + err.message);
          });
      }
    } else {
      if (window.confirm(`${version} 파일을 삭제할까요?`)) {
        setPendingActions(prev => [...prev, { type: "delete", version }]);
        setStatus("📝 삭제 대기 중...");
      }
    }
  };

  const handleComplete = (stock) => {
    if (gitAutoDeploy) {
      uploadStockJsonToGithub({ ...stock, status: "완료" }, stock.version)
        .then(() => {
          setStatus("✅ 완료 처리 성공!");
          window.location.reload();
        })
        .catch(err => {
          console.error(err);
          setStatus("❌ 완료 처리 실패: " + err.message);
        });
    } else {
      setPendingActions(prev => [...prev, { type: "complete", stock }]);
      setStatus("📝 완료 대기 중...");
    }
  };

  const handleBatchCommit = async () => {
    setStatus("🚀 변경사항 저장 중...");
    try {
      for (const action of pendingActions) {
        if (action.type === "upload") {
          await uploadStockJsonToGithub(action.payload, action.version);
        } else if (action.type === "delete") {
          await deleteStockJsonFromGithub(action.version);
        } else if (action.type === "complete") {
          await uploadStockJsonToGithub({ ...action.stock, status: "완료" }, action.stock.version);
        }
      }
      setStatus("✅ 모든 변경사항 저장 완료!");
      setPendingActions([]);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setStatus("❌ 일괄 저장 실패: " + err.message);
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
      <h2>📈 종목 등록/수정</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={gitAutoDeploy}
            onChange={() => setGitAutoDeploy(prev => !prev)}
          />{' '}
          Git 자동 저장/배포 모드
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

        <button type="submit">{editingVersion ? "수정 저장" : "업로드"}</button>
        {editingVersion && (
          <button type="button" onClick={() => { setForm({ code: "", name: "", strategy: "", supportLines: "", resistanceLines: "", youtubeUrl: "", threadsUrl: "" }); setEditingVersion(null); }}>취소</button>
        )}
      </form>

      {pendingActions.length > 0 && (
        <button onClick={handleBatchCommit} style={{ marginBottom: "1rem", backgroundColor: "orange", color: "white", padding: "0.5rem 1rem" }}>변경사항 저장하기</button>
      )}

      {status && <p>{status}</p>}

      <h3>🗂️ 등록된 전체 종목</h3>
      <ul>
        {stocks.map(stock => (
          <li key={stock.version} style={{ marginBottom: "1rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>{stock.name || "Unknown"}</strong> ({stock.code}) - {formatVersion(stock.version)}<br />
              🛡️ 지지선: {stock.supportLines?.join(", ") || "-"} / 🛡️ 저항선: {stock.resistanceLines?.join(", ") || "-"} / 📝 전략: {stock.strategy || "-"}
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
