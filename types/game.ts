// Core game types for EquiJump

export type Gait = 'halt' | 'walk' | 'trot' | 'canter' | 'extended';

export interface Vector2 {
  x: number;
  y: number;
}

export interface GaitConfig {
  speed: number;       // pixels per second
  turnRate: number;    // radians per second
  transitionTime: number; // ms to transition to this gait
}

export interface HorseState {
  position: Vector2;
  rotation: number;    // radians
  velocity: Vector2;
  gait: Gait;
  targetGait: Gait;
  transitionProgress: number; // 0-1
  isJumping: boolean;
  jumpPhase: 'approach' | 'takeoff' | 'airborne' | 'landing' | null;
  straightness: number; // 0-1, how straight the approach is
  balance: number;      // -1 to 1, lateral balance
}

export type TakeoffZone = 'too_close' | 'ideal' | 'too_long' | 'miss';

export interface JumpResult {
  zone: TakeoffZone;
  straightness: number;
  rhythm: number;
  outcome: 'clean' | 'rail' | 'refusal';
  faults: number;
}

export type ObstacleType = 'vertical' | 'oxer' | 'wall' | 'water' | 'triple_bar';

export interface ObstaclePlacement {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  rotation: number;    // radians
  height: number;      // cm (for display/difficulty)
  width?: number;      // cm (for oxers)
}

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Course {
  id: string;
  name: string;
  description: string;
  difficulty: CourseDifficulty;
  timeLimit: number;   // seconds
  obstacles: ObstaclePlacement[];
  startPosition: Vector2;
  startRotation: number;
  finishLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  arena: {
    width: number;
    height: number;
  };
}

export interface GameState {
  status: 'menu' | 'loading' | 'playing' | 'paused' | 'finished';
  courseId: string | null;
  time: number;        // elapsed ms
  faults: number;
  currentObstacleIndex: number;
  jumpResults: JumpResult[];
  horse: HorseState;
}

export interface ScoreData {
  courseId: string;
  time: number;        // ms
  faults: number;
  stars: 1 | 2 | 3;
  jumpResults: JumpResult[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userImage?: string;
  time: number;
  faults: number;
  stars: number;
  createdAt: Date;
}

// Input state from keyboard or touch
export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}
