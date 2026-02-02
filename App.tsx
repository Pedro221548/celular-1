
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-200 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="text-center max-w-2xl relative z-10">
        <div className="mb-10 inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
            Vercel Ready / Zero Config
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tighter">
          Mirror<span className="text-blue-600">Link</span>
        </h1>
        <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-lg mx-auto">
          Espelhamento de tela profissional via link. <br className="hidden md:block"/>
          Sem fios, sem apps, sem complicação.
        </p>

        <button 
          onClick={createRoom}
          className="group relative px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 text-xl mx-auto"
        >
          Criar Sala de Espelhamento
          <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        
        <div className="mt-20 pt-10 border-t border-white/5 flex justify-center gap-10 opacity-30 grayscale contrast-125">
          <span className="text-[10px] font-bold uppercase tracking-widest">PeerJS Cloud</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">WebRTC P2P</span>
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
