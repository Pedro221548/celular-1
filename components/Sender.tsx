
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socketService } from '../services/socket';
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
        await socketService.connect();
        webrtcRef.current = new WebRTCService(roomId, 'sender');
        
        socketService.onMessage(async (msg) => {
          if (msg.roomId !== roomId) return;
          if (msg.type === 'answer') {
            await webrtcRef.current?.handleAnswer(msg.payload);
            setStatus(ConnectionStatus.CONNECTED);
          } else if (msg.type === 'candidate' && msg.sender === 'viewer') {
            await webrtcRef.current?.handleCandidate(msg.payload);
          }
        });

        socketService.send({ type: 'join', roomId, sender: 'sender' });
      } catch (err) {
        console.error(err);
        setStatus(ConnectionStatus.ERROR);
        setError('O servidor de sinalização não foi encontrado.');
      }
    };

    init();

    return () => {
      webrtcRef.current?.cleanup();
      socketService.disconnect();
    };
  }, [roomId]);

  const handleStartShare = async () => {
    if (!webrtcRef.current || status === ConnectionStatus.ERROR) return;
    try {
      const stream = await webrtcRef.current.startScreenShare();
      setIsSharing(true);
      stream.getVideoTracks()[0].onended = () => setIsSharing(false);
      await webrtcRef.current.createOffer();
      setStatus(ConnectionStatus.CONNECTING);
    } catch (err) {
      console.error(err);
      setError('Permissão negada ou erro no navegador.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900">
      <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 text-center relative overflow-hidden">
        {status === ConnectionStatus.ERROR && (
          <div className="absolute inset-0 z-20 bg-slate-900/95 p-6 flex flex-col items-center justify-center">
             <div className="text-red-500 mb-4">
               <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <h2 className="text-white font-bold text-lg mb-2">Servidor Offline</h2>
             <p className="text-slate-400 text-sm mb-6">Não foi possível conectar ao sistema. O administrador precisa iniciar o servidor de sinalização.</p>
             <button onClick={() => window.location.reload()} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-xl text-sm transition-colors">Tentar novamente</button>
          </div>
        )}

        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Transmitir Tela</h1>
          <p className="text-slate-400 text-sm">Compartilhe a tela deste dispositivo com o painel remoto.</p>
        </div>

        <div className="space-y-4">
          {!isSharing ? (
            <button onClick={handleStartShare} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg">Começar Agora</button>
          ) : (
            <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl">
              <div className="text-green-400 font-bold mb-1">AO VIVO</div>
              <p className="text-xs text-slate-500">Transmitindo tela...</p>
              <button onClick={() => window.location.reload()} className="mt-4 text-xs text-slate-400 underline">Parar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sender;
