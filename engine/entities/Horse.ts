import Phaser from 'phaser';
import type { Gait, HorseState, InputState, JumpResult, ObstaclePlacement } from '@/types/game';
import { GaitSystem } from '../systems/GaitSystem';
import { JumpEvaluator } from '../systems/JumpEvaluator';
import { StrideSystem } from '../systems/StrideSystem';
import { HORSE, PHYSICS } from '../constants';

export class Horse extends Phaser.Physics.Arcade.Sprite {
  private gaitSystem: GaitSystem;
  private strideSystem: StrideSystem;
  private isJumping: boolean = false;
  private jumpPhase: 'takeoff' | 'airborne' | 'landing' | null = null;
  private jumpTimer: number = 0;
  private straightness: number = 1;
  private balance: number = 0;
  private lastTurnDirection: number = 0;
  private obstaclesJumped: Set<string> = new Set();
  private hoofprints: Phaser.GameObjects.Graphics;
  private hoofprintPositions: Array<{ x: number; y: number; alpha: number; time: number }> = [];

  // Events
  public onJump: Phaser.Events.EventEmitter;
  public onGaitChange: Phaser.Events.EventEmitter;
  public onStride: Phaser.Events.EventEmitter;

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
    this.strideSystem = new StrideSystem({ x, y });

    // Create hoofprint graphics
    this.hoofprints = scene.add.graphics();
    this.hoofprints.setDepth(-1);

    // Event emitters
    this.onJump = new Phaser.Events.EventEmitter();
    this.onGaitChange = new Phaser.Events.EventEmitter();
    this.onStride = new Phaser.Events.EventEmitter();

    // Setup stride callback
    this.strideSystem.onStride = (strideNum, pos, gait) => {
      this.addHoofprint(pos, gait);
      this.onStride.emit('stride', strideNum, pos, gait);
    };
  }

  /**
   * Update horse each frame
   */
  update(delta: number, input: InputState, obstacles: ObstaclePlacement[], currentTime: number = Date.now()): void {
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

    // Update stride system (not while jumping)
    if (!this.isJumping) {
      this.strideSystem.update(
        { x: this.x, y: this.y },
        this.gaitSystem.getCurrentGait(),
        currentTime
      );
    }

    // Update hoofprint fade
    this.updateHoofprints(delta);

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

    // Reset stride counter for next obstacle
    this.strideSystem.resetStrideCount();

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
   * Add hoofprint at position
   */
  private addHoofprint(position: { x: number; y: number }, gait: Gait): void {
    // Limit number of hoofprints
    if (this.hoofprintPositions.length > 100) {
      this.hoofprintPositions.shift();
    }

    // Add slight offset based on stride (alternating left/right for each pair of hooves)
    const strideNum = this.hoofprintPositions.length;
    const perpAngle = this.rotation + Math.PI / 2;

    // Create 4 hoofprints per stride (4 hooves)
    const offsets = [
      { x: -12, y: -8 },  // Front left
      { x: 12, y: -8 },   // Front right
      { x: -10, y: 8 },   // Back left
      { x: 10, y: 8 },    // Back right
    ];

    // Select which hooves based on gait pattern
    const hoofIndex = strideNum % 4;
    const offset = offsets[hoofIndex];

    // Transform offset based on horse rotation
    const cosR = Math.cos(this.rotation);
    const sinR = Math.sin(this.rotation);
    const worldOffsetX = offset.x * cosR - offset.y * sinR;
    const worldOffsetY = offset.x * sinR + offset.y * cosR;

    this.hoofprintPositions.push({
      x: position.x + worldOffsetX,
      y: position.y + worldOffsetY,
      alpha: 1.0,
      time: Date.now(),
    });
  }

  /**
   * Update hoofprint fade animation
   */
  private updateHoofprints(delta: number): void {
    // Fade and remove old hoofprints (slower fade)
    const fadeRate = 0.0005 * delta;
    this.hoofprintPositions = this.hoofprintPositions.filter(hp => {
      hp.alpha -= fadeRate;
      return hp.alpha > 0;
    });

    // Redraw hoofprints
    this.hoofprints.clear();
    for (const hp of this.hoofprintPositions) {
      // Draw hoofprint shape (U-shaped like real horse hoofprint)
      this.hoofprints.lineStyle(2, 0xFFD700, hp.alpha); // Gold/yellow color
      this.hoofprints.strokeCircle(hp.x, hp.y, 6);

      // Add inner dot
      this.hoofprints.fillStyle(0xFFD700, hp.alpha * 0.5);
      this.hoofprints.fillCircle(hp.x, hp.y, 3);
    }
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
   * Get strides since last obstacle
   */
  getStridesSinceObstacle(): number {
    return this.strideSystem.getStridesSinceLastObstacle();
  }

  /**
   * Get stride progress (0-1) for animation
   */
  getStrideProgress(): number {
    return this.strideSystem.getStrideProgress();
  }

  /**
   * Get full stride info
   */
  getStrideInfo() {
    return this.strideSystem.getInfo();
  }

  /**
   * Reset horse state
   */
  reset(x: number, y: number, rotation: number): void {
    this.setPosition(x, y);
    this.setRotation(rotation);
    this.gaitSystem = new GaitSystem('halt');
    this.strideSystem.reset({ x, y });
    this.isJumping = false;
    this.jumpPhase = null;
    this.straightness = 1;
    this.balance = 0;
    this.obstaclesJumped.clear();
    this.hoofprintPositions = [];
    this.hoofprints.clear();

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
