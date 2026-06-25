console.log('🚀 App.jsx se está ejecutando');

export default function App() {
  console.log('✅ App renderizando');
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'green' }}>✅ SmartSACH funcionando</h1>
      <p>Si ves esto, React está renderizando correctamente.</p>
      <p style={{ fontSize: '12px', color: 'gray' }}>
        Build: {import.meta.env.MODE} | {new Date().toISOString()}
      </p>
    </div>
  );
}