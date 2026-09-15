import { motion } from 'motion/react';
import { CalendarCheck, Heart, ArrowRight } from 'lucide-react';
import { HeartCelebration } from './HeartCelebration';

interface DateConfirmationProps {
  selectedDate: string;
  onNextToVideo?: () => void;
}

export function DateConfirmation({ selectedDate, onNextToVideo }: DateConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-md mx-auto flex flex-col items-center px-4 py-8 text-center select-none"
    >
      <HeartCelebration />

      <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-9 border border-[#F3D8DC] shadow-[0_20px_60px_rgba(107,29,47,0.12)] flex flex-col items-center space-y-6">
        {/* Visual Badge */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#FFF5F6] border border-[#F3D8DC] flex items-center justify-center text-[#8C1D30] shadow-inner">
            <CalendarCheck className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#8C1D30] text-white flex items-center justify-center text-xs shadow-md">
            ❤️
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
            It's a date ❤️
          </h1>
          <p className="text-sm text-[#78716C] uppercase tracking-widest font-medium">
            Our date is officially set for:
          </p>
        </div>

        {/* Highlighted Date Plate */}
        <div className="w-full py-5 px-6 rounded-2xl bg-gradient-to-br from-[#FFF5F6] to-[#FAF7F2] border-2 border-[#F3D8DC] shadow-sm">
          <p className="font-serif text-2xl sm:text-3xl text-[#8C1D30] font-medium tracking-wide">
            {selectedDate}
          </p>
        </div>

        {/* Warm Closing Note */}
        <div className="pt-1 text-center space-y-1.5">
          <p className="font-serif text-2xl sm:text-3xl text-[#1C1917] italic">
            I can't wait. 🫠❤️
          </p>
          <p className="text-xs text-[#A8A29E] tracking-wider uppercase font-light">
            Forever & Always
          </p>
        </div>

        {/* Next Click to Video Reveal */}
        {onNextToVideo && (
          <div className="w-full pt-3 border-t border-[#F3D8DC]/70">
            <button
              id="date-confirmation-next-button"
              onClick={onNextToVideo}
              className="group w-full py-3.5 px-6 rounded-full font-serif text-base font-medium text-white bg-[#8C1D30] hover:bg-[#6B1D2F] shadow-[0_10px_30px_rgba(140,29,48,0.3)] hover:shadow-[0_14px_35px_rgba(140,29,48,0.4)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Next: A Video Surprise for You</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-[#A8A29E] mt-2 font-light">
              One final memory is waiting for you... ✨
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
