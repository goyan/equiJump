import Phaser from 'phaser';
import type { Course, InputState, JumpResult, ObstaclePlacement } from '@/types/game';
import { Horse } from '../entities/Horse';
import { Obstacle } from '../entities/Obstacle';
import { ARENA, COLORS, CAMERA } from '../constants';

// Default beginner course for testing
const DEFAULT_COURSE: Course = {
  id: 'beginner-1',
  name: 'First Steps',
  description: 'A simple course to learn the basics',
  difficulty: 'beginner',
  timeLimit: 60,
  obstacles: [
    { id: 'obs-1', type: 'vertical', x: 600, y: 400, rotation: 0, height: 80 },
    { id: 'obs-2', type: 'vertical', x: 900, y: 500, rotation: 0.3, height: 90 },
    { id: 'obs-3', type: 'oxer', x: 1200, y: 400, rotation: -0.2, height: 100, width: 100 },
    { id: 'obs-4', type: 'vertical', x: 1500, y: 600, rotation: 0, height: 80 },
  ],
  startPosition: { x: 200, y: 400 },
  startRotation: 0,
  finishLine: { x1: 1800, y1: 300, x2: 1800, y2: 700 },
  arena: { width: 2000, height: 1000 },
};

export class GameScene extends Phaser.Scene {
  private horse!: Horse;
  private obstacles: Obstacle[] = [];
  private course!: Course;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  private wasdKeys!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

  // Game state
  private isPlaying: boolean = false;
  private elapsedTime: number = 0;
  private totalFaults: number = 0;
  private jumpResults: JumpResult[] = [];
  private finishLineGraphics!: Phaser.GameObjects.Graphics;
  private arenaGraphics!: Phaser.GameObjects.Graphics;
  private coursePathGraphics!: Phaser.GameObjects.Graphics;

  // UI elements
  private debugText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { courseId?: string }): void {
    // Load course data (for now use default)
    this.course = DEFAULT_COURSE;
    this.elapsedTime = 0;
    this.totalFaults = 0;
    this.jumpResults = [];
  }

  create(): void {
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.course.arena.width, this.course.arena.height);

    // Create arena background
    this.createArena();

    // Create course path (track)
    this.createCoursePath();

    // Create finish line
    this.createFinishLine();

    // Create obstacles
    this.createObstacles();

    // Create horse
    this.horse = new Horse(
      this,
      this.course.startPosition.x,
      this.course.startPosition.y
    );
    this.horse.setRotation(this.course.startRotation);

    // Setup camera
    this.cameras.main.startFollow(this.horse, true, CAMERA.followLerp, CAMERA.followLerp);
    this.cameras.main.setBounds(0, 0, this.course.arena.width, this.course.arena.height);
    this.cameras.main.setZoom(CAMERA.zoomDefault);

    // Setup input
    this.setupInput();

    // Setup event listeners
    this.setupEvents();

    // Create debug text
    if (process.env.NODE_ENV === 'development') {
      this.createDebugUI();
    }

    // Start playing
    this.isPlaying = true;

    // Emit game started event
    this.emitToStore('gameStarted', { courseId: this.course.id });
  }

  /**
   * Create arena background and borders
   */
  private createArena(): void {
    this.arenaGraphics = this.add.graphics();

    // Arena background
    this.arenaGraphics.fillStyle(COLORS.arena, 1);
    this.arenaGraphics.fillRect(0, 0, this.course.arena.width, this.course.arena.height);

    // Arena border
    this.arenaGraphics.lineStyle(ARENA.borderWidth, COLORS.white, 1);
    this.arenaGraphics.strokeRect(
      ARENA.borderWidth / 2,
      ARENA.borderWidth / 2,
      this.course.arena.width - ARENA.borderWidth,
      this.course.arena.height - ARENA.borderWidth
    );

    // Inner arena lines (like a real arena)
    this.arenaGraphics.lineStyle(2, COLORS.white, 0.3);
    // Letters around arena (A, B, C, E, H, K, M, F)
    const margin = 50;
    const positions = [
      { x: this.course.arena.width / 2, y: margin, letter: 'A' },
      { x: this.course.arena.width / 2, y: this.course.arena.height - margin, letter: 'C' },
      { x: margin, y: this.course.arena.height / 2, letter: 'E' },
      { x: this.course.arena.width - margin, y: this.course.arena.height / 2, letter: 'B' },
    ];

    for (const pos of positions) {
      this.add.text(pos.x, pos.y, pos.letter, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
      }).setOrigin(0.5, 0.5).setAlpha(0.5);
    }
  }

  /**
   * Create course path showing the track between obstacles with arrows
   */
  private createCoursePath(): void {
    this.coursePathGraphics = this.add.graphics();
    this.coursePathGraphics.setDepth(-2);

    // Build path: start -> obstacles in order -> finish
    const points: Array<{ x: number; y: number }> = [
      this.course.startPosition,
      ...this.course.obstacles.map(o => ({ x: o.x, y: o.y })),
      {
        x: this.course.finishLine.x1,
        y: (this.course.finishLine.y1 + this.course.finishLine.y2) / 2
      },
    ];

    // Draw path with arrows between each segment
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      this.drawPathWithArrows(start.x, start.y, end.x, end.y);
    }

    // Draw obstacle numbers
    this.course.obstacles.forEach((obs, index) => {
      // Number circle background
      this.coursePathGraphics.fillStyle(0x00F5FF, 0.9);
      this.coursePathGraphics.fillCircle(obs.x, obs.y - 60, 20);

      // Number text
      this.add.text(obs.x, obs.y - 60, `${index + 1}`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#000000',
      }).setOrigin(0.5, 0.5);
    });

    // Draw start marker
    this.coursePathGraphics.fillStyle(0x00FF00, 0.6);
    this.coursePathGraphics.fillCircle(this.course.startPosition.x, this.course.startPosition.y, 30);
    this.coursePathGraphics.lineStyle(3, 0x00FF00, 1);
    this.coursePathGraphics.strokeCircle(this.course.startPosition.x, this.course.startPosition.y, 30);
    this.add.text(this.course.startPosition.x, this.course.startPosition.y - 50, 'DÉPART', {
      fontFamily: 'Arial',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#00FF00',
    }).setOrigin(0.5, 0.5);

    // Draw finish marker
    this.coursePathGraphics.fillStyle(0xFF6600, 0.6);
    const finishX = this.course.finishLine.x1;
    const finishY = (this.course.finishLine.y1 + this.course.finishLine.y2) / 2;
    this.coursePathGraphics.fillCircle(finishX, finishY, 30);
    this.coursePathGraphics.lineStyle(3, 0xFF6600, 1);
    this.coursePathGraphics.strokeCircle(finishX, finishY, 30);
    this.add.text(finishX + 50, finishY, 'ARRIVÉE', {
      fontFamily: 'Arial',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#FF6600',
    }).setOrigin(0, 0.5);
  }

  /**
   * Draw path line with direction arrows
   */
  private drawPathWithArrows(x1: number, y1: number, x2: number, y2: number): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Unit vectors
    const unitX = dx / distance;
    const unitY = dy / distance;

    // Draw main path line (thick, semi-transparent)
    this.coursePathGraphics.lineStyle(12, 0x00F5FF, 0.25);
    this.coursePathGraphics.beginPath();
    this.coursePathGraphics.moveTo(x1, y1);
    this.coursePathGraphics.lineTo(x2, y2);
    this.coursePathGraphics.strokePath();

    // Draw center line
    this.coursePathGraphics.lineStyle(2, 0x00F5FF, 0.5);
    this.coursePathGraphics.beginPath();
    this.coursePathGraphics.moveTo(x1, y1);
    this.coursePathGraphics.lineTo(x2, y2);
    this.coursePathGraphics.strokePath();

    // Draw arrows along the path
    const arrowSpacing = 80;
    const arrowCount = Math.floor(distance / arrowSpacing);
    const arrowSize = 15;

    for (let i = 1; i <= arrowCount; i++) {
      const t = i / (arrowCount + 1);
      const arrowX = x1 + dx * t;
      const arrowY = y1 + dy * t;

      // Draw arrow head (chevron pointing in direction of travel)
      this.coursePathGraphics.lineStyle(3, 0x00F5FF, 0.7);
      this.coursePathGraphics.beginPath();

      // Left side of arrow
      this.coursePathGraphics.moveTo(
        arrowX - Math.cos(angle - Math.PI / 6) * arrowSize,
        arrowY - Math.sin(angle - Math.PI / 6) * arrowSize
      );
      this.coursePathGraphics.lineTo(arrowX, arrowY);

      // Right side of arrow
      this.coursePathGraphics.lineTo(
        arrowX - Math.cos(angle + Math.PI / 6) * arrowSize,
        arrowY - Math.sin(angle + Math.PI / 6) * arrowSize
      );

      this.coursePathGraphics.strokePath();
    }
  }

  /**
   * Create finish line
   */
  private createFinishLine(): void {
    this.finishLineGraphics = this.add.graphics();
    this.finishLineGraphics.lineStyle(8, COLORS.white, 1);
    this.finishLineGraphics.beginPath();
    this.finishLineGraphics.moveTo(this.course.finishLine.x1, this.course.finishLine.y1);
    this.finishLineGraphics.lineTo(this.course.finishLine.x2, this.course.finishLine.y2);
    this.finishLineGraphics.strokePath();

    // Add finish flag
    const flagY = this.course.finishLine.y1;
    this.add.sprite(this.course.finishLine.x1, flagY, 'finish_line').setOrigin(0.5, 1);
  }

  /**
   * Create obstacles from course data
   */
  private createObstacles(): void {
    for (const placement of this.course.obstacles) {
      const obstacle = new Obstacle(this, placement, process.env.NODE_ENV === 'development');
      this.obstacles.push(obstacle);
    }
  }

  /**
   * Setup keyboard input
   */
  private setupInput(): void {
    if (!this.input.keyboard) return;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.wasdKeys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  /**
   * Setup event listeners
   */
  private setupEvents(): void {
    // Listen for jump events from horse
    this.horse.onJump.on('jump', (result: JumpResult, obstacle: ObstaclePlacement) => {
      this.handleJumpResult(result, obstacle);
    });
  }

  /**
   * Handle jump result
   */
  private handleJumpResult(result: JumpResult, obstacle: ObstaclePlacement): void {
    this.jumpResults.push(result);
    this.totalFaults += result.faults;

    // Find and update obstacle
    const obs = this.obstacles.find(o => o.placement.id === obstacle.id);
    if (obs && result.outcome === 'rail') {
      obs.knock();
    }

    // Emit to store
    this.emitToStore('jumpComplete', {
      result,
      obstacleId: obstacle.id,
      totalFaults: this.totalFaults,
    });
  }

  /**
   * Create debug UI
   */
  private createDebugUI(): void {
    this.debugText = this.add.text(10, 10, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setDepth(1000);
  }

  /**
   * Get current input state
   */
  private getInputState(): InputState {
    return {
      forward: this.cursors.up.isDown || this.wasdKeys.W.isDown,
      backward: this.cursors.down.isDown || this.wasdKeys.S.isDown,
      left: this.cursors.left.isDown || this.wasdKeys.A.isDown,
      right: this.cursors.right.isDown || this.wasdKeys.D.isDown,
      jump: Phaser.Input.Keyboard.JustDown(this.jumpKey),
    };
  }

  /**
   * Check if horse crossed finish line
   */
  private checkFinishLine(): boolean {
    const { x1, y1, x2, y2 } = this.course.finishLine;
    const hx = this.horse.x;
    const hy = this.horse.y;

    // Simple line crossing check
    if (hx >= x1 - 20 && hx <= x1 + 20) {
      if (hy >= Math.min(y1, y2) && hy <= Math.max(y1, y2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handle game completion
   */
  private completeGame(): void {
    this.isPlaying = false;

    // Calculate stars
    const timeLimit = this.course.timeLimit * 1000;
    let stars: 1 | 2 | 3 = 1;

    if (this.totalFaults === 0 && this.elapsedTime <= timeLimit) {
      stars = 3;
    } else if (this.totalFaults <= 4 && this.elapsedTime <= timeLimit + 5000) {
      stars = 2;
    }

    // Emit completion event
    this.emitToStore('gameComplete', {
      courseId: this.course.id,
      time: this.elapsedTime,
      faults: this.totalFaults,
      stars,
      jumpResults: this.jumpResults,
    });
  }

  /**
   * Emit event to the Zustand store (via registry)
   */
  private emitToStore(event: string, data: any): void {
    const store = this.registry.get('store');
    if (store && typeof store.handleGameEvent === 'function') {
      store.handleGameEvent(event, data);
    }

    // Also emit as Phaser event for local listeners
    this.events.emit(event, data);
  }

  update(time: number, delta: number): void {
    if (!this.isPlaying) return;

    // Update elapsed time
    this.elapsedTime += delta;

    // Get input
    const input = this.getInputState();

    // Update horse with obstacle data for jump detection
    const obstacleData = this.obstacles.map(o => o.placement);
    this.horse.update(delta, input, obstacleData);

    // Check finish line
    if (this.checkFinishLine()) {
      this.completeGame();
      return;
    }

    // Check time limit
    if (this.elapsedTime >= this.course.timeLimit * 1000) {
      this.completeGame();
      return;
    }

    // Update debug text
    if (this.debugText) {
      const state = this.horse.getState();
      const strideInfo = this.horse.getStrideInfo();
      this.debugText.setText([
        `Gait: ${state.gait}`,
        `Speed: ${this.horse.getSpeed().toFixed(0)} px/s`,
        `Time: ${(this.elapsedTime / 1000).toFixed(1)}s`,
        `Faults: ${this.totalFaults}`,
        `Strides: ${strideInfo.stridesSinceLastObstacle} (total: ${strideInfo.totalStrides})`,
        `Stride Progress: ${(strideInfo.currentStrideProgress * 100).toFixed(0)}%`,
        `Jumping: ${state.isJumping ? state.jumpPhase : 'no'}`,
      ].join('\n'));
    }

    // Emit state update
    this.emitToStore('stateUpdate', {
      time: this.elapsedTime,
      faults: this.totalFaults,
      gait: this.horse.getGait(),
      speed: this.horse.getSpeed(),
      isJumping: this.horse.getIsJumping(),
      stridesSinceObstacle: this.horse.getStridesSinceObstacle(),
    });
  }

  /**
   * Restart the game
   */
  restart(): void {
    this.elapsedTime = 0;
    this.totalFaults = 0;
    this.jumpResults = [];

    // Reset horse
    this.horse.reset(
      this.course.startPosition.x,
      this.course.startPosition.y,
      this.course.startRotation
    );

    // Reset obstacles
    for (const obstacle of this.obstacles) {
      obstacle.reset();
    }

    this.isPlaying = true;
    this.emitToStore('gameRestarted', { courseId: this.course.id });
  }

  /**
   * Pause the game
   */
  pause(): void {
    this.isPlaying = false;
    this.emitToStore('gamePaused', {});
  }

  /**
   * Resume the game
   */
  resume(): void {
    this.isPlaying = true;
    this.emitToStore('gameResumed', {});
  }
}
