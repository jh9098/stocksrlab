// ✅ index.json에 신규 종목만 추가하는 append 모듈
export async function appendStockToIndexJson(code) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const shortCode = code.replace("A", "");
  const path = "frontend/public/data/crawled/index.json";
  const url = `https://api.github.com/repos/jh9098/stocksrlab/contents/${path}`;

  // fetch index.json
  const res = await fetch(url, {
    headers: { Authorization: `token ${token}` },
  });
  if (!res.ok) throw new Error("index.json fetch 실패");

  const json = await res.json();
  const sha = json.sha;
  const content = JSON.parse(atob(json.content));

  // 종목 이미 있으면 종료
  if (content[shortCode]) {
    console.log("⏩ 이미 존재하는 종목 (스킵)");
    return;
  }

  // 종목 크롤링 (FastAPI 호출)
  const priceRes = await fetch(`https://stocksrlab.fly.dev/price/${shortCode}`);
  const priceData = await priceRes.json();
  if (!Array.isArray(priceData) || priceData.length === 0) throw new Error("❌ 가격 데이터 없음");

  // index.json에 추가
  content[shortCode] = priceData;

  const payload = {
    message: `[자동추가] ${shortCode} 크롤링 후 index.json 추가`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
    sha,
    branch: "main",
  };

  // 업데이트 업로드
  const updateRes = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error("GitHub 업로드 실패: " + err.message);
  }

  console.log("✅ index.json 업데이트 완료");
}
