'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center z-10"
        >
          {/* Logo/Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-6xl md:text-8xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent">
              EquiJump
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-white/70 mb-8 max-w-2xl mx-auto"
          >
            Master the art of show jumping through realistic simulation
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/play/beginner-1"
              className="px-8 py-4 bg-gradient-to-r from-primary to-blue-500 text-black font-bold text-lg rounded-xl hover:shadow-neon-lg transition-all duration-300 hover:scale-105"
            >
              Play Now
            </Link>
            <Link
              href="/courses"
              className="px-8 py-4 glass text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Browse Courses
            </Link>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto z-10"
        >
          <FeatureCard
            icon="🏇"
            title="Realistic Controls"
            description="Master gaits, timing, and approach angles like a real rider"
          />
          <FeatureCard
            icon="🎯"
            title="Educational"
            description="Learn proper jumping technique through gameplay feedback"
          />
          <FeatureCard
            icon="🏆"
            title="Compete"
            description="Track your times and compete on global leaderboards"
          />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-white/40 text-sm">
        <p>© 2025 goyan. Built with passion for equestrian sports.</p>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="glass rounded-2xl p-6 text-center"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/60">{description}</p>
    </motion.div>
  );
}
