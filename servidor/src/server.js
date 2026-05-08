// TUS MISMAS VARIABLES, solo agregamos una para la pantalla
const jugadores = new Map(); // slot → WebSocket del gamepad
let siguienteId = 0;         // ahora empieza en 0 (slot 0, 1, 2, 3)
let pantalla = null;         // ← NUEVO: referencia a la pantalla principal

// Colores fijos por slot (igual que en engine.ts)
const COLORES = ['#f59e0b', '#3b82f6', '#ef4444', '#22c55e'];
const NOMBRES = ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4'];

// ← NUEVO: avisa a la pantalla quién está conectado
function notificarPantalla() {
  if (!pantalla || pantalla.readyState !== 1) return;
  pantalla.send(JSON.stringify({
    type: 'playersState',
    payload: {
      jugadores: [0, 1, 2, 3].map(slot => ({
        slot,
        color:  COLORES[slot],
        nombre: NOMBRES[slot],
        activo: jugadores.has(slot),
      })),
    },
  }));
}

Bun.serve({
  port: 3000,
  fetch(req, server) {
    const ok = server.upgrade(req);
    if (ok) return;
    return new Response('Servidor WebSocket activo');
  },
  websocket: {
    open(ws) {
      // El cliente tiene 5s para mandarnos su rol
      ws._timeout = setTimeout(() => {
        if (!ws._rol) ws.close();
      }, 5000);
    },

    message(ws, message) {
      try {
        const data = JSON.parse(message);

        // ── NUEVO: primer mensaje de registro ──────────────────────
        if (data.type === 'register') {
          clearTimeout(ws._timeout);

          // Es la pantalla principal
          if (data.payload?.role === 'display') {
            ws._rol = 'display';
            pantalla = ws;
            console.log('Pantalla conectada');
            notificarPantalla();
            return;
          }

          // Es un gamepad
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
const slot = [0,1,2,3].find(s => !jugadores.has(s));
            ws._rol  = 'gamepad';
            ws._slot = slot;
            jugadores.set(slot, ws);

            console.log(`Jugador ${slot} conectado`);
            console.log(`Jugadores activos: ${jugadores.size}`);

            // ← antes era 'conexion-exitosa', ahora es 'playerAssigned'
            ws.send(JSON.stringify({
              type: 'playerAssigned',
              payload: { slot, color: COLORES[slot], nombre: NOMBRES[slot] },
            }));

            notificarPantalla(); // avisa a la pantalla
            return;
          }

          ws.close();
          return;
        }

        // ── Inputs del gamepad → reenviar a la pantalla ────────────
        if (ws._rol !== 'gamepad') return;

        if (data.type === 'keydown' || data.type === 'keyup') {
          console.log(`[Jugador ${ws._slot}]`, data);
          if (pantalla?.readyState === 1) {
            pantalla.send(JSON.stringify({
              type:    data.type,
              payload: { slot: ws._slot, dir: data.payload?.dir },
            }));
          }
        }

      } catch (error) {
        console.error('Mensaje inválido:', error);
      }
    },

    close(ws) {
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
        notificarPantalla(); // avisa a la pantalla que se fue
      }
    },
  },
});

console.log('Servidor WebSocket iniciado');
console.log('ws://localhost:3000');