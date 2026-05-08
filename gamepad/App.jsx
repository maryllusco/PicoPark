import { useState } from 'react';
import useGamepadSocket from './hooks/useGamepadSocket';
import { ConnectScreen } from './screens/ConnectScreen';
import { GamepadScreen } from './screens/GamepadScreen';

export default function App() {
  const [ipServidor, setIpServidor] = useState('');

  const {
    conectar,
    enviarInput,
    estadoConexion,
    infoJugador,   // ← antes idJugador
    mensajeError,  // ← nuevo
  } = useGamepadSocket(ipServidor);

  function manejarConexion(ip) {
    setIpServidor(ip);
    setTimeout(() => conectar(), 100);
  }

  if (estadoConexion !== 'conectado' || !infoJugador) {
    return (
      <ConnectScreen
        onConnect={manejarConexion}
        estadoConexion={estadoConexion}
        mensajeError={mensajeError}
      />
    );
  }

  return (
    <GamepadScreen
      infoJugador={infoJugador}  // ← antes idJugador={idJugador}
      enviarInput={enviarInput}
    />
  );
}
