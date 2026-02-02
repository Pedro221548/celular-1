
import { SignalingMessage } from '../types';

type MessageHandler = (msg: SignalingMessage) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private handlers: MessageHandler[] = [];
  private url: string;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const hostname = window.location.hostname || 'localhost';
    
    // If running on localhost or a local IP, assume backend is on 3001.
    // Otherwise, assume the signaling server is on the same host/port.
    const isLocal = /localhost|127\.0\.0\.1|192\.168\.|10\.|172\./.test(hostname);
    
    if (isLocal && window.location.port !== '3001') {
      this.url = `${protocol}://${hostname}:3001`;
    } else {
      this.url = `${protocol}://${window.location.host}`;
    }
    
    console.log('[MirrorLink] Signaling URL:', this.url);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) return resolve();

      try {
        this.socket = new WebSocket(this.url);
        
        const timeout = setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            this.socket?.close();
            reject(new Error('Connection timed out'));
          }
        }, 5000);

        this.socket.onopen = () => {
          clearTimeout(timeout);
          console.log('[MirrorLink] Connected to signaling server');
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const msg: SignalingMessage = JSON.parse(event.data);
            this.handlers.forEach(handler => handler(msg));
          } catch (e) {
            console.error('[MirrorLink] Message parse error:', e);
          }
        };

        this.socket.onclose = () => {
          this.socket = null;
        };

        this.socket.onerror = (err) => {
          clearTimeout(timeout);
          console.error('[MirrorLink] WebSocket Error:', err);
          this.socket = null;
          reject(new Error('Signaling server unreachable'));
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
