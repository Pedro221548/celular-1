
import { SignalingMessage } from '../types';

type MessageHandler = (msg: SignalingMessage) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private handlers: MessageHandler[] = [];
  
  public getConfiguredUrl(): string | null {
    return localStorage.getItem('mirrorlink_signaling_url');
  }

  private getUrl(): string {
    const savedUrl = this.getConfiguredUrl();
    if (savedUrl) return savedUrl;

    // Se estiver no Vercel (geralmente .vercel.app ou custom domain)
    // e não houver URL configurada, ele tentará a mesma origem, o que falhará.
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const hostname = window.location.hostname;
    
    if (hostname.includes('vercel.app') || hostname.includes('localhost') === false) {
      // Retorna algo que force o erro explicativo se não configurado
      return `${protocol}://${hostname}/ws-not-supported-on-vercel`;
    }

    return `ws://localhost:3001`;
  }

  connect(): Promise<void> {
    const url = this.getUrl();
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        return resolve();
      }

      try {
        const ws = new WebSocket(url);
        this.socket = ws;
        
        const timeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
            reject(new Error('TIMEOUT: O servidor remoto não respondeu.'));
          }
        }, 4000);

        ws.onopen = () => {
          clearTimeout(timeout);
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const msg: SignalingMessage = JSON.parse(event.data);
            this.handlers.forEach(handler => handler(msg));
          } catch (e) {}
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          const isVercel = window.location.hostname.includes('vercel.app');
          const hasCustomUrl = !!this.getConfiguredUrl();

          let msg = 'Servidor de sinalização inacessível.';
          if (isVercel && !hasCustomUrl) {
            msg = 'Vercel detectado: Você precisa configurar um servidor Node.js externo (Railway/Render) para o sinalizador.';
          }
          reject(new Error(msg));
        };

        ws.onclose = () => {
          if (this.socket === ws) this.socket = null;
        };
      } catch (e: any) {
        reject(e);
      }
    });
  }

  send(message: SignalingMessage) {
    const currentSocket = this.socket;
    if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
      currentSocket.send(JSON.stringify(message));
    }
  }

  onMessage(handler: MessageHandler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
