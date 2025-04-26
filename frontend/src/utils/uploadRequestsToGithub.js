// ✅ frontend/src/utils/uploadRequestsToGithub.js

export async function uploadRequestsToGithub(requests) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) throw new Error("GitHub 토큰이 설정되지 않았습니다");

  // ✅ 저장 경로 변경
  const path = "frontend/public/data/requests/index.json";
  const url = `https://api.github.com/repos/jh9098/stocksrlab/contents/${path}`;

  const content = JSON.stringify(requests, null, 2);
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
        console.log("⏩ 변경 없음: index.json");
        return;
      }
    }
  } catch (e) {
    console.warn("기존 SHA 조회 실패 (신규 파일일 수 있음):", e.message);
  }

  const payload = {
    message: `📝 요청 업데이트: ${new Date().toISOString()}`,
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
