import { ProposalSession, OwnerSummary } from '../types';

export function getOwnerToken(): string | null {
  try {
    return localStorage.getItem('owner_auth_taksh_token') || sessionStorage.getItem('owner_auth_taksh_token') || 'Taksh@28';
  } catch {
    return 'Taksh@28';
  }
}

export function setOwnerToken(token: string): void {
  try {
    localStorage.setItem('owner_auth_taksh_token', token);
    sessionStorage.setItem('owner_auth_taksh_token', token);
  } catch {}
}

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
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.photos)) {
        try {
          localStorage.setItem('cached_proposal_photos', JSON.stringify(data.photos));
        } catch {}
        return data.photos;
      }
    }
  } catch (e) {
    console.warn('Fetch photos failed, checking offline cache:', e);
  }

  // Fallback to local storage cache so media never flickers or vanishes on refresh
  try {
    const cached = localStorage.getItem('cached_proposal_photos');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return [null, null, null, null, null, null];
}

export async function savePhotoAtIndex(
  index: number,
  photoUrl: string | null,
  reset = false
): Promise<(string | null)[]> {
  try {
    const token = getOwnerToken();
    const res = await fetch('/api/photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Owner-Token': token || 'Taksh@28',
      },
      body: JSON.stringify({ index, photo_url: photoUrl, reset }),
    });
    const data = await res.json();
    if (data.photos && Array.isArray(data.photos)) {
      try {
        localStorage.setItem('cached_proposal_photos', JSON.stringify(data.photos));
      } catch {}
      return data.photos;
    }
  } catch (err) {
    console.error('Failed to save photo at index:', err);
  }
  return [null, null, null, null, null, null];
}

export async function resetAllPhotos(): Promise<(string | null)[]> {
  try {
    const token = getOwnerToken();
    const res = await fetch('/api/photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Owner-Token': token || 'Taksh@28',
      },
      body: JSON.stringify({ reset_all: true }),
    });
    const data = await res.json();
    const emptyList = [null, null, null, null, null, null];
    try {
      localStorage.setItem('cached_proposal_photos', JSON.stringify(emptyList));
    } catch {}
    return data.photos || emptyList;
  } catch (err) {
    console.error('Failed to reset all photos:', err);
    return [null, null, null, null, null, null];
  }
}

export async function fetchPhoto(): Promise<string | null> {
  const photos = await fetchPhotos();
  return photos[0] || null;
}

export async function savePhoto(photoUrl: string | null, reset = false): Promise<string | null> {
  const photos = await savePhotoAtIndex(0, photoUrl, reset);
  return photos[0] || null;
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
    if (data.authorized) {
      setOwnerToken(password);
      return true;
    }
    return false;
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
    if (res.ok) {
      const data = await res.json();
      const result: VideoResponse = {
        has_video: Boolean(data.has_video),
        video_url: data.video_url || null,
        video: data.video || null,
      };
      try {
        localStorage.setItem('cached_proposal_video', JSON.stringify(result));
      } catch {}
      return result;
    }
  } catch (err) {
    console.warn('Could not fetch video from backend, checking cache:', err);
  }

  try {
    const cached = localStorage.getItem('cached_proposal_video');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  return { has_video: false, video_url: null };
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
    const token = getOwnerToken();
    const res = await fetch('/api/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Owner-Token': token || 'Taksh@28',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const result: VideoResponse = {
      has_video: Boolean(data.video_url),
      video_url: data.video_url || null,
      video: data.video || null,
    };
    try {
      localStorage.setItem('cached_proposal_video', JSON.stringify(result));
    } catch {}
    return result;
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
  const result = await saveVideo({ reset: true });
  try {
    localStorage.removeItem('cached_proposal_video');
  } catch {}
  return result;
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
    if (res.ok) {
      const data = await res.json();
      const result: MusicResponse = {
        has_music: Boolean(data.has_music),
        is_custom: Boolean(data.is_custom),
        music_url: data.music_url || '/default_music.mp3',
        music: data.music || null,
      };
      try {
        localStorage.setItem('cached_proposal_music', JSON.stringify(result));
      } catch {}
      return result;
    }
  } catch (err) {
    console.warn('Could not fetch music from backend, checking cache:', err);
  }

  try {
    const cached = localStorage.getItem('cached_proposal_music');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  return { has_music: false, is_custom: false, music_url: '/default_music.mp3', music: null };
}

export async function saveMusic(payload: {
  music_data?: string;
  music_url?: string;
  file_name?: string;
  title?: string;
  reset?: boolean;
}): Promise<MusicResponse> {
  try {
    const token = getOwnerToken();
    const res = await fetch('/api/music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Owner-Token': token || 'Taksh@28',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const result: MusicResponse = {
      has_music: Boolean(data.is_custom),
      is_custom: Boolean(data.is_custom),
      music_url: data.music_url || '/default_music.mp3',
      music: data.music || null,
    };
    try {
      localStorage.setItem('cached_proposal_music', JSON.stringify(result));
    } catch {}
    return result;
  } catch (err) {
    console.error('Failed to save music:', err);
    return { has_music: false, is_custom: false, music_url: '/default_music.mp3', music: null };
  }
}

export async function resetMusic(): Promise<MusicResponse> {
  const result = await saveMusic({ reset: true });
  try {
    localStorage.removeItem('cached_proposal_music');
  } catch {}
  return result;
}

