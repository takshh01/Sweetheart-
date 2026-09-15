import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RotateCcw, Eye, Wand2, Check, ArrowRight, Heart as HeartIcon } from 'lucide-react';
import { HeartCelebration } from './HeartCelebration';

interface PhotoPuzzleProps {
  photos?: (string | null)[];
  photoUrl?: string | null;
  onComplete: () => void;
}

interface PuzzlePiece {
  id: number;
  originalIndex: number;
}

// Romantic fallback image if no custom couple photo is uploaded yet
const DEFAULT_ROMANTIC_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4A1525" />
      <stop offset="45%" stop-color="#8C1D30" />
      <stop offset="75%" stop-color="#D9777F" />
      <stop offset="100%" stop-color="#FCE7EB" />
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="60%" r="50%">
      <stop offset="0%" stop-color="#FFFDF0" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#FAD28C" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#FAD28C" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#sky)" />
  <circle cx="300" cy="360" r="140" fill="url(#sun)" />
  <!-- Silhouette of holding hands under stars -->
  <g fill="#24070F">
    <!-- Hill / Horizon -->
    <path d="M0,480 Q300,430 600,490 L600,600 L0,600 Z" />
    <!-- Couple Silhouette -->
    <!-- Partner 1 -->
    <circle cx="270" cy="380" r="28" />
    <path d="M245,415 C245,415 258,405 272,405 C286,405 295,415 295,470 L245,470 Z" />
    <!-- Partner 2 -->
    <circle cx="330" cy="388" r="25" />
    <path d="M305,420 C305,420 318,412 330,412 C342,412 355,420 355,470 L305,470 Z" />
    <!-- Loving embrace / leaning -->
    <ellipse cx="295" cy="425" rx="12" ry="24" transform="rotate(-15 295 425)" />
    <!-- Heart above them -->
    <path d="M300,320 C300,305 285,300 280,310 C275,300 260,305 260,320 C260,340 300,358 300,358 C300,358 340,340 340,320 C340,305 325,300 320,310 C315,300 300,305 300,320 Z" fill="#FFE2E6" transform="translate(0, -10) scale(0.65) translate(110, 80)" />
  </g>
  <!-- Subtle stars -->
  <circle cx="120" cy="140" r="2" fill="#FFF" opacity="0.8" />
  <circle cx="180" cy="90" r="2.5" fill="#FFF" opacity="0.9" />
  <circle cx="450" cy="120" r="2" fill="#FFF" opacity="0.8" />
  <circle cx="500" cy="190" r="1.5" fill="#FFF" opacity="0.7" />
  <circle cx="360" cy="80" r="3" fill="#FFF" opacity="0.95" />
  <circle cx="240" cy="160" r="1.5" fill="#FFF" opacity="0.75" />
  <text x="300" y="555" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif" font-size="28" font-style="italic" fill="#FFE4E8" letter-spacing="1">Kimmi &amp; Me ❤️</text>
</svg>
`)}`;

// Deterministic or pseudo-random shuffle that is guaranteed not already solved
function shufflePieces(): PuzzlePiece[] {
  const pieces: PuzzlePiece[] = Array.from({ length: 9 }, (_, i) => ({
    id: i,
    originalIndex: i,
  }));

  // A couple of predefined pleasant permutations that are fun to solve
  const permutations = [
    [4, 0, 2, 7, 1, 5, 8, 3, 6],
    [3, 1, 5, 0, 4, 8, 6, 2, 7],
    [1, 4, 2, 0, 7, 5, 3, 8, 6],
    [6, 1, 8, 3, 0, 4, 2, 7, 5],
  ];
  const chosen = permutations[Math.floor(Math.random() * permutations.length)];

  return chosen.map((origIdx, slotIdx) => ({
    id: slotIdx,
    originalIndex: origIdx,
  }));
}

export function PhotoPuzzle({ photos = [], photoUrl, onComplete }: PhotoPuzzleProps) {
  // Available photos to pick from
  const availablePhotos = useMemo(() => {
    const valid = photos.filter((p): p is string => Boolean(p));
    if (valid.length > 0) return valid;
    if (photoUrl) return [photoUrl];
    return [DEFAULT_ROMANTIC_PHOTO];
  }, [photos, photoUrl]);

  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const currentPhoto = availablePhotos[activePhotoIndex] || DEFAULT_ROMANTIC_PHOTO;

  const [pieces, setPieces] = useState<PuzzlePiece[]>(shufflePieces);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [completedCelebration, setCompletedCelebration] = useState<boolean>(false);

  // Check if solved whenever pieces change
  useEffect(() => {
    const solved = pieces.every((p, idx) => p.originalIndex === idx);
    if (solved && !isSolved) {
      setIsSolved(true);
      setCompletedCelebration(true);
    }
  }, [pieces, isSolved]);

  // Count correct pieces
  const correctCount = pieces.filter((p, idx) => p.originalIndex === idx).length;

  // Handle tile tap (Tap-to-Swap mechanism)
  const handleTileClick = (slotIndex: number) => {
    if (isSolved) return;

    if (selectedSlot === null) {
      // First piece selected
      setSelectedSlot(slotIndex);
    } else if (selectedSlot === slotIndex) {
      // Deselect if tapping same
      setSelectedSlot(null);
    } else {
      // Swap piece at selectedSlot with slotIndex
      setPieces(prev => {
        const next = [...prev];
        const temp = next[selectedSlot];
        next[selectedSlot] = next[slotIndex];
        next[slotIndex] = temp;
        return next;
      });
      setSelectedSlot(null);
      setMoves(m => m + 1);
    }
  };

  // Auto solve helper ("Solve with Love")
  const handleAutoSolve = () => {
    if (isSolved) return;
    setPieces(Array.from({ length: 9 }, (_, i) => ({ id: i, originalIndex: i })));
    setMoves(m => m + 1);
  };

  // Reset / Reshuffle
  const handleReset = () => {
    setPieces(shufflePieces());
    setSelectedSlot(null);
    setIsSolved(false);
    setCompletedCelebration(false);
    setMoves(0);
  };

  // Advance to next page
  const handleProceed = () => {
    onComplete();
  };

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center px-4 py-6 select-none">
      {completedCelebration && <HeartCelebration />}

      {/* Header */}
      <div className="text-center space-y-2 mb-5">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FFF5F6] border border-[#F3D8DC] text-[#8C1D30] shadow-sm mb-0.5">
          <HeartIcon className="w-5 h-5 fill-[#8C1D30]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
          Piece of My Heart ❤️
        </h1>
        <p className="text-[#78716C] text-sm sm:text-base font-light max-w-xs mx-auto leading-relaxed">
          {isSolved
            ? 'Every piece belongs right where it is.'
            : 'Tap two pieces to swap them and piece together our favorite memory.'}
        </p>
      </div>

      {/* Multiple Photos Selector if owner uploaded > 1 memory photo */}
      {availablePhotos.length > 1 && (
        <div className="mb-4 flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur-xs rounded-full border border-[#F3D8DC] shadow-xs">
          <span className="text-[11px] font-serif text-[#8C1D30] px-2 font-medium">Memory:</span>
          {availablePhotos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActivePhotoIndex(idx);
                handleReset();
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                activePhotoIndex === idx
                  ? 'bg-[#8C1D30] text-white font-medium shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              #{idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Top Status Bar: Progress and Controls */}
      <div className="w-full flex items-center justify-between px-2 mb-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#8C1D30] font-serif">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium">
            {isSolved ? 'Complete! ❤️' : `${correctCount} of 9 in place`}
          </span>
          <span className="text-[#A8A29E] font-sans text-[11px] ml-1">({moves} moves)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Peek / Preview Button */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
              showPreview
                ? 'bg-[#8C1D30] text-white border-[#8C1D30]'
                : 'bg-white/80 text-[#78716C] border-[#E7CCD0] hover:text-[#1C1917]'
            }`}
            title="Peek at the completed photo"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="font-serif text-[11px]">{showPreview ? 'Hide' : 'Peek'}</span>
          </button>

          {/* Solve with love shortcut */}
          {!isSolved && (
            <button
              onClick={handleAutoSolve}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF5F6] text-[#8C1D30] hover:bg-[#FCE7EB] border border-[#F3D8DC] transition-all cursor-pointer"
              title="Solve with Love"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="font-serif text-[11px]">Solve ✨</span>
            </button>
          )}

          {/* Reshuffle */}
          <button
            onClick={handleReset}
            className="p-1 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-black/5 active:scale-90 transition-all cursor-pointer"
            title="Reshuffle puzzle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Puzzle Card Frame */}
      <div className="relative w-full aspect-square max-w-[380px] bg-white rounded-3xl p-3 sm:p-4 shadow-[0_18px_50px_rgba(107,29,47,0.12)] border border-[#F3D8DC] flex items-center justify-center">
        {/* Subtle romantic corner tape/accents */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#FCE7EB]/80 backdrop-blur-xs rounded shadow-xs border border-[#F3D8DC] z-20" />

        {/* The 3x3 Puzzle Board */}
        <div
          className={`relative w-full h-full rounded-2xl overflow-hidden bg-[#FAF6F0] transition-all duration-700 ${
            isSolved
              ? 'p-0 shadow-[0_0_35px_rgba(140,29,48,0.3)] ring-2 ring-[#8C1D30]/40'
              : 'p-1.5'
          }`}
        >
          {/* Solved Seamless View or Interactive Grid */}
          {isSolved ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full rounded-2xl overflow-hidden"
            >
              <img
                src={currentPhoto}
                alt="Our Completed Moment"
                className="w-full h-full object-cover"
              />
              {/* Soft warm vignette on completion */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#8C1D30]/25 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          ) : (
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1.5">
              {pieces.map((piece, slotIdx) => {
                const isSelected = selectedSlot === slotIdx;
                const isCorrect = piece.originalIndex === slotIdx;

                // Calculate image slicing offset for originalIndex
                const origCol = piece.originalIndex % 3;
                const origRow = Math.floor(piece.originalIndex / 3);
                const bgPosX = origCol * 50; // 0%, 50%, 100%
                const bgPosY = origRow * 50; // 0%, 50%, 100%

                return (
                  <motion.button
                    key={`slot-${slotIdx}-${piece.id}`}
                    onClick={() => handleTileClick(slotIdx)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative w-full h-full rounded-xl overflow-hidden transition-all duration-200 cursor-pointer shadow-xs focus:outline-none ${
                      isSelected
                        ? 'ring-3 ring-[#8C1D30] z-20 scale-105 shadow-lg'
                        : isCorrect
                        ? 'ring-1 ring-emerald-500/50'
                        : 'ring-1 ring-black/5 hover:ring-[#8C1D30]/40'
                    }`}
                    style={{
                      backgroundImage: `url("${currentPhoto}")`,
                      backgroundSize: '300% 300%',
                      backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                    }}
                    aria-label={`Puzzle tile at position ${slotIdx + 1}`}
                  >
                    {/* Visual cue when tile is in correct place */}
                    {isCorrect && (
                      <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-white/85 text-emerald-700 shadow-xs flex items-center justify-center text-[9px] pointer-events-none">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Selected overlay shimmer */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#8C1D30]/20 backdrop-blur-[1px] flex items-center justify-center text-white text-xs font-serif font-medium">
                        <span>Swap</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Peek Overlay */}
          <AnimatePresence>
            {showPreview && !isSolved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
                onClick={() => setShowPreview(false)}
              >
                <div className="relative max-w-[260px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-white">
                  <img
                    src={currentPhoto}
                    alt="Original Reference"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 text-center text-[11px] text-white font-serif">
                    Tap anywhere to close peek
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Completion Banner & Action Button */}
      {isSolved ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 w-full text-center space-y-4"
        >
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF5F6] to-[#FAF7F2] border border-[#F3D8DC] shadow-sm space-y-1">
            <p className="font-serif text-xl sm:text-2xl text-[#8C1D30] font-medium">
              You put us together perfectly ❤️
            </p>
            <p className="text-xs sm:text-sm text-[#78716C] font-light">
              Just like every chapter of our story, every piece leads straight to you.
            </p>
          </div>

          <button
            id="puzzle-continue-button"
            onClick={handleProceed}
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-serif text-base sm:text-lg font-medium text-white bg-[#8C1D30] hover:bg-[#6B1D2F] shadow-[0_10px_30px_rgba(140,29,48,0.3)] hover:shadow-[0_14px_35px_rgba(140,29,48,0.4)] transition-all duration-200 active:scale-95 cursor-pointer w-full max-w-xs mx-auto"
          >
            <span>Continue to Our Moment</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      ) : (
        /* Helpful play hint */
        <p className="text-xs text-[#A8A29E] mt-4 text-center font-light italic">
          Tip: Tap any tile, then tap another to swap them into place. ✨
        </p>
      )}
    </div>
  );
}
