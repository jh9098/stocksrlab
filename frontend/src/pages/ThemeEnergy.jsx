import energy from "../data/themes/energy.json";

export default function ThemeEnergy() {
  return (
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
  );
}
