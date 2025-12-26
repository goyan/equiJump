import type { Gait, GaitConfig } from '@/types/game';

// Gait configurations
export const GAIT_CONFIG: Record<Gait, GaitConfig> = {
  halt: {
    speed: 0,
    turnRate: 0.1,
    transitionTime: 0,
  },
  walk: {
    speed: 80,
    turnRate: 0.08,
    transitionTime: 400,
  },
  trot: {
    speed: 160,
    turnRate: 0.06,
    transitionTime: 600,
  },
  canter: {
    speed: 280,
    turnRate: 0.04,
    transitionTime: 800,
  },
  extended: {
    speed: 400,
    turnRate: 0.025,
    transitionTime: 1000,
  },
};

// Gait order for transitioning
export const GAIT_ORDER: Gait[] = ['halt', 'walk', 'trot', 'canter', 'extended'];

// Jump takeoff zones (distance in pixels from obstacle)
export const TAKEOFF_ZONES = {
  too_close: { min: 0, max: 50 },
  ideal: { min: 50, max: 110 },
  too_long: { min: 110, max: 170 },
};

// Jump evaluation weights
export const JUMP_WEIGHTS = {
  zone: 0.35,
  straightness: 0.30,
  rhythm: 0.20,
  balance: 0.15,
};

// Fault probabilities by zone (base chance of knocking a rail)
export const ZONE_FAULT_CHANCE = {
  too_close: 0.6,
  ideal: 0.05,
  too_long: 0.4,
  miss: 1.0,
};

// Arena defaults
export const ARENA = {
  width: 2400,
  height: 1600,
  backgroundColor: 0x1a472a,
  borderColor: 0xffffff,
  borderWidth: 4,
};

// Horse sprite size
export const HORSE = {
  width: 48,
  height: 32,
  colliderRadius: 20,
};

// Obstacle dimensions (in pixels)
export const OBSTACLE = {
  vertical: { width: 80, height: 16 },
  oxer: { width: 80, height: 32 },
  wall: { width: 80, height: 24 },
  water: { width: 100, height: 40 },
  triple_bar: { width: 80, height: 40 },
};

// Physics
export const PHYSICS = {
  drag: 100,
  angularDrag: 200,
  acceleration: 300,
  deceleration: 400,
};

// Camera
export const CAMERA = {
  followLerp: 0.1,
  zoomDefault: 1,
  zoomMin: 0.5,
  zoomMax: 2,
};

// Colors for UI
export const COLORS = {
  primary: 0x00f5ff,
  secondary: 0xff00e5,
  accent: 0x00ff88,
  warning: 0xffb800,
  error: 0xff3366,
  arena: 0x1a472a,
  arenaDark: 0x0f2d1a,
  arenaLight: 0x2d5a3d,
  white: 0xffffff,
  black: 0x000000,
};

// Star rating thresholds
export const STAR_THRESHOLDS = {
  // 3 stars: no faults, under time limit
  // 2 stars: 0-4 faults OR slightly over time
  // 1 star: completed
  maxFaultsFor3Stars: 0,
  maxFaultsFor2Stars: 4,
  timeBufferFor3Stars: 0,    // must be under limit
  timeBufferFor2Stars: 5000, // can be 5s over
};
