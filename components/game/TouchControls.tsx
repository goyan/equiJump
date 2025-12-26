'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

interface TouchControlsProps {
  gameRef: React.RefObject<Phaser.Game | null>;
}

interface JoystickState {
  active: boolean;
  x: number;
  y: number;
  angle: number;
  force: number;
}

export function TouchControls({ gameRef }: TouchControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystick, setJoystick] = useState<JoystickState>({
    active: false,
    x: 0,
    y: 0,
    angle: 0,
    force: 0,
  });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768
      );
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Joystick touch handlers
  const handleJoystickStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left - centerX;
    const y = clientY - rect.top - centerY;

    updateJoystick(x, y);
  }, []);

  const handleJoystickMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!joystick.active || !joystickRef.current) return;
    e.preventDefault();

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left - centerX;
    const y = clientY - rect.top - centerY;

    updateJoystick(x, y);
  }, [joystick.active]);

  const handleJoystickEnd = useCallback(() => {
    setJoystick({
      active: false,
      x: 0,
      y: 0,
      angle: 0,
      force: 0,
    });

    // Clear virtual input
    emitInput({ forward: false, backward: false, left: false, right: false });
  }, []);

  const updateJoystick = useCallback((rawX: number, rawY: number) => {
    const maxRadius = 40;
    const distance = Math.sqrt(rawX * rawX + rawY * rawY);
    const clampedDistance = Math.min(distance, maxRadius);
    const angle = Math.atan2(rawY, rawX);

    const x = Math.cos(angle) * clampedDistance;
    const y = Math.sin(angle) * clampedDistance;
    const force = clampedDistance / maxRadius;

    setJoystick({
      active: true,
      x,
      y,
      angle,
      force,
    });

    // Emit input based on joystick position
    const deadzone = 0.2;
    if (force > deadzone) {
      const normX = x / maxRadius;
      const normY = y / maxRadius;

      emitInput({
        forward: normY < -0.3,
        backward: normY > 0.3,
        left: normX < -0.3,
        right: normX > 0.3,
      });
    }
  }, []);

  // Jump button handler
  const handleJump = useCallback(() => {
    emitInput({ jump: true });

    // Reset jump after a frame
    requestAnimationFrame(() => {
      emitInput({ jump: false });
    });
  }, []);

  // Emit input to Phaser game
  const emitInput = useCallback((input: Partial<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
  }>) => {
    if (!gameRef.current) return;

    const scene = gameRef.current.scene.getScene('GameScene');
    if (scene) {
      scene.registry.set('virtualInput', {
        ...scene.registry.get('virtualInput'),
        ...input,
      });
    }
  }, [gameRef]);

  // Don't render on desktop
  if (!isMobile) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none z-40 p-4">
      <div className="flex justify-between items-end">
        {/* Virtual Joystick */}
        <div
          ref={joystickRef}
          className="relative w-32 h-32 pointer-events-auto"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onMouseDown={handleJoystickStart}
          onMouseMove={handleJoystickMove}
          onMouseUp={handleJoystickEnd}
          onMouseLeave={handleJoystickEnd}
        >
          {/* Base */}
          <div className="absolute inset-0 rounded-full bg-white/10 border-2 border-white/20 backdrop-blur-sm" />

          {/* Direction indicators */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute top-2 text-white/30">▲</div>
            <div className="absolute bottom-2 text-white/30">▼</div>
            <div className="absolute left-2 text-white/30">◀</div>
            <div className="absolute right-2 text-white/30">▶</div>
          </div>

          {/* Stick */}
          <div
            className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 border-2 border-primary shadow-neon transition-transform duration-75"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${joystick.x}px), calc(-50% + ${joystick.y}px))`,
            }}
          />
        </div>

        {/* Jump Button */}
        <button
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 border-4 border-primary/50 shadow-neon-lg pointer-events-auto active:scale-95 transition-transform flex items-center justify-center"
          onTouchStart={(e) => {
            e.preventDefault();
            handleJump();
          }}
          onClick={handleJump}
        >
          <span className="text-black font-bold text-lg">JUMP</span>
        </button>
      </div>
    </div>
  );
}
