import * as Matter from 'matter-js';

import {
  FLOOR_HEIGHT,
  GAME_HEIGHT,
  GAME_WIDTH,
} from './constants';

export function createFloor() {
  return Matter.Bodies.rectangle(
    GAME_WIDTH / 2,
    GAME_HEIGHT - FLOOR_HEIGHT / 2,
    GAME_WIDTH,
    FLOOR_HEIGHT,
    {
      isStatic: true,
      render: {
        fillStyle: '#374151',
      },
    }
  );
}