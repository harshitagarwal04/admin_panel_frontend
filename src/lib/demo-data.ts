// Simplified demo data for CalliQ public demo

export interface DemoRep {
  id: string;
  name: string;
  avatar: string;
  winRate: number;
  calls: number;
  revenue: number;
  trend: 'up' | 'down';
}

// Simplified team metrics
export const teamMetrics = {
  totalCalls: 1247,
  avgWinRate: 63,
  previousWinRate: 47,
  topPerformer: 'Raj Sharma',
  revenue: 4500000, // ₹45L
  previousRevenue: 3200000, // ₹32L
};

// Just 3 reps for simplicity
export const demoReps: DemoRep[] = [
  {
    id: 'rep-1',
    name: 'Raj Sharma',
    avatar: 'RS',
    winRate: 78,
    calls: 312,
    revenue: 2100000,
    trend: 'up'
  },
  {
    id: 'rep-2',
    name: 'Priya Patel',
    avatar: 'PP',
    winRate: 71,
    calls: 289,
    revenue: 1800000,
    trend: 'up'
  },
  {
    id: 'rep-3',
    name: 'Amit Kumar',
    avatar: 'AK',
    winRate: 45,
    calls: 256,
    revenue: 980000,
    trend: 'down'
  }
];

// Key insights to show value
export const keyInsights = [
  {
    title: 'Discovery Questions',
    insight: 'Top performers ask 3x more discovery questions',
    impact: '+27% higher win rate',
    icon: '💡'
  },
  {
    title: 'Next Steps',
    insight: '91% of won deals have clear next steps',
    impact: '2x faster close time',
    icon: '🎯'
  },
  {
    title: 'Talk Time',
    insight: 'Best reps talk only 40-45% of the time',
    impact: '+35% better engagement',
    icon: '⏱️'
  }
];

// Sample analysis results for different call types
export const analysisResultsByCallType = {
  // Enterprise Software Demo call
  1: {
    winProbability: 85,
    strengths: [
      'Excellent product demonstration flow',
      'Addressed all technical requirements',
      'Strong ROI calculation presented',
      'Got buy-in from technical stakeholder'
    ],
    improvements: [
      'Involve decision maker earlier',
      'Clarify implementation timeline',
      'Discuss support SLA options'
    ],
    keyMoments: [
      { time: '5:12', event: 'Customer excited about integration capabilities', type: 'opportunity' },
      { time: '15:30', event: 'Technical team expressed concerns about migration', type: 'objection' },
      { time: '22:45', event: 'CFO joined and asked about pricing', type: 'opportunity' },
      { time: '28:10', event: 'Scheduled proof of concept for next week', type: 'commitment' }
    ]
  },
  
  // Pricing Negotiation call
  2: {
    winProbability: 68,
    strengths: [
      'Maintained value focus during price discussion',
      'Offered flexible payment terms',
      'Highlighted competitor pricing disadvantages'
    ],
    improvements: [
      'Quantify specific cost savings better',
      'Prepare more case studies for similar companies',
      'Have approval for larger discount ready',
      'Create urgency with time-limited offer'
    ],
    keyMoments: [
      { time: '2:30', event: 'Customer asked for 30% discount immediately', type: 'objection' },
      { time: '8:15', event: 'Mentioned competitor offering lower price', type: 'objection' },
      { time: '18:20', event: 'Agreed to 15% discount with annual payment', type: 'commitment' },
      { time: '25:00', event: 'Customer wants to think about it', type: 'objection' }
    ]
  },
  
  // Discovery Call
  3: {
    winProbability: 92,
    strengths: [
      'Asked 18 high-quality discovery questions',
      'Uncovered 3 critical pain points',
      'Built strong rapport with prospect',
      'Identified complete buying committee',
      'Discovered budget and timeline'
    ],
    improvements: [
      'Could have explored competition more',
      'Schedule next step during the call'
    ],
    keyMoments: [
      { time: '4:20', event: 'Prospect shared frustration with current solution', type: 'opportunity' },
      { time: '12:45', event: 'Revealed budget of ₹50L approved', type: 'opportunity' },
      { time: '23:30', event: 'Identified 5 stakeholders in decision process', type: 'opportunity' },
      { time: '35:15', event: 'Customer eager to see demo next week', type: 'commitment' },
      { time: '42:00', event: 'Asked for customer references', type: 'opportunity' }
    ]
  }
};

// Default for backward compatibility
export const analysisResults = analysisResultsByCallType[1];