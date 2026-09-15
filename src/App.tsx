/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PageId } from './types';
import {
  getOrCreateSessionId,
  fetchProposalSession,
  sendProposalEvent,
  fetchPhoto,
  fetchPhotos,
} from './services/api';

import { IntroPage } from './components/IntroPage';
import { EnvelopePage } from './components/EnvelopePage';
import { MemoryCard } from './components/MemoryCard';
import { LoveReasons } from './components/LoveReasons';
import { LoveLetter } from './components/LoveLetter';
import { PhotoPuzzle } from './components/PhotoPuzzle';
import { ThankYouPage } from './components/ThankYouPage';
import { DatePickerPage } from './components/DatePickerPage';
import { DateConfirmation } from './components/DateConfirmation';
import { VideoReveal } from './components/VideoReveal';
import { BackgroundMusic } from './components/BackgroundMusic';
import { OwnerPanel } from './components/OwnerPanel';
import { OwnerPasswordModal } from './components/OwnerPasswordModal';
import { fetchVideo, fetchMusic } from './services/api';

export default function App() {
  const [sessionId] = useState<string>(() => getOrCreateSessionId());
  const [currentPage, setCurrentPage] = useState<PageId>('intro');
  const [isOwnerPanelOpen, setIsOwnerPanelOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('owner_auth_taksh') === 'true';
    } catch {
      return false;
    }
  });

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null, null]);

  // Video State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('Our Story in Motion ❤️');
  const [videoCaption, setVideoCaption] = useState<string>('Every second with you is a moment I want to remember forever.');

  // Background Music State
  const [musicUrl, setMusicUrl] = useState<string>('/default_music.mp3');

  // Viewed states for envelopes
  const [viewedCards, setViewedCards] = useState({
    memories: false,
    why_love: false,
    letter: false,
  });

  // Proposal interaction states
  const [noAttempts, setNoAttempts] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isSavingDate, setIsSavingDate] = useState<boolean>(false);

  // Initialize session, photos, video & music from backend
  useEffect(() => {
    async function init() {
      // Fetch 6 photos
      const photoList = await fetchPhotos();
      if (photoList && photoList.length > 0) {
        setPhotos(photoList);
        if (photoList[0]) setPhotoUrl(photoList[0]);
      } else {
        const photo = await fetchPhoto();
        if (photo) setPhotoUrl(photo);
      }

      // Fetch video
      const vData = await fetchVideo();
      if (vData.has_video && vData.video_url) {
        setVideoUrl(vData.video_url);
        if (vData.video?.title) setVideoTitle(vData.video.title);
        if (vData.video?.caption) setVideoCaption(vData.video.caption);
      }

      // Fetch background music
      const mData = await fetchMusic();
      if (mData.music_url) {
        setMusicUrl(mData.music_url);
      }

      // Initialize proposal session on server
      await fetchProposalSession(sessionId);
    }
    init();
  }, [sessionId]);

  // Click on the 3-dots button: prompt password if not yet unlocked
  const handleOpenOwner = () => {
    if (isOwnerAuthenticated) {
      setIsOwnerPanelOpen(true);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handleOwnerAuthenticated = () => {
    setIsOwnerAuthenticated(true);
    setIsPasswordModalOpen(false);
    setIsOwnerPanelOpen(true);
  };

  const handleLockOwner = () => {
    setIsOwnerAuthenticated(false);
    setIsOwnerPanelOpen(false);
    try {
      sessionStorage.removeItem('owner_auth_taksh');
    } catch {}
  };

  // Page 1: Open gift -> Transition to envelopes
  const handleOpenGift = () => {
    sendProposalEvent(sessionId, 'start');
    setCurrentPage('envelopes');
  };

  // Page 2: Select an envelope card
  const handleSelectEnvelope = (card: 'memories' | 'why_love' | 'letter') => {
    if (card === 'memories') {
      sendProposalEvent(sessionId, 'memories_viewed');
      setViewedCards(prev => ({ ...prev, memories: true }));
      setCurrentPage('memories');
    } else if (card === 'why_love') {
      sendProposalEvent(sessionId, 'why_love_viewed');
      setViewedCards(prev => ({ ...prev, why_love: true }));
      setCurrentPage('why_love');
    } else if (card === 'letter') {
      sendProposalEvent(sessionId, 'letter_viewed');
      setViewedCards(prev => ({ ...prev, letter: true }));
      setCurrentPage('letter');
    }
  };

  // Return to envelopes without resetting state
  const handleBackToEnvelopes = () => {
    setCurrentPage('envelopes');
  };

  // Page 2: Next -> Bottle game
  const handleNextToGame = () => {
    setCurrentPage('game');
  };

  // Page 3: Bottle game complete -> Thank you / proposal
  const handleGameComplete = () => {
    sendProposalEvent(sessionId, 'game_completed');
    setCurrentPage('thank_you');
  };

  // Page 4: NO attempt
  const handleNoAttempt = () => {
    const updated = noAttempts + 1;
    setNoAttempts(updated);
    sendProposalEvent(sessionId, 'no_attempt');
  };

  // Page 4: YES response
  const handleYes = () => {
    sendProposalEvent(sessionId, 'final_answer', 'YES');
    setCurrentPage('pick_date');
  };

  // Page 5: Save date
  const handleSaveDate = async (dateStr: string) => {
    setIsSavingDate(true);
    setSelectedDate(dateStr);
    await sendProposalEvent(sessionId, 'selected_date', dateStr);
    setIsSavingDate(false);
    setCurrentPage('date_confirmed');
  };

  // Reset journey for testing
  const handleSessionReset = () => {
    setViewedCards({ memories: false, why_love: false, letter: false });
    setNoAttempts(0);
    setSelectedDate('');
    setCurrentPage('intro');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] font-sans relative overflow-x-hidden flex flex-col justify-between selection:bg-[#F3D8DC] selection:text-[#6B1D2F]">
      {/* Soft Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#FFF0F2]/60 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-[#FCE7EB]/50 to-transparent blur-3xl pointer-events-none" />

      {/* Top Floating Corner Menu for Owner (available across all screens or intro) */}
      <div className="absolute top-4 right-4 z-40">
        <button
          id="global-owner-button"
          onClick={handleOpenOwner}
          className="p-2.5 rounded-full text-[#78716C]/70 hover:text-[#1C1917] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
          title="Owner Menu (⋮) [Taksh@28]"
          aria-label="Owner Settings & Dashboard"
        >
          <span className="text-xl leading-none font-bold">⋮</span>
        </button>
      </div>

      {/* Main Screen Container */}
      <div className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-6 z-10">
        <AnimatePresence mode="wait">
          {/* PAGE 1: INTRODUCTION */}
          {currentPage === 'intro' && (
            <motion.div
              key="page-intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <IntroPage
                onOpenGift={handleOpenGift}
                onOpenOwnerPanel={handleOpenOwner}
              />
            </motion.div>
          )}

          {/* PAGE 2: CHOOSE AN ENVELOPE */}
          {currentPage === 'envelopes' && (
            <motion.div
              key="page-envelopes"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <EnvelopePage
                onSelectCard={handleSelectEnvelope}
                onNext={handleNextToGame}
                viewed={viewedCards}
              />
            </motion.div>
          )}

          {/* PAGE 2 SUB-VIEW: OUR MEMORIES */}
          {currentPage === 'memories' && (
            <motion.div
              key="page-memories"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <MemoryCard
                photos={photos}
                photoUrl={photoUrl}
                onBack={handleBackToEnvelopes}
              />
            </motion.div>
          )}

          {/* PAGE 2 SUB-VIEW: WHY I LOVE YOU */}
          {currentPage === 'why_love' && (
            <motion.div
              key="page-why-love"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <LoveReasons onBack={handleBackToEnvelopes} />
            </motion.div>
          )}

          {/* PAGE 2 SUB-VIEW: MY LETTER */}
          {currentPage === 'letter' && (
            <motion.div
              key="page-letter"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <LoveLetter onBack={handleBackToEnvelopes} />
            </motion.div>
          )}

          {/* PAGE 3: OUR PHOTO PUZZLE */}
          {currentPage === 'game' && (
            <motion.div
              key="page-game"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.6 }}
              className="w-full flex justify-center"
            >
              <PhotoPuzzle
                photos={photos}
                photoUrl={photoUrl}
                onComplete={handleGameComplete}
              />
            </motion.div>
          )}

          {/* PAGE 4: THANK YOU & THE BIG QUESTION */}
          {currentPage === 'thank_you' && (
            <motion.div
              key="page-thank-you"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
              className="w-full flex justify-center"
            >
              <ThankYouPage
                noAttempts={noAttempts}
                onNoAttempt={handleNoAttempt}
                onYes={handleYes}
              />
            </motion.div>
          )}

          {/* PAGE 5: PICK A DATE */}
          {currentPage === 'pick_date' && (
            <motion.div
              key="page-pick-date"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <DatePickerPage
                onSaveDate={handleSaveDate}
                isSaving={isSavingDate}
              />
            </motion.div>
          )}

          {/* PAGE 5: DATE CONFIRMATION */}
          {currentPage === 'date_confirmed' && (
            <motion.div
              key="page-date-confirmed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6 }}
              className="w-full flex justify-center"
            >
              <DateConfirmation
                selectedDate={selectedDate}
                onNextToVideo={() => setCurrentPage('video_reveal')}
              />
            </motion.div>
          )}

          {/* PAGE 6: VIDEO REVEAL (FINALE) */}
          {currentPage === 'video_reveal' && (
            <motion.div
              key="page-video-reveal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6 }}
              className="w-full flex justify-center"
            >
              <VideoReveal
                videoUrl={videoUrl}
                videoTitle={videoTitle}
                videoCaption={videoCaption}
                onRestartJourney={handleSessionReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Owner Panel Drawer / Modal */}
      <OwnerPanel
        isOpen={isOwnerPanelOpen}
        onClose={() => setIsOwnerPanelOpen(false)}
        sessionId={sessionId}
        onPhotoUpdated={(newUrl) => setPhotoUrl(newUrl)}
        onPhotosUpdated={(newPhotos) => setPhotos(newPhotos)}
        onVideoUpdated={(newUrl, title, caption) => {
          setVideoUrl(newUrl);
          if (title) setVideoTitle(title);
          if (caption) setVideoCaption(caption);
        }}
        onMusicUpdated={(newUrl) => {
          setMusicUrl(newUrl);
        }}
        onLock={handleLockOwner}
        onSessionReset={handleSessionReset}
      />

      {/* Global Romantic Background Music (Pages 1 through 2nd-to-last page, pauses on video page) */}
      <BackgroundMusic
        musicUrl={musicUrl}
        shouldPlay={currentPage !== 'video_reveal'}
      />

      {/* Owner Password Modal Protected by Taksh@28 */}
      <OwnerPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onAuthenticated={handleOwnerAuthenticated}
      />
    </div>
  );
}
