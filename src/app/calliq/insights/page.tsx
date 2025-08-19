'use client';

import { useState, useEffect } from 'react';
import { 
  LightbulbIcon,
  TargetIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  UsersIcon,
  ClipboardListIcon,
  MessageSquareIcon,
  ShieldIcon,
  ChevronRightIcon,
  FilterIcon,
  CalendarIcon
} from 'lucide-react';
import { mockInsights } from '@/lib/calliq-mock-data';

interface Insight {
  id: string;
  type: 'objection' | 'opportunity' | 'risk' | 'action_item' | 'competitor' | 'topic' | 'question' | 'commitment' | 'coaching';
  title: string;
  description: string;
  count?: number;
  trend?: 'up' | 'down' | 'stable';
  priority?: 'high' | 'medium' | 'low';
  examples?: string[];
  impact?: string;
  recommendation?: string;
  severity?: 'info' | 'warning' | 'success' | 'error';
}

const getTypeIcon = (type: Insight['type']) => {
  switch (type) {
    case 'objection': return AlertTriangleIcon;
    case 'opportunity': return TrendingUpIcon;
    case 'risk': return ShieldIcon;
    case 'action_item': return ClipboardListIcon;
    case 'competitor': return UsersIcon;
    case 'topic': return MessageSquareIcon;
    case 'question': return MessageSquareIcon;
    case 'commitment': return TargetIcon;
    default: return LightbulbIcon;
  }
};

const getTypeColor = (type: Insight['type']) => {
  switch (type) {
    case 'objection': return 'text-red-600 bg-red-100';
    case 'opportunity': return 'text-green-600 bg-green-100';
    case 'risk': return 'text-yellow-600 bg-yellow-100';
    case 'action_item': return 'text-blue-600 bg-blue-100';
    case 'competitor': return 'text-purple-600 bg-purple-100';
    case 'topic': return 'text-indigo-600 bg-indigo-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getPriorityBadgeClass = (priority: Insight['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
  }
};

export default function CallIQInsightsPage() {
  const [insights, setInsights] = useState<Insight[]>(mockInsights as any[]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('last30days');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const filteredInsights = insights.filter(insight => {
    if (selectedType !== 'all' && insight.type !== selectedType) return false;
    if (selectedPriority !== 'all' && insight.priority !== selectedPriority) return false;
    return true;
  });

  const insightTypes = [
    { value: 'all', label: 'All Types', count: insights.length },
    { value: 'objection', label: 'Objections', count: insights.filter(i => i.type === 'objection').length },
    { value: 'opportunity', label: 'Opportunities', count: insights.filter(i => i.type === 'opportunity').length },
    { value: 'risk', label: 'Risks', count: insights.filter(i => i.type === 'risk').length },
    { value: 'action_item', label: 'Action Items', count: insights.filter(i => i.type === 'action_item').length },
    { value: 'competitor', label: 'Competitors', count: insights.filter(i => i.type === 'competitor').length },
    { value: 'topic', label: 'Topics', count: insights.filter(i => i.type === 'topic').length },
  ];

  // Summary Stats
  const totalInsights = insights.length;
  const highPriorityCount = insights.filter(i => i.severity === 'warning' || i.severity === 'error').length;
  const trendingUpCount = 1; // Based on our single call insight

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CallIQ Insights</h1>
          <p className="text-gray-600">AI-powered insights from your sales conversations</p>
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="last7days">Last 7 days</option>
          <option value="last30days">Last 30 days</option>
          <option value="last90days">Last 90 days</option>
          <option value="custom">Custom range</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Insights</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalInsights}</p>
              <p className="text-sm text-gray-500 mt-2">Across all calls</p>
            </div>
            <LightbulbIcon className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{highPriorityCount}</p>
              <p className="text-sm text-gray-500 mt-2">Need attention</p>
            </div>
            <AlertTriangleIcon className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trending Up</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{trendingUpCount}</p>
              <p className="text-sm text-gray-500 mt-2">Increasing frequency</p>
            </div>
            <TrendingUpIcon className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Action Required</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">12</p>
              <p className="text-sm text-gray-500 mt-2">Pending items</p>
            </div>
            <ClipboardListIcon className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FilterIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>

          {/* Type Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {insightTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label} ({type.count})
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedPriority('all');
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInsights.map(insight => {
          const Icon = getTypeIcon(insight.type);
          const isExpanded = expandedInsight === insight.id;

          return (
            <div 
              key={insight.id} 
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(insight.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                  {insight.severity && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      insight.severity === 'error' || insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      insight.severity === 'success' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {insight.severity}
                    </span>
                  )}
                </div>

                {/* Metrics - only show if data available */}
                {(insight.count || insight.impact) && (
                  <div className="flex items-center space-x-6 mb-4">
                    {insight.count && (
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">{insight.count}</span>
                        <span className="text-sm text-gray-500">occurrences</span>
                        {insight.trend === 'up' && <TrendingUpIcon className="w-4 h-4 text-green-500" />}
                        {insight.trend === 'down' && <TrendingUpIcon className="w-4 h-4 text-red-500 rotate-180" />}
                      </div>
                    )}
                    {insight.impact && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Impact:</span> {insight.impact}
                      </div>
                    )}
                  </div>
                )}

                {/* Examples - only show if available */}
                {insight.examples && insight.examples.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Common Examples:</p>
                    <div className="space-y-1">
                      {insight.examples.slice(0, isExpanded ? undefined : 2).map((example, index) => (
                        <p key={index} className="text-sm text-gray-600 italic">
                          "{example}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation - only show if available */}
                {insight.recommendation && (isExpanded || insight.severity === 'warning') && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Recommended Action:</p>
                    <p className="text-sm text-blue-800">{insight.recommendation}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      View Calls
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Create Training
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <LightbulbIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No insights found</h3>
          <p className="text-gray-600">Try adjusting your filters or date range</p>
        </div>
      )}
    </div>
  );
}