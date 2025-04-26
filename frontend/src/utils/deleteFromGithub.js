export async function deleteStockJsonFromGithub(version) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) throw new Error("GitHub 토큰이 설정되지 않았습니다");

  const path = `frontend/src/data/stocks/${version}.json`;
  const url = `https://api.github.com/repos/jh9098/stocksrlab/contents/${path}`;

  let sha;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `token ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error("SHA 조회 실패: " + text);
    }

    const data = await res.json();
    sha = data.sha;
  } catch (err) {
    throw new Error("SHA 조회 실패: " + err.message);
  }

  const payload = {
    message: `🗑️ Delete ${version}.json`,
    sha,
    branch: "main",
  };

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error("삭제 실패: " + text);
  }

  return await response.json();
}
