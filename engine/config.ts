import Phaser from 'phaser';
import { ARENA, COLORS } from './constants';

export const createGameConfig = (
  parent: HTMLElement,
  width: number = 1280,
  height: number = 720
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  width,
  height,
  backgroundColor: COLORS.arenaDark,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: process.env.NODE_ENV === 'development',
    },
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
  audio: {
    disableWebAudio: false,
  },
});

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
