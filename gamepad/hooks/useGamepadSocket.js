import { useEffect, useRef, useState } from 'react';

export default function useGamepadSocket(ipServidor) {
  const socket     = useRef(null);
  const timeoutRef = useRef(null);

  const [estadoConexion, setEstadoConexion] = useState('desconectado');
  const [infoJugador,    setInfoJugador]    = useState(null);  // { slot, color, nombre }
  const [mensajeError,   setMensajeError]   = useState('');

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      desconectar();
    };
  }, []);

  function conectar() {
    if (!ipServidor) return;

    setEstadoConexion('conectando');
    setMensajeError('');

    const ws = new WebSocket(`ws://${ipServidor}:3000`);
    socket.current = ws;

    // Si en 8s no conecta, mostramos error
    timeoutRef.current = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        ws.close();
        setEstadoConexion('desconectado');
        setMensajeError('No se pudo conectar. Verificá la IP.');
      }
    }, 8000);

    ws.onopen = () => {
      clearTimeout(timeoutRef.current);
      console.log('Conectado al servidor');
      // ← CLAVE: registrarse como gamepad
      ws.send(JSON.stringify({ type: 'register', payload: { role: 'gamepad' } }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Mensaje servidor:', data);

        // Sala llena
        if (data.type === 'rejected') {
          setMensajeError(data.payload?.motivo ?? 'Sala llena');
          ws.close();
          return;
        }

        // Conexión aceptada → nos asignan slot y color
        if (data.type === 'playerAssigned') {
          setInfoJugador(data.payload);   // { slot, color, nombre }
          setEstadoConexion('conectado');
        }

      } catch (error) {
        console.error('Error parseando mensaje:', error);
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onclose = () => {
      clearTimeout(timeoutRef.current);
      console.log('Socket cerrado');
      setEstadoConexion('desconectado');
      setInfoJugador(null);
    };
  }

  function enviarInput(tipo, dir) {
    if (!socket.current) return;
    if (socket.current.readyState !== WebSocket.OPEN) return;
    // ← CLAVE: ahora manda { type, payload: { dir } } en vez de { tipo, tecla }
    socket.current.send(JSON.stringify({ type: tipo, payload: { dir } }));
  }

  function desconectar() {
    socket.current?.close();
  }

  return {
    conectar,
    desconectar,
    enviarInput,
    estadoConexion,
    infoJugador,    // ← antes era idJugador
    mensajeError,
  };
}