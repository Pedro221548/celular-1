
export enum ConnectionStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate' | 'join' | 'ready';
  roomId: string;
  payload?: any;
  sender?: 'viewer' | 'sender';
}

export interface RoomState {
  id: string;
  hasViewer: boolean;
  hasSender: boolean;
}
