import data from "../data/themes/bci.json";

export default function ThemeBci() {
  return (
    <>
      <div style={{ padding: "1.5rem", maxWidth: "960px", margin: "auto" }}>
        <h2>🧠 {data.theme}</h2>
        <p>{data.description}</p>

        <table style={{ width: "100%", marginTop: "1.5rem", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>종목명</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>요약</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>코드</th>
            </tr>
          </thead>
          <tbody>
            {data.stocks.map(stock => (
              <tr key={stock.code}>
                <td style={{ padding: "0.5rem" }}>{stock.name}</td>
                <td style={{ padding: "0.5rem" }}>{stock.summary}</td>
                <td style={{ padding: "0.5rem" }}>{stock.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: "#f9f9f9", padding: "1rem", borderRadius: "8px", maxWidth: "960px", margin: "2rem auto" }}>
        <h3>🧠 기술 흐름 요약</h3>
        <ul style={{ paddingLeft: "1.2rem" }}>
          <li><strong>BCI (Brain-Computer Interface):</strong> 뇌 신호 분석 후 외부 장치 제어, 뉴럴링크 등으로 주목</li>
          <li><strong>AI 진단:</strong> 뇌졸중 등 진단 자동화, 의료 영상 AI 수요 증가</li>
          <li><strong>센서/칩:</strong> 생체신호 측정 전극·센서, 고정밀 기술 필수</li>
          <li><strong>정밀 로봇:</strong> 뇌파 기반 로봇 연동, 수술용 로봇 연계</li>
          <li><strong>웨어러블/치료기:</strong> 우울증 등 정신 질환 치료에 BCI 확산</li>
        </ul>
      </div>
    </>
  );
}
