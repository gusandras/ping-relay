const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

const clients = new Set();

wss.on('connection', (ws) => {
    ws.playerName = 'desconhecido';
    clients.add(ws);
    console.log(`Cliente conectado. Total: ${clients.size}`);

    ws.on('message', (raw) => {
        try {
            const msg = JSON.parse(raw.toString());

            if (msg.type === 'identify') {
                ws.playerName = msg.player;
                console.log(`Jogador identificado: ${ws.playerName}`);
                return;
            }

            if (msg.type === 'heartbeat') return;

            // broadcast ping para todos exceto quem mandou
            clients.forEach(peer => {
                if (peer !== ws && peer.readyState === 1) {
                    peer.send(raw.toString());
                }
            });
        } catch (e) {
            console.error('Erro ao processar mensagem:', e.message);
        }
    });

    ws.on('close', () => {
        console.log(`Jogador desconectado: ${ws.playerName}. Total: ${clients.size - 1}`);
        clients.delete(ws);
    });

    ws.on('error', (err) => {
        console.error(`Erro (${ws.playerName}):`, err.message);
        clients.delete(ws);
    });
});

console.log(`Relay rodando na porta ${PORT}`);
