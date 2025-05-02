// 통합 index.json 관리 업로드 버전
export async function uploadStockJsonToGithub(
  { code, name, strategy, detail, supportLines, resistanceLines, youtubeUrl, threadsUrl, status },
  version
) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) throw new Error("GitHub 토큰이 설정되지 않았습니다");

  const shortCode = code.replace("A", "");
  const key = version ? `${shortCode}_${version.split("_")[1]}_${version.split("_")[2]}` : shortCode;
  const path = `frontend/src/data/stocks/index.json`;
  const url = `https://api.github.com/repos/jh9098/stocksrlab/contents/${path}`;

  const newEntry = {
    code,
    name,
    strategy,
    detail,
    supportLines,
    resistanceLines,
    youtubeUrl,
    threadsUrl,
    status,
  };

  // ✅ 기존 index.json 가져오기
  let sha = null;
  let indexJson = {};
  try {
    const res = await fetch(url, {
      headers: { Authorization: `token ${token}` },
    });
    if (res.ok) {
      const existing = await res.json();
      sha = existing.sha;
      const decoded = atob(existing.content);
      indexJson = JSON.parse(decoded);

      const existingEntry = indexJson[key];
      if (existingEntry && JSON.stringify(existingEntry) === JSON.stringify(newEntry)) {
        console.log(`⏩ 변경 없음: ${key}`);
        return;
      }
    }
  } catch (e) {
    console.warn("⚠️ index.json 초기 로딩 실패 (신규일 수 있음):", e.message);
  }

  // ✅ 업데이트 적용
  indexJson[key] = newEntry;
  const newContent = JSON.stringify(indexJson, null, 2);
  const encodedContent = btoa(unescape(encodeURIComponent(newContent)));

  const payload = {
    message: `분석 등록: ${name} (${code})`,
    content: encodedContent,
    branch: "main",
    ...(sha && { sha }),
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error("GitHub 업로드 실패: " + err.message);
  }

  return await response.json();
}
