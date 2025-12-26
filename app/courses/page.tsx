'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// Course data (will be loaded from API later)
const COURSES = [
  {
    id: 'beginner-1',
    name: 'First Steps',
    description: 'Learn the basics of approach and timing',
    difficulty: 'beginner',
    obstacles: 4,
    timeLimit: 60,
    unlocked: true,
  },
  {
    id: 'beginner-2',
    name: 'Gentle Curves',
    description: 'Practice turning and maintaining rhythm',
    difficulty: 'beginner',
    obstacles: 6,
    timeLimit: 75,
    unlocked: true,
  },
  {
    id: 'intermediate-1',
    name: 'Rising Heights',
    description: 'Higher jumps require better preparation',
    difficulty: 'intermediate',
    obstacles: 8,
    timeLimit: 90,
    unlocked: false,
  },
  {
    id: 'intermediate-2',
    name: 'Combination Challenge',
    description: 'Master double and triple combinations',
    difficulty: 'intermediate',
    obstacles: 10,
    timeLimit: 100,
    unlocked: false,
  },
  {
    id: 'advanced-1',
    name: 'Grand Prix Lite',
    description: 'A taste of professional courses',
    difficulty: 'advanced',
    obstacles: 12,
    timeLimit: 120,
    unlocked: false,
  },
  {
    id: 'expert-1',
    name: 'Championship',
    description: 'The ultimate test of skill',
    difficulty: 'expert',
    obstacles: 15,
    timeLimit: 150,
    unlocked: false,
  },
];

const DIFFICULTY_COLORS = {
  beginner: 'from-green-500 to-emerald-600',
  intermediate: 'from-yellow-500 to-orange-500',
  advanced: 'from-orange-500 to-red-500',
  expert: 'from-red-500 to-purple-600',
};

const DIFFICULTY_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export default function CoursesPage() {
  return (
    <main className="min-h-screen py-12 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <Link
          href="/"
          className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors"
        >
          ← Back to Home
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          Choose Your Course
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-white/60 text-lg"
        >
          Progress through increasingly challenging courses to master show jumping
        </motion.p>
      </div>

      {/* Course Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CourseCard course={course} />
          </motion.div>
        ))}
      </div>
    </main>
  );
}

function CourseCard({ course }: { course: typeof COURSES[0] }) {
  const difficultyGradient = DIFFICULTY_COLORS[course.difficulty as keyof typeof DIFFICULTY_COLORS];
  const difficultyLabel = DIFFICULTY_LABELS[course.difficulty as keyof typeof DIFFICULTY_LABELS];

  return (
    <div
      className={`glass rounded-2xl overflow-hidden ${
        course.unlocked ? 'hover:scale-105 transition-transform cursor-pointer' : 'opacity-60'
      }`}
    >
      {/* Difficulty banner */}
      <div className={`bg-gradient-to-r ${difficultyGradient} px-4 py-2`}>
        <span className="text-white font-semibold text-sm">{difficultyLabel}</span>
      </div>

      <div className="p-6">
        {/* Course name */}
        <h3 className="text-xl font-bold text-white mb-2">{course.name}</h3>

        {/* Description */}
        <p className="text-white/60 text-sm mb-4">{course.description}</p>

        {/* Stats */}
        <div className="flex gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1 text-white/70">
            <span>🚧</span>
            <span>{course.obstacles} jumps</span>
          </div>
          <div className="flex items-center gap-1 text-white/70">
            <span>⏱️</span>
            <span>{course.timeLimit}s</span>
          </div>
        </div>

        {/* Action button */}
        {course.unlocked ? (
          <Link
            href={`/play/${course.id}`}
            className="block w-full py-3 bg-primary text-black font-semibold text-center rounded-xl hover:bg-primary/80 transition-colors"
          >
            Play
          </Link>
        ) : (
          <div className="flex items-center justify-center py-3 bg-white/5 text-white/40 font-semibold rounded-xl">
            <span className="mr-2">🔒</span>
            Locked
          </div>
        )}
      </div>
    </div>
  );
}
