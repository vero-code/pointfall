// src/config.js
export const GAME_SETTINGS = {
  TOTAL_LEVELS: 5,
  OBJECTIVE_UPDATE_DELAY: 1000,
};

export const PLAYER_SETTINGS = {
  HEIGHT: 1.6,
  SPEED: 9,
  INTERACTION_DISTANCE: 2,
  MOVEMENT_DAMPING: 5.0,
};

export const STARTING_STATE = {
  INVENTORY: {
    water: 0,
    lollipop: 0,
  },
  LEVEL: 1,
};

export const SCENE_SETTINGS = {
  FOG_COLOR: 0x0a0a0a,
  FOG_NEAR: 1,
  FOG_FAR: 15,
  STARTING_POSITION: { x: 0, y: PLAYER_SETTINGS.HEIGHT, z: 5 },
};

export const WORLD_BOUNDS = {
  MIN_X: -1.767,
  MAX_X: 1.789,
  MIN_Z: -5.729,
  MAX_Z: 5.747,
};
