import { ProposalSession, OwnerSummary } from '../types';

export function createFreshSessionId(): string {
  // Always create a fresh session id on page refresh so user journey starts anew every time
  const id = `kimmi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  try {
    sessionStorage.setItem('kimmi_active_session_id', id);
  } catch {}
  return id;
}

export function getOrCreateSessionId(): string {
  return createFreshSessionId();
}

export async function fetchProposalSession(sessionId: string): Promise<ProposalSession | null> {
  try {
    const res = await fetch(`/api/proposal?session_id=${encodeURIComponent(sessionId)}`);
    if (!res.ok) throw new Error('Failed to fetch session');
    const data = await res.json();
    return data.session || null;
  } catch (err) {
    console.warn('Could not fetch proposal session from backend, using local state:', err);
    return null;
  }
}

export async function sendProposalEvent(
  sessionId: string,
  eventType:
    | 'start'
    | 'memories_viewed'
    | 'why_love_viewed'
    | 'letter_viewed'
    | 'game_completed'
    | 'no_attempt'
    | 'final_answer'
    | 'selected_date',
  value?: any
): Promise<ProposalSession | null> {
  try {
    const res = await fetch('/api/proposal/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, event_type: eventType, value }),
    });
    if (!res.ok) throw new Error('Event submission failed');
    const data = await res.json();
    return data.session || null;
  } catch (err) {
    console.warn(`Could not sync event ${eventType} with backend:`, err);
    return null;
  }
}

export async function fetchPhotos(): Promise<(string | null)[]> {
  try {
    const res = await fetch('/api/photos');
    if (!res.ok) return [null, null, null, null, null, null];
    const data = await res.json();
    return data.photos || [null, null, null, null, null, null];
  } catch {
    return [null, null, null, null, null, null];
  }
}

export async function savePhotoAtIndex(
  index: number,
  photoUrl: string | null,
  reset = false
): Promise<(string | null)[]> {
  try {
    const res = await fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index, photo_url: photoUrl, reset }),
    });
    const data = await res.json();
    return data.photos || [null, null, null, null, null, null];
  } catch (err) {
    console.error('Failed to save photo at index:', err);
    return [null, null, null, null, null, null];
  }
}

export async function resetAllPhotos(): Promise<(string | null)[]> {
  try {
    const res = await fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_all: true }),
    });
    const data = await res.json();
    return data.photos || [null, null, null, null, null, null];
  } catch (err) {
    console.error('Failed to reset all photos:', err);
    return [null, null, null, null, null, null];
  }
}

export async function fetchPhoto(): Promise<string | null> {
  try {
    const res = await fetch('/api/photo');
    if (!res.ok) return null;
    const data = await res.json();
    return data.photo_url || null;
  } catch {
    return null;
  }
}

export async function savePhoto(photoUrl: string | null, reset = false): Promise<string | null> {
  try {
    const res = await fetch('/api/photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_url: photoUrl, reset }),
    });
    const data = await res.json();
    return data.photo_url || null;
  } catch (err) {
    console.error('Failed to save photo:', err);
    return null;
  }
}

export async function fetchOwnerSummary(sessionId: string): Promise<OwnerSummary | null> {
  try {
    const res = await fetch(`/api/owner/summary?session_id=${encodeURIComponent(sessionId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch owner summary:', err);
    return null;
  }
}

export async function verifyOwnerPassword(password: string): Promise<boolean> {
  try {
    const res = await fetch('/api/owner/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    return Boolean(data.authorized);
  } catch {
    return false;
  }
}

export interface VideoResponse {
  has_video: boolean;
  video_url: string | null;
  video?: {
    custom_url: string | null;
    type?: 'file' | 'url';
    file_name?: string;
    title?: string;
    caption?: string;
    updated_at: string;
  };
}

export async function fetchVideo(): Promise<VideoResponse> {
  try {
    const res = await fetch('/api/video');
    if (!res.ok) return { has_video: false, video_url: null };
    const data = await res.json();
    return {
      has_video: Boolean(data.has_video),
      video_url: data.video_url || null,
      video: data.video || null,
    };
  } catch (err) {
    console.error('Failed to fetch video:', err);
    return { has_video: false, video_url: null };
  }
}

export async function saveVideo(payload: {
  video_data?: string;
  video_url?: string;
  file_name?: string;
  title?: string;
  caption?: string;
  reset?: boolean;
}): Promise<VideoResponse> {
  try {
    const res = await fetch('/api/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return {
      has_video: Boolean(data.video_url),
      video_url: data.video_url || null,
      video: data.video || null,
    };
  } catch (err) {
    console.error('Failed to save video:', err);
    return { has_video: false, video_url: null };
  }
}

export async function resetSessionOnServer(sessionId: string): Promise<ProposalSession | null> {
  try {
    const res = await fetch('/api/owner/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
    const data = await res.json();
    return data.session;
  } catch (err) {
    console.error('Failed to reset session:', err);
    return null;
  }
}

export async function resetVideo(): Promise<VideoResponse> {
  return saveVideo({ reset: true });
}

export interface MusicResponse {
  has_music: boolean;
  is_custom?: boolean;
  music_url: string;
  music?: {
    custom_url: string | null;
    type?: 'file' | 'url';
    file_name?: string;
    title?: string;
    updated_at: string;
  } | null;
}

export async function fetchMusic(): Promise<MusicResponse> {
  try {
    const res = await fetch('/api/music');
    if (!res.ok) throw new Error('Failed to fetch music');
    const data = await res.json();
    return {
      has_music: Boolean(data.has_music),
      is_custom: Boolean(data.is_custom),
      music_url: data.music_url || '/default_music.mp3',
      music: data.music || null,
    };
  } catch (err) {
    console.warn('Could not fetch music from backend, using default fallback:', err);
    return { has_music: false, is_custom: false, music_url: '/default_music.mp3', music: null };
  }
}

export async function saveMusic(payload: {
  music_data?: string;
  music_url?: string;
  file_name?: string;
  title?: string;
  reset?: boolean;
}): Promise<MusicResponse> {
  try {
    const res = await fetch('/api/music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return {
      has_music: Boolean(data.is_custom),
      is_custom: Boolean(data.is_custom),
      music_url: data.music_url || '/default_music.mp3',
      music: data.music || null,
    };
  } catch (err) {
    console.error('Failed to save music:', err);
    return { has_music: false, is_custom: false, music_url: '/default_music.mp3', music: null };
  }
}

export async function resetMusic(): Promise<MusicResponse> {
  return saveMusic({ reset: true });
}

