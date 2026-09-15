export interface ProposalSession {
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

export type PageId =
  | 'intro'
  | 'envelopes'
  | 'memories'
  | 'why_love'
  | 'letter'
  | 'game'
  | 'thank_you'
  | 'question'
  | 'pick_date'
  | 'date_confirmed'
  | 'video_reveal';

export interface OwnerSummary {
  session: ProposalSession;
  all_sessions_count: number;
  photo_configured: boolean;
  photos_count?: number;
  photos?: (string | null)[];
  video?: {
    custom_url: string | null;
    type?: 'file' | 'url';
    file_name?: string;
    title?: string;
    caption?: string;
    updated_at: string;
  };
  has_video?: boolean;
  music?: {
    custom_url: string | null;
    type?: 'file' | 'url';
    file_name?: string;
    title?: string;
    updated_at: string;
  };
  has_music?: boolean;
  email_status: {
    owner_email: string;
    resend_configured: boolean;
    owner_email_configured: boolean;
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
