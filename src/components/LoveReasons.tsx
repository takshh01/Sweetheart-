import { motion } from 'motion/react';
import { ArrowLeft, Heart } from 'lucide-react';

interface LoveReasonsProps {
  onBack: () => void;
}

const reasons = [
  {
    text: 'You make my bad days softer and my good days brighter.',
    highlight: 'softer and brighter',
  },
  {
    text: 'You listen — really listen — and that means everything.',
    highlight: 'really listen',
  },
  {
    text: "You're my calm and my chaos at the same time.",
    highlight: 'calm and chaos',
  },
  {
    text: "You support my dreams like they're your own.",
    highlight: 'support my dreams',
  },
  {
    text: 'Being with you feels like home.',
    highlight: 'feels like home',
  },
];

export function LoveReasons({ onBack }: LoveReasonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg mx-auto flex flex-col items-center px-4 py-6"
    >
      {/* Editorial Card */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#F3D8DC] shadow-[0_16px_45px_rgba(107,29,47,0.08)]">
        {/* Heading */}
        <div className="text-center pb-6 border-b border-[#F5E6E8]">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FCE7EB] text-[#8C1D30] mb-3">
            <Heart className="w-5 h-5 fill-[#8C1D30]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
            Why I love you ❤️
          </h2>
        </div>

        {/* Sequential Lines */}
        <div className="py-6 space-y-5">
          {reasons.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.2 + index * 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-[#FAF6F0]/60 transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5E6E8] text-[#8C1D30] text-xs font-serif flex items-center justify-center mt-0.5">
                {index + 1}
              </span>
              <p className="font-serif text-lg sm:text-xl text-[#292524] leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <button
          id="why-love-back-button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-[#44403C] hover:text-[#1C1917] bg-white/80 hover:bg-white border border-[#E7CCD0] shadow-sm hover:shadow transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back</span>
        </button>
      </div>
    </motion.div>
  );
}
