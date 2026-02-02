
import { socketService } from './socket';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export class WebRTCService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private roomId: string;
  private role: 'viewer' | 'sender';

  constructor(roomId: string, role: 'viewer' | 'sender') {
    this.roomId = roomId;
    this.role = role;
  }

  private createPeerConnection() {
    this.pc = new RTCPeerConnection(ICE_SERVERS);

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.send({
          type: 'candidate',
          roomId: this.roomId,
          sender: this.role,
          payload: event.candidate,
        });
      }
    };

    this.pc.ontrack = (event) => {
      if (this.onRemoteStreamCallback && event.streams[0]) {
        this.onRemoteStreamCallback(event.streams[0]);
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.pc?.addTrack(track, this.localStream!);
      });
    }

    return this.pc;
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        },
        audio: false, // Mobile Chrome rarely supports system audio via getDisplayMedia
      });
      return this.localStream;
    } catch (err) {
      console.error('Error starting screen share:', err);
      throw err;
    }
  }

  async createOffer() {
    const pc = this.createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    socketService.send({
      type: 'offer',
      roomId: this.roomId,
      sender: this.role,
      payload: offer,
    });
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    const pc = this.createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketService.send({
      type: 'answer',
      roomId: this.roomId,
      sender: this.role,
      payload: answer,
    });
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (this.pc) {
      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async handleCandidate(candidate: RTCIceCandidateInit) {
    if (this.pc) {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  cleanup() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.pc?.close();
    this.pc = null;
    this.localStream = null;
  }
}
