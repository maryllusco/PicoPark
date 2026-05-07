import { useEffect, useRef, useState } from 'react';

export default function useGamepadSocket(ipServidor) {
  const socket = useRef(null);

  const [estadoConexion, setEstadoConexion] = useState('desconectado');
  const [idJugador, setIdJugador] = useState(null);

  useEffect(() => {
    return () => {
      desconectar();
    };
  }, []);

  function conectar() {
    if (!ipServidor) {
      return;
    }

    setEstadoConexion('conectando');

    const ws = new WebSocket(`ws://${ipServidor}:3000`);

    socket.current = ws;

    ws.onopen = () => {
      console.log('Conectado al servidor');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log('Mensaje servidor:', data);

        // Sala llena
        if (data.tipo === 'error') {
          alert(data.mensaje);

          ws.close();

          return;
        }

        // Conexión aceptada
        if (data.tipo === 'conexion-exitosa') {
          setIdJugador(data.idJugador);

          setEstadoConexion('conectado');
        }

      } catch (error) {
        console.error('Error parseando mensaje:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Error socket:', error.message);

      setEstadoConexion('error');
    };

    ws.onclose = () => {
      console.log('Socket cerrado');

      setEstadoConexion('desconectado');
    };
  }

  function enviarInput(tipo, tecla) {
    if (!socket.current) {
      return;
    }

    if (socket.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.current.send(
      JSON.stringify({
        tipo,
        tecla,
      })
    );
  }

  function desconectar() {
    socket.current?.close();
  }

  return {
    conectar,
    desconectar,
    enviarInput,
    estadoConexion,
    idJugador,
  };
}