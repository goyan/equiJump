import Phaser from 'phaser';
import { COLORS } from '../constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#00f5ff',
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    });
    percentText.setOrigin(0.5, 0.5);

    // Update loading bar
    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.round(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(COLORS.primary, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Generate placeholder graphics (will be replaced with actual sprites later)
    this.createPlaceholderGraphics();
  }

  private createPlaceholderGraphics(): void {
    // Horse placeholder (simple rectangle with direction indicator)
    const horseGraphics = this.make.graphics({ x: 0, y: 0 });
    horseGraphics.fillStyle(0x8B4513, 1); // Brown
    horseGraphics.fillRect(0, 0, 48, 32);
    horseGraphics.fillStyle(0x000000, 1);
    horseGraphics.fillTriangle(48, 16, 40, 8, 40, 24); // Direction arrow
    horseGraphics.generateTexture('horse', 48, 32);
    horseGraphics.destroy();

    // Horse jumping placeholder
    const horseJumpGraphics = this.make.graphics({ x: 0, y: 0 });
    horseJumpGraphics.fillStyle(0x8B4513, 1);
    horseJumpGraphics.fillRect(0, 0, 48, 28); // Slightly smaller when jumping
    horseJumpGraphics.fillStyle(0xFFD700, 1);
    horseJumpGraphics.fillTriangle(48, 14, 40, 6, 40, 22);
    horseJumpGraphics.generateTexture('horse_jump', 48, 28);
    horseJumpGraphics.destroy();

    // Vertical obstacle placeholder
    const verticalGraphics = this.make.graphics({ x: 0, y: 0 });
    verticalGraphics.fillStyle(0xFF0000, 1);
    verticalGraphics.fillRect(0, 0, 80, 8);
    verticalGraphics.fillStyle(0xFFFFFF, 1);
    verticalGraphics.fillRect(0, 8, 80, 8);
    verticalGraphics.generateTexture('obstacle_vertical', 80, 16);
    verticalGraphics.destroy();

    // Oxer obstacle placeholder
    const oxerGraphics = this.make.graphics({ x: 0, y: 0 });
    oxerGraphics.fillStyle(0xFF0000, 1);
    oxerGraphics.fillRect(0, 0, 80, 8);
    oxerGraphics.fillStyle(0xFFFFFF, 1);
    oxerGraphics.fillRect(0, 8, 80, 8);
    oxerGraphics.fillStyle(0xFF0000, 1);
    oxerGraphics.fillRect(0, 20, 80, 8);
    oxerGraphics.fillStyle(0xFFFFFF, 1);
    oxerGraphics.fillRect(0, 28, 80, 8);
    oxerGraphics.generateTexture('obstacle_oxer', 80, 36);
    oxerGraphics.destroy();

    // Wall obstacle placeholder
    const wallGraphics = this.make.graphics({ x: 0, y: 0 });
    wallGraphics.fillStyle(0x8B0000, 1);
    wallGraphics.fillRect(0, 0, 80, 24);
    wallGraphics.lineStyle(2, 0x000000);
    wallGraphics.strokeRect(0, 0, 80, 24);
    wallGraphics.generateTexture('obstacle_wall', 80, 24);
    wallGraphics.destroy();

    // Arena grass texture
    const grassGraphics = this.make.graphics({ x: 0, y: 0 });
    grassGraphics.fillStyle(0x2d5a3d, 1);
    grassGraphics.fillRect(0, 0, 64, 64);
    // Add some variation
    grassGraphics.fillStyle(0x1a472a, 0.5);
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      grassGraphics.fillCircle(x, y, 2);
    }
    grassGraphics.generateTexture('grass', 64, 64);
    grassGraphics.destroy();

    // Finish line
    const finishGraphics = this.make.graphics({ x: 0, y: 0 });
    for (let i = 0; i < 8; i++) {
      finishGraphics.fillStyle(i % 2 === 0 ? 0xffffff : 0x000000, 1);
      finishGraphics.fillRect(i * 10, 0, 10, 20);
    }
    finishGraphics.generateTexture('finish_line', 80, 20);
    finishGraphics.destroy();

    // Takeoff zone indicator (debug)
    const zoneGraphics = this.make.graphics({ x: 0, y: 0 });
    zoneGraphics.fillStyle(0x00ff00, 0.3);
    zoneGraphics.fillRect(0, 0, 60, 100);
    zoneGraphics.generateTexture('zone_ideal', 60, 100);
    zoneGraphics.destroy();
  }

  create(): void {
    // Get course ID from registry
    const courseId = this.registry.get('courseId') || 'beginner-1';

    // Start the game scene
    this.scene.start('GameScene', { courseId });
  }
}
