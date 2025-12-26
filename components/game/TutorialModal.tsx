'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Space } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="glass rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">How to Play</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white/70" />
              </button>
            </div>

            {/* Controls Section */}
            <div className="space-y-6">
              {/* Keyboard Controls */}
              <section>
                <h3 className="text-lg font-semibold text-primary mb-3">Keyboard Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ControlItem
                    keys={[<ArrowUp key="up" className="w-5 h-5" />, 'W']}
                    label="Increase Gait"
                    description="Speed up: Halt → Walk → Trot → Canter → Extended"
                  />
                  <ControlItem
                    keys={[<ArrowDown key="down" className="w-5 h-5" />, 'S']}
                    label="Decrease Gait"
                    description="Slow down through the gaits"
                  />
                  <ControlItem
                    keys={[<ArrowLeft key="left" className="w-5 h-5" />, 'A']}
                    label="Turn Left"
                    description="Steer your horse left"
                  />
                  <ControlItem
                    keys={[<ArrowRight key="right" className="w-5 h-5" />, 'D']}
                    label="Turn Right"
                    description="Steer your horse right"
                  />
                  <ControlItem
                    keys={['SPACE']}
                    label="Jump"
                    description="Jump over obstacles when in range"
                  />
                </div>
              </section>

              {/* Gaits Explanation */}
              <section>
                <h3 className="text-lg font-semibold text-primary mb-3">Understanding Gaits</h3>
                <div className="space-y-2">
                  <GaitItem name="Halt" speed="0" description="Standing still" color="text-gray-400" />
                  <GaitItem name="Walk" speed="80" description="Slow, controlled pace" color="text-green-400" />
                  <GaitItem name="Trot" speed="160" description="Medium speed, good for approach" color="text-yellow-400" />
                  <GaitItem name="Canter" speed="280" description="Fast, ideal for jumping" color="text-orange-400" />
                  <GaitItem name="Extended" speed="400" description="Maximum speed, harder to control" color="text-red-400" />
                </div>
              </section>

              {/* Jumping Tips */}
              <section>
                <h3 className="text-lg font-semibold text-primary mb-3">Jumping Tips</h3>
                <div className="glass rounded-xl p-4 space-y-3">
                  <TipItem
                    title="Takeoff Zone"
                    description="Jump when you're in the ideal zone (50-110 pixels from obstacle). Too close or too far increases fault chance."
                  />
                  <TipItem
                    title="Straightness"
                    description="Approach obstacles straight-on. Turning while jumping increases the chance of knocking rails."
                  />
                  <TipItem
                    title="Speed Matters"
                    description="Canter (280 px/s) is ideal for jumping. Too slow may cause refusals, too fast reduces control."
                  />
                  <TipItem
                    title="Rhythm"
                    description="Maintain a steady rhythm. Constant speed changes affect your horse's balance."
                  />
                </div>
              </section>

              {/* Scoring */}
              <section>
                <h3 className="text-lg font-semibold text-primary mb-3">Scoring</h3>
                <div className="glass rounded-xl p-4">
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-center gap-2">
                      <span className="text-red-400 font-bold">4 faults</span>
                      <span>— Knocked rail</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold">3 faults</span>
                      <span>— Refusal (horse stops at obstacle)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400 font-bold">0 faults</span>
                      <span>— Clean jump!</span>
                    </li>
                  </ul>
                  <p className="mt-3 text-white/60 text-sm">
                    Complete the course with 0 faults under the time limit for 3 stars!
                  </p>
                </div>
              </section>

              {/* Mobile Controls */}
              <section>
                <h3 className="text-lg font-semibold text-primary mb-3">Mobile Controls</h3>
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                      <span className="text-white/50 text-xs">Joystick</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/80">Use the virtual joystick on the left to control direction and speed.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="w-16 h-16 rounded-full bg-primary/30 border-2 border-primary/50 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">JUMP</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/80">Tap the JUMP button on the right to jump over obstacles.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-primary to-blue-500 text-black font-bold rounded-xl hover:shadow-neon transition-all"
              >
                Got it, let's play!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ControlItem({
  keys,
  label,
  description,
}: {
  keys: (string | React.ReactNode)[];
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            {i > 0 && <span className="text-white/30 mx-1">/</span>}
            <kbd className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-white/10 border border-white/20 rounded text-white text-sm font-mono">
              {key}
            </kbd>
          </span>
        ))}
      </div>
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
    </div>
  );
}

function GaitItem({
  name,
  speed,
  description,
  color,
}: {
  name: string;
  speed: string;
  description: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
      <span className={`font-bold w-20 ${color}`}>{name}</span>
      <span className="text-white/50 w-16 text-sm">{speed} px/s</span>
      <span className="text-white/70 text-sm">{description}</span>
    </div>
  );
}

function TipItem({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="text-white font-medium">{title}</p>
      <p className="text-white/60 text-sm">{description}</p>
    </div>
  );
}
