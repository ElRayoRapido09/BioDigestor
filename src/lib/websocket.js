import { WebSocketServer } from 'ws';
import { createServer } from 'http';

let wss;

export function initWebSocket() {
    if (!wss) {
        const server = createServer();
        wss = new WebSocketServer({ server });

        wss.on('connection', (ws) => {
            console.log('Cliente conectado');
            ws.on('message', (message) => {
                console.log('Mensaje recibido:', message.toString());
            });
            ws.on('close', () => {
                console.log('Cliente desconectado');
            });
        });

        server.listen(3001, '0.0.0.0', () => {
            console.log('WebSocket server running on ws://0.0.0.0:3001');
        });
    }
}

export function broadcast(data) {
    if (wss) {
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(data));
            }
        });
    }
}