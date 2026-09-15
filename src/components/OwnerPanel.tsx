import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Mail,
  RotateCcw,
  Sparkles,
  Sliders,
  Video,
  Film,
  Lock,
  Play,
  Pause,
  Music,
  Volume2,
  Save,
  Check,
} from 'lucide-react';
import { OwnerSummary } from '../types';
import {
  fetchOwnerSummary,
  savePhoto,
  savePhotoAtIndex,
  resetAllPhotos,
  resetSessionOnServer,
  fetchVideo,
  saveVideo,
  resetVideo,
  fetchMusic,
  saveMusic,
  resetMusic,
} from '../services/api';

interface OwnerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onPhotoUpdated?: (newUrl: string | null) => void;
  onPhotosUpdated?: (newPhotos: (string | null)[]) => void;
  onVideoUpdated?: (newUrl: string | null, title?: string, caption?: string) => void;
  onMusicUpdated?: (newUrl: string, title?: string) => void;
  onLock?: () => void;
  onSessionReset: () => void;
}

export function OwnerPanel({
  isOpen,
  onClose,
  sessionId,
  onPhotoUpdated,
  onPhotosUpdated,
  onVideoUpdated,
  onMusicUpdated,
  onLock,
  onSessionReset,
}: OwnerPanelProps) {
  const [summary, setSummary] = useState<OwnerSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'journey' | 'photo' | 'music' | 'video' | 'email'>('journey');
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Video State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('Our Story in Motion ❤️');
  const [videoCaption, setVideoCaption] = useState<string>('Forever & Always');
  const [videoInputUrl, setVideoInputUrl] = useState<string>('');
  const [isVideoUploading, setIsVideoUploading] = useState<boolean>(false);
  const [hasCustomVideo, setHasCustomVideo] = useState<boolean>(false);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Music State
  const [musicUrl, setMusicUrl] = useState<string>('/default_music.mp3');
  const [musicTitle, setMusicTitle] = useState<string>('Romantic Piano Melody 🎵');
  const [musicInputUrl, setMusicInputUrl] = useState<string>('');
  const [isMusicUploading, setIsMusicUploading] = useState<boolean>(false);
  const [hasCustomMusic, setHasCustomMusic] = useState<boolean>(false);
  const [isMusicPreviewPlaying, setIsMusicPreviewPlaying] = useState<boolean>(false);
  const musicFileInputRef = useRef<HTMLInputElement | null>(null);
  const dashboardAudioRef = useRef<HTMLAudioElement | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchOwnerSummary(sessionId);
    setSummary(data);

    const videoData = await fetchVideo();
    if (videoData.has_video && videoData.video_url) {
      setVideoUrl(videoData.video_url);
      setHasCustomVideo(true);
      if (videoData.video?.title) setVideoTitle(videoData.video.title);
      if (videoData.video?.caption) setVideoCaption(videoData.video.caption);
      if (videoData.video?.custom_url && videoData.video.custom_url !== '/api/video/file') {
        setVideoInputUrl(videoData.video.custom_url);
      }
    } else {
      setVideoUrl(null);
      setHasCustomVideo(false);
    }

    const musicData = await fetchMusic();
    if (musicData.has_music && musicData.music_url) {
      setMusicUrl(musicData.music_url);
      setHasCustomMusic(musicData.is_custom || false);
      if (musicData.music?.title) setMusicTitle(musicData.music.title);
      if (musicData.music?.custom_url && musicData.music.custom_url !== '/api/music/file') {
        setMusicInputUrl(musicData.music.custom_url);
      }
    } else {
      setMusicUrl(musicData.music_url || '/default_music.mp3');
      setHasCustomMusic(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, sessionId]);

  // Video Handlers
  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 90 * 1024 * 1024) {
      setStatusMsg('Please choose a video under 90MB for optimal streaming.');
      return;
    }

    setIsVideoUploading(true);
    setStatusMsg(`Uploading "${file.name}" securely to server storage... please do not close this window.`);

    const reader = new FileReader();
    reader.onload = async event => {
      const base64Data = event.target?.result as string;
      const res = await saveVideo({
        video_data: base64Data,
        file_name: file.name,
        title: videoTitle,
        caption: videoCaption,
      });
      setIsVideoUploading(false);
      if (res.video_url) {
        setVideoUrl(res.video_url);
        setHasCustomVideo(true);
        setStatusMsg('✅ Video safely uploaded and stored on server disk! Ready for the surprise reveal.');
        if (onVideoUpdated) onVideoUpdated(res.video_url, videoTitle, videoCaption);
      } else {
        setStatusMsg('Video upload failed. Check file format or try an external video URL instead.');
      }
    };
    reader.onerror = () => {
      setIsVideoUploading(false);
      setStatusMsg('Error reading video file from your device.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveVideoUrl = async () => {
    if (!videoInputUrl.trim()) {
      setStatusMsg('Please enter a valid video link or upload a video file.');
      return;
    }
    setIsVideoUploading(true);
    const res = await saveVideo({
      video_url: videoInputUrl.trim(),
      title: videoTitle,
      caption: videoCaption,
    });
    setIsVideoUploading(false);
    if (res.video_url) {
      setVideoUrl(res.video_url);
      setHasCustomVideo(true);
      setStatusMsg('Video URL saved successfully!');
      if (onVideoUpdated) onVideoUpdated(res.video_url, videoTitle, videoCaption);
    }
  };

  const handleResetVideo = async () => {
    if (!confirm('Reset video to the default romantic visual?')) return;
    setIsVideoUploading(true);
    await resetVideo();
    setVideoUrl(null);
    setVideoInputUrl('');
    setHasCustomVideo(false);
    setIsVideoUploading(false);
    setStatusMsg('Video reset to default romantic preview.');
    if (onVideoUpdated) onVideoUpdated(null);
  };

  // Music Handlers
  const handleMusicFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 35 * 1024 * 1024) {
      setStatusMsg('Please choose an audio file under 35MB for fast loading.');
      return;
    }

    setIsMusicUploading(true);
    setStatusMsg(`Uploading audio "${file.name}" securely to server storage... please wait.`);

    const reader = new FileReader();
    reader.onload = async event => {
      const base64Data = event.target?.result as string;
      const res = await saveMusic({
        music_data: base64Data,
        file_name: file.name,
        title: musicTitle || file.name,
      });
      setIsMusicUploading(false);
      if (res.music_url) {
        setMusicUrl(res.music_url);
        setHasCustomMusic(true);
        setStatusMsg('✅ Background music safely saved on server disk! It will play across Kimmi\'s journey.');
        if (onMusicUpdated) onMusicUpdated(res.music_url, musicTitle);
      } else {
        setStatusMsg('Audio upload failed. Check file format or try an external audio URL.');
      }
    };
    reader.onerror = () => {
      setIsMusicUploading(false);
      setStatusMsg('Error reading audio file from your device.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMusicUrl = async () => {
    if (!musicInputUrl.trim()) {
      setStatusMsg('Please enter a valid audio link or upload an audio file.');
      return;
    }
    setIsMusicUploading(true);
    const res = await saveMusic({
      music_url: musicInputUrl.trim(),
      title: musicTitle,
    });
    setIsMusicUploading(false);
    if (res.music_url) {
      setMusicUrl(res.music_url);
      setHasCustomMusic(true);
      setStatusMsg('Background music URL saved successfully!');
      if (onMusicUpdated) onMusicUpdated(res.music_url, musicTitle);
    }
  };

  const handleResetMusic = async () => {
    if (!confirm('Restore the default acoustic piano romantic melody?')) return;
    setIsMusicUploading(true);
    const res = await resetMusic();
    setMusicUrl(res.music_url || '/default_music.mp3');
    setMusicInputUrl('');
    setHasCustomMusic(false);
    setMusicTitle('Romantic Piano Melody 🎵');
    setIsMusicUploading(false);
    setStatusMsg('Background music restored to default romantic acoustic piano.');
    if (onMusicUpdated) onMusicUpdated(res.music_url || '/default_music.mp3', 'Romantic Piano Melody 🎵');
  };

  const togglePreviewAudio = () => {
    const audio = dashboardAudioRef.current;
    if (!audio) return;
    if (isMusicPreviewPlaying) {
      audio.pause();
      setIsMusicPreviewPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsMusicPreviewPlaying(true))
        .catch(err => console.warn('Preview play error:', err));
    }
  };

  // Handle Photo File Upload for selected slot
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Support high resolution camera photos up to 30MB (they will be optimized safely)
    if (file.size > 30 * 1024 * 1024) {
      setStatusMsg('Please choose an image file under 30MB');
      return;
    }

    setIsUploading(true);
    setStatusMsg(`Optimizing & securing photo for Slot #${selectedSlot + 1}...`);

    const reader = new FileReader();
    reader.onload = async event => {
      const result = event.target?.result as string;

      // Safe offscreen canvas downscale to optimize disk storage & network speed
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setPhotoPreview(optimizedDataUrl);

        setStatusMsg(`Saving photo #${selectedSlot + 1} securely to server disk...`);

        // Save to backend at current slot index
        const updatedPhotos = await savePhotoAtIndex(selectedSlot, optimizedDataUrl);
        if (onPhotosUpdated) onPhotosUpdated(updatedPhotos);
        if (selectedSlot === 0 && onPhotoUpdated) onPhotoUpdated(updatedPhotos[0]);

        setIsUploading(false);
        setStatusMsg(`✅ Photo #${selectedSlot + 1} safely saved on server disk!`);
        loadData();
      };
      img.onerror = () => {
        setIsUploading(false);
        setStatusMsg('Could not decode image file. Please try another photo format.');
      };
      img.src = result;
    };
    reader.onerror = () => {
      setIsUploading(false);
      setStatusMsg('Error reading image file from your device.');
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = async () => {
    if (!confirm(`Reset photo #${selectedSlot + 1} back to the default placeholder?`)) return;
    setIsUploading(true);
    const updatedPhotos = await savePhotoAtIndex(selectedSlot, null, true);
    setPhotoPreview(null);
    if (onPhotosUpdated) onPhotosUpdated(updatedPhotos);
    if (selectedSlot === 0 && onPhotoUpdated) onPhotoUpdated(updatedPhotos[0]);
    setIsUploading(false);
    setStatusMsg(`Slot #${selectedSlot + 1} reset to placeholder.`);
    loadData();
  };

  const handleResetAllPhotos = async () => {
    if (!confirm('Reset all 6 memory photos back to default placeholders?')) return;
    setIsUploading(true);
    const updatedPhotos = await resetAllPhotos();
    setPhotoPreview(null);
    if (onPhotosUpdated) onPhotosUpdated(updatedPhotos);
    if (onPhotoUpdated) onPhotoUpdated(null);
    setIsUploading(false);
    setStatusMsg('All 6 photos reset to placeholders.');
    loadData();
  };

  const handleTestEmail = async () => {
    setStatusMsg('Sending test notification to configured owner email...');
    try {
      const res = await fetch('/api/owner/test-email', { method: 'POST' });
      const data = await res.json();
      setStatusMsg(data?.result?.simulated ? 'Notification logged (email service in test mode)' : 'Test email dispatched!');
      loadData();
    } catch {
      setStatusMsg('Could not trigger test notification.');
    }
  };

  const handleResetSession = async () => {
    if (!confirm('Reset current proposal journey for testing? This will restart tracking.')) return;
    await resetSessionOnServer(sessionId);
    onSessionReset();
    setStatusMsg('Proposal session reset.');
    loadData();
  };

  if (!isOpen) return null;

  const s = summary?.session;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border border-[#F3D8DC] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white border-b border-[#F3D8DC] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FCE7EB] text-[#8C1D30] flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#1C1917] font-medium leading-none">
                  Owner Dashboard
                </h3>
                <p className="text-xs text-[#78716C] mt-1">
                  Private view for proposal management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={loadData}
                disabled={isLoading}
                className="p-2 rounded-full hover:bg-black/5 text-[#78716C] active:scale-95 transition-all cursor-pointer"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              {onLock && (
                <button
                  onClick={onLock}
                  className="p-2 rounded-full hover:bg-rose-50 text-[#78716C] hover:text-[#8C1D30] active:scale-95 transition-all cursor-pointer"
                  title="Lock Dashboard (Taksh@28)"
                >
                  <Lock className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 text-[#78716C] active:scale-95 transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Safe Storage Indicator */}
          <div className="bg-[#FFF8F9] border-b border-[#F3D8DC] px-5 py-1.5 flex items-center justify-between text-[11px] text-[#8C1D30]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Safe Storage Active: uploads persist securely on server disk</span>
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#F3D8DC] bg-[#FFF5F6]/50 px-5 pt-3 gap-3 text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setActiveTab('journey')}
              className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'journey'
                  ? 'border-[#8C1D30] text-[#8C1D30] font-semibold'
                  : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Kimmi's Journey
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'photo'
                  ? 'border-[#8C1D30] text-[#8C1D30] font-semibold'
                  : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Photos (6)
            </button>
            <button
              onClick={() => setActiveTab('music')}
              className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'music'
                  ? 'border-[#8C1D30] text-[#8C1D30] font-semibold'
                  : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Music 🎵</span>
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'video'
                  ? 'border-[#8C1D30] text-[#8C1D30] font-semibold'
                  : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Surprise 🎥</span>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'email'
                  ? 'border-[#8C1D30] text-[#8C1D30] font-semibold'
                  : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Notifications & Logs
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {statusMsg && (
              <div className="p-3 bg-[#FCE7EB] text-[#8C1D30] rounded-xl text-xs flex items-center justify-between animate-fade-in">
                <span>{statusMsg}</span>
                <button
                  onClick={() => setStatusMsg(null)}
                  className="font-bold text-xs ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* TAB 1: JOURNEY */}
            {activeTab === 'journey' && (
              <div className="space-y-6 text-sm">
                {/* Proposal Journey Section */}
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-[#8C1D30] font-semibold">
                    Kimmi's Proposal Journey
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5]">
                      <span className="text-[#57534E]">Proposal Started:</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5]">
                      <span className="text-[#57534E]">Our Memories:</span>
                      <span className={s?.memories_viewed ? 'font-semibold text-emerald-700' : 'text-[#A8A29E]'}>
                        {s?.memories_viewed ? 'Viewed' : 'Not Viewed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5]">
                      <span className="text-[#57534E]">Why I Love You:</span>
                      <span className={s?.why_love_viewed ? 'font-semibold text-emerald-700' : 'text-[#A8A29E]'}>
                        {s?.why_love_viewed ? 'Viewed' : 'Not Viewed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5]">
                      <span className="text-[#57534E]">My Letter:</span>
                      <span className={s?.letter_viewed ? 'font-semibold text-emerald-700' : 'text-[#A8A29E]'}>
                        {s?.letter_viewed ? 'Viewed' : 'Not Viewed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] sm:col-span-2">
                      <span className="text-[#57534E]">Photo Puzzle:</span>
                      <span className={s?.game_completed ? 'font-semibold text-emerald-700' : 'text-[#A8A29E]'}>
                        {s?.game_completed ? 'Completed' : 'Not Completed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proposal Answer & NO attempts */}
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-[#8C1D30] font-semibold">
                    Proposal Response
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F5E6E8]">
                      <span className="text-xs text-[#78716C] block mb-1">NO Attempts</span>
                      <span className="text-2xl font-serif font-bold text-[#8C1D30]">
                        {s?.no_attempts || 0}
                      </span>
                    </div>
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F5E6E8]">
                      <span className="text-xs text-[#78716C] block mb-1">Final Answer</span>
                      <span
                        className={`text-xl font-serif font-bold ${
                          s?.final_answer === 'YES' ? 'text-emerald-700' : 'text-[#78716C]'
                        }`}
                      >
                        {s?.final_answer || 'Not answered'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date & Completion Details */}
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm space-y-2 text-xs">
                  <h4 className="text-xs uppercase tracking-widest text-[#8C1D30] font-semibold mb-2">
                    Our Date
                  </h4>
                  <div className="flex justify-between py-1.5 border-b border-[#FAF5F0]">
                    <span className="text-[#78716C]">Selected Date:</span>
                    <span className="font-medium text-[#1C1917]">
                      {s?.selected_date || 'Not selected yet'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#FAF5F0]">
                    <span className="text-[#78716C]">Completed At:</span>
                    <span className="font-medium text-[#1C1917]">
                      {s?.completion_time ? new Date(s.completion_time).toLocaleString() : 'In progress'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#78716C]">Visitor Session ID:</span>
                    <span className="font-mono text-[10px] text-[#A8A29E] truncate max-w-[200px]">
                      {s?.session_id}
                    </span>
                  </div>
                </div>

                {/* Test Controls */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleResetSession}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#78716C] hover:text-[#1C1917] bg-white border border-[#E7CCD0] hover:bg-[#FAF8F5] transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Journey (For Testing)</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PHOTO MANAGEMENT (6 PHOTOS) */}
            {activeTab === 'photo' && (
              <div className="space-y-5 text-sm">
                <div className="text-center space-y-1">
                  <h4 className="font-serif text-lg text-[#1C1917]">
                    Our Memories Photos (6 Slots)
                  </h4>
                  <p className="text-xs text-[#78716C]">
                    Upload and manage up to 6 cherished memories for Kimmi's Polaroid album.
                  </p>
                </div>

                {/* 6 Slots Selection Grid */}
                <div className="grid grid-cols-6 gap-1.5 p-2 bg-[#FFF5F6] rounded-2xl border border-[#F3D8DC]">
                  {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                    const slotPhoto = summary?.photos?.[slotIdx] || (slotIdx === 0 && summary?.photo_configured ? '/api/photo' : null);
                    const isSelected = selectedSlot === slotIdx;
                    return (
                      <button
                        key={slotIdx}
                        onClick={() => {
                          setSelectedSlot(slotIdx);
                          setPhotoPreview(null);
                        }}
                        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-1 text-xs font-serif transition-all cursor-pointer overflow-hidden border ${
                          isSelected
                            ? 'border-[#8C1D30] bg-white shadow-sm ring-2 ring-[#8C1D30]/20'
                            : 'border-[#F3D8DC] bg-white/70 hover:bg-white text-[#78716C]'
                        }`}
                      >
                        {slotPhoto ? (
                          <img
                            src={slotPhoto}
                            alt={`Slot ${slotIdx + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="font-mono text-[11px] text-[#A8A29E]">#{slotIdx + 1}</span>
                        )}
                        <span
                          className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full ${
                            slotPhoto ? 'bg-emerald-500' : 'bg-stone-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Active Slot Header */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8C1D30]">
                    Editing Slot #{selectedSlot + 1} of 6
                  </span>
                  <span className="text-[11px] text-[#78716C]">
                    {(summary?.photos?.[selectedSlot] || (selectedSlot === 0 && summary?.photo_configured))
                      ? 'Custom photo uploaded'
                      : 'Showing romantic placeholder'}
                  </span>
                </div>

                {/* Active Photo Preview Container */}
                <div className="w-full aspect-[4/3] bg-white rounded-2xl border-2 border-dashed border-[#F3D8DC] p-2 flex flex-col items-center justify-center overflow-hidden relative">
                  {(photoPreview || summary?.photos?.[selectedSlot] || (selectedSlot === 0 && summary?.photo_configured)) ? (
                    <img
                      src={
                        photoPreview ||
                        summary?.photos?.[selectedSlot] ||
                        (selectedSlot === 0 ? `/api/photo?t=${Date.now()}` : '')
                      }
                      alt={`Memory Slot ${selectedSlot + 1} Preview`}
                      className="w-full h-full object-cover rounded-xl"
                      onError={() => setPhotoPreview(null)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4 text-[#78716C] space-y-2">
                      <ImageIcon className="w-10 h-10 text-[#8C1D30]/40 stroke-[1.5]" />
                      <p className="text-xs font-mono bg-[#FAF5F0] px-2 py-0.5 rounded text-[#8C1D30]">
                        OUR_MEMORIES_PHOTO #{selectedSlot + 1}
                      </p>
                      <p className="text-[11px] text-[#A8A29E] max-w-xs">
                        Currently displaying default placeholder for memory #{selectedSlot + 1}. Upload your special photo anytime.
                      </p>
                    </div>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center text-xs text-[#8C1D30] font-medium">
                      Uploading image...
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full py-3 rounded-xl font-serif text-sm font-medium text-white bg-[#8C1D30] hover:bg-[#6B1D2F] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo for Slot #{selectedSlot + 1}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleResetPhoto}
                      disabled={isUploading}
                      className="w-full py-2.5 rounded-xl font-serif text-xs font-medium text-[#78716C] hover:text-[#1C1917] bg-white border border-[#E7CCD0] hover:bg-[#FAF8F5] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Slot #{selectedSlot + 1}</span>
                    </button>

                    <button
                      onClick={handleResetAllPhotos}
                      disabled={isUploading}
                      className="w-full py-2.5 rounded-xl font-serif text-xs font-medium text-[#78716C] hover:text-[#8C1D30] bg-white border border-[#E7CCD0] hover:bg-[#FAF8F5] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All 6</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: VIDEO SURPRISE (FINALE) */}
            {activeTab === 'video' && (
              <div className="space-y-5">
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase tracking-widest text-[#8C1D30] font-semibold flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" />
                      <span>Finale Video Surprise</span>
                    </h4>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        hasCustomVideo
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#FFF5F6] text-[#8C1D30] border border-[#F3D8DC]'
                      }`}
                    >
                      {hasCustomVideo ? 'Custom Video Active ✨' : 'Default Romantic Preview'}
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    This video automatically plays as the emotional grand finale right after Kimmi confirms our date and clicks "Next".
                  </p>
                </div>

                {/* Video Player Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-[#1C1917] block">
                    Live Video Preview:
                  </span>
                  <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border-2 border-[#F3D8DC] shadow-md flex items-center justify-center">
                    {videoUrl ? (
                      <video
                        key={videoUrl}
                        src={videoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src="https://assets.mixkit.co/videos/preview/mixkit-sunset-over-the-ocean-and-a-calm-beach-40156-large.mp4"
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}

                    {isVideoUploading && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-2 z-20">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#FCE7EB]" />
                        <span>Uploading &amp; processing video...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Title & Caption */}
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8C1D30] block">
                    Video Titles &amp; Message
                  </span>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-[#78716C] block mb-1">
                        Video Display Title:
                      </label>
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={e => setVideoTitle(e.target.value)}
                        placeholder="e.g. Our Story in Motion ❤️"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7CCD0] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#8C1D30]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#78716C] block mb-1">
                        Caption / Note under Title:
                      </label>
                      <input
                        type="text"
                        value={videoCaption}
                        onChange={e => setVideoCaption(e.target.value)}
                        placeholder="e.g. Every second with you is a moment I want to remember forever."
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7CCD0] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#8C1D30]"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload or Link Option */}
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8C1D30] block">
                    Upload or Provide Video
                  </span>

                  {/* Option A: Direct File Upload */}
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    onChange={handleVideoFileChange}
                    accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/*"
                    className="hidden"
                  />

                  <button
                    onClick={() => videoFileInputRef.current?.click()}
                    disabled={isVideoUploading}
                    className="w-full py-3 px-4 rounded-xl font-serif text-sm font-medium text-white bg-[#8C1D30] hover:bg-[#6B1D2F] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Video File (.mp4, .mov, .webm)</span>
                  </button>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-[#F3D8DC] w-full" />
                    <span className="bg-white px-2 text-[11px] text-[#A8A29E] uppercase tracking-wider font-medium">
                      OR VIA VIDEO URL
                    </span>
                  </div>

                  {/* Option B: Direct URL */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={videoInputUrl}
                      onChange={e => setVideoInputUrl(e.target.value)}
                      placeholder="Paste direct MP4 or video URL (https://...)"
                      className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E7CCD0] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#8C1D30]"
                    />
                    <button
                      onClick={handleSaveVideoUrl}
                      disabled={isVideoUploading || !videoInputUrl.trim()}
                      className="px-4 py-2 bg-[#1C1917] hover:bg-black text-white text-xs font-medium rounded-xl transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save URL</span>
                    </button>
                  </div>

                  {/* Reset Video to Default */}
                  <div className="pt-2 border-t border-[#F3D8DC]/60">
                    <button
                      onClick={handleResetVideo}
                      disabled={isVideoUploading || !hasCustomVideo}
                      className="w-full py-2.5 rounded-xl font-serif text-xs font-medium text-[#78716C] hover:text-[#8C1D30] bg-white border border-[#E7CCD0] hover:bg-[#FAF8F5] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Default Romantic Video</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BACKGROUND MUSIC */}
            {activeTab === 'music' && (
              <div className="space-y-4 text-xs">
                {/* Audio Element for in-dashboard preview */}
                <audio
                  ref={dashboardAudioRef}
                  src={musicUrl}
                  onEnded={() => setIsMusicPreviewPlaying(false)}
                  onPause={() => setIsMusicPreviewPlaying(false)}
                  onPlay={() => setIsMusicPreviewPlaying(true)}
                />

                {/* Status Card */}
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8C1D30] flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" />
                      <span>Background Music Status</span>
                    </span>
                    <p className="text-[11px] text-[#78716C]">
                      Plays continuously from Page 1 through 2nd-to-last page (pauses on Video page)
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasCustomMusic ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Custom Music Active</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-[#8C1D30] border border-[#F3D8DC] text-[11px] font-medium flex items-center gap-1">
                        <span>Acoustic Piano (Default)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Preview Player */}
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#8C1D30] block">
                        Preview &amp; Listen
                      </span>
                      <p className="text-sm font-medium text-[#1C1917] mt-0.5 font-serif">
                        {musicTitle || 'Romantic Melody'}
                      </p>
                    </div>

                    <button
                      onClick={togglePreviewAudio}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C1D30] hover:bg-[#6B1D2F] text-white text-xs font-medium shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      {isMusicPreviewPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause Preview</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Listen Preview</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Native Audio Controls widget */}
                  <div className="w-full pt-1">
                    <audio
                      src={musicUrl}
                      controls
                      className="w-full h-9 rounded-lg"
                    />
                  </div>
                </div>

                {/* Music Song Title */}
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm space-y-2">
                  <label className="text-[11px] font-semibold text-[#8C1D30] uppercase tracking-wider block">
                    Song Title / Display Name:
                  </label>
                  <input
                    type="text"
                    value={musicTitle}
                    onChange={e => setMusicTitle(e.target.value)}
                    placeholder="e.g. Perfect - Ed Sheeran / Our Special Song 🎵"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7CCD0] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#8C1D30]"
                  />
                </div>

                {/* Upload or Link Option */}
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8C1D30] block">
                    Change Background Music
                  </span>

                  {/* Option A: Audio File Upload */}
                  <input
                    type="file"
                    ref={musicFileInputRef}
                    onChange={handleMusicFileChange}
                    accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/*"
                    className="hidden"
                  />

                  <button
                    onClick={() => musicFileInputRef.current?.click()}
                    disabled={isMusicUploading}
                    className="w-full py-3 px-4 rounded-xl font-serif text-sm font-medium text-white bg-[#8C1D30] hover:bg-[#6B1D2F] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Song / Music File (.mp3, .m4a, .wav)</span>
                  </button>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-[#F3D8DC] w-full" />
                    <span className="bg-white px-2 text-[11px] text-[#A8A29E] uppercase tracking-wider font-medium">
                      OR VIA DIRECT AUDIO LINK
                    </span>
                  </div>

                  {/* Option B: Direct Audio URL */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={musicInputUrl}
                      onChange={e => setMusicInputUrl(e.target.value)}
                      placeholder="Paste direct audio MP3 link (https://...)"
                      className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E7CCD0] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#8C1D30]"
                    />
                    <button
                      onClick={handleSaveMusicUrl}
                      disabled={isMusicUploading || !musicInputUrl.trim()}
                      className="px-4 py-2 bg-[#1C1917] hover:bg-black text-white text-xs font-medium rounded-xl transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Music</span>
                    </button>
                  </div>

                  {/* Reset to Default Acoustic Romantic Track */}
                  <div className="pt-2 border-t border-[#F3D8DC]/60">
                    <button
                      onClick={handleResetMusic}
                      disabled={isMusicUploading || !hasCustomMusic}
                      className="w-full py-2.5 rounded-xl font-serif text-xs font-medium text-[#78716C] hover:text-[#8C1D30] bg-white border border-[#E7CCD0] hover:bg-[#FAF8F5] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Default Romantic Piano Music</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: EMAIL & NOTIFICATIONS */}
            {activeTab === 'email' && (
              <div className="space-y-4 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-[#8C1D30] font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Notification System</span>
                  </h4>
                  <p className="text-[#78716C]">
                    Important events (Kimmi's YES answer, NO attempts, and chosen Date) are automatically dispatched securely from the server.
                  </p>

                  <div className="pt-2 border-t border-[#FAF5F0] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#78716C]">Owner Email:</span>
                      <span className="font-mono text-[#1C1917]">
                        {summary?.email_status.owner_email || 'Not configured in .env'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#78716C]">Transactional Provider:</span>
                      <span className="font-medium">
                        {summary?.email_status.resend_configured
                          ? 'Resend API (Live Active)'
                          : 'Console / Memory Logger (Mock safe fallback)'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleTestEmail}
                      className="w-full py-2 bg-[#FFF5F6] text-[#8C1D30] hover:bg-[#FCE7EB] border border-[#F3D8DC] rounded-xl font-medium transition-colors cursor-pointer"
                    >
                      Send Test Notification Email
                    </button>
                  </div>
                </div>

                {/* Recent Email Event Logs */}
                <div className="bg-white p-4 rounded-2xl border border-[#F3D8DC] shadow-sm space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-[#8C1D30] font-semibold">
                    Notification Dispatch Logs
                  </h4>
                  {summary?.email_logs && summary.email_logs.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {summary.email_logs.map(log => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#F5E6E8] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#1C1917] truncate max-w-[220px]">
                              {log.subject}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-mono ${
                                log.status === 'sent'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {log.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A8A29E]">
                            {new Date(log.sent_at).toLocaleTimeString()} • To: {log.to}
                          </p>
                          {log.details && (
                            <p className="text-[10px] text-[#78716C] font-mono">
                              {log.details}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#A8A29E] italic py-2">No email events recorded yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-[#F3D8DC] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-medium text-white bg-[#8C1D30] hover:bg-[#6B1D2F] transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
