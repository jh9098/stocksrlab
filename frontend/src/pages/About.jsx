export default function About() {
  return (
    <div style={{ padding: "2rem", maxWidth: "960px", margin: "auto", lineHeight: "1.8" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>지지저항 Lab 소개</h1>

      <p>
        <strong>지지저항 Lab</strong>은 개인 투자자들이 주식 시장에서 실질적인 매매 판단을 할 수 있도록, 
        <strong>지지선과 저항선</strong>을 중심으로 한 전략 데이터를 무료로 제공하는 비영리 웹서비스입니다.
      </p>

      <p>
        본 서비스는 단순한 종목 나열이 아닌, 각 종목별로 매매 전략, 
        지지/저항 구간, 차트 기반 분석 요약 등 실전 매매에 도움이 되는 정보를 체계적으로 제공합니다. 
        자체 데이터베이스를 관리하며, 매일 최신 시장 상황을 반영하여 지속적으로 업데이트합니다.
      </p>

      <h2 style={{ marginTop: "2rem" }}>운영 철학</h2>
      <ul>
        <li>✔️ 개인 투자자에게 <strong>명확한 매매 기준</strong> 제공</li>
        <li>✔️ <strong>투명하고 신뢰할 수 있는 데이터</strong> 기반 제공</li>
        <li>✔️ 투자자들이 <strong>스스로 판단</strong>할 수 있도록 지원</li>
        <li>✔️ 모든 분석은 <strong>광고 없이 무료</strong>로 제공</li>
      </ul>

      <h2 style={{ marginTop: "2rem" }}>특징 및 주요 서비스</h2>
      <ul>
        <li>✅ 종목별 지지선/저항선 분석 데이터 제공</li>
        <li>✅ 종목 요청 게시판 운영 (사용자 참여 기반)</li>
        <li>✅ 즐겨찾기 기능으로 맞춤형 관심 종목 관리</li>
        <li>✅ 국내 주요 지수(KOSPI, KOSDAQ) 요약 제공</li>
        <li>✅ YouTube Shorts 및 Threads 연동하여 추가 시장 정보 제공</li>
      </ul>

      <h2 style={{ marginTop: "2rem" }}>서비스 이용 안내</h2>
      <p>
        지지저항 Lab은 별도의 가입비나 유료 결제 없이 누구나 자유롭게 이용할 수 있습니다. 
        구글 또는 카카오 계정을 통한 간편 로그인 후, 종목 요청 및 즐겨찾기 기능을 사용할 수 있습니다.
      </p>

      <h2 style={{ marginTop: "2rem" }}>책임 한계 및 투자 유의사항</h2>
      <p>
        본 서비스에서 제공하는 모든 데이터와 분석 정보는 참고용으로만 제공되며, 
        투자 판단에 대한 최종 책임은 사용자 본인에게 있습니다. 
        지지저항 Lab은 정보 제공에 최선을 다하지만, 데이터의 오류, 지연, 부정확성 등에 대해서는 책임을 지지 않습니다.
      </p>

      <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "#888" }}>
        ⓒ 2025 지지저항 Lab. 무단 복제 및 재배포를 금합니다.
      </p>
    </div>
  );
}