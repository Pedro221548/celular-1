
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Viewer from './components/Viewer';
import Sender from './components/Sender';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');

  useEffect(() => {
    setBackendUrl(localStorage.getItem('mirrorlink_signaling_url') || '');
  }, []);

  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 9);
    navigate(`/viewer/${roomId}`);
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (backendUrl) {
      localStorage.setItem('mirrorlink_signaling_url', backendUrl);
    } else {
      localStorage.removeItem('mirrorlink_signaling_url');
    }
    setShowSettings(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Botão de Configurações */}
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 p-3 text-slate-500 hover:text-white transition-colors bg-slate-900/50 rounded-full border border-slate-800"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Modal de Configurações */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Configurar Backend</h2>
            <p className="text-slate-400 text-sm mb-6">
              Vercel não suporta WebSockets. Informe a URL do seu servidor Node.js (ex: Railway, Render).
            </p>
            <form onSubmit={saveSettings}>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">URL do Servidor (WS/WSS)</label>
              <input 
                type="text"
                placeholder="ws://meu-ip:3001 ou wss://meu-app.com"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-blue-400 font-mono text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSettings(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="text-center max-w-2xl relative z-10">
        <div className="inline-block p-4 rounded-3xl bg-blue-600/10 border border-blue-500/20 mb-8">
           <svg className="w-16 h-16 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Mirror<span className="text-blue-500">Link</span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
          O Vercel hospeda o painel. O seu servidor Node.js gerencia os dados. 
          Gere um link e veja a tela em tempo real.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={createRoom}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-3 text-lg"
          >
            Criar Sala de Espelhamento
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        
        <p className="mt-12 text-xs text-slate-600 uppercase tracking-[0.2em]">Deploy Híbrido: Vercel + Node.js</p>
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
