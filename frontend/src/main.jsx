// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  console.error("🔥 앱 초기 렌더링 실패:", e);
  const root = document.getElementById('root');
  if (root) root.innerHTML = "<h2 style='color:red; text-align:center;'>앱 로딩 실패. 콘솔 확인!</h2>";
}
