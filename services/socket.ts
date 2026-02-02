
// Este arquivo foi descontinuado em favor do PeerJS que gerencia 
// a sinalização automaticamente via nuvem, permitindo deploy direto no Vercel.
export const socketService = {
  connect: () => Promise.resolve(),
  disconnect: () => {},
  send: () => {},
  onMessage: () => () => {}
};
