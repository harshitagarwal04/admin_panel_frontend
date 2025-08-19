// CalliQ Types

export interface CallIQCall {
  id: string;
  user_id: string;
  company_id: string;
  title?: string;
  date: string;
  duration?: number; // in seconds
  recording_url?: string;
  original_filename?: string;
  file_size?: number; // in bytes
  status: 'uploaded' | 'transcribing' | 'analyzing' | 'completed' | 'failed';
  outcome?: 'won' | 'lost' | 'follow_up' | 'no_decision';
  error_message?: string;
  created_at: string;
  updated_at?: string;
  has_transcript: boolean;
  has_analysis: boolean;
  insights_count: number;
  
  // Expanded fields for detail view
  transcript?: CallIQTranscript;
  analysis?: CallIQAnalysis;
  insights?: CallIQInsight[];
  
  // Frontend computed fields
  rep_name?: string;
  customer_name?: string;
  talk_ratio?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  win_probability?: number;
}

export interface CallIQTranscript {
  full_text: string;
  segments: TranscriptSegment[];
  speakers: number[];
  speaker_count: number;
  duration: number;
  confidence: number;
  words_count: number;
  language: string;
  model_used: string;
  processing_time: number;
  paragraphs?: Paragraph[];
}

export interface TranscriptSegment {
  speaker: number;
  speaker_label: string;
  text: string;
  start: number;
  end: number;
  confidence: number;
  words?: Word[];
}

export interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface Paragraph {
  sentences: Sentence[];
  start: number;
  end: number;
  num_words: number;
}

export interface Sentence {
  text: string;
  start: number;
  end: number;
}

export interface CallIQAnalysis {
  summary: string;
  key_topics: string[];
  sentiment_score: number;
  talk_ratio: {
    rep: number;
    customer: number;
  };
  win_probability: number;
  action_items: ActionItem[];
  next_steps: string[];
  coaching_tips: string[];
  objections: Objection[];
  competitors_mentioned: CompetitorMention[];
  pricing_discussion?: PricingDiscussion;
}

export interface ActionItem {
  id: string;
  description: string;
  owner?: string;
  due_date?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface Objection {
  id: string;
  objection: string;
  response: string;
  resolved: boolean;
  timestamp?: number;
}

export interface CompetitorMention {
  competitor: string;
  context: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp?: number;
}

export interface PricingDiscussion {
  budget_mentioned?: number;
  discount_requested?: boolean;
  price_objection?: boolean;
  final_price?: number;
}

export interface CallIQInsight {
  id: string;
  call_id: string;
  type: 'objection' | 'topic' | 'action_item' | 'competitor' | 'risk' | 'opportunity' | 'question' | 'commitment';
  content: string;
  timestamp?: number; // seconds into the call
  speaker?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  priority?: 'high' | 'medium' | 'low';
  resolved?: boolean;
  insight_metadata?: Record<string, any>;
  created_at: string;
}

// Dashboard Stats
export interface CallIQStats {
  total_calls: number;
  avg_win_rate: number;
  calls_today: number;
  processing_count: number;
  total_duration: number; // in seconds
  team_performance_score: number;
  
  // Trends
  calls_trend: TrendData[];
  win_rate_trend: TrendData[];
  sentiment_trend: TrendData[];
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

// Rep Performance
export interface RepPerformance {
  id: string;
  name: string;
  avatar?: string;
  calls_analyzed: number;
  win_rate: number;
  avg_talk_ratio: number;
  top_strength: string;
  performance_score: number;
  rank?: number;
  trend: 'up' | 'down' | 'stable';
}

// Filters
export interface CallIQFilters {
  date_range?: {
    start: string;
    end: string;
  };
  status?: CallIQCall['status'][];
  reps?: string[];
  outcomes?: CallIQCall['outcome'][];
  search?: string;
  sort_by?: 'date' | 'duration' | 'win_probability' | 'sentiment';
  sort_order?: 'asc' | 'desc';
}

// Upload
export interface UploadRequest {
  file?: File;
  title?: string;
  metadata?: {
    rep_name?: string;
    customer_name?: string;
    date?: string;
    notes?: string;
  };
}

export interface BulkUploadRequest {
  csv_file: File;
}

export interface UploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  message?: string;
  error?: string;
  result?: CallIQCall;
}

// API Responses
export interface CallIQListResponse {
  calls: CallIQCall[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface CallIQInsightsResponse {
  insights: CallIQInsight[];
  grouped_by_type: Record<CallIQInsight['type'], CallIQInsight[]>;
  total: number;
}

// Similar Calls
export interface SimilarCall {
  call: CallIQCall;
  similarity_score: number;
  matching_patterns: string[];
}

// Patterns
export interface CallPattern {
  id: string;
  name: string;
  description: string;
  frequency: number; // across all calls
  success_rate: number;
  examples: PatternExample[];
  icon?: string;
}

export interface PatternExample {
  call_id: string;
  timestamp: number;
  text: string;
  outcome: 'positive' | 'negative';
}