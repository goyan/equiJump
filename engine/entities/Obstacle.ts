import Phaser from 'phaser';
import type { ObstaclePlacement, ObstacleType } from '@/types/game';
import { OBSTACLE, TAKEOFF_ZONES, COLORS } from '../constants';

export class Obstacle extends Phaser.GameObjects.Container {
  public readonly data: ObstaclePlacement;
  private sprite: Phaser.GameObjects.Sprite;
  private knockedPoles: Phaser.GameObjects.Sprite[] = [];
  private isKnocked: boolean = false;
  private zoneIndicator?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, placement: ObstaclePlacement, showZones: boolean = false) {
    super(scene, placement.x, placement.y);

    this.data = placement;

    // Create main sprite
    const textureKey = this.getTextureKey(placement.type);
    this.sprite = scene.add.sprite(0, 0, textureKey);
    this.add(this.sprite);

    // Set rotation
    this.setRotation(placement.rotation);

    // Show takeoff zones in debug mode
    if (showZones) {
      this.createZoneIndicator();
    }

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Get texture key for obstacle type
   */
  private getTextureKey(type: ObstacleType): string {
    switch (type) {
      case 'vertical':
        return 'obstacle_vertical';
      case 'oxer':
        return 'obstacle_oxer';
      case 'wall':
        return 'obstacle_wall';
      default:
        return 'obstacle_vertical';
    }
  }

  /**
   * Create zone indicator for debugging
   */
  private createZoneIndicator(): void {
    this.zoneIndicator = this.scene.add.graphics();

    // Draw zones behind the obstacle
    const zones = [
      { zone: TAKEOFF_ZONES.too_long, color: 0xff6600, alpha: 0.2 },
      { zone: TAKEOFF_ZONES.ideal, color: 0x00ff00, alpha: 0.3 },
      { zone: TAKEOFF_ZONES.too_close, color: 0xff0000, alpha: 0.2 },
    ];

    for (const { zone, color, alpha } of zones) {
      this.zoneIndicator.fillStyle(color, alpha);
      this.zoneIndicator.fillCircle(this.x, this.y, zone.max);
    }

    // Cut out the inner zones
    this.zoneIndicator.setDepth(-1);
  }

  /**
   * Knock the obstacle (rail was hit)
   */
  knock(): void {
    if (this.isKnocked) return;
    this.isKnocked = true;

    // Create falling pole animation
    const pole = this.scene.add.sprite(this.x, this.y, 'obstacle_vertical');
    pole.setRotation(this.rotation + Math.random() * 0.5 - 0.25);
    this.knockedPoles.push(pole);

    // Animate pole falling
    this.scene.tweens.add({
      targets: pole,
      y: pole.y + 30,
      rotation: pole.rotation + (Math.random() > 0.5 ? 1 : -1) * 0.3,
      alpha: 0.7,
      duration: 500,
      ease: 'Bounce.easeOut',
    });

    // Flash the obstacle
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2,
    });

    // Emit knocked event
    this.emit('knocked', this.data);
  }

  /**
   * Reset obstacle to original state
   */
  reset(): void {
    this.isKnocked = false;
    this.sprite.setAlpha(1);

    // Remove knocked poles
    for (const pole of this.knockedPoles) {
      pole.destroy();
    }
    this.knockedPoles = [];
  }

  /**
   * Get obstacle bounds for collision detection
   */
  getBounds(): Phaser.Geom.Rectangle {
    const dims = OBSTACLE[this.data.type] || OBSTACLE.vertical;
    return new Phaser.Geom.Rectangle(
      this.x - dims.width / 2,
      this.y - dims.height / 2,
      dims.width,
      dims.height
    );
  }

  /**
   * Check if a point is within jump range
   */
  isPointInJumpRange(x: number, y: number): boolean {
    const distance = Phaser.Math.Distance.Between(x, y, this.x, this.y);
    return distance <= TAKEOFF_ZONES.too_long.max;
  }

  /**
   * Get distance from point to obstacle center
   */
  getDistanceFrom(x: number, y: number): number {
    return Phaser.Math.Distance.Between(x, y, this.x, this.y);
  }

  /**
   * Check if this obstacle was knocked
   */
  getIsKnocked(): boolean {
    return this.isKnocked;
  }

  /**
   * Clean up
   */
  destroy(fromScene?: boolean): void {
    if (this.zoneIndicator) {
      this.zoneIndicator.destroy();
    }
    for (const pole of this.knockedPoles) {
      pole.destroy();
    }
    super.destroy(fromScene);
  }
}
