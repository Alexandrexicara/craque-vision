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
    this.setState({ errorInfo });
    console.error('🔥 ErrorBoundary capturou:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#1a0000',
          color: '#ff6b6b',
          padding: '40px',
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '800px', width: '100%' }}>
            <h1 style={{ color: '#ff4444', fontSize: '28px', marginBottom: '10px' }}>
              🔥 Erro na Aplicação
            </h1>
            <p style={{ color: '#ff9999', marginBottom: '20px' }}>
              Um erro impediu a renderização do componente:
            </p>
            <div style={{
              background: '#2d0000',
              border: '1px solid #ff4444',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              overflow: 'auto'
            }}>
              <pre style={{ color: '#ff6b6b', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                {this.state.error?.toString()}
              </pre>
            </div>
            {this.state.errorInfo && (
              <details style={{ marginBottom: '20px' }}>
                <summary style={{ cursor: 'pointer', color: '#ff9999', marginBottom: '10px' }}>
                  Stack Trace Completo
                </summary>
                <div style={{
                  background: '#1a0000',
                  border: '1px solid #ff444466',
                  borderRadius: '8px',
                  padding: '15px',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  <pre style={{ color: '#ff8888', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              style={{
                background: '#ff4444',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
