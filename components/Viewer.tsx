
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WebRTCService } from '../services/webrtc';
import { ConnectionStatus } from '../types';

const Viewer: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<WebRTCService | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const init = async () => {
      try {
        setStatus(ConnectionStatus.CONNECTING);
        const service = new WebRTCService(roomId, 'viewer');
        webrtcRef.current = service;

        await service.initialize();
        setStatus(ConnectionStatus.IDLE);

        service.onRemoteStream((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStatus(ConnectionStatus.CONNECTED);
          }
        });

      } catch (err: any) {
        setStatus(ConnectionStatus.ERROR);
        setError('Ocorreu um erro na conexão PeerJS. Verifique sua rede.');
      }
    };

    init();

    return () => webrtcRef.current?.cleanup();
  }, [roomId]);

  // Link corrigido para HashRouter: inclui /#/ para que o Vercel não dê 404
  const shareUrl = `${window.location.origin}/#/sender/${roomId}`;

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-slate-950">
      <div className="w-full max-w-5xl bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 ring-1 ring-white/10">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50">
          <div onClick={() => navigate('/')} className="cursor-pointer group">
            <h1 className="text-2xl font-black text-white tracking-tight group-hover:text-blue-500 transition-colors">Mirror<span className="text-blue-600 group-hover:text-white">Link</span></h1>
            <p className="text-slate-400 text-sm">Painel de Visualização - Sala: <span className="font-mono text-blue-400 uppercase">{roomId}</span></p>
          </div>
          <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
            <div className={`h-2.5 w-2.5 rounded-full ${
              status === ConnectionStatus.CONNECTED ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse' : 
              status === ConnectionStatus.CONNECTING ? 'bg-yellow-500 animate-bounce' : 'bg-slate-600'
            }`}></div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              {status === ConnectionStatus.CONNECTED ? 'Conectado' : 
               status === ConnectionStatus.CONNECTING ? 'Configurando...' : 'Aguardando Dispositivo'}
            </span>
          </div>
        </div>

        <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
          {status !== ConnectionStatus.CONNECTED && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-12 text-center bg-slate-950/90 backdrop-blur-md">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_50px_-10px_rgba(37,99,235,0.3)]">
                <svg className="w-10 h-10 text-blue-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Escaneie ou copie o link</h2>
              <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
                Abra o endereço abaixo no celular que deseja espelhar.
              </p>
            </div>
          )}
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-contain"
          />
        </div>

        <div className="p-8 bg-slate-900/80 border-t border-white/5">
          <div className="max-w-2xl mx-auto text-center">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-[0.2em]">Link de Transmissão Direta</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-black border border-white/10 rounded-2xl px-5 py-4 text-blue-400 font-mono text-xs md:text-sm truncate flex items-center shadow-inner">
                {shareUrl}
              </div>
              <button 
                onClick={() => { 
                  navigator.clipboard.writeText(shareUrl); 
                  const btn = document.getElementById('copy-btn');
                  if (btn) btn.innerText = 'Copiado!';
                  setTimeout(() => { if (btn) btn.innerText = 'Copiar Link'; }, 2000);
                }} 
                id="copy-btn"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap min-w-[140px]"
              >
                Copiar Link
              </button>
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => navigate('/')} className="mt-12 text-slate-500 hover:text-white transition-colors text-sm font-medium">← Sair da Sala</button>
    </div>
  );
};

export default Viewer;
