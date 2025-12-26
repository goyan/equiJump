'use client';

import { motion } from 'framer-motion';
import { useFinalScore } from '@/stores/gameStore';
import Link from 'next/link';

interface ResultsModalProps {
  onRestart: () => void;
}

export function ResultsModal({ onRestart }: ResultsModalProps) {
  const score = useFinalScore();

  if (!score) return null;

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const getStarDisplay = (stars: number) => {
    return Array(3)
      .fill(0)
      .map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + i * 0.15, type: 'spring', damping: 10 }}
          className={`text-4xl ${i < stars ? 'text-yellow-400' : 'text-gray-600'}`}
        >
          ★
        </motion.span>
      ));
  };

  const cleanJumps = score.jumpResults.filter((r) => r.outcome === 'clean').length;
  const totalJumps = score.jumpResults.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-gradient-to-br from-arena-dark to-arena border border-white/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-center text-white mb-6"
        >
          Course Complete!
        </motion.h2>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {getStarDisplay(score.stars)}
        </div>

        {/* Stats */}
        <div className="space-y-4 mb-8">
          {/* Time */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3"
          >
            <span className="text-white/70">Time</span>
            <span className="text-2xl font-mono font-bold text-primary">
              {formatTime(score.time)}
            </span>
          </motion.div>

          {/* Faults */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3"
          >
            <span className="text-white/70">Faults</span>
            <span className={`text-2xl font-bold ${score.faults > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {score.faults}
            </span>
          </motion.div>

          {/* Clean Jumps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3"
          >
            <span className="text-white/70">Clean Jumps</span>
            <span className="text-2xl font-bold text-white">
              {cleanJumps}/{totalJumps}
            </span>
          </motion.div>
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <button
            onClick={onRestart}
            className="flex-1 py-3 bg-primary text-black font-semibold rounded-xl hover:bg-primary/80 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/courses"
            className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-center"
          >
            Courses
          </Link>
        </motion.div>

        {/* Save score hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/50 text-sm mt-4"
        >
          Sign in to save your score
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
