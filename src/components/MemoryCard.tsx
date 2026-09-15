import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles } from 'lucide-react';

interface MemoryCardProps {
  photos?: (string | null)[];
  photoUrl?: string | null; // For backwards compatibility
  onBack: () => void;
}

const MEMORY_DESCRIPTIONS = [
  'A quiet moment where the whole world faded away, and it was just us.',
  'Your radiant smile that turned an ordinary day into a lifelong memory.',
  'That spontaneous laugh we shared until our cheeks hurt.',
  'Walking beside you, feeling completely at peace with everything.',
  'A tender look that reminded me how lucky I truly am to love you.',
  'The warmth of your hand in mine — my absolute favorite place to be.',
];

export function MemoryCard({ photos: propPhotos, photoUrl, onBack }: MemoryCardProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Normalize to 6 photos
  const photos: (string | null)[] = [
    propPhotos?.[0] || photoUrl || null,
    propPhotos?.[1] || null,
    propPhotos?.[2] || null,
    propPhotos?.[3] || null,
    propPhotos?.[4] || null,
    propPhotos?.[5] || null,
  ];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const currentPhoto = photos[currentIndex];
  const currentDesc = MEMORY_DESCRIPTIONS[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto flex flex-col items-center px-4 py-6 select-none"
    >
      {/* Top Memory Counter Badge */}
      <div className="flex items-center justify-between w-full px-2 mb-3">
        <span className="text-xs uppercase tracking-widest text-[#8C1D30] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Memories • {currentIndex + 1} of 6</span>
        </span>

        {/* Mini dot indicators */}
        <div className="flex items-center gap-1.5">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-5 bg-[#8C1D30]'
                  : 'w-1.5 bg-[#E7CCD0] hover:bg-[#8C1D30]/40'
              }`}
              aria-label={`Jump to memory photo ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Polaroid-inspired Luxury Photo Frame */}
      <div className="relative w-full bg-white p-4 sm:p-5 pb-8 rounded-2xl shadow-[0_16px_50px_rgba(107,29,47,0.12)] border border-[#F3D8DC] transform -rotate-0.5 hover:rotate-0 transition-transform duration-500">
        {/* Subtle tape / luxury photo clip effect at top */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#F5E6E8]/85 backdrop-blur-sm rounded shadow-sm border border-[#E7CCD0]/60 z-10" />

        {/* The Photo Container with Animated Switching */}
        <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-[#FAF6F0] via-[#FDFBF7] to-[#F5E6E8] rounded-xl overflow-hidden border border-[#EBE3DE] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full h-full flex items-center justify-center"
            >
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={`Our memory ${currentIndex + 1}`}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/80 shadow-sm border border-[#F3D8DC] flex items-center justify-center text-[#8C1D30]">
                    <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block px-3 py-1 bg-[#F5E6E8] text-[#8C1D30] text-xs font-semibold rounded-full tracking-wider uppercase mb-1">
                      OUR_MEMORIES_PHOTO #{currentIndex + 1}
                    </span>
                    <p className="text-sm text-[#78716C] font-light max-w-xs leading-relaxed">
                      {currentDesc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[#8C1D30]/60 text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Memory slot {currentIndex + 1} of 6</span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#44403C] hover:text-[#8C1D30] shadow-md border border-[#F3D8DC] flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer z-20 backdrop-blur-xs"
            aria-label="Previous memory"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#44403C] hover:text-[#8C1D30] shadow-md border border-[#F3D8DC] flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer z-20 backdrop-blur-xs"
            aria-label="Next memory"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Handwritten / Editorial Caption */}
        <div className="mt-5 text-center">
          <p className="font-serif italic text-lg sm:text-xl text-[#1C1917] tracking-wide">
            One of my favorite memories with you ❤️
          </p>
        </div>
      </div>

      {/* 6 Photo Thumbnail Selector Strip */}
      <div className="w-full mt-4 flex items-center justify-center gap-2 overflow-x-auto py-1 px-2">
        {photos.map((photo, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'border-[#8C1D30] shadow-md scale-105'
                  : 'border-[#E7CCD0] opacity-60 hover:opacity-100 hover:border-[#8C1D30]/60'
              }`}
              title={`View memory ${idx + 1}`}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={`Thumb ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#FAF6F0] flex flex-col items-center justify-center text-[#8C1D30] text-[10px] font-mono">
                  <span>#{idx + 1}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <button
          id="memory-back-button"
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
