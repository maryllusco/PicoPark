import http from 'node:http';
import { WebSocketServer } from 'ws';

const jugadores = new Map(); // slot → WebSocket del gamepad
const COLORES = ['#f59e0b', '#3b82f6', '#ef4444', '#22c55e'];
const NOMBRES = ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4'];
let pantalla = null;

function notificarPantalla() {
  if (!pantalla || pantalla.readyState !== 1) return;
  pantalla.send(JSON.stringify({
    type: 'playersState',
    payload: {
      jugadores: [0, 1, 2, 3].map(slot => ({
        slot,
        color: COLORES[slot],
        nombre: NOMBRES[slot],
        activo: jugadores.has(slot),
      })),
    },
  }));
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Servidor WebSocket activo');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws._timeout = setTimeout(() => {
    if (!ws._rol) ws.close();
  }, 5000);

  ws.on('message', (rawMessage) => {
    try {
      const data = JSON.parse(rawMessage.toString());

      if (data.type === 'register') {
        clearTimeout(ws._timeout);

        if (data.payload?.role === 'display') {
          ws._rol = 'display';
          pantalla = ws;
          console.log('Pantalla conectada');
          notificarPantalla();
          return;
        }

        if (data.payload?.role === 'gamepad') {
          if (jugadores.size >= 4) {
            ws.send(JSON.stringify({
              type: 'rejected',
              payload: { motivo: 'Sala llena' },
            }));
            ws.close();
            console.log('Conexión rechazada: sala llena');
            return;
          }

          const slot = [0, 1, 2, 3].find(s => !jugadores.has(s));
          ws._rol = 'gamepad';
          ws._slot = slot;
          jugadores.set(slot, ws);

          console.log(`Jugador ${slot} conectado`);
          console.log(`Jugadores activos: ${jugadores.size}`);

          ws.send(JSON.stringify({
            type: 'playerAssigned',
            payload: { slot, color: COLORES[slot], nombre: NOMBRES[slot] },
          }));

          notificarPantalla();
          return;
        }

        ws.close();
        return;
      }

      if (ws._rol !== 'gamepad') return;

      if (data.type === 'keydown' || data.type === 'keyup') {
        console.log(`[Jugador ${ws._slot}]`, data);
        if (pantalla?.readyState === 1) {
          pantalla.send(JSON.stringify({
            type: data.type,
            payload: { slot: ws._slot, dir: data.payload?.dir },
          }));
        }
      }
    } catch (error) {
      console.error('Mensaje inválido:', error);
    }
  });

  ws.on('close', () => {
    clearTimeout(ws._timeout);

    if (ws._rol === 'display') {
      pantalla = null;
      console.log('Pantalla desconectada');
      return;
    }

    if (ws._rol === 'gamepad' && ws._slot != null) {
      jugadores.delete(ws._slot);
      console.log(`Jugador ${ws._slot} desconectado`);
      console.log(`Jugadores activos: ${jugadores.size}`);
      notificarPantalla();
    }
  });
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Servidor WebSocket iniciado');
  console.log('ws://localhost:3000');
});
