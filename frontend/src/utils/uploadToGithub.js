// uploadToGithub.js: 변경 감지 + 업로드 최적화 버전

export async function uploadStockJsonToGithub(
  { code, name, strategy, detail, supportLines, resistanceLines, youtubeUrl, threadsUrl, status },
  version
) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) throw new Error("GitHub 토큰이 설정되지 않았습니다");

  const shortCode = code.replace("A", "");
  const filename = version ? `${version}.json` : `${shortCode}.json`;
  const path = `frontend/src/data/stocks/${filename}`;
  const url = `https://api.github.com/repos/jh9098/stocksrlab/contents/${path}`;

  const json = {
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

  const content = JSON.stringify(json, null, 2);
  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  let sha = null;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `token ${token}` },
    });

    if (res.status === 404) {
      console.log("🆕 신규 파일로 간주:", filename);
    } else if (res.ok) {
      const existing = await res.json();
      sha = existing.sha;

      const existingDecoded = decodeURIComponent(escape(atob(existing.content)));
      if (existingDecoded.trim() === content.trim()) {
        console.log(`⏩ 변경 없음: ${filename}`);
        return;
      }
    } else {
      const errText = await res.text();
      console.warn("📛 SHA 조회 실패 응답:", errText);
      throw new Error(`GitHub SHA 조회 실패 (${res.status}): ${res.statusText}`);
    }
  } catch (e) {
    console.warn("⚠️ SHA 조회 중 예외 발생:", e.message);
  }

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
    const errText = await response.text();
    throw new Error(`GitHub 업로드 실패 (${response.status}): ${errText}`);
  }

  console.log("✅ 업로드 성공:", filename);
  return await response.json();
}
