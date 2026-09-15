import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// High body limit for base64 photo and video uploads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Ensure data directory exists for persistence
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

const STORAGE_FILE = path.join(DATA_DIR, 'proposal_db.json');

interface ProposalSession {
  id: string;
  session_id: string;
  proposal_started: boolean;
  memories_viewed: boolean;
  why_love_viewed: boolean;
  letter_viewed: boolean;
  game_completed: boolean;
  no_attempts: number;
  final_answer: 'YES' | 'NO' | 'Not answered';
  selected_date: string | null;
  created_at: string;
  updated_at: string;
  completion_time: string | null;
}

interface DBStructure {
  sessions: Record<string, ProposalSession>;
  photos: (string | null)[];
  photo: {
    custom_url: string | null;
    updated_at: string;
  };
  video?: {
    custom_url: string | null;
    type?: 'file' | 'url';
    file_name?: string;
    title?: string;
    caption?: string;
    updated_at: string;
  };
  music?: {
    custom_url: string | null;
    type?: 'file' | 'url';
    file_name?: string;
    title?: string;
    updated_at: string;
  };
  email_logs: Array<{
    id: string;
    type: string;
    subject: string;
    to: string;
    sent_at: string;
    status: 'sent' | 'skipped' | 'failed' | 'logged_only';
    details?: string;
  }>;
}

function loadDB(): DBStructure {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed.photos)) {
        parsed.photos = [parsed.photo?.custom_url || null, null, null, null, null, null];
      }
      while (parsed.photos.length < 6) {
        parsed.photos.push(null);
      }
      if (!parsed.video) {
        parsed.video = {
          custom_url: null,
          type: 'url',
          updated_at: new Date().toISOString(),
        };
      }
      if (!parsed.music) {
        parsed.music = {
          custom_url: null,
          type: 'url',
          title: 'Romantic Piano Melody 🎵',
          updated_at: new Date().toISOString(),
        };
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading storage, resetting:', e);
  }

  const initialDB: DBStructure = {
    sessions: {},
    photos: [null, null, null, null, null, null],
    photo: {
      custom_url: null,
      updated_at: new Date().toISOString(),
    },
    video: {
      custom_url: null,
      type: 'url',
      updated_at: new Date().toISOString(),
    },
    music: {
      custom_url: null,
      type: 'url',
      title: 'Romantic Piano Melody 🎵',
      updated_at: new Date().toISOString(),
    },
    email_logs: [],
  };
  saveDB(initialDB);
  return initialDB;
}

function saveDB(db: DBStructure) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving storage:', e);
  }
}

// Memory cache
let db = loadDB();

// Helper to get or create a proposal session
function getOrCreateSession(sessionId: string): ProposalSession {
  if (!sessionId) {
    sessionId = 'default-kimmi-session';
  }
  if (!db.sessions[sessionId]) {
    const now = new Date().toISOString();
    db.sessions[sessionId] = {
      id: `prop_${Date.now()}`,
      session_id: sessionId,
      proposal_started: true,
      memories_viewed: false,
      why_love_viewed: false,
      letter_viewed: false,
      game_completed: false,
      no_attempts: 0,
      final_answer: 'Not answered',
      selected_date: null,
      created_at: now,
      updated_at: now,
      completion_time: null,
    };
    saveDB(db);
  }
  return db.sessions[sessionId];
}

// -----------------------------------------------------------------------------
// Transactional Email Service (Resend or graceful server-side logging)
// -----------------------------------------------------------------------------
async function sendProposalEmail(params: {
  type: 'YES' | 'DATE' | 'EVENT';
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}) {
  const ownerEmail = process.env.OWNER_EMAIL || '';
  const resendApiKey = process.env.RESEND_API_KEY || '';

  const logEntry = {
    id: `email_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: params.type,
    subject: params.subject,
    to: ownerEmail || 'owner (unconfigured)',
    sent_at: new Date().toISOString(),
    status: 'logged_only' as 'sent' | 'skipped' | 'failed' | 'logged_only',
    details: '',
  };

  console.log(`[Email Notification Triggered] Subject: "${params.subject}"`);
  console.log(`To: ${ownerEmail || '(OWNER_EMAIL not set in env)'}`);
  console.log(`Body:\n${params.bodyText}`);

  if (!ownerEmail || !resendApiKey) {
    logEntry.status = 'logged_only';
    logEntry.details = !ownerEmail
      ? 'OWNER_EMAIL not configured in .env'
      : 'RESEND_API_KEY not configured in .env';
    db.email_logs.unshift(logEntry);
    if (db.email_logs.length > 50) db.email_logs.pop();
    saveDB(db);
    return { success: true, simulated: true, reason: logEntry.details };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Proposal Love Note <onboarding@resend.dev>',
        to: [ownerEmail],
        subject: params.subject,
        text: params.bodyText,
        html: params.bodyHtml || `<pre style="font-family: sans-serif; white-space: pre-wrap;">${params.bodyText}</pre>`,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      logEntry.status = 'sent';
      logEntry.details = `Delivered via Resend ID: ${data?.id || 'ok'}`;
      db.email_logs.unshift(logEntry);
      if (db.email_logs.length > 50) db.email_logs.pop();
      saveDB(db);
      return { success: true, resendId: data?.id };
    } else {
      const errText = await response.text();
      console.warn('Resend API response not OK:', errText);
      logEntry.status = 'failed';
      logEntry.details = `Resend error: ${errText.slice(0, 150)}`;
      db.email_logs.unshift(logEntry);
      saveDB(db);
      return { success: false, error: errText };
    }
  } catch (err: any) {
    console.error('Email sending exception (handled gracefully):', err?.message || err);
    logEntry.status = 'failed';
    logEntry.details = err?.message || 'Network failure';
    db.email_logs.unshift(logEntry);
    saveDB(db);
    return { success: false, error: err?.message };
  }
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// 1. Get or initialize proposal state
app.get('/api/proposal', (req, res) => {
  const sessionId = (req.query.session_id as string) || 'default-kimmi-session';
  const session = getOrCreateSession(sessionId);
  res.json({ success: true, session });
});

// 2. Update proposal event
app.post('/api/proposal/event', async (req, res) => {
  try {
    const { session_id, event_type, value } = req.body;
    const session = getOrCreateSession(session_id || 'default-kimmi-session');
    const now = new Date().toISOString();
    session.updated_at = now;

    let emailTriggered = false;

    switch (event_type) {
      case 'start':
        session.proposal_started = true;
        break;

      case 'memories_viewed':
        session.memories_viewed = true;
        break;

      case 'why_love_viewed':
        session.why_love_viewed = true;
        break;

      case 'letter_viewed':
        session.letter_viewed = true;
        break;

      case 'game_completed':
        session.game_completed = true;
        break;

      case 'no_attempt':
        session.no_attempts = (session.no_attempts || 0) + 1;
        break;

      case 'final_answer':
        session.final_answer = value === 'YES' ? 'YES' : 'NO';
        session.completion_time = now;

        if (session.final_answer === 'YES') {
          // Send YES Email
          const bodyText = `Kimmi's Proposal Response ❤️

Final Answer: YES ❤️
NO Attempts: ${session.no_attempts}
Our Memories: ${session.memories_viewed ? 'viewed' : 'not viewed'}
Why I Love You: ${session.why_love_viewed ? 'viewed' : 'not viewed'}
My Letter: ${session.letter_viewed ? 'viewed' : 'not viewed'}
Photo Puzzle: ${session.game_completed ? 'completed' : 'not completed'}
Selected Date: ${session.selected_date || 'Pending date selection'}
Completed At: ${new Date(now).toLocaleString()}
`;

          const bodyHtml = `
<div style="background-color: #FDFBF7; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1C1917; max-width: 540px; margin: auto; border-radius: 16px; border: 1px solid #F5E6E8;">
  <div style="text-align: center; margin-bottom: 24px;">
    <span style="font-size: 40px;">💕</span>
    <h1 style="color: #8C1D30; font-size: 26px; margin: 12px 0 4px 0;">Kimmi Said YES! ❤️</h1>
    <p style="color: #78716C; font-size: 14px; margin: 0;">Kimmi's Official Proposal Response</p>
  </div>
  
  <div style="background-color: #FFFFFF; border-radius: 12px; padding: 20px; border: 1px solid #F3D8DC; box-shadow: 0 4px 12px rgba(140, 29, 48, 0.05);">
    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #FAF5F0; padding-bottom: 8px;">
      <strong style="color: #6B1D2F;">Final Answer:</strong>
      <span style="color: #8C1D30; font-weight: bold; background: #FCE7EB; padding: 2px 10px; border-radius: 12px;">YES ❤️</span>
    </div>
    <div style="margin-bottom: 8px;"><strong>NO Attempts:</strong> ${session.no_attempts} playful try(s)</div>
    <div style="margin-bottom: 8px;"><strong>Our Memories:</strong> ${session.memories_viewed ? '✅ Viewed' : 'Not viewed'}</div>
    <div style="margin-bottom: 8px;"><strong>Why I Love You:</strong> ${session.why_love_viewed ? '✅ Viewed' : 'Not viewed'}</div>
    <div style="margin-bottom: 8px;"><strong>My Letter:</strong> ${session.letter_viewed ? '✅ Viewed' : 'Not viewed'}</div>
    <div style="margin-bottom: 8px;"><strong>Photo Puzzle:</strong> ${session.game_completed ? '✅ Completed' : 'Not completed'}</div>
    <div style="margin-bottom: 8px;"><strong>Completed At:</strong> ${new Date(now).toLocaleString()}</div>
  </div>
  
  <p style="text-align: center; color: #A8A29E; font-size: 12px; margin-top: 24px;">
    Forever Partner Digital Proposal Experience
  </p>
</div>
`;
          sendProposalEmail({
            type: 'YES',
            subject: '💕 Kimmi Said YES!',
            bodyText,
            bodyHtml,
          }).catch(() => {});
          emailTriggered = true;
        }
        break;

      case 'selected_date':
        session.selected_date = value;
        session.completion_time = now;

        // Send Date Email
        const dateBodyText = `Kimmi picked a date ❤️

Selected Date:
${value}

Proposal Status:
YES ❤️

NO Attempts:
${session.no_attempts}
`;

        const dateBodyHtml = `
<div style="background-color: #FDFBF7; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1C1917; max-width: 540px; margin: auto; border-radius: 16px; border: 1px solid #F5E6E8;">
  <div style="text-align: center; margin-bottom: 24px;">
    <span style="font-size: 40px;">📅</span>
    <h1 style="color: #8C1D30; font-size: 26px; margin: 12px 0 4px 0;">Kimmi Picked a Date! ❤️</h1>
    <p style="color: #78716C; font-size: 14px; margin: 0;">Our celebration date is officially locked in</p>
  </div>
  
  <div style="background-color: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #F3D8DC; text-align: center; box-shadow: 0 4px 12px rgba(140, 29, 48, 0.05);">
    <p style="color: #78716C; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 0;">Officially Set For</p>
    <div style="color: #8C1D30; font-size: 24px; font-weight: 700; margin-bottom: 16px;">${value}</div>
    <div style="font-size: 14px; color: #44403C;">
      <span>Proposal Status: <strong>YES ❤️</strong></span> • 
      <span>NO Attempts: <strong>${session.no_attempts}</strong></span>
    </div>
  </div>
  
  <p style="text-align: center; color: #A8A29E; font-size: 12px; margin-top: 24px;">
    "I can't wait. 🫠❤️"
  </p>
</div>
`;
        sendProposalEmail({
          type: 'DATE',
          subject: '📅 Kimmi Picked a Date!',
          bodyText: dateBodyText,
          bodyHtml: dateBodyHtml,
        }).catch(() => {});
        emailTriggered = true;
        break;
    }

    saveDB(db);
    res.json({ success: true, session, emailTriggered });
  } catch (err: any) {
    console.error('Error handling proposal event:', err);
    res.status(200).json({ success: false, error: err?.message });
  }
});

// 3. Photo endpoints (6 photos support)
app.get('/api/photos', (req, res) => {
  res.json({
    success: true,
    photos: db.photos || [null, null, null, null, null, null],
  });
});

app.post('/api/photos', (req, res) => {
  try {
    const { index, photo_url, reset, reset_all } = req.body;
    if (!Array.isArray(db.photos)) {
      db.photos = [null, null, null, null, null, null];
    }

    if (reset_all) {
      db.photos = [null, null, null, null, null, null];
      db.photo = { custom_url: null, updated_at: new Date().toISOString() };
    } else if (typeof index === 'number' && index >= 0 && index < 6) {
      if (reset) {
        db.photos[index] = null;
      } else if (photo_url) {
        db.photos[index] = photo_url;
      }
      if (index === 0) {
        db.photo = { custom_url: db.photos[0], updated_at: new Date().toISOString() };
      }
    }

    saveDB(db);
    res.json({
      success: true,
      photos: db.photos,
    });
  } catch (err: any) {
    console.error('Error updating photos:', err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Legacy single photo endpoints (syncs with slot 0)
app.get('/api/photo', (req, res) => {
  res.json({
    success: true,
    photo_url: db.photos?.[0] || db.photo?.custom_url || null,
    updated_at: db.photo?.updated_at || null,
  });
});

app.post('/api/photo', (req, res) => {
  try {
    const { photo_url, reset } = req.body;
    if (!Array.isArray(db.photos)) {
      db.photos = [null, null, null, null, null, null];
    }
    if (reset) {
      db.photo = {
        custom_url: null,
        updated_at: new Date().toISOString(),
      };
      db.photos[0] = null;
    } else if (photo_url) {
      db.photo = {
        custom_url: photo_url,
        updated_at: new Date().toISOString(),
      };
      db.photos[0] = photo_url;
    }
    saveDB(db);
    res.json({
      success: true,
      photo_url: db.photo.custom_url,
      updated_at: db.photo.updated_at,
    });
  } catch (err: any) {
    console.error('Error updating photo:', err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 4. Owner password verification
app.post('/api/owner/verify-password', (req, res) => {
  const { password } = req.body;
  if (password === 'Taksh@28') {
    return res.json({ success: true, authorized: true });
  }
  return res.status(401).json({ success: false, authorized: false, error: 'Incorrect password' });
});

// Video Endpoints
app.get('/api/video', (req, res) => {
  const videoFilePath = path.join(DATA_DIR, 'uploaded_video.mp4');
  const fileExists = fs.existsSync(videoFilePath);
  const customUrl = db.video?.custom_url;
  const hasVideo = Boolean((customUrl && customUrl !== '/api/video/file') || fileExists);
  
  let activeUrl: string | null = null;
  if (fileExists) {
    activeUrl = `/api/video/file?t=${encodeURIComponent(db.video?.updated_at || Date.now().toString())}`;
  } else if (customUrl) {
    activeUrl = customUrl;
  }

  res.json({
    success: true,
    has_video: hasVideo,
    video: db.video || null,
    video_url: activeUrl,
  });
});

// Stream uploaded video with HTTP 206 Range headers for smooth playback
app.get('/api/video/file', (req, res) => {
  const videoFilePath = path.join(DATA_DIR, 'uploaded_video.mp4');
  if (!fs.existsSync(videoFilePath)) {
    return res.status(404).send('Video not found');
  }

  try {
    const stat = fs.statSync(videoFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(videoFilePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      fileStream.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoFilePath).pipe(res);
    }
  } catch (err) {
    console.error('Error streaming video file:', err);
    res.status(500).send('Error streaming video');
  }
});

app.post('/api/video', (req, res) => {
  try {
    const { video_data, video_url, file_name, title, caption, reset } = req.body;
    const videoFilePath = path.join(DATA_DIR, 'uploaded_video.mp4');

    if (reset) {
      if (fs.existsSync(videoFilePath)) {
        try {
          fs.unlinkSync(videoFilePath);
        } catch (e) {
          console.error('Failed to unlink video file:', e);
        }
      }
      db.video = {
        custom_url: null,
        type: 'url',
        title: '',
        caption: '',
        updated_at: new Date().toISOString(),
      };
      saveDB(db);
      return res.json({ success: true, video: db.video, video_url: null });
    }

    if (video_data) {
      const matches = video_data.match(/^data:(video\/[a-zA-Z0-9.-]+);base64,(.+)$/);
      let buffer: Buffer;
      if (matches && matches[2]) {
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(video_data.replace(/^data:[^;]+;base64,/, ''), 'base64');
      }
      fs.writeFileSync(videoFilePath, buffer);
      db.video = {
        custom_url: '/api/video/file',
        type: 'file',
        file_name: file_name || 'our_video.mp4',
        title: title || 'Our Story ❤️',
        caption: caption || 'Forever & Always',
        updated_at: new Date().toISOString(),
      };
      saveDB(db);
      return res.json({
        success: true,
        video: db.video,
        video_url: `/api/video/file?t=${Date.now()}`,
      });
    }

    if (video_url) {
      if (fs.existsSync(videoFilePath)) {
        try {
          fs.unlinkSync(videoFilePath);
        } catch (e) {}
      }
      db.video = {
        custom_url: video_url.trim(),
        type: 'url',
        file_name: file_name || '',
        title: title || 'Our Story ❤️',
        caption: caption || 'Forever & Always',
        updated_at: new Date().toISOString(),
      };
      saveDB(db);
      return res.json({
        success: true,
        video: db.video,
        video_url: db.video.custom_url,
      });
    }

    res.status(400).json({ success: false, error: 'No video payload or URL provided' });
  } catch (err: any) {
    console.error('Error saving video:', err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Music Endpoints
app.get('/api/music', (req, res) => {
  const musicFilePath = path.join(DATA_DIR, 'uploaded_music.mp3');
  const fileExists = fs.existsSync(musicFilePath);
  const customUrl = db.music?.custom_url;
  const isCustom = Boolean((customUrl && customUrl !== '/default_music.mp3' && customUrl !== '/api/music/file') || fileExists);

  let activeUrl = '/default_music.mp3';
  if (fileExists) {
    activeUrl = `/api/music/file?t=${encodeURIComponent(db.music?.updated_at || Date.now().toString())}`;
  } else if (customUrl) {
    activeUrl = customUrl;
  }

  res.json({
    success: true,
    has_music: isCustom,
    is_custom: isCustom,
    music: db.music || null,
    music_url: activeUrl,
    default_url: '/default_music.mp3',
  });
});

// Stream uploaded music with HTTP 206 Range headers for fast buffering & smooth audio
app.get('/api/music/file', (req, res) => {
  const musicFilePath = path.join(DATA_DIR, 'uploaded_music.mp3');
  if (!fs.existsSync(musicFilePath)) {
    return res.status(404).send('Music file not found');
  }

  try {
    const stat = fs.statSync(musicFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(musicFilePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg',
      };
      res.writeHead(206, head);
      fileStream.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      };
      res.writeHead(200, head);
      fs.createReadStream(musicFilePath).pipe(res);
    }
  } catch (err) {
    console.error('Error streaming music file:', err);
    res.status(500).send('Error streaming music');
  }
});

app.post('/api/music', (req, res) => {
  try {
    const { music_data, music_url, file_name, title, reset } = req.body;
    const musicFilePath = path.join(DATA_DIR, 'uploaded_music.mp3');

    if (reset) {
      if (fs.existsSync(musicFilePath)) {
        try {
          fs.unlinkSync(musicFilePath);
        } catch (e) {
          console.error('Failed to unlink music file:', e);
        }
      }
      db.music = {
        custom_url: null,
        type: 'url',
        title: 'Romantic Piano Melody 🎵',
        updated_at: new Date().toISOString(),
      };
      saveDB(db);
      return res.json({
        success: true,
        music: db.music,
        music_url: '/default_music.mp3',
        is_custom: false,
      });
    }

    if (music_data) {
      const matches = music_data.match(/^data:(audio\/[a-zA-Z0-9.-]+);base64,(.+)$/);
      let buffer: Buffer;
      if (matches && matches[2]) {
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(music_data.replace(/^data:[^;]+;base64,/, ''), 'base64');
      }
      fs.writeFileSync(musicFilePath, buffer);
      db.music = {
        custom_url: '/api/music/file',
        type: 'file',
        file_name: file_name || 'custom_music.mp3',
        title: title || 'Our Romantic Song 🎵',
        updated_at: new Date().toISOString(),
      };
      saveDB(db);
      return res.json({
        success: true,
        music: db.music,
        music_url: `/api/music/file?t=${Date.now()}`,
        is_custom: true,
      });
    }

    if (music_url) {
      if (fs.existsSync(musicFilePath)) {
        try {
          fs.unlinkSync(musicFilePath);
        } catch (e) {}
      }
      db.music = {
        custom_url: music_url.trim(),
        type: 'url',
        file_name: file_name || '',
        title: title || 'Our Romantic Song 🎵',
        updated_at: new Date().toISOString(),
      };
      saveDB(db);
      return res.json({
        success: true,
        music: db.music,
        music_url: db.music.custom_url,
        is_custom: true,
      });
    }

    res.status(400).json({ success: false, error: 'No music payload or URL provided' });
  } catch (err: any) {
    console.error('Error saving music:', err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 5. Owner summary endpoint
app.get('/api/owner/summary', (req, res) => {
  const sessionId = (req.query.session_id as string) || 'default-kimmi-session';
  const session = getOrCreateSession(sessionId);

  const ownerEmailConfigured = Boolean(process.env.OWNER_EMAIL);
  const resendKeyConfigured = Boolean(process.env.RESEND_API_KEY);

  const photosList = db.photos || [null, null, null, null, null, null];
  const photosCount = photosList.filter(Boolean).length;
  const videoFileExists = fs.existsSync(path.join(DATA_DIR, 'uploaded_video.mp4'));
  const hasVideo = Boolean((db.video?.custom_url && db.video.custom_url !== '/api/video/file') || videoFileExists);
  const musicFileExists = fs.existsSync(path.join(DATA_DIR, 'uploaded_music.mp3'));
  const hasMusic = Boolean((db.music?.custom_url && db.music.custom_url !== '/default_music.mp3') || musicFileExists);

  res.json({
    success: true,
    session,
    all_sessions_count: Object.keys(db.sessions).length,
    photo_configured: photosCount > 0,
    photos_count: photosCount,
    photos: photosList,
    video: db.video || null,
    has_video: hasVideo,
    music: db.music || null,
    has_music: hasMusic,
    email_status: {
      owner_email: process.env.OWNER_EMAIL || 'Not configured in .env',
      resend_configured: resendKeyConfigured,
      owner_email_configured: ownerEmailConfigured,
    },
    email_logs: db.email_logs.slice(0, 15),
  });
});

// 6. Test email dispatcher or manual trigger for owner
app.post('/api/owner/test-email', async (req, res) => {
  const result = await sendProposalEmail({
    type: 'EVENT',
    subject: '💌 Test Notification from Kimmi\'s Proposal Website',
    bodyText: 'This is a test notification verifying your email configuration on the proposal site.',
  });
  res.json({ success: true, result });
});

// 6. Reset session helper for owner testing
app.post('/api/owner/reset', (req, res) => {
  const { session_id } = req.body;
  const targetId = session_id || 'default-kimmi-session';
  const now = new Date().toISOString();
  db.sessions[targetId] = {
    id: `prop_${Date.now()}`,
    session_id: targetId,
    proposal_started: true,
    memories_viewed: false,
    why_love_viewed: false,
    letter_viewed: false,
    game_completed: false,
    no_attempts: 0,
    final_answer: 'Not answered',
    selected_date: null,
    created_at: now,
    updated_at: now,
    completion_time: null,
  };
  saveDB(db);
  res.json({ success: true, session: db.sessions[targetId] });
});

// -----------------------------------------------------------------------------
// Vite Server Integration
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Romantic Proposal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
