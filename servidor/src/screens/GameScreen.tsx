import { useEffect, useRef, useState } from 'react';
import { createGame } from '../game/engine';

// Conecta al servidor en el mismo host donde corre Vite
const WS_URL = `ws://${window.location.hostname}:3000`;

type InfoJugador = { slot: number; color: string; nombre: string; activo: boolean };

export default function GameScreen() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef      = useRef<ReturnType<typeof createGame> | null>(null);
  const wsRef        = useRef<WebSocket | null>(null);

  const [jugadores, setJugadores] = useState<InfoJugador[]>([]);
  const [conectado, setConectado] = useState(false);

  // ── Iniciar motor del juego ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    gameRef.current = createGame(containerRef.current);
  }, []);

  // ── Conectar al servidor como pantalla ───────────────────────────
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConectado(true);
      ws.send(JSON.stringify({ type: 'register', payload: { role: 'display' } }));
    };

    ws.onmessage = ({ data }) => {
      let msg: any;
      try { msg = JSON.parse(data); } catch { return; }

      // Quién está conectado → mostrar/ocultar jugadores en Matter.js
      if (msg.type === 'playersState') {
        const lista: InfoJugador[] = msg.payload.jugadores;
        setJugadores(lista);
        lista.forEach(({ slot, activo }) => {
          const body = gameRef.current?.jugadores[slot];
          if (!body) return;
          (body.render as any).opacity = activo ? 1 : 0;
          // Resetear posición si se reconecta
          if (activo) {
            const spawnX = [150, 300, 450, 600];
            Matter.Body.setPosition(body, { x: spawnX[slot], y: 200 });
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
          }
        });
      }

      // Input de gamepad → actualizar estado de teclas
      if (msg.type === 'keydown' && gameRef.current) {
        gameRef.current.inputs[msg.payload.slot][msg.payload.dir] = true;
      }
      if (msg.type === 'keyup' && gameRef.current) {
        gameRef.current.inputs[msg.payload.slot][msg.payload.dir] = false;
      }
    };

    ws.onclose = () => setConectado(false);

    return () => ws.close();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#111827' }}>

      {/* Canvas Matter.js */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* HUD jugadores */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 10, pointerEvents: 'none',
      }}>
        {jugadores.map(j => (
          <div key={j.slot} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20,
            background: j.activo ? j.color + '22' : '#ffffff08',
            border: `1px solid ${j.activo ? j.color : '#2a2a2a'}`,
            opacity: j.activo ? 1 : 0.3,
            transition: 'all .3s',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: j.activo ? j.color : '#333' }} />
            <span style={{ color: j.activo ? j.color : '#444', fontSize: 11, fontFamily: 'monospace' }}>
              {j.nombre}
            </span>
          </div>
        ))}
      </div>

      {/* Mensaje si no hay conexión */}
      {!conectado && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#444', fontFamily: 'monospace', fontSize: 13, textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🎮</div>
          Conectando al servidor...
          <div style={{ marginTop: 6, fontSize: 10, color: '#2a2a2a' }}>{WS_URL}</div>
        </div>
      )}
    </div>
  );
}

// Necesario para resetear posición dentro del onmessage
import * as Matter from 'matter-js';
