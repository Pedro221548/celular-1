
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WebRTCService } from '../services/webrtc';
import { ConnectionStatus } from '../types';

const Sender: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const webrtcRef = useRef<WebRTCService | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.IDLE);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const init = async () => {
      try {
        setStatus(ConnectionStatus.CONNECTING);
        const service = new WebRTCService(roomId, 'sender');
        webrtcRef.current = service;
        await service.initialize();
        setStatus(ConnectionStatus.IDLE);
      } catch (err) {
        setStatus(ConnectionStatus.ERROR);
        setError('Erro ao conectar ao serviço de sinalização.');
      }
    };

    init();
    return () => webrtcRef.current?.cleanup();
  }, [roomId]);

  const handleStartShare = async () => {
    if (!webrtcRef.current) return;
    try {
      await webrtcRef.current.startScreenShare();
      setIsSharing(true);
      setStatus(ConnectionStatus.CONNECTED);
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        setError('Ocorreu um erro ao tentar compartilhar a tela.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-200">
      <div className="w-full max-w-md bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-white/5 ring-1 ring-white/10 text-center relative overflow-hidden">
        
        <div className="mb-10">
          <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-inner">
            <svg className={`w-12 h-12 text-blue-500 ${isSharing ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Transmitir Tela</h1>
          <p className="text-slate-400 leading-relaxed">
            Seu dispositivo está pronto. Toque no botão abaixo para espelhar esta tela no computador.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {!isSharing ? (
            <button 
              onClick={handleStartShare} 
              disabled={status === ConnectionStatus.CONNECTING}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-6 rounded-[1.5rem] transition-all active:scale-95 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] text-lg"
            >
              {status === ConnectionStatus.CONNECTING ? 'Iniciando...' : 'Espelhar Agora'}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-8 bg-green-500/5 border border-green-500/20 rounded-[2rem] flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                  <span className="text-green-500 font-black text-sm uppercase tracking-widest">Transmitindo</span>
                </div>
                <p className="text-xs text-slate-500">Sua tela está visível no painel remoto</p>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full py-4 text-slate-500 hover:text-white text-sm font-bold transition-colors"
              >
                Parar Transmissão
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex justify-center gap-6 opacity-40">
           <span className="text-[10px] font-bold uppercase tracking-widest">SSL Encrypted</span>
           <span className="text-[10px] font-bold uppercase tracking-widest">P2P Link</span>
        </div>
      </div>
    </div>
  );
};

export default Sender;
