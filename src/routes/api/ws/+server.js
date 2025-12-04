import { initWebSocket } from '$lib/websocket.js';

export async function GET({ request }) {
    initWebSocket();
    return new Response('WebSocket server started', { status: 200 });
}