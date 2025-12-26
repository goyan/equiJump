'use client';

import { useGameTime, useGameFaults, useCurrentGait, useCurrentSpeed } from '@/stores/gameStore';
import { HelpCircle } from 'lucide-react';
import type { Gait } from '@/types/game';

interface HUDOverlayProps {
  onPause: () => void;
  onHelp: () => void;
}

const GAIT_LABELS: Record<Gait, string> = {
  halt: 'HALT',
  walk: 'WALK',
  trot: 'TROT',
  canter: 'CANTER',
  extended: 'EXTENDED',
};

const GAIT_COLORS: Record<Gait, string> = {
  halt: 'text-gray-400',
  walk: 'text-green-400',
  trot: 'text-yellow-400',
  canter: 'text-orange-400',
  extended: 'text-red-400',
};

export function HUDOverlay({ onPause, onHelp }: HUDOverlayProps) {
  const time = useGameTime();
  const faults = useGameFaults();
  const gait = useCurrentGait();
  const speed = useCurrentSpeed();

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-40">
      <div className="flex justify-between items-start p-4">
        {/* Left: Speed and Gait */}
        <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/10 pointer-events-auto">
          <div className="flex flex-col items-center min-w-[120px]">
            {/* Gait indicator */}
            <div className={`text-lg font-bold ${GAIT_COLORS[gait]}`}>
              {GAIT_LABELS[gait]}
            </div>

            {/* Speed bar */}
            <div className="w-full h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 transition-all duration-150"
                style={{ width: `${Math.min(100, (speed / 400) * 100)}%` }}
              />
            </div>

            {/* Speed value */}
            <div className="text-sm text-white/60 mt-1">
              {Math.round(speed)} px/s
            </div>
          </div>
        </div>

        {/* Center: Timer */}
        <div className="bg-black/60 backdrop-blur-md rounded-xl px-6 py-3 border border-white/10">
          <div className="text-3xl font-mono font-bold text-primary">
            {formatTime(time)}
          </div>
        </div>

        {/* Right: Faults and Pause */}
        <div className="flex items-center gap-3">
          {/* Faults counter */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
            <div className="text-center">
              <div className="text-xs text-white/60 uppercase tracking-wider">Faults</div>
              <div className={`text-2xl font-bold ${faults > 0 ? 'text-red-400' : 'text-white'}`}>
                {faults}
              </div>
            </div>
          </div>

          {/* Help button */}
          <button
            onClick={onHelp}
            className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 pointer-events-auto hover:bg-white/10 transition-colors"
            title="Help"
          >
            <HelpCircle className="w-6 h-6 text-white" />
          </button>

          {/* Pause button */}
          <button
            onClick={onPause}
            className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 pointer-events-auto hover:bg-white/10 transition-colors"
            title="Pause"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom: Controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:block">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-white/60">
          <span className="mr-4">↑↓ Speed</span>
          <span className="mr-4">←→ Turn</span>
          <span>SPACE Jump</span>
        </div>
      </div>
    </div>
  );
}
