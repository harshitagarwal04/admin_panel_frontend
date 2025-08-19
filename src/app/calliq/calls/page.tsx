'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  SearchIcon, 
  FilterIcon, 
  DownloadIcon,
  PlayIcon,
  EyeIcon,
  TrashIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon
} from 'lucide-react';
import { CallIQCall, CallIQFilters } from '@/types/calliq';
import { formatDuration, formatDate } from '@/lib/utils';
import { mockCall } from '@/lib/calliq-mock-data';

export default function CallIQCallsPage() {
  const router = useRouter();
  const [calls, setCalls] = useState<CallIQCall[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallIQCall[]>([]);
  const [selectedCalls, setSelectedCalls] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<CallIQFilters>({
    search: '',
    status: [],
    outcomes: [],
    date_range: undefined
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('last7days');

  useEffect(() => {
    // Load mock data - just one call for now
    setCalls([mockCall]);
    setFilteredCalls([mockCall]);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...calls];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(call => 
        call.title?.toLowerCase().includes(searchLower) ||
        call.rep_name?.toLowerCase().includes(searchLower) ||
        call.customer_name?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(call => filters.status!.includes(call.status));
    }

    // Outcome filter
    if (filters.outcomes && filters.outcomes.length > 0) {
      filtered = filtered.filter(call => call.outcome && filters.outcomes!.includes(call.outcome));
    }

    setFilteredCalls(filtered);
    setCurrentPage(1);
  }, [filters, calls]);

  const handleSelectAll = () => {
    if (selectedCalls.size === pageItems.length) {
      setSelectedCalls(new Set());
    } else {
      setSelectedCalls(new Set(pageItems.map(call => call.id)));
    }
  };

  const handleSelectCall = (callId: string) => {
    const newSelected = new Set(selectedCalls);
    if (newSelected.has(callId)) {
      newSelected.delete(callId);
    } else {
      newSelected.add(callId);
    }
    setSelectedCalls(newSelected);
  };

  const handleBulkExport = () => {
    console.log('Exporting calls:', Array.from(selectedCalls));
    // Implement export logic
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedCalls.size} calls?`)) {
      console.log('Deleting calls:', Array.from(selectedCalls));
      // Implement delete logic
      setSelectedCalls(new Set());
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = filteredCalls.slice(startIndex, endIndex);

  const getSentimentEmoji = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '—';
    }
  };

  const getStatusBadgeClass = (status: CallIQCall['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'analyzing': return 'bg-purple-100 text-purple-800';
      case 'transcribing': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeBadgeClass = (outcome?: CallIQCall['outcome']) => {
    switch (outcome) {
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      case 'no_decision': return 'bg-gray-100 text-gray-800';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CallIQ Calls</h1>
        <p className="text-gray-600">View and analyze all your recorded calls</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search calls, reps, or customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          {/* Date Range */}
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

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                setFilters({ ...filters, status: [value as CallIQCall['status']] });
              } else {
                setFilters({ ...filters, status: [] });
              }
            }}
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="analyzing">Analyzing</option>
            <option value="transcribing">Transcribing</option>
            <option value="uploaded">Uploaded</option>
            <option value="failed">Failed</option>
          </select>

          {/* Outcome Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                setFilters({ ...filters, outcomes: [value as CallIQCall['outcome']] });
              } else {
                setFilters({ ...filters, outcomes: [] });
              }
            }}
          >
            <option value="">All Outcomes</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="follow_up">Follow-up</option>
            <option value="no_decision">No Decision</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setFilters({ search: '', status: [], outcomes: [] });
              setDateRange('last7days');
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Clear filters
          </button>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredCalls.length)} of {filteredCalls.length} calls
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCalls.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-900 font-medium">
            {selectedCalls.size} call{selectedCalls.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkExport}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              <DownloadIcon className="w-4 h-4 inline mr-2" />
              Export Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <TrashIcon className="w-4 h-4 inline mr-2" />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedCalls(new Set())}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Calls Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCalls.size === pageItems.length && pageItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
                  Talk Ratio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win Prob
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageItems.map((call) => (
                <tr 
                  key={call.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCalls.has(call.id)}
                      onChange={() => handleSelectCall(call.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(call.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium">{call.rep_name?.charAt(0)}</span>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-900">{call.rep_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {call.duration ? formatDuration(call.duration) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-20">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(call.talk_ratio || 0) * 100}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs text-gray-600">
                          {((call.talk_ratio || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-2xl text-center">
                    {getSentimentEmoji(call.sentiment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(call.status)}`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {call.win_probability ? (
                      <span className={`font-medium ${
                        call.win_probability > 0.7 ? 'text-green-600' :
                        call.win_probability > 0.4 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {(call.win_probability * 100).toFixed(0)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {call.outcome && (
                      <span className={`px-2 py-1 text-xs rounded-full ${getOutcomeBadgeClass(call.outcome)}`}>
                        {call.outcome}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => console.log('Play:', call.id)}
                      >
                        <PlayIcon className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => router.push(`/calliq/calls/${call.id}`)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => console.log('Download:', call.id)}
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => console.log('Delete:', call.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredCalls.length)}</span> of{' '}
                  <span className="font-medium">{filteredCalls.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}