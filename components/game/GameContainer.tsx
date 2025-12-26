'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { HUDOverlay } from './HUDOverlay';
import { TouchControls } from './TouchControls';
import { JumpFeedback } from './JumpFeedback';
import { ResultsModal } from './ResultsModal';
import { TutorialModal } from './TutorialModal';

interface GameContainerProps {
  courseId: string;
}

const TUTORIAL_SEEN_KEY = 'equijump_tutorial_seen';

export function GameContainer({ courseId }: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { status, reset } = useGameStore();
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if first-time player
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_SEEN_KEY);
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = useCallback(() => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
  }, []);

  const handleShowHelp = useCallback(() => {
    setShowTutorial(true);
    // Pause game when showing help
    if (gameRef.current) {
      const gameScene = gameRef.current.scene.getScene('GameScene') as any;
      if (gameScene && typeof gameScene.pause === 'function') {
        gameScene.pause();
      }
    }
  }, []);

  // Initialize Phaser game
  useEffect(() => {
    if (!containerRef.current) return;

    const initGame = async () => {
      // Dynamic import to avoid SSR issues
      const Phaser = (await import('phaser')).default;
      const { createGameConfig } = await import('@/engine/config');
      const { BootScene } = await import('@/engine/scenes/BootScene');
      const { GameScene } = await import('@/engine/scenes/GameScene');

      // Create config with scenes
      const config = createGameConfig(containerRef.current!);
      config.scene = [BootScene, GameScene];

      // Create game instance
      gameRef.current = new Phaser.Game(config);

      // Pass data to game registry
      gameRef.current.registry.set('courseId', courseId);
      // Pass the store with its methods (not just the state)
      gameRef.current.registry.set('store', {
        handleGameEvent: useGameStore.getState().handleGameEvent,
        getState: useGameStore.getState,
      });
    };

    initGame();

    // Cleanup
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      reset();
    };
  }, [courseId, reset]);

  // Handle pause/resume
  const handlePause = useCallback(() => {
    if (gameRef.current) {
      const gameScene = gameRef.current.scene.getScene('GameScene') as any;
      if (gameScene && typeof gameScene.pause === 'function') {
        gameScene.pause();
      }
    }
  }, []);

  const handleResume = useCallback(() => {
    if (gameRef.current) {
      const gameScene = gameRef.current.scene.getScene('GameScene') as any;
      if (gameScene && typeof gameScene.resume === 'function') {
        gameScene.resume();
      }
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (gameRef.current) {
      const gameScene = gameRef.current.scene.getScene('GameScene') as any;
      if (gameScene && typeof gameScene.restart === 'function') {
        gameScene.restart();
      }
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-arena-dark overflow-hidden">
      {/* Phaser canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* React overlays */}
      <HUDOverlay onPause={handlePause} onHelp={handleShowHelp} />
      <TouchControls gameRef={gameRef} />
      <JumpFeedback />

      {/* Results modal */}
      {status === 'finished' && (
        <ResultsModal onRestart={handleRestart} />
      )}

      {/* Pause overlay */}
      {status === 'paused' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-glass border border-white/10 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Paused</h2>
            <div className="flex gap-4">
              <button
                onClick={handleResume}
                className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/80 transition-colors"
              >
                Resume
              </button>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial modal */}
      <TutorialModal isOpen={showTutorial} onClose={handleCloseTutorial} />
    </div>
  );
}
