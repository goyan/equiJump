import type { Gait } from '@/types/game';

// Stride lengths in pixels per gait (approximating real horse strides scaled)
export const STRIDE_LENGTH: Record<Gait, number> = {
  halt: 0,
  walk: 40,      // ~1.5m scaled
  trot: 65,      // ~2.5m scaled
  canter: 90,    // ~3.5m scaled
  extended: 110, // ~4m scaled
};

// Stride frequency in ms between footfalls
export const STRIDE_FREQUENCY: Record<Gait, number> = {
  halt: 0,
  walk: 500,     // Slow 4-beat
  trot: 350,     // 2-beat diagonal
  canter: 280,   // 3-beat
  extended: 230, // Fast 3-beat
};

export interface StrideInfo {
  totalStrides: number;
  stridesSinceLastObstacle: number;
  lastStrideTime: number;
  distanceSinceLastStride: number;
  currentStrideProgress: number; // 0-1 for animation
}

export class StrideSystem {
  private totalStrides: number = 0;
  private stridesSinceLastObstacle: number = 0;
  private lastStrideTime: number = 0;
  private distanceSinceLastStride: number = 0;
  private lastPosition: { x: number; y: number } = { x: 0, y: 0 };
  private currentStrideProgress: number = 0;

  // Event callback for stride
  public onStride?: (strideNumber: number, position: { x: number; y: number }, gait: Gait) => void;

  constructor(initialPosition: { x: number; y: number }) {
    this.lastPosition = { ...initialPosition };
  }

  /**
   * Update stride tracking
   */
  update(
    currentPosition: { x: number; y: number },
    gait: Gait,
    currentTime: number
  ): void {
    if (gait === 'halt') {
      this.currentStrideProgress = 0;
      return;
    }

    // Calculate distance moved
    const dx = currentPosition.x - this.lastPosition.x;
    const dy = currentPosition.y - this.lastPosition.y;
    const distanceMoved = Math.sqrt(dx * dx + dy * dy);

    this.distanceSinceLastStride += distanceMoved;
    this.lastPosition = { ...currentPosition };

    // Get stride length for current gait
    const strideLength = STRIDE_LENGTH[gait];
    const strideFrequency = STRIDE_FREQUENCY[gait];

    // Calculate stride progress for animation
    this.currentStrideProgress = (this.distanceSinceLastStride % strideLength) / strideLength;

    // Check if we've completed a stride
    if (this.distanceSinceLastStride >= strideLength) {
      const stridesCompleted = Math.floor(this.distanceSinceLastStride / strideLength);

      for (let i = 0; i < stridesCompleted; i++) {
        this.totalStrides++;
        this.stridesSinceLastObstacle++;
        this.lastStrideTime = currentTime;

        // Emit stride event
        if (this.onStride) {
          this.onStride(this.stridesSinceLastObstacle, currentPosition, gait);
        }
      }

      this.distanceSinceLastStride = this.distanceSinceLastStride % strideLength;
    }
  }

  /**
   * Reset stride counter after jumping an obstacle
   */
  resetStrideCount(): void {
    this.stridesSinceLastObstacle = 0;
    this.distanceSinceLastStride = 0;
  }

  /**
   * Get current stride info
   */
  getInfo(): StrideInfo {
    return {
      totalStrides: this.totalStrides,
      stridesSinceLastObstacle: this.stridesSinceLastObstacle,
      lastStrideTime: this.lastStrideTime,
      distanceSinceLastStride: this.distanceSinceLastStride,
      currentStrideProgress: this.currentStrideProgress,
    };
  }

  /**
   * Get strides since last obstacle
   */
  getStridesSinceLastObstacle(): number {
    return this.stridesSinceLastObstacle;
  }

  /**
   * Get current stride progress (0-1) for animation
   */
  getStrideProgress(): number {
    return this.currentStrideProgress;
  }

  /**
   * Full reset
   */
  reset(position: { x: number; y: number }): void {
    this.totalStrides = 0;
    this.stridesSinceLastObstacle = 0;
    this.lastStrideTime = 0;
    this.distanceSinceLastStride = 0;
    this.lastPosition = { ...position };
    this.currentStrideProgress = 0;
  }
}
