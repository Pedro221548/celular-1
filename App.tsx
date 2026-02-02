
import React from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Viewer from './components/Viewer';
import Sender from './components/Sender';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 9);
    navigate(`/viewer/${roomId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      <div className="text-center max-w-2xl">
        <div className="inline-block p-4 rounded-3xl bg-blue-600/10 border border-blue-500/20 mb-8">
           <svg className="w-16 h-16 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10h.01M15 10h.01M12 12h.01" />
          </svg>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Mirror<span className="text-blue-500">Link</span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
          Espelhamento de tela profissional via link único. Sem USB, sem ADB, sem instalação. 
          Funciona direto no navegador com tecnologia WebRTC.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={createRoom}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 text-lg"
          >
            Começar Agora
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <span className="text-blue-500">01.</span> Gerar Link
            </h3>
            <p className="text-sm text-slate-500">Crie uma sala segura com um ID único em apenas um clique.</p>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <span className="text-blue-500">02.</span> Compartilhar
            </h3>
            <p className="text-sm text-slate-500">Envie o link para o celular Android. Sem cabos ou configuração complexa.</p>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <span className="text-blue-500">03.</span> Visualizar
            </h3>
            <p className="text-sm text-slate-500">Assista em tempo real com alta performance e baixa latência.</p>
          </div>
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
