import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Maximize2, Sparkles, Heart as HeartIcon } from 'lucide-react';
import { HeartCelebration } from './HeartCelebration';

interface VideoRevealProps {
  videoUrl?: string | null;
  videoTitle?: string;
  videoCaption?: string;
  onRestartJourney?: () => void;
}

// Romantic fallback video (aesthetic royalty-free ambient romantic sunset & waves loop)
const DEFAULT_ROMANTIC_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-the-ocean-and-a-calm-beach-40156-large.mp4';

export function VideoReveal({
  videoUrl,
  videoTitle = 'Our Story in Motion ❤️',
  videoCaption,
  onRestartJourney,
}: VideoRevealProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true); // start muted for reliable mobile autoplay
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isEnded, setIsEnded] = useState<boolean>(false);

  const activeVideo = videoUrl || DEFAULT_ROMANTIC_VIDEO;

  // Auto-play on mount
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay might need user interaction
        setIsPlaying(false);
      });
    }
  }, [activeVideo]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
      setIsEnded(false);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
    setHasUnmutedOnce(true);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.duration) {
      setProgress((v.currentTime / v.duration) * 100);
      setDuration(v.duration);
    }
  };

  const handleVideoEnded = () => {
    setIsEnded(true);
    setIsPlaying(false);
  };

  const handleRestartVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setIsPlaying(true);
    setIsEnded(false);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen?.();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-xl mx-auto flex flex-col items-center px-4 py-8 select-none"
    >
      <HeartCelebration />

      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF5F6] border border-[#F3D8DC] text-[#8C1D30] shadow-xs text-xs font-serif tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Finale Chapter</span>
          <HeartIcon className="w-3 h-3 fill-[#8C1D30]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
          {videoTitle}
        </h1>
        <p className="text-[#78716C] text-sm sm:text-base font-light max-w-md mx-auto leading-relaxed">
          {videoCaption || 'Every second with you is a moment I want to pause and remember forever.'}
        </p>
      </div>

      {/* Cinematic Video Player Frame */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] sm:aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(107,29,47,0.2)] border-2 border-[#F3D8DC] group"
      >
        <video
          ref={videoRef}
          src={activeVideo}
          playsInline
          muted={isMuted}
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Soft Vignette Overlay */}
        <div
          onClick={togglePlay}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none transition-opacity opacity-80 group-hover:opacity-95"
        />

        {/* Unmute prompt badge if muted */}
        {isMuted && !hasUnmutedOnce && (
          <button
            onClick={toggleMute}
            className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-serif flex items-center gap-1.5 border border-white/20 hover:bg-black/80 transition-all cursor-pointer shadow-lg animate-pulse"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Tap for Sound 🔊</span>
          </button>
        )}

        {/* Center Big Play Button (when paused or ended) */}
        {(!isPlaying || isEnded) && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/90 text-[#8C1D30] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer z-20 backdrop-blur-xs"
            aria-label="Play video"
          >
            {isEnded ? <RotateCcw className="w-7 h-7" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </button>
        )}

        {/* Bottom Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 z-20 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative">
            <div
              className="h-full bg-gradient-to-r from-[#FCE7EB] to-[#8C1D30] rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs font-serif">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-full hover:bg-white/20 transition-all cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-1.5 rounded-full hover:bg-white/20 transition-all cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleRestartVideo}
                className="p-1.5 rounded-full hover:bg-white/20 transition-all cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-white/80 tracking-wide font-sans">
                {videoRef.current ? Math.floor(videoRef.current.currentTime || 0) : 0}s / {Math.floor(duration || 0)}s
              </span>
              <button
                onClick={handleFullscreen}
                className="p-1.5 rounded-full hover:bg-white/20 transition-all cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Romantic Closing Letter Plaque */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="mt-6 w-full p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-[#F3D8DC] shadow-[0_15px_40px_rgba(107,29,47,0.08)] text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-2 text-[#8C1D30]">
          <HeartIcon className="w-4 h-4 fill-[#8C1D30]" />
          <span className="font-serif text-xs uppercase tracking-widest font-semibold">
            Kimmi &amp; Taksh
          </span>
          <HeartIcon className="w-4 h-4 fill-[#8C1D30]" />
        </div>

        <p className="font-serif text-xl sm:text-2xl text-[#1C1917] italic leading-relaxed">
          "From our first conversation to this very moment, choosing you is the easiest and most beautiful decision I'll ever make."
        </p>

        <p className="text-xs sm:text-sm text-[#78716C] font-light max-w-sm mx-auto">
          Thank you for making my world so gentle and bright. I can't wait for all our adventures ahead.
        </p>

        <div className="pt-2">
          <p className="font-serif text-lg text-[#8C1D30] font-medium">
            Forever Yours, Taksh ❤️
          </p>
        </div>

        {onRestartJourney && (
          <div className="pt-4 border-t border-[#F3D8DC]/60 flex justify-center">
            <button
              onClick={onRestartJourney}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-serif text-[#78716C] hover:text-[#8C1D30] bg-[#FFF5F6] hover:bg-[#FCE7EB] border border-[#F3D8DC] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Relive Our Story from the Beginning</span>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
