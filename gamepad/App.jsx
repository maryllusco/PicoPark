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
    idJugador,
  } = useGamepadSocket(ipServidor);

  function manejarConexion(ip) {
    setIpServidor(ip);
        setTimeout(() => {
      conectar();
    }, 100);
  }

  if (estadoConexion !== 'conectado') {
    return (
      <ConnectScreen onConnect={manejarConexion} />
    );
  }

  return (
    <GamepadScreen
      idJugador={idJugador}
      enviarInput={enviarInput}
    />
  );
}