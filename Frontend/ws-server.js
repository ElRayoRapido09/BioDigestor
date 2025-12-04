import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  ws.on('message', (message) => {
    console.log('Mensaje recibido:', message.toString());
    // Reenviar el mensaje a todos los clientes conectados
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message.toString());
      }
    });
  });
  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(8081, '0.0.0.0', () => {
  console.log('WebSocket server running on ws://0.0.0.0:8081');
});