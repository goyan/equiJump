import type { JumpResult, TakeoffZone, HorseState, ObstaclePlacement, Vector2 } from '@/types/game';
import { TAKEOFF_ZONES, ZONE_FAULT_CHANCE, JUMP_WEIGHTS } from '../constants';

export class JumpEvaluator {
  /**
   * Calculate distance from horse to obstacle center
   */
  static getDistanceToObstacle(horse: Vector2, obstacle: ObstaclePlacement): number {
    const dx = obstacle.x - horse.x;
    const dy = obstacle.y - horse.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Determine which takeoff zone the horse is in
   */
  static getTakeoffZone(distance: number): TakeoffZone {
    if (distance < TAKEOFF_ZONES.too_close.max) {
      return 'too_close';
    } else if (distance < TAKEOFF_ZONES.ideal.max) {
      return 'ideal';
    } else if (distance < TAKEOFF_ZONES.too_long.max) {
      return 'too_long';
    }
    return 'miss';
  }

  /**
   * Calculate approach straightness (0-1)
   * Compares horse direction to obstacle direction
   */
  static calculateStraightness(
    horseRotation: number,
    horsePosition: Vector2,
    obstacle: ObstaclePlacement
  ): number {
    // Calculate angle from horse to obstacle
    const dx = obstacle.x - horsePosition.x;
    const dy = obstacle.y - horsePosition.y;
    const angleToObstacle = Math.atan2(dy, dx);

    // Calculate difference between horse heading and obstacle direction
    let angleDiff = Math.abs(horseRotation - angleToObstacle);

    // Normalize to 0-PI
    if (angleDiff > Math.PI) {
      angleDiff = 2 * Math.PI - angleDiff;
    }

    // Convert to straightness score (0-1, where 1 is perfectly straight)
    // 0 degrees diff = 1.0, 45 degrees diff = 0.5, 90+ degrees = 0
    const straightness = Math.max(0, 1 - (angleDiff / (Math.PI / 2)));

    return straightness;
  }

  /**
   * Calculate rhythm score based on speed consistency
   * In a real implementation, this would track speed over time
   */
  static calculateRhythm(currentSpeed: number, optimalSpeed: number): number {
    const speedRatio = currentSpeed / optimalSpeed;

    // Perfect rhythm at ratio of 1.0
    // Score decreases for too slow or too fast
    if (speedRatio < 0.5) return 0.3;
    if (speedRatio < 0.8) return 0.6;
    if (speedRatio < 1.2) return 1.0;
    if (speedRatio < 1.5) return 0.7;
    return 0.4;
  }

  /**
   * Calculate overall jump success probability
   */
  static calculateSuccessProbability(
    zone: TakeoffZone,
    straightness: number,
    rhythm: number,
    balance: number
  ): number {
    // Base fault chance from zone
    const baseFaultChance = ZONE_FAULT_CHANCE[zone];

    // Modifiers from other factors
    const straightnessModifier = (1 - straightness) * JUMP_WEIGHTS.straightness;
    const rhythmModifier = (1 - rhythm) * JUMP_WEIGHTS.rhythm;
    const balanceModifier = Math.abs(balance) * JUMP_WEIGHTS.balance;

    // Final fault probability
    const faultProbability = Math.min(1, baseFaultChance + straightnessModifier + rhythmModifier + balanceModifier);

    return 1 - faultProbability;
  }

  /**
   * Evaluate a jump attempt
   */
  static evaluate(
    horse: HorseState,
    obstacle: ObstaclePlacement,
    currentSpeed: number,
    optimalSpeed: number = 280 // canter speed
  ): JumpResult {
    const distance = this.getDistanceToObstacle(horse.position, obstacle);
    const zone = this.getTakeoffZone(distance);

    // If completely missed the takeoff window
    if (zone === 'miss') {
      return {
        zone: 'miss',
        straightness: 0,
        rhythm: 0,
        outcome: 'refusal',
        faults: 4, // Refusal = 4 faults
      };
    }

    const straightness = this.calculateStraightness(
      horse.rotation,
      horse.position,
      obstacle
    );

    const rhythm = this.calculateRhythm(currentSpeed, optimalSpeed);

    const successProbability = this.calculateSuccessProbability(
      zone,
      straightness,
      rhythm,
      horse.balance
    );

    // Determine outcome
    const roll = Math.random();
    const outcome = roll < successProbability ? 'clean' : 'rail';

    return {
      zone,
      straightness,
      rhythm,
      outcome,
      faults: outcome === 'rail' ? 4 : 0,
    };
  }

  /**
   * Check if horse is in valid jump range of an obstacle
   */
  static isInJumpRange(horse: Vector2, obstacle: ObstaclePlacement): boolean {
    const distance = this.getDistanceToObstacle(horse, obstacle);
    return distance <= TAKEOFF_ZONES.too_long.max;
  }

  /**
   * Find the nearest obstacle in front of the horse
   */
  static findNearestObstacle(
    horse: HorseState,
    obstacles: ObstaclePlacement[]
  ): ObstaclePlacement | null {
    let nearest: ObstaclePlacement | null = null;
    let nearestDistance = Infinity;

    for (const obstacle of obstacles) {
      // Check if obstacle is roughly in front of the horse
      const dx = obstacle.x - horse.position.x;
      const dy = obstacle.y - horse.position.y;
      const angleToObstacle = Math.atan2(dy, dx);

      let angleDiff = Math.abs(horse.rotation - angleToObstacle);
      if (angleDiff > Math.PI) {
        angleDiff = 2 * Math.PI - angleDiff;
      }

      // Only consider obstacles within ~60 degrees of heading
      if (angleDiff > Math.PI / 3) continue;

      const distance = this.getDistanceToObstacle(horse.position, obstacle);

      // Only consider obstacles within jump range
      if (distance > TAKEOFF_ZONES.too_long.max * 1.5) continue;

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = obstacle;
      }
    }

    return nearest;
  }
}
