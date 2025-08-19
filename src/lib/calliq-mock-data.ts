import { CallIQCall, CallIQStats, CallIQInsight, CallIQAnalysis } from '@/types/calliq';

// Single consistent call record used across all CallIQ pages
export const mockCall: CallIQCall = {
  id: 'call-001',
  user_id: 'user-123',
  company_id: 'company-456',
  title: 'Discovery Call - Acme Corp',
  date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  duration: 1830, // 30.5 minutes
  status: 'completed',
  outcome: 'won',
  created_at: new Date(Date.now() - 3600000).toISOString(),
  has_transcript: true,
  has_analysis: true,
  insights_count: 5,
  rep_name: 'Sarah Johnson',
  customer_name: 'Acme Corp',
  sentiment: 'positive',
  win_probability: 1.0, // 100% since the call was won
  talk_ratio: 0.42
};

// Mock transcript for the call
export const mockTranscript = {
  call_id: mockCall.id,
  segments: [
    {
      speaker: 'Rep',
      text: "Hi John, thank you for taking the time to speak with me today. I understand you're looking for a solution to help streamline your sales operations?",
      timestamp: 0,
      sentiment: 'positive'
    },
    {
      speaker: 'Customer',
      text: "Yes, exactly. We've been growing rapidly and our current tools just aren't keeping up. We need something that can scale with us.",
      timestamp: 15,
      sentiment: 'positive'
    },
    {
      speaker: 'Rep',
      text: "That's great to hear about your growth! Can you tell me more about your current sales process and where you're experiencing the most friction?",
      timestamp: 28,
      sentiment: 'neutral'
    },
    {
      speaker: 'Customer',
      text: "Our main challenges are around lead tracking and follow-ups. We're losing potential deals because things fall through the cracks.",
      timestamp: 40,
      sentiment: 'negative'
    },
    {
      speaker: 'Rep',
      text: "I completely understand. Our platform actually specializes in automated lead tracking and intelligent follow-up reminders. Let me show you how it works...",
      timestamp: 55,
      sentiment: 'positive'
    }
  ]
};

// Mock analysis for the call
export const mockAnalysis: CallIQAnalysis = {
  summary: 'Successful discovery call discussing enterprise software needs. Customer showed strong interest in our platform capabilities.',
  key_topics: ['Scalability', 'Security', 'API integration', 'Pricing'],
  sentiment_score: 0.75,
  talk_ratio: {
    rep: 0.42,
    customer: 0.58
  },
  win_probability: 1.0,
  action_items: [
    {
      id: 'action-001',
      description: 'Send pricing documentation',
      priority: 'high',
      completed: false
    },
    {
      id: 'action-002',
      description: 'Schedule technical demo with engineering team',
      priority: 'high',
      completed: false
    },
    {
      id: 'action-003',
      description: 'Share case studies from similar companies',
      priority: 'medium',
      completed: false
    }
  ],
  next_steps: [
    'Schedule technical demo for next week with their engineering team',
    'Send follow-up email with pricing information'
  ],
  coaching_tips: [
    'Great job building rapport in the opening',
    'Consider addressing budget concerns earlier in the conversation',
    'Excellent use of discovery questions'
  ],
  objections: [
    {
      id: 'obj-001',
      objection: 'Budget concerns',
      response: 'Highlighted ROI and flexible pricing options',
      resolved: true
    },
    {
      id: 'obj-002',
      objection: 'Integration complexity',
      response: 'Explained our comprehensive API and support team',
      resolved: true
    }
  ],
  competitors_mentioned: []
};

// Mock insights related to the call
export const mockInsights: CallIQInsight[] = [
  {
    id: 'insight-001',
    call_id: mockCall.id,
    type: 'opportunity',
    content: 'Call Won Successfully - This call was successfully won with positive engagement signals and customer commitment.',
    sentiment: 'positive',
    priority: 'high',
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'insight-002',
    call_id: mockCall.id,
    type: 'action_item',
    content: 'Follow-up Required - Customer requested pricing documentation and technical demo scheduling.',
    priority: 'high',
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'insight-003',
    call_id: mockCall.id,
    type: 'question',
    content: 'Talk Ratio Optimal - Rep spoke 42% of the time, which is within the optimal range of 40-45%.',
    sentiment: 'positive',
    priority: 'low',
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
];

// Mock stats for dashboard
export const mockStats: CallIQStats = {
  total_calls: 1,
  avg_win_rate: 1.0, // 100% win rate with 1 won call
  calls_today: 1,
  processing_count: 0,
  total_duration: 1830,
  team_performance_score: 85,
  calls_trend: [],
  win_rate_trend: [],
  sentiment_trend: []
};

// Empty arrays for pages that need lists
export const emptyCallsList: CallIQCall[] = [mockCall];
export const emptyInsightsList: CallIQInsight[] = mockInsights;