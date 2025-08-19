'use client';

import { useRouter } from 'next/navigation';
import { 
  PhoneIcon, 
  TrendingUpIcon, 
  DollarSignIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  SparklesIcon
} from 'lucide-react';
import { teamMetrics, demoReps, keyInsights } from '@/lib/demo-data';

export default function DemoDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">See How CalliQ Transforms Your Sales Team</h1>
        <p className="text-xl text-gray-600 mt-3">AI-powered call analytics that help you win more deals</p>
      </div>

      {/* Key Metrics - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <PhoneIcon className="w-10 h-10 text-blue-500" />
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{teamMetrics.totalCalls.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Calls Analyzed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUpIcon className="w-10 h-10 text-green-500" />
            <div className="flex items-center text-green-600 text-sm">
              <ArrowUpIcon className="w-4 h-4" />
              <span>+34%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{teamMetrics.avgWinRate}%</p>
          <p className="text-sm text-gray-600 mt-1">Win Rate</p>
          <p className="text-xs text-gray-500 mt-2">↑ from {teamMetrics.previousWinRate}%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSignIcon className="w-10 h-10 text-purple-500" />
            <div className="flex items-center text-green-600 text-sm">
              <ArrowUpIcon className="w-4 h-4" />
              <span>+41%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{(teamMetrics.revenue / 100000).toFixed(0)}L</p>
          <p className="text-sm text-gray-600 mt-1">Revenue Generated</p>
          <p className="text-xs text-gray-500 mt-2">↑ from ₹{(teamMetrics.previousRevenue / 100000).toFixed(0)}L</p>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8">
        <div className="flex items-center mb-6">
          <SparklesIcon className="w-8 h-8 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">What CalliQ Discovered</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {keyInsights.map((insight, index) => (
            <div key={index} className="bg-white rounded-lg p-6">
              <div className="text-3xl mb-3">{insight.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{insight.insight}</p>
              <div className="text-sm font-semibold text-green-600">{insight.impact}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Team Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Team Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rep</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calls</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demoReps.map((rep, index) => (
                <tr key={rep.id} className={index === 0 ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium">{rep.avatar}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{rep.name}</p>
                        {index === 0 && <p className="text-xs text-yellow-600">👑 Top Performer</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rep.calls}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-semibold ${
                        rep.winRate >= 70 ? 'text-green-600' :
                        rep.winRate >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {rep.winRate}%
                      </span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            rep.winRate >= 70 ? 'bg-green-500' :
                            rep.winRate >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${rep.winRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{(rep.revenue / 100000).toFixed(0)}L
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rep.trend === 'up' ? (
                      <ArrowUpIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to boost your team's performance?</h2>
        <p className="text-xl text-blue-100 mb-8">
          Upload a call recording and see AI insights in seconds
        </p>
        <button
          onClick={() => router.push('/demo/calliq/upload')}
          className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center"
        >
          Try It Now - Upload a Call
          <ArrowRightIcon className="w-6 h-6 ml-3" />
        </button>
      </div>
    </div>
  );
}