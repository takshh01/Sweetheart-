import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';

interface GiftCardProps {
  onOpen: () => void;
}

export function GiftCard({ onOpen }: GiftCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (isOpen) return;
    setIsOpen(true);
    setTimeout(() => {
      onOpen();
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <motion.button
        id="interactive-gift-card"
        onClick={handleClick}
        disabled={isOpen}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={
          isOpen
            ? { scale: [1, 1.06, 0.96], y: [0, -8, 4] }
            : { y: [0, -6, 0] }
        }
        transition={
          isOpen
            ? { duration: 1.1, ease: 'easeInOut' }
            : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }
        className="relative group cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C1D30]/40 rounded-3xl"
        aria-label="Open your romantic gift"
      >
        {/* Ambient Glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#F5E6E8] via-[#F3D8DC] to-[#F5E6E8] opacity-60 blur-xl group-hover:opacity-90 transition duration-1000 group-hover:duration-200 animate-pulse" />

        {/* Gift Box Card */}
        <div className="relative w-72 sm:w-80 p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-[#F3D8DC] shadow-[0_12px_40px_rgba(107,29,47,0.08)] flex flex-col items-center text-center overflow-hidden transition-all duration-500">
          {/* Subtle Silk Ribbon Decoration */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-b from-[#8C1D30]/15 via-[#8C1D30]/10 to-[#8C1D30]/15 pointer-events-none" />
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 bg-gradient-to-r from-[#8C1D30]/15 via-[#8C1D30]/10 to-[#8C1D30]/15 pointer-events-none" />

          {/* Interactive Gift Icon & Lid */}
          <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
            {/* Ribbon Bow */}
            <motion.div
              animate={
                isOpen
                  ? { y: -45, opacity: 0, rotate: -15, scale: 1.2 }
                  : { y: 0, opacity: 1, rotate: 0 }
              }
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -top-3 z-20 flex items-center justify-center text-[#8C1D30]"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-6 h-5 rounded-full border-2 border-[#8C1D30] bg-[#FDFBF7] shadow-sm transform -rotate-12 -mr-1" />
                <div className="w-6 h-5 rounded-full border-2 border-[#8C1D30] bg-[#FDFBF7] shadow-sm transform rotate-12 -ml-1" />
                <div className="absolute w-3.5 h-3.5 rounded-full bg-[#8C1D30] shadow-sm" />
              </div>
            </motion.div>

            {/* Box Body */}
            <motion.div
              animate={isOpen ? { scale: [1, 1.05, 1.02] } : {}}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFF5F6] to-[#FCE7EB] border border-[#F3D8DC] shadow-inner flex items-center justify-center relative overflow-hidden"
            >
              {/* Internal Velvet Texture & Floating Hearts when opened */}
              {isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, y: 15 }}
                  animate={{ opacity: 1, scale: 1.2, y: -8 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="flex items-center justify-center text-[#8C1D30]"
                >
                  <Heart className="w-10 h-10 fill-[#8C1D30] drop-shadow-md animate-pulse" />
                </motion.div>
              ) : (
                <div className="text-[#8C1D30]/70 flex flex-col items-center">
                  <Sparkles className="w-7 h-7 stroke-[1.5] text-[#8C1D30] group-hover:rotate-12 transition-transform duration-300" />
                </div>
              )}
            </motion.div>

            {/* Sparkle hearts erupting on open */}
            {isOpen && (
              <>
                <motion.span
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], x: -36, y: -45, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="absolute text-lg text-[#8C1D30]"
                >
                  ❤️
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], x: 38, y: -40, scale: 1.1 }}
                  transition={{ duration: 1, delay: 0.1 }}
                  className="absolute text-base text-[#8C1D30]"
                >
                  ✨
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], x: 0, y: -58, scale: 1.3 }}
                  transition={{ duration: 1.1, delay: 0.15 }}
                  className="absolute text-xl text-[#8C1D30]"
                >
                  💖
                </motion.span>
              </>
            )}
          </div>

          <div className="relative z-10">
            <p className="text-xs uppercase tracking-widest text-[#8C1D30]/80 font-medium mb-1.5">
              {isOpen ? 'Unwrapping...' : 'Tap to Open'}
            </p>
            <h3 className="font-serif text-2xl text-[#1C1917] font-normal tracking-wide">
              A little gift for you
            </h3>
          </div>
        </div>
      </motion.button>
    </div>
  );
}
