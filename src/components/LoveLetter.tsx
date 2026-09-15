import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface LoveLetterProps {
  onBack: () => void;
}

export function LoveLetter({ onBack }: LoveLetterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg mx-auto flex flex-col items-center px-4 py-6"
    >
      {/* Parchment Styled Letter Card */}
      <div className="relative w-full bg-[#FAF7F2] rounded-3xl p-6 sm:p-10 border border-[#EBE3D5] shadow-[0_16px_50px_rgba(107,29,47,0.09)] overflow-hidden">
        {/* Subtle Paper Fiber Watermark / Texture */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#F3D8DC]/20 to-transparent pointer-events-none" />

        {/* Wax seal accent */}
        <div className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gradient-to-br from-[#8C1D30] to-[#59121F] shadow-md flex items-center justify-center text-white/90 text-xs font-serif border border-[#A51D34]/40">
          ❤️
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
            My Letter 💌
          </h2>
        </div>

        {/* Letter Body with Handwritten / Editorial warm feel */}
        <div className="space-y-6 text-[#292524] text-base sm:text-lg leading-relaxed font-serif">
          <p className="text-xl font-medium text-[#1C1917]">Kimmi,</p>

          <p>
            I don't always know how to put everything I feel into words, but I want you to know
            that having you in my life means more to me than I can explain.
          </p>

          <p>
            You have a way of making ordinary moments feel special, and somehow, even the
            smallest things about us become memories I want to keep forever.
          </p>

          <p>
            I know I'm not perfect, and I know there have been moments where I could have done
            better. But through everything, one thing has always stayed true — you matter to me,
            deeply.
          </p>

          <p className="font-medium text-[#8C1D30]">
            Thank you for being you. ❤️
          </p>

          <div className="pt-4 border-t border-[#EBE3D5]/80 flex flex-col items-start font-serif">
            <span className="text-sm tracking-widest uppercase text-[#78716C]">Yours,</span>
            <span className="text-2xl text-[#8C1D30] font-serif italic mt-1">Always.</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <button
          id="letter-back-button"
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
