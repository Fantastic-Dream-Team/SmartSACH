// src/components/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ERROR DETECTADO:', error);
    console.error('📍 DÓNDE:', errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: 'auto', fontFamily: 'monospace' }}>
          <h1 style={{ color: 'red' }}>❌ Algo salió mal</h1>
          <details style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <summary>📋 Ver error completo</summary>
            <p><strong>Mensaje:</strong> {this.state.error?.toString()}</p>
            <p><strong>Stack:</strong> {this.state.error?.stack}</p>
            {this.state.errorInfo && (
              <p><strong>Componente:</strong> {this.state.errorInfo.componentStack}</p>
            )}
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔄 Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;