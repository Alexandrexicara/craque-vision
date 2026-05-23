import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('🚀 main.jsx iniciando...');
console.log('📦 React version:', React.version);

const rootElement = document.getElementById('root');
console.log('🔍 root element:', rootElement);

if (!rootElement) {
  document.body.innerHTML = '<div style="color:red;padding:40px;font-family:monospace;"><h1>❌ ERRO: Elemento #root não encontrado!</h1><p>Verifique o index.html</p></div>';
} else {
  try {
    console.log('⚛️ Criando React root...');
    const root = ReactDOM.createRoot(rootElement);
    console.log('🎨 Renderizando App...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('✅ Renderização inicial concluída');
  } catch (error) {
    console.error('🔥 Erro fatal ao renderizar:', error);
    rootElement.innerHTML = `
      <div style="color:#ff4444;background:#1a0000;padding:40px;font-family:monospace;min-height:100vh;">
        <h1>🔥 Erro Fatal na Renderização</h1>
        <pre style="white-space:pre-wrap;word-break:break-word;">${error.toString()}\n\n${error.stack || ''}</pre>
      </div>
    `;
  }
}
