
import { SignalingMessage } from '../types';

type MessageHandler = (msg: SignalingMessage) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private handlers: MessageHandler[] = [];
  
  private getUrl(): string {
    // 1. Tenta pegar do localStorage
    const savedUrl = localStorage.getItem('mirrorlink_signaling_url');
    if (savedUrl) return savedUrl;

    // 2. Fallback padrão para desenvolvimento local
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const hostname = window.location.hostname || 'localhost';
    const isLocal = /localhost|127\.0\.0\.1|192\.168\.|10\.|172\./.test(hostname);
    
    if (isLocal && window.location.port !== '3001') {
      return `${protocol}://${hostname}:3001`;
    }
    return `${protocol}://${window.location.host}`;
  }

  connect(): Promise<void> {
    const url = this.getUrl();
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) return resolve();

      try {
        console.log('[MirrorLink] Conectando ao sinalizador:', url);
        this.socket = new WebSocket(url);
        
        const timeout = setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            this.socket?.close();
            reject(new Error('Tempo de conexão esgotado'));
          }
        }, 5000);

        this.socket.onopen = () => {
          clearTimeout(timeout);
          console.log('[MirrorLink] Conectado com sucesso');
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const msg: SignalingMessage = JSON.parse(event.data);
            this.handlers.forEach(handler => handler(msg));
          } catch (e) {
            console.error('[MirrorLink] Erro no parse:', e);
          }
        };

        this.socket.onclose = () => {
          this.socket = null;
        };

        this.socket.onerror = (err) => {
          clearTimeout(timeout);
          this.socket = null;
          reject(new Error('Servidor de sinalização inacessível'));
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  send(message: SignalingMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  onMessage(handler: MessageHandler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

export const socketService = new SocketService();
