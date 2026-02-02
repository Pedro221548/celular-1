
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Viewer from './components/Viewer';
import Sender from './components/Sender';
import { socketService } from './services/socket';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');
  const [isVercel, setIsVercel] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mirrorlink_signaling_url') || '';
    setBackendUrl(saved);
    setIsVercel(window.location.hostname.includes('vercel.app'));
    
    // Auto-open settings if on Vercel and no backend set
    if (window.location.hostname.includes('vercel.app') && !saved) {
      setShowSettings(true);
    }
  }, []);

  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 9);
    navigate(`/viewer/${roomId}`);
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (backendUrl.trim()) {
      localStorage.setItem('mirrorlink_signaling_url', backendUrl.trim());
    } else {
      localStorage.removeItem('mirrorlink_signaling_url');
    }
    setShowSettings(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-200 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 p-3 text-slate-400 hover:text-white transition-all bg-slate-900/50 rounded-full border border-slate-800 hover:border-slate-600 z-20"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      </button>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl ring-1 ring-white/10">
            <h2 className="text-2xl font-bold text-white mb-2">Configurar Servidor</h2>
            <p className="text-slate-400 text-sm mb-6">
              O Vercel não suporta WebSockets. Você deve hospedar o <code className="text-blue-400">server.js</code> em um serviço como Railway ou Render.
            </p>
            <form onSubmit={saveSettings}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">URL do Backend (WS/WSS)</label>
                  <input 
                    type="text"
                    placeholder="wss://seu-app-no-railway.app"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    className="w-full bg-black border border-slate-700 rounded-2xl px-5 py-4 text-blue-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 transition-all"
                  />
                </div>
                <div className="p-4 bg-blue-600/5 rounded-xl border border-blue-500/10">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <span className="text-blue-500 font-bold">Dica:</span> Se estiver testando localmente, use <code className="text-slate-200">ws://localhost:3001</code>. Em produção, use sempre <code className="text-slate-200">wss://</code>.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSettings(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-4 rounded-2xl transition-all">Fechar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">Salvar URL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="text-center max-w-2xl relative z-10">
        <div className="mb-10 inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full">
          <span className={`w-2 h-2 rounded-full ${backendUrl ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
            {backendUrl ? 'Backend Configurado' : 'Aguardando Backend'}
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tighter">
          Mirror<span className="text-blue-600">Link</span>
        </h1>
        <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-lg mx-auto">
          Espelhamento de tela profissional via link. <br className="hidden md:block"/>
          Sem fios, sem ADB, apenas alta performance.
        </p>

        {isVercel && !backendUrl && (
          <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-left max-w-md mx-auto">
            <h3 className="text-amber-500 font-bold mb-1 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Configuração Necessária
            </h3>
            <p className="text-sm text-amber-500/80">
              O Vercel não permite conexões WebSocket. Clique na engrenagem no topo para configurar a URL do seu servidor externo.
            </p>
          </div>
        )}

        <button 
          onClick={createRoom}
          className="group relative px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 text-xl mx-auto"
        >
          Criar Sala de Espelhamento
          <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        
        <div className="mt-20 pt-10 border-t border-slate-900 flex justify-center gap-10 opacity-30 grayscale contrast-125">
          <span className="text-[10px] font-bold uppercase tracking-widest">WebRTC</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Secure TLS</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Low Latency</span>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/viewer/:roomId" element={<Viewer />} />
        <Route path="/sender/:roomId" element={<Sender />} />
      </Routes>
    </Router>
  );
}

export default App;
