'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PhoneIcon, 
  TrendingUpIcon, 
  ClockIcon, 
  ActivityIcon,
  PlayIcon,
  EyeIcon,
  DownloadIcon,
  LightbulbIcon,
  TargetIcon,
  AlertCircleIcon
} from 'lucide-react';
import { calliqAPI } from '@/lib/calliq-api';
import { CallIQStats, CallIQCall } from '@/types/calliq';
import { formatDuration } from '@/lib/utils';
import { mockCall, mockStats, mockInsights } from '@/lib/calliq-mock-data';

// Stats Card Component
function StatsCard({ 
  label, 
  value, 
  change, 
  icon: Icon,
  trend 
}: { 
  label: string; 
  value: string | number; 
  change?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </p>
        )}
      </div>
    </div>
  );
}

// Recent Call Row Component
function RecentCallRow({ call }: { call: CallIQCall }) {
  const router = useRouter();
  
  return (
    <tr 
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => router.push(`/calliq/calls/${call.id}`)}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(call.date).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium">{call.rep_name?.charAt(0) || 'R'}</span>
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">{call.rep_name || 'Unknown Rep'}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {call.customer_name || 'Unknown Customer'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {call.duration ? formatDuration(call.duration) : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${
          call.status === 'completed' ? 'bg-green-100 text-green-800' :
          call.status === 'transcribing' || call.status === 'analyzing' ? 'bg-yellow-100 text-yellow-800' :
          call.status === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {call.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex space-x-2">
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              // Handle play
            }}
          >
            <PlayIcon className="w-4 h-4" />
          </button>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/calliq/calls/${call.id}`);
            }}
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              // Handle download
            }}
          >
            <DownloadIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Insight Card Component
function InsightCard({ 
  icon, 
  title, 
  description, 
  callId 
}: { 
  icon: string; 
  title: string; 
  description: string;
  callId?: string;
}) {
  const router = useRouter();
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <span className="text-2xl mr-3">{icon}</span>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          {callId && (
            <button 
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => router.push(`/calliq/calls/${callId}`)}
            >
              View call →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


export default function CallIQDashboard() {
  const [stats, setStats] = useState<CallIQStats | null>(null);
  const [recentCalls, setRecentCalls] = useState<CallIQCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API calls when backend is ready
      // For now, use mock data to demonstrate the UI
      
      setStats(mockStats);
      setRecentCalls([mockCall]);

      // Uncomment when backend is ready:
      // const [statsData, callsData] = await Promise.all([
      //   calliqAPI.getStats(),
      //   calliqAPI.getCalls({ 
      //     sort_by: 'date', 
      //     sort_order: 'desc' 
      //   }, 1, 5)
      // ]);
      // setStats(statsData);
      // setRecentCalls(callsData.calls);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircleIcon className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CallIQ Dashboard</h1>
        <p className="text-gray-600">Analyze and improve your sales calls</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total Calls"
          value={stats?.total_calls || 0}
          change="100% from last week"
          icon={PhoneIcon}
          trend="up"
        />
        <StatsCard
          label="Avg Win Rate"
          value={`${((stats?.avg_win_rate || 0) * 100).toFixed(0)}%`}
          change="100% from last week"
          icon={TrendingUpIcon}
          trend="up"
        />
        <StatsCard
          label="Calls Today"
          value={stats?.calls_today || 0}
          icon={ClockIcon}
        />
        <StatsCard
          label="Processing"
          value={stats?.processing_count || 0}
          icon={ActivityIcon}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Calls - 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Calls</h2>
              <button 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => router.push('/calliq/calls')}
              >
                View all →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date/Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rep
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentCalls.map((call) => (
                    <RecentCallRow key={call.id} call={call} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Insights - 1/3 width */}
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Today's Insights</h2>
            </div>
            <div className="p-6 space-y-4">
              {mockInsights.slice(0, 3).map((insight) => (
                <InsightCard
                  key={insight.id}
                  icon={insight.type === 'opportunity' ? '🎯' : insight.type === 'action_item' ? '⚠️' : '💡'}
                  title={insight.content.split(' - ')[0] || insight.type}
                  description={insight.content.split(' - ')[1] || insight.content}
                  callId={insight.call_id}
                />
              ))}
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2">
                View all insights →
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}