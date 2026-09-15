import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface BackgroundMusicProps {
  musicUrl: string;
  shouldPlay: boolean; // True on pages 1 to second-to-last page, false on video page
}

export function BackgroundMusic({ musicUrl, shouldPlay }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Initialize and handle URL changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.35; // Gentle, romantic background level
    audioRef.current.loop = true;
  }, [musicUrl]);

  // Attempt to play on user's first interaction anywhere on page (browser policy compliance)
  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasInteracted(true);
      if (shouldPlay && !isMuted && audioRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.log('Audio autoplay prevented by browser until further interaction:', err);
          });
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: false });
    window.addEventListener('touchstart', handleFirstInteraction, { once: false });
    window.addEventListener('keydown', handleFirstInteraction, { once: false });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [shouldPlay, isMuted]);

  // Sync playback with shouldPlay prop (stop on video page, resume when returning)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!shouldPlay) {
      // We are on the Video page -> Pause background music so it does not conflict!
      if (!audio.paused) {
        audio.pause();
        setIsPlaying(false);
      }
    } else {
      // We are on page 1 through second-to-last page
      if (!isMuted && hasInteracted && audio.paused) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  }, [shouldPlay, isMuted, hasInteracted]);

  // Manual toggle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn('Could not toggle audio playback:', err));
    }
  };

  // Don't render floating music button on the video page if user is focused on the video
  if (!shouldPlay) {
    return (
      <audio
        ref={audioRef}
        src={musicUrl}
        preload="auto"
        loop
      />
    );
  }

  return (
    <>
      {/* Background Audio Element */}
      <audio
        ref={audioRef}
        src={musicUrl}
        preload="auto"
        loop
      />

      {/* Floating Music Pill Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <button
          id="global-music-toggle"
          onClick={togglePlayPause}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md shadow-md border transition-all cursor-pointer select-none active:scale-95 text-xs font-serif ${
            isPlaying
              ? 'bg-white/90 border-[#F3D8DC] text-[#8C1D30] hover:bg-[#FFF5F6] hover:border-[#8C1D30]/40'
              : 'bg-white/80 border-gray-200 text-[#78716C] hover:bg-white hover:text-[#1C1917]'
          }`}
          title={isPlaying ? 'Pause Background Music 🎵' : 'Play Background Music 🎵'}
          aria-label={isPlaying ? 'Pause Background Music' : 'Play Background Music'}
        >
          {isPlaying ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8C1D30] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8C1D30]" />
              </span>
              <Volume2 className="w-3.5 h-3.5 text-[#8C1D30]" />
              <span className="hidden sm:inline font-sans text-[11px] font-medium tracking-wide">
                Music Playing
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#78716C]" />
              <span className="hidden sm:inline font-sans text-[11px] font-medium tracking-wide">
                Music Paused
              </span>
            </>
          )}
        </button>
      </motion.div>
    </>
  );
}
