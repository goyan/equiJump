'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLastJumpResult } from '@/stores/gameStore';
import type { JumpResult } from '@/types/game';

const ZONE_MESSAGES = {
  too_close: 'Too Close!',
  ideal: 'Perfect!',
  too_long: 'Too Long!',
  miss: 'Missed!',
};

const OUTCOME_STYLES = {
  clean: {
    bg: 'from-green-500/90 to-emerald-600/90',
    text: 'Clean Jump!',
    icon: '✓',
    iconColor: 'text-green-300',
  },
  rail: {
    bg: 'from-red-500/90 to-rose-600/90',
    text: 'Rail Down!',
    icon: '✗',
    iconColor: 'text-red-300',
  },
  refusal: {
    bg: 'from-orange-500/90 to-amber-600/90',
    text: 'Refusal!',
    icon: '⚠',
    iconColor: 'text-orange-300',
  },
};

export function JumpFeedback() {
  const lastJumpResult = useLastJumpResult();
  const [visible, setVisible] = useState(false);
  const [currentResult, setCurrentResult] = useState<JumpResult | null>(null);

  useEffect(() => {
    if (lastJumpResult) {
      setCurrentResult(lastJumpResult);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [lastJumpResult]);

  if (!currentResult) return null;

  const style = OUTCOME_STYLES[currentResult.outcome];
  const zoneMessage = ZONE_MESSAGES[currentResult.zone];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -10 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div
            className={`bg-gradient-to-br ${style.bg} backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border border-white/20`}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 10 }}
              className={`text-5xl text-center mb-2 ${style.iconColor}`}
            >
              {style.icon}
            </motion.div>

            {/* Main text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold text-white text-center"
            >
              {style.text}
            </motion.div>

            {/* Zone message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-sm text-white/80 text-center mt-1"
            >
              {zoneMessage}
            </motion.div>

            {/* Faults */}
            {currentResult.faults > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-semibold text-white/90 text-center mt-2"
              >
                +{currentResult.faults} faults
              </motion.div>
            )}

            {/* Stats for clean jumps */}
            {currentResult.outcome === 'clean' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex justify-center gap-4 mt-3 text-xs text-white/70"
              >
                <span>Straight: {Math.round(currentResult.straightness * 100)}%</span>
                <span>Rhythm: {Math.round(currentResult.rhythm * 100)}%</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
