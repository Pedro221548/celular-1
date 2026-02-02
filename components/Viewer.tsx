
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
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
        await socketService.connect();
        
        webrtcRef.current = new WebRTCService(roomId, 'viewer');
        webrtcRef.current.onRemoteStream((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStatus(ConnectionStatus.CONNECTED);
          }
        });

        socketService.onMessage(async (msg) => {
          if (msg.roomId !== roomId) return;
          switch (msg.type) {
            case 'offer':
              await webrtcRef.current?.handleOffer(msg.payload);
              break;
            case 'candidate':
              if (msg.sender === 'sender') {
                await webrtcRef.current?.handleCandidate(msg.payload);
              }
              break;
          }
        });

        socketService.send({ type: 'join', roomId, sender: 'viewer' });
      } catch (err) {
        console.error(err);
        setStatus(ConnectionStatus.ERROR);
        setError('Servidor inacessível. Verifique as configurações na Home.');
      }
    };

    init();

    return () => {
      webrtcRef.current?.cleanup();
      socketService.disconnect();
    };
  }, [roomId]);

  const shareUrl = `${window.location.origin}/#/sender/${roomId}`;

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <div>
            <h1 className="text-xl font-bold text-blue-400">Painel do Viewer</h1>
            <p className="text-sm text-slate-400">ID: <span className="font-mono text-slate-200">{roomId}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${
              status === ConnectionStatus.CONNECTED ? 'bg-green-500 animate-pulse' : 
              status === ConnectionStatus.CONNECTING ? 'bg-yellow-500 animate-bounce' : 'bg-red-500'
            }`}></span>
            <span className="text-sm font-medium uppercase tracking-wider">{status}</span>
          </div>
        </div>

        <div className="aspect-video bg-black relative flex items-center justify-center">
          {status === ConnectionStatus.ERROR && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/95 p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Conexão Falhou</h2>
              <p className="text-slate-400 mb-6 max-w-sm">O frontend não conseguiu encontrar seu servidor de sinalização (backend).</p>
              <button 
                onClick={() => navigate('/')} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all"
              >
                Configurar URL do Servidor
              </button>
            </div>
          )}

          {status === ConnectionStatus.CONNECTING && (
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400">Conectando ao sinalizador...</p>
            </div>
          )}
          
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
        </div>

        <div className="p-6 bg-slate-900/30">
          <label className="block text-sm font-medium text-slate-400 mb-2">Envie este link para o celular:</label>
          <div className="flex gap-2">
            <input readOnly value={shareUrl} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm font-mono text-blue-300 focus:outline-none" />
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link copiado!'); }} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Copiar</button>
          </div>
        </div>
      </div>
      <button onClick={() => navigate('/')} className="mt-8 text-slate-500 hover:text-white transition-colors text-sm">← Início</button>
    </div>
  );
};

export default Viewer;
