import { describe, it, expect } from 'vitest';
import { JumpEvaluator } from '../JumpEvaluator';
import type { HorseState, ObstaclePlacement } from '@/types/game';

describe('JumpEvaluator', () => {
  const createHorseState = (overrides: Partial<HorseState> = {}): HorseState => ({
    position: { x: 0, y: 0 },
    rotation: 0,
    velocity: { x: 0, y: 0 },
    gait: 'canter',
    targetGait: 'canter',
    transitionProgress: 1,
    isJumping: false,
    jumpPhase: null,
    straightness: 1,
    balance: 0,
    ...overrides,
  });

  const createObstacle = (overrides: Partial<ObstaclePlacement> = {}): ObstaclePlacement => ({
    id: 'test-obs',
    type: 'vertical',
    x: 100,
    y: 0,
    rotation: 0,
    height: 100,
    ...overrides,
  });

  describe('getDistanceToObstacle', () => {
    it('should calculate distance correctly', () => {
      const horse = { x: 0, y: 0 };
      const obstacle = createObstacle({ x: 100, y: 0 });

      const distance = JumpEvaluator.getDistanceToObstacle(horse, obstacle);
      expect(distance).toBe(100);
    });

    it('should handle diagonal distance', () => {
      const horse = { x: 0, y: 0 };
      const obstacle = createObstacle({ x: 30, y: 40 });

      const distance = JumpEvaluator.getDistanceToObstacle(horse, obstacle);
      expect(distance).toBe(50);
    });
  });

  describe('getTakeoffZone', () => {
    it('should return too_close for short distances', () => {
      expect(JumpEvaluator.getTakeoffZone(30)).toBe('too_close');
      expect(JumpEvaluator.getTakeoffZone(49)).toBe('too_close');
    });

    it('should return ideal for medium distances', () => {
      expect(JumpEvaluator.getTakeoffZone(60)).toBe('ideal');
      expect(JumpEvaluator.getTakeoffZone(90)).toBe('ideal');
      expect(JumpEvaluator.getTakeoffZone(109)).toBe('ideal');
    });

    it('should return too_long for far distances', () => {
      expect(JumpEvaluator.getTakeoffZone(120)).toBe('too_long');
      expect(JumpEvaluator.getTakeoffZone(160)).toBe('too_long');
    });

    it('should return miss for very far distances', () => {
      expect(JumpEvaluator.getTakeoffZone(180)).toBe('miss');
      expect(JumpEvaluator.getTakeoffZone(200)).toBe('miss');
    });
  });

  describe('calculateStraightness', () => {
    it('should return 1 for perfect alignment', () => {
      const horse = { x: 0, y: 0 };
      const obstacle = createObstacle({ x: 100, y: 0 });
      const horseRotation = 0; // Facing right

      const straightness = JumpEvaluator.calculateStraightness(
        horseRotation,
        horse,
        obstacle
      );
      expect(straightness).toBeCloseTo(1, 2);
    });

    it('should return lower value for angled approach', () => {
      const horse = { x: 0, y: 0 };
      const obstacle = createObstacle({ x: 100, y: 0 });
      const horseRotation = Math.PI / 4; // 45 degrees off

      const straightness = JumpEvaluator.calculateStraightness(
        horseRotation,
        horse,
        obstacle
      );
      expect(straightness).toBeCloseTo(0.5, 1);
    });

    it('should return 0 for perpendicular approach', () => {
      const horse = { x: 0, y: 0 };
      const obstacle = createObstacle({ x: 100, y: 0 });
      const horseRotation = Math.PI / 2; // 90 degrees off

      const straightness = JumpEvaluator.calculateStraightness(
        horseRotation,
        horse,
        obstacle
      );
      expect(straightness).toBeCloseTo(0, 1);
    });
  });

  describe('calculateRhythm', () => {
    it('should return 1 for optimal speed', () => {
      expect(JumpEvaluator.calculateRhythm(280, 280)).toBe(1);
    });

    it('should penalize slow speed', () => {
      expect(JumpEvaluator.calculateRhythm(100, 280)).toBeLessThan(1);
    });

    it('should penalize fast speed', () => {
      expect(JumpEvaluator.calculateRhythm(500, 280)).toBeLessThan(1);
    });
  });

  describe('evaluate', () => {
    it('should return clean jump for ideal conditions', () => {
      const horse = createHorseState({
        position: { x: 20, y: 0 },
        straightness: 1,
        balance: 0,
      });
      const obstacle = createObstacle({ x: 100, y: 0 });

      // Run multiple times to account for randomness
      let cleanJumps = 0;
      for (let i = 0; i < 100; i++) {
        const result = JumpEvaluator.evaluate(horse, obstacle, 280);
        if (result.outcome === 'clean') cleanJumps++;
      }

      // With ideal conditions, should be mostly clean
      expect(cleanJumps).toBeGreaterThan(80);
    });

    it('should return refusal for missed takeoff', () => {
      const horse = createHorseState({
        position: { x: 0, y: 0 },
      });
      const obstacle = createObstacle({ x: 300, y: 0 }); // Too far

      const result = JumpEvaluator.evaluate(horse, obstacle, 280);
      expect(result.outcome).toBe('refusal');
      expect(result.faults).toBe(4);
    });

    it('should have higher fault chance for poor straightness', () => {
      const horse = createHorseState({
        position: { x: 20, y: 0 },
        straightness: 0.3,
        balance: 0,
        rotation: Math.PI / 6,
      });
      const obstacle = createObstacle({ x: 100, y: 0 });

      let railHits = 0;
      for (let i = 0; i < 100; i++) {
        const result = JumpEvaluator.evaluate(horse, obstacle, 280);
        if (result.outcome === 'rail') railHits++;
      }

      // Poor straightness should cause more rails (probabilistic - at least 5 out of 100)
      expect(railHits).toBeGreaterThan(5);
    });
  });

  describe('isInJumpRange', () => {
    it('should return true when in range', () => {
      const horse = { x: 0, y: 0 };
      const obstacle = createObstacle({ x: 100, y: 0 });

      expect(JumpEvaluator.isInJumpRange(horse, obstacle)).toBe(true);
    });

    it('should return false when too far', () => {
      const horse = { x: 0, y: 0 };
      const obstacle = createObstacle({ x: 500, y: 0 });

      expect(JumpEvaluator.isInJumpRange(horse, obstacle)).toBe(false);
    });
  });

  describe('findNearestObstacle', () => {
    it('should find obstacle in front of horse', () => {
      const horse = createHorseState({
        position: { x: 0, y: 0 },
        rotation: 0,
      });
      const obstacles = [
        createObstacle({ id: 'front', x: 100, y: 0 }),
        createObstacle({ id: 'behind', x: -100, y: 0 }),
        createObstacle({ id: 'side', x: 0, y: 100 }),
      ];

      const nearest = JumpEvaluator.findNearestObstacle(horse, obstacles);
      expect(nearest?.id).toBe('front');
    });

    it('should return null when no obstacles in range', () => {
      const horse = createHorseState({
        position: { x: 0, y: 0 },
        rotation: 0,
      });
      const obstacles = [
        createObstacle({ id: 'far', x: 500, y: 0 }),
      ];

      const nearest = JumpEvaluator.findNearestObstacle(horse, obstacles);
      expect(nearest).toBeNull();
    });
  });
});
