'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Phaser
const GameContainer = dynamic(
  () => import('@/components/game/GameContainer').then((mod) => mod.GameContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-arena-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading game...</p>
        </div>
      </div>
    ),
  }
);

interface PlayPageProps {
  params: Promise<{ courseId: string }>;
}

export default function PlayPage({ params }: PlayPageProps) {
  const { courseId } = use(params);

  return (
    <main className="w-full h-screen overflow-hidden game-container">
      <GameContainer courseId={courseId} />
    </main>
  );
}
