import Phaser from 'phaser';
import type { Gait, HorseState, InputState, JumpResult, ObstaclePlacement } from '@/types/game';
import { GaitSystem } from '../systems/GaitSystem';
import { JumpEvaluator } from '../systems/JumpEvaluator';
import { HORSE, PHYSICS } from '../constants';

export class Horse extends Phaser.Physics.Arcade.Sprite {
  private gaitSystem: GaitSystem;
  private isJumping: boolean = false;
  private jumpPhase: 'takeoff' | 'airborne' | 'landing' | null = null;
  private jumpTimer: number = 0;
  private straightness: number = 1;
  private balance: number = 0;
  private lastTurnDirection: number = 0;
  private obstaclesJumped: Set<string> = new Set();

  // Events
  public onJump: Phaser.Events.EventEmitter;
  public onGaitChange: Phaser.Events.EventEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'horse');

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setDrag(PHYSICS.drag, PHYSICS.drag);

    // Set size and origin
    this.setDisplaySize(HORSE.width, HORSE.height);
    this.setOrigin(0.5, 0.5);

    // Initialize systems
    this.gaitSystem = new GaitSystem('halt');

    // Event emitters
    this.onJump = new Phaser.Events.EventEmitter();
    this.onGaitChange = new Phaser.Events.EventEmitter();
  }

  /**
   * Update horse each frame
   */
  update(delta: number, input: InputState, obstacles: ObstaclePlacement[]): void {
    // Update gait system
    this.gaitSystem.update(delta);

    // Handle gait changes from input
    this.handleGaitInput(input);

    // Handle turning
    this.handleTurning(input, delta);

    // Handle forward/backward movement
    this.handleMovement(input);

    // Update straightness based on turning
    this.updateStraightness(delta);

    // Update balance
    this.updateBalance(delta);

    // Handle jumping
    if (this.isJumping) {
      this.updateJump(delta);
    } else if (input.jump) {
      this.attemptJump(obstacles);
    }

    // Update sprite based on state
    this.updateSprite();
  }

  /**
   * Handle gait change input
   */
  private handleGaitInput(input: InputState): void {
    if (input.forward) {
      this.gaitSystem.requestGaitChange('up');
    } else if (input.backward) {
      this.gaitSystem.requestGaitChange('down');
    }
  }

  /**
   * Handle turning input
   */
  private handleTurning(input: InputState, delta: number): void {
    const turnRate = this.gaitSystem.getTurnRate();
    const speed = this.gaitSystem.getSpeed();

    // Reduce turn rate at high speeds
    const speedFactor = Math.max(0.5, 1 - speed / 600);
    const effectiveTurnRate = turnRate * speedFactor;

    if (input.left) {
      this.rotation -= effectiveTurnRate * (delta / 16.67);
      this.lastTurnDirection = -1;
    } else if (input.right) {
      this.rotation += effectiveTurnRate * (delta / 16.67);
      this.lastTurnDirection = 1;
    } else {
      this.lastTurnDirection = 0;
    }
  }

  /**
   * Handle forward movement
   */
  private handleMovement(input: InputState): void {
    if (this.isJumping) return;

    const speed = this.gaitSystem.getSpeed();

    if (speed > 0) {
      // Apply velocity in the direction horse is facing
      const body = this.body as Phaser.Physics.Arcade.Body;
      this.scene.physics.velocityFromRotation(
        this.rotation,
        speed,
        body.velocity
      );
    }
  }

  /**
   * Update straightness score based on turning
   */
  private updateStraightness(delta: number): void {
    // Straightness decreases when turning
    if (this.lastTurnDirection !== 0) {
      this.straightness = Math.max(0, this.straightness - 0.01 * (delta / 16.67));
    } else {
      // Slowly recover straightness when going straight
      this.straightness = Math.min(1, this.straightness + 0.005 * (delta / 16.67));
    }
  }

  /**
   * Update balance based on movement
   */
  private updateBalance(delta: number): void {
    // Balance shifts with turning
    if (this.lastTurnDirection !== 0) {
      this.balance += this.lastTurnDirection * 0.02 * (delta / 16.67);
      this.balance = Phaser.Math.Clamp(this.balance, -1, 1);
    } else {
      // Slowly return to center
      this.balance *= 0.98;
    }
  }

  /**
   * Attempt to jump
   */
  private attemptJump(obstacles: ObstaclePlacement[]): void {
    // Find nearest obstacle in front
    const horseState = this.getState();
    const nearestObstacle = JumpEvaluator.findNearestObstacle(horseState, obstacles);

    if (!nearestObstacle) {
      // No obstacle to jump - could emit a "no target" event
      return;
    }

    // Check if already jumped this obstacle
    if (this.obstaclesJumped.has(nearestObstacle.id)) {
      return;
    }

    // Check if in jump range
    if (!JumpEvaluator.isInJumpRange(horseState.position, nearestObstacle)) {
      return;
    }

    // Evaluate the jump
    const result = JumpEvaluator.evaluate(
      horseState,
      nearestObstacle,
      this.gaitSystem.getSpeed()
    );

    // Mark obstacle as jumped
    this.obstaclesJumped.add(nearestObstacle.id);

    // Start jump animation
    this.startJump(result);

    // Emit jump event
    this.onJump.emit('jump', result, nearestObstacle);
  }

  /**
   * Start jump animation
   */
  private startJump(result: JumpResult): void {
    this.isJumping = true;
    this.jumpPhase = 'takeoff';
    this.jumpTimer = 0;

    // Change to jumping sprite
    this.setTexture('horse_jump');

    // Boost forward during jump
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.scene.physics.velocityFromRotation(
      this.rotation,
      this.gaitSystem.getSpeed() * 1.5,
      body.velocity
    );
  }

  /**
   * Update jump animation
   */
  private updateJump(delta: number): void {
    this.jumpTimer += delta;

    const jumpDuration = 600; // ms total jump time
    const takeoffDuration = 150;
    const airborneDuration = 300;

    if (this.jumpTimer < takeoffDuration) {
      this.jumpPhase = 'takeoff';
      // Scale up slightly during takeoff
      const progress = this.jumpTimer / takeoffDuration;
      this.setScale(1 + progress * 0.2);
    } else if (this.jumpTimer < takeoffDuration + airborneDuration) {
      this.jumpPhase = 'airborne';
      this.setScale(1.2);
    } else if (this.jumpTimer < jumpDuration) {
      this.jumpPhase = 'landing';
      // Scale back down during landing
      const progress = (this.jumpTimer - takeoffDuration - airborneDuration) / (jumpDuration - takeoffDuration - airborneDuration);
      this.setScale(1.2 - progress * 0.2);
    } else {
      // Jump complete
      this.isJumping = false;
      this.jumpPhase = null;
      this.setScale(1);
      this.setTexture('horse');
    }
  }

  /**
   * Update sprite based on current state
   */
  private updateSprite(): void {
    // Could add animation frames based on gait here
    // For now, just ensure correct texture
    if (!this.isJumping) {
      this.setTexture('horse');
    }
  }

  /**
   * Get current state for external systems
   */
  getState(): HorseState {
    const body = this.body as Phaser.Physics.Arcade.Body;

    return {
      position: { x: this.x, y: this.y },
      rotation: this.rotation,
      velocity: { x: body.velocity.x, y: body.velocity.y },
      gait: this.gaitSystem.getCurrentGait(),
      targetGait: this.gaitSystem.getCurrentGait(),
      transitionProgress: this.gaitSystem.getTransitionProgress(),
      isJumping: this.isJumping,
      jumpPhase: this.jumpPhase,
      straightness: this.straightness,
      balance: this.balance,
    };
  }

  /**
   * Get current gait
   */
  getGait(): Gait {
    return this.gaitSystem.getCurrentGait();
  }

  /**
   * Get current speed
   */
  getSpeed(): number {
    return this.gaitSystem.getSpeed();
  }

  /**
   * Check if horse is jumping
   */
  getIsJumping(): boolean {
    return this.isJumping;
  }

  /**
   * Reset horse state
   */
  reset(x: number, y: number, rotation: number): void {
    this.setPosition(x, y);
    this.setRotation(rotation);
    this.gaitSystem = new GaitSystem('halt');
    this.isJumping = false;
    this.jumpPhase = null;
    this.straightness = 1;
    this.balance = 0;
    this.obstaclesJumped.clear();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  /**
   * Force stop (for collisions, refusals)
   */
  forceStop(): void {
    this.gaitSystem.forceHalt();
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }
}
