'use client';

import { useState, useRef } from 'react';
import { 
  UploadCloudIcon, 
  FileAudioIcon, 
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LoaderIcon,
  DownloadIcon,
  FileTextIcon
} from 'lucide-react';

type UploadMethod = 'single' | 'bulk';
type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

interface FileUpload {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  result?: any;
}

export default function CallIQUploadPage() {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('single');
  const [isDragging, setIsDragging] = useState(false);
  const [fileUpload, setFileUpload] = useState<FileUpload | null>(null);
  const [bulkFiles, setBulkFiles] = useState<FileUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['mp3', 'wav', 'm4a', 'mp4', 'mpeg', 'webm', 'ogg'];
  const maxFileSize = 100 * 1024 * 1024; // 100MB

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (uploadMethod === 'single' && files.length > 0) {
      handleSingleFile(files[0]);
    } else if (uploadMethod === 'bulk' && files.length > 0) {
      handleBulkCSV(files[0]);
    }
  };

  const handleSingleFile = (file: File) => {
    // Validate file
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !supportedFormats.includes(extension)) {
      alert(`Unsupported file format. Supported formats: ${supportedFormats.join(', ')}`);
      return;
    }

    if (file.size > maxFileSize) {
      alert('File size exceeds 100MB limit');
      return;
    }

    // Start upload simulation
    const upload: FileUpload = {
      file,
      status: 'uploading',
      progress: 0
    };
    setFileUpload(upload);

    // Simulate upload progress
    const interval = setInterval(() => {
      setFileUpload(prev => {
        if (!prev) return null;
        
        if (prev.progress >= 100) {
          clearInterval(interval);
          return { ...prev, status: 'completed', progress: 100 };
        }
        
        if (prev.progress >= 50 && prev.status === 'uploading') {
          return { ...prev, status: 'processing', progress: prev.progress + 5 };
        }
        
        return { ...prev, progress: prev.progress + 10 };
      });
    }, 500);
  };

  const handleBulkCSV = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    // Parse CSV and create mock uploads
    const mockUrls = [
      'https://storage.example.com/call1.mp3',
      'https://storage.example.com/call2.wav',
      'https://storage.example.com/call3.m4a',
      'https://storage.example.com/call4.mp3',
      'https://storage.example.com/call5.wav',
    ];

    const uploads = mockUrls.map((url, index) => ({
      file: new File([url], `Call ${index + 1}`),
      status: 'idle' as UploadStatus,
      progress: 0
    }));

    setBulkFiles(uploads);

    // Start processing files one by one
    uploads.forEach((_, index) => {
      setTimeout(() => {
        processBulkFile(index);
      }, index * 2000);
    });
  };

  const processBulkFile = (index: number) => {
    const interval = setInterval(() => {
      setBulkFiles(prev => {
        const updated = [...prev];
        const file = updated[index];
        
        if (!file) {
          clearInterval(interval);
          return prev;
        }

        if (file.progress >= 100) {
          clearInterval(interval);
          file.status = 'completed';
          file.progress = 100;
          return updated;
        }

        if (file.status === 'idle') {
          file.status = 'uploading';
        }

        if (file.progress >= 50 && file.status === 'uploading') {
          file.status = 'processing';
        }

        file.progress = Math.min(100, file.progress + 20);
        return updated;
      });
    }, 400);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <LoaderIcon className="w-5 h-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <FileAudioIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'processing': return 'Processing audio...';
      case 'completed': return 'Ready for analysis';
      case 'failed': return 'Upload failed';
      default: return 'Waiting...';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Calls</h1>
        <p className="text-gray-600">Upload your call recordings for AI-powered analysis</p>
      </div>

      {/* Upload Method Toggle */}
      <div className="bg-white rounded-lg shadow p-1 inline-flex">
        <button
          onClick={() => setUploadMethod('single')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            uploadMethod === 'single' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Single File
        </button>
        <button
          onClick={() => setUploadMethod('bulk')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            uploadMethod === 'bulk' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Bulk CSV
        </button>
      </div>

      {/* Single File Upload */}
      {uploadMethod === 'single' && (
        <div className="bg-white rounded-lg shadow">
          {!fileUpload ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloudIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop your audio file here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: {supportedFormats.join(', ')} • Max size: 100MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={supportedFormats.map(f => `.${f}`).join(',')}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleSingleFile(file);
                }}
              />
            </div>
          ) : (
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(fileUpload.status)}
                  <div>
                    <p className="font-medium text-gray-900">{fileUpload.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(fileUpload.file.size)} • {getStatusText(fileUpload.status)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFileUpload(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{fileUpload.status === 'uploading' ? 'Uploading' : 'Processing'}</span>
                  <span>{fileUpload.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      fileUpload.status === 'completed' ? 'bg-green-500' :
                      fileUpload.status === 'failed' ? 'bg-red-500' :
                      'bg-blue-600'
                    }`}
                    style={{ width: `${fileUpload.progress}%` }}
                  />
                </div>
              </div>

              {/* Success Actions */}
              {fileUpload.status === 'completed' && (
                <div className="flex space-x-4">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    View Analysis
                  </button>
                  <button 
                    onClick={() => setFileUpload(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Upload Another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bulk CSV Upload */}
      {uploadMethod === 'bulk' && (
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Bulk Upload Instructions</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Prepare a CSV file with columns: audio_url, rep_name, customer_name, date</li>
              <li>Ensure all audio files are publicly accessible URLs</li>
              <li>Maximum 100 files per batch</li>
              <li>Files will be processed sequentially</li>
            </ol>
            <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
              <DownloadIcon className="w-4 h-4 inline mr-1" />
              Download CSV Template
            </button>
          </div>

          {/* CSV Upload Zone */}
          {bulkFiles.length === 0 ? (
            <div className="bg-white rounded-lg shadow">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => csvInputRef.current?.click()}
              >
                <FileTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your CSV file here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse
                </p>
                <input
                  ref={csvInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBulkCSV(file);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">Processing Bulk Upload</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {bulkFiles.filter(f => f.status === 'completed').length} of {bulkFiles.length} files processed
                    </p>
                  </div>
                  <button
                    onClick={() => setBulkFiles([])}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Overall Progress */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(bulkFiles.filter(f => f.status === 'completed').length / bulkFiles.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* File List */}
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {bulkFiles.map((file, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.file.name}</p>
                        <p className="text-xs text-gray-500">{getStatusText(file.status)}</p>
                      </div>
                    </div>
                    {file.status === 'uploading' || file.status === 'processing' ? (
                      <div className="w-32">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Actions */}
              {bulkFiles.every(f => f.status === 'completed') && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      View All Results
                    </button>
                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Download Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}