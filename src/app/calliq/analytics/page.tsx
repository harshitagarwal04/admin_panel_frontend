'use client';

import { useState } from 'react';
import { 
  BarChart3Icon,
  TrendingUpIcon,
  UsersIcon,
  PhoneIcon,
  ClockIcon,
  TargetIcon,
  AwardIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CalendarIcon,
  DownloadIcon
} from 'lucide-react';
import { mockCall, mockStats } from '@/lib/calliq-mock-data';

interface MetricCard {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ElementType;
}


// Simple chart data based on single call
const generateChartData = (points: number) => {
  // Return mostly empty data with one point for our single call
  return Array.from({ length: points }, (_, i) => ({
    date: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: i === points - 1 ? 85 : 0 // Only show data for the most recent day
  }));
};

export default function CallIQAnalyticsPage() {
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedMetric, setSelectedMetric] = useState('winRate');

  const metrics: MetricCard[] = [
    { label: 'Total Calls Analyzed', value: '1', change: 100, trend: 'up', icon: PhoneIcon },
    { label: 'Average Win Rate', value: '100%', change: 100, trend: 'up', icon: TargetIcon },
    { label: 'Avg Call Duration', value: '30:30', change: 100, trend: 'up', icon: ClockIcon },
    { label: 'Team Performance Score', value: 85, change: 100, trend: 'up', icon: AwardIcon },
  ];

  const chartData = {
    callVolume: generateChartData(30),
    winRate: generateChartData(30),
    sentiment: generateChartData(30),
    talkRatio: generateChartData(30)
  };


  // Simple bar chart component
  const SimpleBarChart = ({ data, height = 200 }: { data: any[], height?: number }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center justify-end">
              <div 
                className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
                title={`${item.date}: ${item.value}`}
              />
            </div>
          ))}
        </div>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue}</span>
          <span>{Math.floor(maxValue / 2)}</span>
          <span>0</span>
        </div>
      </div>
    );
  };

  // Simple line chart component
  const SimpleLineChart = ({ data, height = 200, color = 'blue' }: { data: any[], height?: number, color?: string }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.value - minValue) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="relative" style={{ height }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke={color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : '#3b82f6'}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CallIQ Analytics</h1>
          <p className="text-gray-600">Performance metrics and team insights</p>
        </div>
        <div className="flex space-x-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="last7days">Last 7 days</option>
            <option value="last30days">Last 30 days</option>
            <option value="last90days">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <DownloadIcon className="w-5 h-5 inline mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
                <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend === 'up' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm text-gray-600 mt-1">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Volume Trend</h3>
          <SimpleBarChart data={chartData.callVolume} />
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <span>{chartData.callVolume[0].date}</span>
            <span>{chartData.callVolume[chartData.callVolume.length - 1].date}</span>
          </div>
        </div>

        {/* Win Rate Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Win Rate Trend</h3>
          <SimpleLineChart data={chartData.winRate} color="green" />
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <span>{chartData.winRate[0].date}</span>
            <span>{chartData.winRate[chartData.winRate.length - 1].date}</span>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Positive</span>
                <span className="text-green-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Neutral</span>
                <span className="text-yellow-600">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Negative</span>
                <span className="text-red-600">0%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Outcome Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Outcomes</h3>
          <div className="relative h-48">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">1</p>
                <p className="text-sm text-gray-500">Total Call</p>
              </div>
            </div>
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="251 251" />
            </svg>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <span>Won (100%)</span>
            </div>
          </div>
        </div>
      </div>


      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Top Performer</h3>
          <p className="text-2xl font-bold mb-2">Sarah Johnson</p>
          <p className="text-sm opacity-90">72% win rate with excellent customer sentiment scores. Consider having her mentor newer team members.</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Key Insight</h3>
          <p className="text-lg font-bold mb-2">Call completed successfully</p>
          <p className="text-sm opacity-90">High win probability with positive sentiment.</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Action Required</h3>
          <p className="text-lg font-bold mb-2">Follow-up scheduled</p>
          <p className="text-sm opacity-90">Technical demo with engineering team next week.</p>
        </div>
      </div>
    </div>
  );
}