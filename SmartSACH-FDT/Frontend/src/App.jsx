// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function HomePage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>✅ SmartSACH funcionando</h1>
      <p>Si ves esto, React está renderizando correctamente.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}