
/**
 * BACKEND SIGNALING SERVER
 * Save this as server.js and run with `node server.js`
 * Required dependencies: `npm install express ws`
 */

const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3001;

// Rooms storage: roomId -> Set of clients
const rooms = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');
  let currentRoomId = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      const { type, roomId } = message;

      if (type === 'join') {
        currentRoomId = roomId;
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(ws);
        console.log(`Client joined room: ${roomId}`);

        // Broadcast join to others in the room
        broadcast(roomId, message, ws);
        return;
      }

      // Relay all other messages (offer, answer, candidate, ready) to others in the same room
      if (roomId && rooms.has(roomId)) {
        broadcast(roomId, message, ws);
      }
    } catch (e) {
      console.error('Error handling message:', e);
    }
  });

  ws.on('close', () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      rooms.get(currentRoomId).delete(ws);
      if (rooms.get(currentRoomId).size === 0) {
        rooms.delete(currentRoomId);
      }
      console.log(`Client disconnected from room: ${currentRoomId}`);
    }
  });
});

function broadcast(roomId, message, senderWs) {
  const clients = rooms.get(roomId);
  if (!clients) return;

  const msgString = JSON.stringify(message);
  clients.forEach((client) => {
    if (client !== senderWs && client.readyState === 1) {
      client.send(msgString);
    }
  });
}

server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});
