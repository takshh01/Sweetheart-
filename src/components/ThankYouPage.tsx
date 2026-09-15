import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { HeartCelebration } from './HeartCelebration';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';

interface ThankYouPageProps {
  noAttempts: number;
  onNoAttempt: () => void;
  onYes: () => void;
}

export function ThankYouPage({
  noAttempts,
  onNoAttempt,
  onYes,
}: ThankYouPageProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [noPositionIndex, setNoPositionIndex] = useState(0);

  // Safe preset dodge coordinates relative to its starting position
  // These guaranteed positions stay in safe bounds and NEVER overlap or cover the YES button
  const safeDodgeOffsets = [
    { x: 0, y: 0 },
    { x: 45, y: 40 },
    { x: 70, y: -45 },
    { x: -30, y: 55 },
    { x: 60, y: 25 },
    { x: -40, y: -40 },
    { x: 50, y: -60 },
  ];

  // Scaled YES button: base scale 1.0, gently expands with attempts, capped at 1.35 so it never distorts layout
  const yesScale = Math.min(1.35, 1 + noAttempts * 0.06);

  // Playful safe dodge handler (clean, non-blocking)
  const handleDodge = () => {
    if (isAccepted) return;
    onNoAttempt();
    setNoPositionIndex(prev => (prev + 1) % safeDodgeOffsets.length);
  };

  const handleYesClick = () => {
    if (isAccepted) return;
    setIsAccepted(true);
    setShowCelebration(true);

    // Smooth transition to date picker
    setTimeout(() => {
      onYes();
    }, 1000);
  };

  // Fun playful labels for NO button
  const getNoButtonLabel = () => {
    if (noAttempts === 0) return 'NO';
    if (noAttempts === 1) return 'Wait, what? 🥺';
    if (noAttempts === 2) return 'Are you sure? 🙈';
    if (noAttempts === 3) return 'Only YES! 💖';
    return 'Destiny says YES! 🥰';
  };

  const currentOffset = safeDodgeOffsets[noPositionIndex] || { x: 0, y: 0 };

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center px-4 py-8 select-none">
      {showCelebration && <HeartCelebration />}

      {/* Heartfelt Apology & Gratitude Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#F3D8DC] shadow-[0_16px_45px_rgba(107,29,47,0.08)] space-y-6"
      >
        {/* Heading */}
        <div className="text-center space-y-1">
          <div className="text-3xl mb-1 animate-bounce">❤️</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
            Thank You ❤️
          </h1>
        </div>

        {/* Apology & Appreciation Body */}
        <div className="space-y-4 text-[#292524] text-base sm:text-lg leading-relaxed font-serif">
          <p>
            Thank you for solving everything.
          </p>

          <p>
            Thank you for trying to understand me, for being patient with me, and for solving all
            these little things along the way.
          </p>

          <p>
            And I'm sorry too.
          </p>

          <p>
            I know I've made mistakes. There were moments when I created distance between us, and
            I'm genuinely sorry for that.
          </p>

          <p>
            I never wanted that distance to become bigger than what we have.
          </p>

          <p className="font-medium text-[#8C1D30]">
            I'm really sorry. ❤️
          </p>

          {/* Emotional transition question */}
          <div className="pt-3 pb-1 border-y border-[#F5E6E8] text-center space-y-1.5">
            <p className="text-sm font-sans tracking-widest text-[#78716C] uppercase">
              So...
            </p>
            <p className="text-2xl sm:text-3xl text-[#1C1917] font-serif italic">
              Maaf kar diya? 🫠
            </p>
          </div>

          <p className="text-center text-sm text-[#78716C] font-sans">
            Because now I have one more question for you...
          </p>
        </div>
      </motion.div>

      {/* THE BIG QUESTION SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#FFF5F6] to-[#FAF7F2] border-2 border-[#F3D8DC] shadow-[0_20px_50px_rgba(140,29,48,0.12)] text-center flex flex-col items-center overflow-hidden"
      >
        <div className="space-y-2 mb-6">
          <span className="text-xs uppercase tracking-widest text-[#8C1D30] font-semibold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Moment</span>
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1C1917] font-medium tracking-tight">
            Will you be my forever partner? ❤️
          </h2>
        </div>

        {/* Dedicated Interactive Button Stage */}
        <div className="w-full min-h-[170px] flex flex-col sm:flex-row items-center justify-center gap-6 relative py-4">
          {/* YES Button - Unobstructed & Primary */}
          <motion.button
            id="proposal-yes-button"
            onClick={handleYesClick}
            disabled={isAccepted}
            animate={{ scale: isAccepted ? 1.08 : yesScale }}
            whileHover={{ scale: isAccepted ? 1.08 : yesScale * 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className={`z-20 inline-flex items-center justify-center gap-2.5 py-4 px-10 rounded-full font-serif text-lg sm:text-xl font-medium shadow-[0_12px_32px_rgba(140,29,48,0.32)] cursor-pointer select-none transition-all ${
              isAccepted
                ? 'bg-emerald-700 text-white ring-4 ring-emerald-200'
                : 'bg-[#8C1D30] hover:bg-[#6B1D2F] text-white'
            }`}
          >
            {isAccepted ? (
              <>
                <span>Forever &amp; Always!</span>
                <Heart className="w-5 h-5 fill-white" />
              </>
            ) : (
              <>
                <span>YES</span>
                <Heart className="w-5 h-5 fill-white animate-pulse" />
              </>
            )}
          </motion.button>

          {/* NO Button Container with Constrained Playful Dodge */}
          <div className="relative min-w-[120px] min-h-[60px] flex items-center justify-center">
            <motion.button
              id="proposal-no-button"
              onClick={handleDodge}
              onMouseEnter={handleDodge}
              disabled={isAccepted}
              animate={{
                x: currentOffset.x,
                y: currentOffset.y,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full font-serif text-sm font-normal text-[#78716C] hover:text-[#8C1D30] bg-white/95 hover:bg-white border border-[#E7CCD0] shadow-sm cursor-pointer select-none active:scale-95 transition-colors whitespace-nowrap"
              aria-label="Playful No option"
            >
              <span>{getNoButtonLabel()}</span>
            </motion.button>
          </div>
        </div>

        {/* Playful hint text if NO was tried */}
        {noAttempts > 0 && !isAccepted && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-[#8C1D30] mt-3 italic font-serif"
          >
            {noAttempts === 1
              ? "Nice try, but love won't let you click that! 🫠"
              : noAttempts < 4
              ? 'The YES button is calling your heart! ❤️'
              : 'Destiny has already chosen YES for us! 🥰'}
          </motion.p>
        )}

        {isAccepted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-emerald-700 font-medium mt-3 flex items-center gap-1.5"
          >
            <span>Locking in our forever promise... Taking you to our special date!</span>
            <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
