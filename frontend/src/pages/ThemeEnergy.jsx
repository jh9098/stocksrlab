import energy from "../data/themes/energy.json";

export default function ThemeEnergy() {
  return (
    <>
      <div style={{ padding: "1.5rem", maxWidth: "960px", margin: "auto" }}>
        <h2>📊 {energy.theme}</h2>
        <p>{energy.description}</p>

        <div style={{ marginTop: "1.5rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>종목명</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>요약</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>코드</th>
              </tr>
            </thead>
            <tbody>
              {energy.stocks.map((stock) => (
                <tr key={stock.code}>
                  <td style={{ padding: "0.5rem" }}>{stock.name}</td>
                  <td style={{ padding: "0.5rem" }}>{stock.summary}</td>
                  <td style={{ padding: "0.5rem" }}>{stock.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: "#f9f9f9", padding: "1rem", borderRadius: "8px", maxWidth: "960px", margin: "2rem auto" }}>
        <h3>⚡ 기술 흐름 요약</h3>
        <ul style={{ paddingLeft: "1.2rem" }}>
          <li><strong>에너지 저장(ESS):</strong> 재생에너지 과잉 공급 시 잉여 전력을 저장하는 핵심 장치</li>
          <li><strong>전력망 투자:</strong> 노후화된 송·배전망 보강과 스마트그리드 확산으로 수혜</li>
          <li><strong>신재생 에너지:</strong> 태양광·풍력 설비 증설과 구조 고도화 필요성 증가</li>
          <li><strong>양수 발전:</strong> 전력 피크 대응 인프라로 국가 정책 수혜 확대</li>
          <li><strong>스마트그리드/변압기:</strong> 지능형 계통 제어 기술 도입으로 자동화 수요 상승</li>
        </ul>
      </div>
    </>
  );
}
