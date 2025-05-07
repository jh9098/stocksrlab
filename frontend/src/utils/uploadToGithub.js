// uploadToGithub.js: 변경 감지 + 업로드 최적화 버전

export async function uploadStockJsonToGithub(
  { code, name, strategy,detail, supportLines, resistanceLines, youtubeUrl, threadsUrl, status },
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
    status, // ✅ 중요!
  };

  const content = JSON.stringify(json, null, 2);
  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  let sha = null;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `token ${token}` },
    });
    if (res.ok) {
      const existing = await res.json();
      sha = existing.sha;

      // ✅ 변경 감지: 내용이 같으면 커밋 생략
      const existingDecoded = atob(existing.content);
      if (existingDecoded.trim() === content.trim()) {
        console.log(`⏩ 변경 없음: ${filename}`);
        return;
      }
    }
  } catch (e) {
    console.warn("기존 SHA 조회 실패 (신규 파일일 수 있음):", e.message);
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
    const err = await response.json();
    throw new Error("GitHub 업로드 실패: " + err.message);
  }

  return await response.json();
}
