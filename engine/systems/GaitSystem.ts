import type { Gait, GaitConfig } from '@/types/game';
import { GAIT_CONFIG, GAIT_ORDER } from '../constants';

export class GaitSystem {
  private currentGait: Gait = 'halt';
  private targetGait: Gait = 'halt';
  private transitionProgress: number = 1; // 1 = complete
  private transitionTime: number = 0;

  constructor(initialGait: Gait = 'halt') {
    this.currentGait = initialGait;
    this.targetGait = initialGait;
  }

  /**
   * Request a gait change (up or down)
   */
  requestGaitChange(direction: 'up' | 'down'): void {
    const currentIndex = GAIT_ORDER.indexOf(this.targetGait);

    if (direction === 'up' && currentIndex < GAIT_ORDER.length - 1) {
      this.setTargetGait(GAIT_ORDER[currentIndex + 1]);
    } else if (direction === 'down' && currentIndex > 0) {
      this.setTargetGait(GAIT_ORDER[currentIndex - 1]);
    }
  }

  /**
   * Set a specific target gait
   */
  setTargetGait(gait: Gait): void {
    if (gait === this.targetGait) return;

    // If we're mid-transition, don't interrupt (unless going to halt)
    if (this.transitionProgress < 1 && gait !== 'halt') {
      return;
    }

    this.targetGait = gait;
    this.transitionProgress = 0;
    this.transitionTime = GAIT_CONFIG[gait].transitionTime;
  }

  /**
   * Update the gait transition
   */
  update(delta: number): void {
    if (this.transitionProgress >= 1) return;

    if (this.transitionTime <= 0) {
      this.transitionProgress = 1;
      this.currentGait = this.targetGait;
      return;
    }

    this.transitionProgress += delta / this.transitionTime;

    if (this.transitionProgress >= 1) {
      this.transitionProgress = 1;
      this.currentGait = this.targetGait;
    }
  }

  /**
   * Get current effective speed (interpolated during transitions)
   */
  getSpeed(): number {
    const fromSpeed = GAIT_CONFIG[this.currentGait].speed;
    const toSpeed = GAIT_CONFIG[this.targetGait].speed;

    // Ease in-out for smooth transitions
    const t = this.easeInOutQuad(this.transitionProgress);
    return fromSpeed + (toSpeed - fromSpeed) * t;
  }

  /**
   * Get current effective turn rate
   */
  getTurnRate(): number {
    const fromRate = GAIT_CONFIG[this.currentGait].turnRate;
    const toRate = GAIT_CONFIG[this.targetGait].turnRate;

    const t = this.easeInOutQuad(this.transitionProgress);
    return fromRate + (toRate - fromRate) * t;
  }

  /**
   * Get current gait name (for display)
   */
  getCurrentGait(): Gait {
    return this.transitionProgress >= 1 ? this.currentGait : this.targetGait;
  }

  /**
   * Get the actual current gait (may differ during transition)
   */
  getActualGait(): Gait {
    return this.currentGait;
  }

  /**
   * Check if currently transitioning
   */
  isTransitioning(): boolean {
    return this.transitionProgress < 1;
  }

  /**
   * Get transition progress (0-1)
   */
  getTransitionProgress(): number {
    return this.transitionProgress;
  }

  /**
   * Force immediate halt (for refusals, collisions)
   */
  forceHalt(): void {
    this.currentGait = 'halt';
    this.targetGait = 'halt';
    this.transitionProgress = 1;
  }

  /**
   * Easing function for smooth transitions
   */
  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
}
