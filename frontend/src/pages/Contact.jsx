export default function Contact() {
  return (
    <div style={{ padding: "2rem", maxWidth: "960px", margin: "auto", lineHeight: "1.8" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>지지저항 Lab 문의하기</h1>

      <p>
        지지저항 Lab은 사용자 여러분에게 주식 시장 정보 및 전략 분석을 제공하고 있습니다.  
        서비스 관련 문의, 제휴 제안, 기술 지원 요청 등이 있으시면 아래 연락처를 통해 언제든지 문의해 주세요.
      </p>

      <h2 style={{ marginTop: "2rem" }}>운영자 연락처</h2>
      <ul>
        <li>📧 이메일: <strong>stocksrlab@naver.com</strong></li>
        <li>💬 오픈채팅방: <a href="https://open.kakao.com/o/xxxxxxx" target="_blank" rel="noreferrer">카카오톡 오픈채팅 문의</a></li>
      </ul>

      <h2 style={{ marginTop: "2rem" }}>운영 시간</h2>
      <p>
        문의 응답은 <strong>평일 오전 10시 ~ 오후 5시</strong>에 순차적으로 처리됩니다.  
        주말 및 공휴일에는 답변이 다소 지연될 수 있습니다.
      </p>

      <h2 style={{ marginTop: "2rem" }}>주의사항</h2>
      <ul>
        <li>✅ 본 서비스는 <strong>투자 권유, 종목 매수 추천</strong>을 제공하지 않습니다.</li>
        <li>✅ 지지선/저항선 및 전략 정보는 <strong>참고용</strong>으로만 제공되며, 최종 투자 판단은 사용자 본인에게 있습니다.</li>
        <li>✅ 빠른 처리를 위해 문의 제목에 간단한 내용을 요약해 주세요.</li>
        <li>✅ 오류/버그 제보 시 문제 발생 상황을 구체적으로 작성해 주시면 감사하겠습니다.</li>
      </ul>

      <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "#888" }}>
        ⓒ 2025 지지저항 Lab. 제공되는 모든 정보는 참고용이며, 투자 결과에 대한 책임은 사용자 본인에게 있습니다.
      </p>
    </div>
  );
}