'use client';

import { useRouter } from 'next/navigation';
import { 
  LightbulbIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  TargetIcon,
  MessageSquareIcon,
  ShieldIcon,
  SparklesIcon,
  UsersIcon,
  BrainIcon
} from 'lucide-react';

const topPatterns = [
  {
    pattern: 'Discovery Excellence',
    impact: '+32% win rate',
    description: 'Top performers ask 3x more discovery questions in the first 10 minutes',
    frequency: '89% of won deals',
    icon: '🔍'
  },
  {
    pattern: 'Clear Next Steps',
    impact: '2x faster close',
    description: 'Winners always end calls with specific, time-bound commitments',
    frequency: '94% of won deals',
    icon: '📅'
  },
  {
    pattern: 'Value Before Price',
    impact: '+45% conversion',
    description: 'Successful reps discuss pricing only after establishing clear value',
    frequency: '76% of won deals',
    icon: '💎'
  }
];

const commonObjections = [
  {
    objection: 'Too expensive',
    frequency: 234,
    bestResponse: 'Focus on ROI and break down cost per outcome achieved',
    winRate: 68
  },
  {
    objection: 'Need to think about it',
    frequency: 189,
    bestResponse: 'Identify specific concerns and schedule follow-up while on call',
    winRate: 71
  },
  {
    objection: 'Happy with current solution',
    frequency: 156,
    bestResponse: 'Acknowledge and explore gaps in their current experience',
    winRate: 54
  }
];

const coachingOpportunities = [
  {
    rep: 'Amit Kumar',
    issue: 'Talking 68% of the time',
    impact: 'Losing 23% more deals than average',
    recommendation: 'Practice active listening techniques'
  },
  {
    rep: 'Priya Patel', 
    issue: 'Skipping discovery phase',
    impact: 'Missing critical pain points',
    recommendation: 'Use discovery framework for first 15 minutes'
  },
  {
    rep: 'Vikram Singh',
    issue: 'Weak closing attempts',
    impact: '40% of deals stuck in pipeline',
    recommendation: 'Practice assumptive close techniques'
  }
];

export default function DemoInsights() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">AI-Powered Sales Insights</h1>
        <p className="text-xl text-gray-600 mt-3">Discover what separates top performers from the rest</p>
      </div>

      {/* Key Discovery Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center">
          <SparklesIcon className="w-10 h-10 mr-4" />
          <div>
            <h3 className="text-2xl font-bold mb-2">🎯 Game-Changing Discovery</h3>
            <p className="text-purple-100 text-lg">
              Teams using CalliQ insights improve their win rate by an average of 34% in just 60 days
            </p>
          </div>
        </div>
      </div>

      {/* Winning Patterns */}
      <div>
        <div className="flex items-center mb-6">
          <TrendingUpIcon className="w-8 h-8 text-green-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Winning Patterns We Found</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPatterns.map((pattern, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-3xl mb-3">{pattern.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{pattern.pattern}</h3>
              <div className="text-2xl font-bold text-green-600 mb-3">{pattern.impact}</div>
              <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
              <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full inline-block">
                {pattern.frequency}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Objections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <ShieldIcon className="w-7 h-7 text-yellow-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Most Common Objections & How to Handle Them</h2>
        </div>
        <div className="space-y-4">
          {commonObjections.map((obj, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">"{obj.objection}"</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Heard {obj.frequency} times this month
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{obj.winRate}%</div>
                  <p className="text-xs text-gray-500">win rate when handled well</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 mb-1">💡 Best Response:</p>
                <p className="text-sm text-blue-800">{obj.bestResponse}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coaching Opportunities */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-center mb-6">
          <BrainIcon className="w-7 h-7 text-orange-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Top Coaching Opportunities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coachingOpportunities.map((opp, index) => (
            <div key={index} className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{opp.rep}</h4>
                <AlertCircleIcon className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-sm text-red-600 font-medium mb-2">{opp.issue}</p>
              <p className="text-xs text-gray-600 mb-3">{opp.impact}</p>
              <div className="bg-green-50 rounded p-2">
                <p className="text-xs text-green-800">
                  <span className="font-semibold">Fix:</span> {opp.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performers vs Average Reps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center mb-4">
              <CheckCircleIcon className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Top Performers (&gt;70% win rate)</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Ask 12+ discovery questions</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Talk less than 45% of the time</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Always book next steps on the call</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Address objections proactively</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <div className="flex items-center mb-4">
              <XCircleIcon className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Average Reps (&lt;50% win rate)</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span className="text-sm text-gray-700">Rush through discovery (&lt; 5 questions)</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span className="text-sm text-gray-700">Dominate conversation (60%+ talk time)</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span className="text-sm text-gray-700">Vague follow-ups ("I'll email you")</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span className="text-sm text-gray-700">Avoid difficult objections</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Multiple CTAs */}
      <div className="space-y-4">
        {/* Primary CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Get These Insights for Your Team</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start analyzing your calls and coaching your team to success
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRightIcon className="w-6 h-6 ml-3" />
            </a>
            <button
              onClick={() => router.push('/demo/calliq/features')}
              className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-400 transition-colors"
            >
              See All Features
            </button>
          </div>
        </div>

        {/* Secondary CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/demo/calliq/upload')}
            className="bg-white border border-gray-300 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <TargetIcon className="w-8 h-8 text-blue-500 mb-2" />
            <h4 className="font-semibold text-gray-900">Try Analysis</h4>
            <p className="text-sm text-gray-600 mt-1">Upload a call to see insights</p>
          </button>

          <a
            href="https://wa.me/+918076018082?text=Hi!%20I%20would%20like%20to%20schedule%20a%20CalliQ%20demo."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-300 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <MessageSquareIcon className="w-8 h-8 text-green-500 mb-2" />
            <h4 className="font-semibold text-gray-900">Schedule Demo</h4>
            <p className="text-sm text-gray-600 mt-1">Talk to our team</p>
          </a>
        </div>
      </div>
    </div>
  );
}