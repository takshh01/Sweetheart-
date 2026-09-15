import { motion } from 'motion/react';
import { GiftCard } from './GiftCard';
import { MoreVertical } from 'lucide-react';

interface IntroPageProps {
  onOpenGift: () => void;
  onOpenOwnerPanel: () => void;
}

export function IntroPage({ onOpenGift, onOpenOwnerPanel }: IntroPageProps) {
  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between items-center px-4 py-8 max-w-lg mx-auto select-none">
      {/* Three-dot Owner Menu in top-right */}
      <header className="w-full flex justify-end items-center mb-6">
        <button
          id="owner-menu-button"
          onClick={onOpenOwnerPanel}
          className="p-2.5 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-black/5 active:scale-95 transition-all duration-200 cursor-pointer"
          title="Owner Dashboard"
          aria-label="Owner Settings & Dashboard"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Main Centered Intro */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col items-center justify-center text-center space-y-7 my-auto w-full"
      >
        {/* Heart Icon at top */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-5xl filter drop-shadow-sm select-none"
        >
          ❤️
        </motion.div>

        {/* Personalized Message */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[#1C1917]"
          >
            Hey Kimmi
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.45 }}
            className="space-y-1.5 text-base sm:text-lg text-[#57534E] font-light leading-relaxed max-w-sm mx-auto"
          >
            <p>I made something special just for you.</p>
            <p className="text-[#8C1D30] font-normal">
              Because you mean the world to me.
            </p>
          </motion.div>
        </div>

        {/* Interactive Gift Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="pt-4 w-full flex justify-center"
        >
          <GiftCard onOpen={onOpenGift} />
        </motion.div>
      </motion.main>

      {/* Subtle footer credit / touch indicator */}
      <footer className="pt-8 text-center text-xs text-[#A8A29E] tracking-widest uppercase font-light">
        A private experience for you
      </footer>
    </div>
  );
}
