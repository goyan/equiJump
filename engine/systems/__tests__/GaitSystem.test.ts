import { describe, it, expect, beforeEach } from 'vitest';
import { GaitSystem } from '../GaitSystem';

describe('GaitSystem', () => {
  let gaitSystem: GaitSystem;

  beforeEach(() => {
    gaitSystem = new GaitSystem('halt');
  });

  describe('initialization', () => {
    it('should start at halt by default', () => {
      expect(gaitSystem.getCurrentGait()).toBe('halt');
      expect(gaitSystem.getSpeed()).toBe(0);
    });

    it('should start at specified gait', () => {
      const system = new GaitSystem('walk');
      expect(system.getCurrentGait()).toBe('walk');
      expect(system.getSpeed()).toBe(80);
    });
  });

  describe('gait transitions', () => {
    it('should transition up from halt to walk', () => {
      gaitSystem.requestGaitChange('up');
      expect(gaitSystem.getCurrentGait()).toBe('walk');
    });

    it('should not transition down from halt', () => {
      gaitSystem.requestGaitChange('down');
      expect(gaitSystem.getCurrentGait()).toBe('halt');
    });

    it('should transition through all gaits', () => {
      const gaits = ['halt', 'walk', 'trot', 'canter', 'extended'];

      for (let i = 1; i < gaits.length; i++) {
        gaitSystem.requestGaitChange('up');
        // Simulate time passing for transition
        gaitSystem.update(1000);
        expect(gaitSystem.getCurrentGait()).toBe(gaits[i]);
      }
    });

    it('should not transition past extended', () => {
      // Go to extended
      for (let i = 0; i < 5; i++) {
        gaitSystem.requestGaitChange('up');
        gaitSystem.update(1000);
      }

      expect(gaitSystem.getCurrentGait()).toBe('extended');

      // Try to go higher
      gaitSystem.requestGaitChange('up');
      gaitSystem.update(1000);
      expect(gaitSystem.getCurrentGait()).toBe('extended');
    });
  });

  describe('speed interpolation', () => {
    it('should interpolate speed during transition', () => {
      gaitSystem.requestGaitChange('up'); // halt -> walk

      const initialSpeed = gaitSystem.getSpeed();
      expect(initialSpeed).toBe(0);

      // Mid-transition
      gaitSystem.update(200);
      const midSpeed = gaitSystem.getSpeed();
      expect(midSpeed).toBeGreaterThan(0);
      expect(midSpeed).toBeLessThan(80);

      // Complete transition
      gaitSystem.update(300);
      const finalSpeed = gaitSystem.getSpeed();
      expect(finalSpeed).toBe(80);
    });
  });

  describe('turn rate', () => {
    it('should return correct turn rate for each gait', () => {
      expect(gaitSystem.getTurnRate()).toBe(0.1); // halt

      gaitSystem.setTargetGait('walk');
      gaitSystem.update(1000);
      expect(gaitSystem.getTurnRate()).toBe(0.08);

      gaitSystem.setTargetGait('canter');
      gaitSystem.update(1000);
      expect(gaitSystem.getTurnRate()).toBe(0.04);
    });
  });

  describe('forceHalt', () => {
    it('should immediately stop the horse', () => {
      gaitSystem.setTargetGait('canter');
      gaitSystem.update(1000);

      expect(gaitSystem.getSpeed()).toBe(280);

      gaitSystem.forceHalt();
      expect(gaitSystem.getCurrentGait()).toBe('halt');
      expect(gaitSystem.getSpeed()).toBe(0);
      expect(gaitSystem.isTransitioning()).toBe(false);
    });
  });

  describe('transition state', () => {
    it('should report transitioning status', () => {
      expect(gaitSystem.isTransitioning()).toBe(false);

      gaitSystem.requestGaitChange('up');
      expect(gaitSystem.isTransitioning()).toBe(true);

      gaitSystem.update(1000);
      expect(gaitSystem.isTransitioning()).toBe(false);
    });

    it('should report transition progress', () => {
      expect(gaitSystem.getTransitionProgress()).toBe(1);

      gaitSystem.requestGaitChange('up');
      expect(gaitSystem.getTransitionProgress()).toBe(0);

      gaitSystem.update(200);
      const progress = gaitSystem.getTransitionProgress();
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(1);
    });
  });
});
