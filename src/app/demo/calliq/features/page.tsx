'use client';

import { useRouter } from 'next/navigation';
import { 
  MicIcon,
  BrainIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  UsersIcon,
  LinkIcon,
  ShieldCheckIcon,
  ZapIcon,
  BarChart3Icon,
  MessageSquareIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  GlobeIcon
} from 'lucide-react';

const mainFeatures = [
  {
    icon: MicIcon,
    title: 'Real-Time Transcription',
    description: 'Automatic speech-to-text with 99% accuracy. Support for multiple languages and accents.',
    benefits: ['Save 2+ hours/day', 'Never miss details', 'Searchable archive'],
    color: 'blue'
  },
  {
    icon: BrainIcon,
    title: 'AI Coaching Assistant',
    description: 'Get personalized coaching recommendations based on top performer patterns.',
    benefits: ['Improve win rate 34%', 'Reduce ramp time 60%', 'Scale best practices'],
    color: 'purple'
  },
  {
    icon: AlertTriangleIcon,
    title: 'Deal Risk Alerts',
    description: 'Proactive alerts when deals show signs of stalling or competitive threats.',
    benefits: ['Save at-risk deals', 'Prioritize follow-ups', 'Predict outcomes'],
    color: 'red'
  },
  {
    icon: TrendingUpIcon,
    title: 'Performance Analytics',
    description: 'Track individual and team metrics with actionable insights.',
    benefits: ['Data-driven coaching', 'Identify top patterns', 'Measure improvement'],
    color: 'green'
  }
];

const additionalFeatures = [
  {
    icon: LinkIcon,
    title: 'CRM Integration',
    description: 'Seamlessly sync with Salesforce, HubSpot, and more',
    time: '5 min setup'
  },
  {
    icon: MessageSquareIcon,
    title: 'Slack Notifications',
    description: 'Get instant alerts for important moments',
    time: 'Real-time'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with end-to-end encryption',
    time: 'Always on'
  },
  {
    icon: GlobeIcon,
    title: 'Multi-Language',
    description: 'Support for 25+ languages globally',
    time: 'Available now'
  },
  {
    icon: ZapIcon,
    title: 'Instant Processing',
    description: 'Get insights within seconds of call ending',
    time: '< 30 seconds'
  },
  {
    icon: BarChart3Icon,
    title: 'Custom Reports',
    description: 'Build reports tailored to your metrics',
    time: 'Weekly/Monthly'
  }
];

const integrations = [
  { name: 'Salesforce', logo: '☁️' },
  { name: 'HubSpot', logo: '🟠' },
  { name: 'Zoom', logo: '🎥' },
  { name: 'Slack', logo: '💬' },
  { name: 'Teams', logo: '📊' },
  { name: 'Gong', logo: '🎯' }
];

export default function DemoFeatures() {
  const router = useRouter();

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'purple': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'red': return 'bg-red-100 text-red-600 border-red-200';
      case 'green': return 'bg-green-100 text-green-600 border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Powerful Features Built for Sales Teams</h1>
        <p className="text-xl text-gray-600 mt-3">Everything you need to coach your team to success</p>
      </div>

      {/* Value Proposition */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Turn Every Call into a Learning Opportunity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div>
            <div className="text-4xl font-bold">34%</div>
            <p className="text-blue-100 mt-2">Average win rate improvement</p>
          </div>
          <div>
            <div className="text-4xl font-bold">2.5x</div>
            <p className="text-blue-100 mt-2">Faster rep onboarding</p>
          </div>
          <div>
            <div className="text-4xl font-bold">89%</div>
            <p className="text-blue-100 mt-2">Deal accuracy prediction</p>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start">
                <div className={`p-3 rounded-lg ${getColorClasses(feature.color)} mr-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Features Grid */}
      <div className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Everything Else You Need</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start">
                <feature.icon className="w-5 h-5 text-gray-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                  <div className="flex items-center mt-2">
                    <ClockIcon className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">{feature.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Works With Your Stack</h2>
        <p className="text-gray-600 text-center mb-8">Seamlessly integrate with tools you already use</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {integrations.map((integration, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-2">{integration.logo}</div>
              <p className="text-sm text-gray-600">{integration.name}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">+ 20 more integrations available</p>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Simple 3-Step Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Record or Upload</h3>
            <p className="text-sm text-gray-600">Connect your calling tool or upload recordings</p>
          </div>
          <div className="text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
            <p className="text-sm text-gray-600">CalliQ analyzes calls in seconds</p>
          </div>
          <div className="text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Get Insights</h3>
            <p className="text-sm text-gray-600">Receive coaching tips and action items</p>
          </div>
        </div>
      </div>

      {/* Multiple CTAs */}
      <div className="space-y-4">
        {/* Primary CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">See CalliQ in Action</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 500+ sales teams already winning with CalliQ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Start Free 14-Day Trial
              <ArrowRightIcon className="w-6 h-6 ml-3" />
            </a>
            <button
              onClick={() => router.push('/demo/calliq/upload')}
              className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-400 transition-colors"
            >
              Try Demo Analysis
            </button>
          </div>
          <p className="text-sm text-blue-200 mt-6">No credit card required • Setup in 5 minutes</p>
        </div>

        {/* Secondary CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://wa.me/+918076018082?text=Hi!%20I%20need%20help%20choosing%20the%20right%20CalliQ%20plan%20for%20my%20team."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-300 rounded-lg p-6 hover:border-green-400 hover:shadow-md transition-all flex items-center"
          >
            <MessageSquareIcon className="w-10 h-10 text-green-500 mr-4" />
            <div>
              <h4 className="font-semibold text-gray-900">Talk to Sales</h4>
              <p className="text-sm text-gray-600 mt-1">Get personalized demo and pricing</p>
            </div>
          </a>

          <button
            onClick={() => router.push('/demo/calliq/insights')}
            className="bg-white border border-gray-300 rounded-lg p-6 hover:border-purple-400 hover:shadow-md transition-all flex items-center"
          >
            <BrainIcon className="w-10 h-10 text-purple-500 mr-4" />
            <div>
              <h4 className="font-semibold text-gray-900">View Sample Insights</h4>
              <p className="text-sm text-gray-600 mt-1">See what CalliQ discovers</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}