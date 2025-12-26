import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Phaser for unit tests (Phaser requires browser environment)
vi.mock('phaser', () => ({
  default: {
    AUTO: 0,
    Scale: {
      FIT: 0,
      CENTER_BOTH: 0,
    },
    Game: vi.fn(),
    Scene: vi.fn(),
    Physics: {
      Arcade: {
        Sprite: vi.fn(),
        Body: vi.fn(),
      },
    },
    GameObjects: {
      Container: vi.fn(),
      Sprite: vi.fn(),
      Graphics: vi.fn(),
      Text: vi.fn(),
    },
    Math: {
      Distance: {
        Between: (x1: number, y1: number, x2: number, y2: number) =>
          Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
      },
      Clamp: (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max),
    },
    Input: {
      Keyboard: {
        KeyCodes: {
          SPACE: 32,
          W: 87,
          A: 65,
          S: 83,
          D: 68,
        },
        JustDown: vi.fn(() => false),
      },
    },
    Events: {
      EventEmitter: vi.fn(() => ({
        on: vi.fn(),
        emit: vi.fn(),
        off: vi.fn(),
      })),
    },
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
