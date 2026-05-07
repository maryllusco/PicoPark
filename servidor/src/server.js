const jugadores = new Map();

let siguienteId = 1;

Bun.serve({
  port: 3000,

  fetch(req, server) {
    const ok = server.upgrade(req);

    if (ok) {
      return;
    }

    return new Response('Servidor WebSocket activo');
  },

  websocket: {
  open(ws) {

    // Máximo 4 jugadores
    if (jugadores.size >= 4) {

      ws.send(
        JSON.stringify({
          tipo: 'error',
          mensaje: 'Sala llena',
        })
      );

      ws.close();

      console.log('Conexión rechazada: sala llena');

      return;
    }

    const idJugador = siguienteId++;

    ws.idJugador = idJugador;

    jugadores.set(idJugador, ws);

    console.log(`Jugador ${idJugador} conectado`);

    console.log(`Jugadores activos: ${jugadores.size}`);

    ws.send(
      JSON.stringify({
        tipo: 'conexion-exitosa',
        idJugador,
      })
    );
  },

  message(ws, message) {
    try {
      const data = JSON.parse(message);

      console.log(
        `[Jugador ${ws.idJugador}]`,
        data
      );

    } catch (error) {
      console.error('Mensaje inválido:', error);
    }
  },

  close(ws) {
    const idJugador = ws.idJugador;

    jugadores.delete(idJugador);

    console.log(`Jugador ${idJugador} desconectado`);

    console.log(`Jugadores activos: ${jugadores.size}`);
  },
}
});

console.log('Servidor WebSocket iniciado');
console.log('ws://192.168.0.186:3000');