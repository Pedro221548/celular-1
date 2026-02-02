
import { Peer, MediaConnection } from 'peerjs';

export class WebRTCService {
  private peer: Peer | null = null;
  private currentCall: MediaConnection | null = null;
  private localStream: MediaStream | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onStatusChangeCallback: ((status: string) => void) | null = null;

  constructor(private roomId: string, private role: 'viewer' | 'sender') {}

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      // O ID do peer será baseado na sala e no papel
      const peerId = this.role === 'viewer' ? `mirror-${this.roomId}-v` : `mirror-${this.roomId}-s`;
      
      this.peer = new Peer(peerId, {
        debug: 2,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', () => {
        console.log('PeerJS conectado com ID:', this.peer?.id);
        resolve();
      });

      this.peer.on('error', (err) => {
        console.error('Erro no PeerJS:', err);
        reject(err);
      });

      // Se for o Viewer, ele aguarda chamadas
      if (this.role === 'viewer') {
        this.peer.on('call', (call) => {
          console.log('Recebendo chamada do Sender...');
          this.currentCall = call;
          call.answer(); // Viewer apenas recebe, não envia stream de volta
          
          call.on('stream', (remoteStream) => {
            if (this.onRemoteStreamCallback) {
              this.onRemoteStreamCallback(remoteStream);
            }
          });
        });
      }
    });
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      // FIX: Cast video constraints to 'any' to bypass TS check for 'cursor' and 'displaySurface'
      this.localStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          displaySurface: 'monitor',
          cursor: 'always'
        } as any,
        audio: false
      });

      // Quando o usuário para de compartilhar pelo botão do navegador
      this.localStream.getVideoTracks()[0].onended = () => {
        this.cleanup();
      };

      // Tenta ligar para o Viewer
      const viewerId = `mirror-${this.roomId}-v`;
      console.log('Ligando para o Viewer:', viewerId);
      
      this.currentCall = this.peer!.call(viewerId, this.localStream);
      
      return this.localStream;
    } catch (err) {
      console.error('Erro ao capturar tela:', err);
      throw err;
    }
  }

  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  onStatusChange(callback: (status: string) => void) {
    this.onStatusChangeCallback = callback;
  }

  cleanup() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.currentCall?.close();
    this.peer?.destroy();
    this.localStream = null;
    this.peer = null;
  }
}
