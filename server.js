const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`Cliente conectado. Total: ${clients.size}`);

    ws.on('message', (raw) => {
        clients.forEach(peer => {
            if (peer !== ws && peer.readyState === 1) {
                peer.send(raw.toString());
            }
        });
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log(`Cliente desconectado. Total: ${clients.size}`);
    });

    ws.on('error', (err) => {
        console.error('Erro:', err.message);
        clients.delete(ws);
    });
});

console.log(`Relay rodando na porta ${PORT}`);
