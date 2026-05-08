import * as Matter from 'matter-js';

const GAME_WIDTH  = 1000;
const GAME_HEIGHT = 600;

const COLORES  = ['#f59e0b', '#3b82f6', '#ef4444', '#22c55e'];
const SPAWN_X  = [150, 300, 450, 600];
const VELOCIDAD = 5;
const FUERZA_SALTO = -15;

// ── Estado de inputs por slot ─────────────────────────────────────
const inputs: Record<number, Record<string, boolean>> = {
  0: {}, 1: {}, 2: {}, 3: {},
};

// ── Helpers ───────────────────────────────────────────────────────
function plataforma(x: number, y: number, w: number, color = '#4b5563') {
  return Matter.Bodies.rectangle(x, y, w, 20, {
    isStatic: true,
    render: { fillStyle: color },
    friction: 0.1,
  });
}

function jugadorBody(slot: number) {
  return Matter.Bodies.rectangle(SPAWN_X[slot], 200, 40, 40, {
    friction:    0.05,
    frictionAir: 0.02,
    restitution: 0,
    label: `jugador-${slot}`,
    render: {
      fillStyle: COLORES[slot],
      opacity: 0,           // oculto hasta que se conecte
    },
  });
}

// ── Función principal ─────────────────────────────────────────────
export function createGame(container: HTMLDivElement) {
  const engine = Matter.Engine.create();
  const render = Matter.Render.create({
    element: container,
    engine,
    options: {
      width:      GAME_WIDTH,
      height:     GAME_HEIGHT,
      wireframes: false,
      background: '#111827',
      // Escala el canvas al tamaño del contenedor
      hasBounds:  true,
    },
  });

  // Ajustar canvas al contenedor
  render.canvas.style.width  = '100%';
  render.canvas.style.height = '100%';

  // ── Mundo ───────────────────────────────────────────────────────
  const suelo = Matter.Bodies.rectangle(500, 590, 1000, 40, {
    isStatic: true,
    render: { fillStyle: '#374151' },
  });

  const paredIzq = Matter.Bodies.rectangle(-10, 300, 20, 600, {
    isStatic: true, render: { fillStyle: '#374151' },
  });
  const paredDer = Matter.Bodies.rectangle(1010, 300, 20, 600, {
    isStatic: true, render: { fillStyle: '#374151' },
  });

  // Plataformas del nivel
  const plataformas = [
    plataforma(200,  450, 180),
    plataforma(450,  380, 160),
    plataforma(680,  310, 180),
    plataforma(850,  420, 140),
    plataforma(150,  280, 140),
    plataforma(500,  220, 200, '#1e3a5f'),  // plataforma alta
    plataforma(780,  180, 160, '#1e3a5f'),
  ];

  // 4 jugadores
  const jugadores = [0, 1, 2, 3].map(jugadorBody);

  Matter.World.add(engine.world, [
    suelo, paredIzq, paredDer,
    ...plataformas,
    ...jugadores,
  ]);

  // ── Loop de física: aplica inputs cada tick ─────────────────────
  const runner = Matter.Runner.create();

  Matter.Events.on(runner, 'tick', () => {
    jugadores.forEach((body, slot) => {
      if ((body.render as any).opacity === 0) return;

      const inp     = inputs[slot];
      const enSuelo = Math.abs(body.velocity.y) < 0.8;

      if (inp['left'])  Matter.Body.setVelocity(body, { x: -VELOCIDAD, y: body.velocity.y });
      if (inp['right']) Matter.Body.setVelocity(body, { x:  VELOCIDAD, y: body.velocity.y });

      // Fricción horizontal cuando no se toca nada
      if (!inp['left'] && !inp['right']) {
        Matter.Body.setVelocity(body, { x: body.velocity.x * 0.75, y: body.velocity.y });
      }

      if ((inp['up'] || inp['jump']) && enSuelo) {
        Matter.Body.setVelocity(body, { x: body.velocity.x, y: FUERZA_SALTO });
      }
    });
  });

  Matter.Render.run(render);
  Matter.Runner.run(runner, engine);

  return { engine, render, runner, jugadores, inputs };
}
