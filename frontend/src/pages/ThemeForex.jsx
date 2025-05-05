import data from "../data/themes/forex.json";

export default function ThemeForex() {
  return (
    <>
      <div style={{ padding: "1.5rem", maxWidth: "960px", margin: "auto" }}>
        <h2>📈 {data.theme}</h2>
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
        <h3>💱 기술 흐름 요약</h3>
        <ul style={{ paddingLeft: "1.2rem" }}>
          <li><strong>수입 원가 절감:</strong> 원화 강세 시 수입 기업들의 원가 부담이 낮아져 수익성 개선</li>
          <li><strong>해외여행/소비 확대:</strong> 환율이 하락하면 해외 소비가 증가해 여행·면세 관련 수혜</li>
          <li><strong>항공/물류:</strong> 항공사·물류 기업은 유류비 절감 및 해외 수요 증가로 이익 개선</li>
          <li><strong>OEM/ODM:</strong> 수출 비중이 높더라도 수입 원자재 비중 큰 기업은 환율 수혜 가능</li>
          <li><strong>화장품/소비재:</strong> 중국 수출 기대 + 수입 비용 절감으로 이중 수혜 가능성</li>
        </ul>
      </div>
    </>
  );
}
