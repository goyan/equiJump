import { create } from 'zustand';
import type { Gait, JumpResult, ScoreData } from '@/types/game';

interface GameState {
  // Game status
  status: 'menu' | 'loading' | 'playing' | 'paused' | 'finished';
  courseId: string | null;

  // Live game data
  time: number;
  faults: number;
  gait: Gait;
  speed: number;
  isJumping: boolean;
  stridesSinceObstacle: number;

  // Results
  lastJumpResult: JumpResult | null;
  finalScore: ScoreData | null;

  // Actions
  setStatus: (status: GameState['status']) => void;
  setCourseId: (courseId: string) => void;
  updateGameState: (state: Partial<GameState>) => void;
  setJumpResult: (result: JumpResult) => void;
  setFinalScore: (score: ScoreData) => void;
  reset: () => void;

  // Handler for Phaser events
  handleGameEvent: (event: string, data: any) => void;
}

const initialState = {
  status: 'menu' as const,
  courseId: null,
  time: 0,
  faults: 0,
  gait: 'halt' as Gait,
  speed: 0,
  isJumping: false,
  stridesSinceObstacle: 0,
  lastJumpResult: null,
  finalScore: null,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setStatus: (status) => set({ status }),

  setCourseId: (courseId) => set({ courseId }),

  updateGameState: (state) => set(state),

  setJumpResult: (result) => set({ lastJumpResult: result }),

  setFinalScore: (score) => set({ finalScore: score, status: 'finished' }),

  reset: () => set(initialState),

  handleGameEvent: (event, data) => {
    switch (event) {
      case 'gameStarted':
        set({
          status: 'playing',
          courseId: data.courseId,
          time: 0,
          faults: 0,
          lastJumpResult: null,
          finalScore: null,
        });
        break;

      case 'stateUpdate':
        set({
          time: data.time,
          faults: data.faults,
          gait: data.gait,
          speed: data.speed,
          isJumping: data.isJumping,
          stridesSinceObstacle: data.stridesSinceObstacle ?? 0,
        });
        break;

      case 'jumpComplete':
        set({
          lastJumpResult: data.result,
          faults: data.totalFaults,
        });

        // Clear jump result after 2 seconds
        setTimeout(() => {
          const current = get();
          if (current.lastJumpResult === data.result) {
            set({ lastJumpResult: null });
          }
        }, 2000);
        break;

      case 'gameComplete':
        set({
          status: 'finished',
          finalScore: {
            courseId: data.courseId,
            time: data.time,
            faults: data.faults,
            stars: data.stars,
            jumpResults: data.jumpResults,
          },
        });
        break;

      case 'gamePaused':
        set({ status: 'paused' });
        break;

      case 'gameResumed':
        set({ status: 'playing' });
        break;

      case 'gameRestarted':
        set({
          status: 'playing',
          time: 0,
          faults: 0,
          lastJumpResult: null,
          finalScore: null,
        });
        break;
    }
  },
}));

// Selector hooks for common state slices
export const useGameStatus = () => useGameStore((s) => s.status);
export const useGameTime = () => useGameStore((s) => s.time);
export const useGameFaults = () => useGameStore((s) => s.faults);
export const useCurrentGait = () => useGameStore((s) => s.gait);
export const useCurrentSpeed = () => useGameStore((s) => s.speed);
export const useStridesSinceObstacle = () => useGameStore((s) => s.stridesSinceObstacle);
export const useLastJumpResult = () => useGameStore((s) => s.lastJumpResult);
export const useFinalScore = () => useGameStore((s) => s.finalScore);
