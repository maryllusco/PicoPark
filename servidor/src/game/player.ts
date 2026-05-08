import * as Matter from 'matter-js';

import {
  PLAYER_SIZE,
} from './constants';

export function createPlayer() {
  return Matter.Bodies.rectangle(
    200,
    200,
    PLAYER_SIZE,
    PLAYER_SIZE,
    {
      restitution: 0,
      friction: 0.1,
      render: {
        fillStyle: '#f59e0b',
      },
    }
  );
}