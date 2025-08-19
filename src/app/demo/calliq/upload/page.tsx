'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UploadCloudIcon, 
  FileAudioIcon, 
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  ClockIcon,
  PlayIcon,
  ZapIcon,
  MessageSquareIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  MicIcon,
  VolumeIcon
} from 'lucide-react';
import { analysisResultsByCallType } from '@/lib/demo-data';

const sampleCalls = [
  {
    id: 1,
    title: 'Enterprise Software Demo',
    duration: '32:15',
    customer: 'TechCorp Solutions',
    date: '2 hours ago',
    type: 'Demo Call'
  },
  {
    id: 2,
    title: 'Pricing Negotiation',
    duration: '28:45',
    customer: 'Global Retail Inc',
    date: '5 hours ago',
    type: 'Follow-up'
  },
  {
    id: 3,
    title: 'Discovery Call',
    duration: '45:20',
    customer: 'StartUp Innovations',
    date: 'Yesterday',
    type: 'Discovery'
  }
];

export default function DemoUploadAnalysis() {
  const router = useRouter();
  const [selectedCall, setSelectedCall] = useState<number | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);

  const handleSelectCall = (callId: number) => {
    setSelectedCall(callId);
    setUploadState('uploading');
    setProgress(0);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setTimeout(() => {
            setUploadState('analyzing');
            simulateAnalysis();
          }, 500);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const simulateAnalysis = () => {
    setTimeout(() => {
      setUploadState('complete');
    }, 2000);
  };

  const resetDemo = () => {
    setUploadState('idle');
    setSelectedCall(null);
    setProgress(0);
  };

  const currentCall = selectedCall ? sampleCalls.find(c => c.id === selectedCall) : null;
  const analysisData = selectedCall ? analysisResultsByCallType[selectedCall as keyof typeof analysisResultsByCallType] : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Call Analysis</h1>
        <p className="text-xl text-gray-600 mt-3">Upload and analyze sales calls instantly</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
        
        {/* Left Panel - Upload Section */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Sample Calls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Calls</h3>
            <div className="space-y-3">
              {sampleCalls.map(call => (
                <div
                  key={call.id}
                  onClick={() => handleSelectCall(call.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCall === call.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{call.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{call.customer}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500 flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {call.duration}
                        </span>
                        <span className="text-xs text-gray-500">{call.date}</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {call.type}
                        </span>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                      <PlayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Your Own</h3>
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 cursor-pointer transition-colors bg-gray-50"
            >
              <UploadCloudIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">Drop your call recording here</p>
              <p className="text-xs text-gray-500 mb-3">or click to browse</p>
              <p className="text-xs text-gray-400">Supports MP3, WAV, M4A (Max 100MB)</p>
            </div>
          </div>

          {/* Progress Indicator */}
          {(uploadState === 'uploading' || uploadState === 'analyzing') && currentCall && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <FileAudioIcon className="w-8 h-8 text-blue-500 mr-3" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{currentCall.title}</p>
                  <p className="text-sm text-gray-500">
                    {uploadState === 'uploading' ? 'Uploading...' : 'Analyzing...'}
                  </p>
                </div>
              </div>
              {uploadState === 'uploading' && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
                </>
              )}
              {uploadState === 'analyzing' && (
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                    Transcribing conversation
                  </p>
                  <p className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                    Identifying key moments
                  </p>
                  <p className="flex items-center animate-pulse">
                    <SparklesIcon className="w-4 h-4 text-purple-500 mr-2" />
                    Generating recommendations...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="lg:col-span-7">
          {uploadState === 'idle' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center h-full flex items-center justify-center">
              <div>
                <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Analyze</h3>
                <p className="text-gray-600 mb-4">Select a sample call or upload your own to see AI-powered insights</p>
                <p className="text-sm text-gray-500">Analysis takes only a few seconds</p>
              </div>
            </div>
          )}

          {(uploadState === 'uploading' || uploadState === 'analyzing') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 h-full flex items-center justify-center">
              <div className="text-center">
                <SparklesIcon className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI is analyzing your call...</h3>
                <p className="text-gray-600 mb-4">Extracting insights and patterns</p>
              </div>
            </div>
          )}

          {/* Results State */}
          {uploadState === 'complete' && selectedCall && analysisData && (
            <div className="space-y-6">
              {/* Call Info Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{currentCall?.title}</h3>
                    <p className="text-sm text-gray-600">{currentCall?.customer} • {currentCall?.duration}</p>
                  </div>
                  <button 
                    onClick={resetDemo}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Analyze Another Call
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-green-600">{analysisData.winProbability}%</p>
                      <p className="text-xs text-gray-600 mt-1">Win Probability</p>
                    </div>
                    <TrendingUpIcon className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">38%</p>
                      <p className="text-xs text-gray-600 mt-1">Talk Ratio</p>
                    </div>
                    <MicIcon className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-purple-600">{analysisData.keyMoments.length}</p>
                      <p className="text-xs text-gray-600 mt-1">Key Moments</p>
                    </div>
                    <SparklesIcon className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Strengths and Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                  <div className="flex items-center mb-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">What Went Well</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisData.strengths.slice(0, 3).map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                  <div className="flex items-center mb-3">
                    <AlertTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Areas to Improve</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisData.improvements.slice(0, 3).map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-600 mr-2">!</span>
                        <span className="text-sm text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Moments */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Key Moments</h3>
                <div className="space-y-2">
                  {analysisData.keyMoments.slice(0, 3).map((moment, index) => (
                    <div key={index} className="flex items-start">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium mr-3 ${
                        moment.type === 'objection' ? 'bg-red-100 text-red-700' :
                        moment.type === 'opportunity' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {moment.time}
                      </span>
                      <p className="text-sm text-gray-700">{moment.event}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white text-center">
                <h3 className="text-xl font-bold mb-2">Get These Insights for Every Call</h3>
                <p className="text-blue-100 mb-4 text-sm">Join 500+ teams using CalliQ</p>
                <a
                  href="/login"
                  className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 inline-flex items-center text-sm"
                >
                  Start Free Trial
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}