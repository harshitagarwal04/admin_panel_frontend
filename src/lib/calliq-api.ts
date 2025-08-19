// CallIQ API Client

import { 
  CallIQCall, 
  CallIQListResponse, 
  CallIQFilters, 
  CallIQStats,
  CallIQInsightsResponse,
  UploadRequest,
  UploadProgress,
  BulkUploadRequest,
  SimilarCall,
  CallPattern,
  RepPerformance
} from '@/types/calliq';
import { AuthStorage } from './auth-storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class CallIQAPI {
  private getHeaders(): HeadersInit {
    const tokens = AuthStorage.getTokens();
    return {
      'Content-Type': 'application/json',
      ...(tokens && { 'Authorization': `Bearer ${tokens.access_token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'Request failed');
    }
    return response.json();
  }

  // Dashboard Stats
  async getStats(dateRange?: { start: string; end: string }): Promise<CallIQStats> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('start_date', dateRange.start);
      params.append('end_date', dateRange.end);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/stats?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<CallIQStats>(response);
  }

  // Calls List
  async getCalls(filters?: CallIQFilters, page = 1, pageSize = 20): Promise<CallIQListResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    if (filters) {
      if (filters.date_range) {
        params.append('start_date', filters.date_range.start);
        params.append('end_date', filters.date_range.end);
      }
      if (filters.status?.length) {
        filters.status.forEach(s => params.append('status', s));
      }
      if (filters.reps?.length) {
        filters.reps.forEach(r => params.append('rep', r));
      }
      if (filters.outcomes?.length) {
        filters.outcomes.forEach(o => o && params.append('outcome', o));
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.sort_by) {
        params.append('sort_by', filters.sort_by);
        params.append('sort_order', filters.sort_order || 'desc');
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/calls?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<CallIQListResponse>(response);
  }

  // Get Single Call
  async getCall(callId: string): Promise<CallIQCall> {
    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/calls/${callId}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<CallIQCall>(response);
  }

  // Upload Audio File
  async uploadAudio(request: UploadRequest, onProgress?: (progress: UploadProgress) => void): Promise<CallIQCall> {
    const formData = new FormData();
    if (request.file) {
      formData.append('file', request.file);
    }
    if (request.title) {
      formData.append('title', request.title);
    }
    if (request.metadata) {
      formData.append('metadata', JSON.stringify(request.metadata));
    }

    // Initial progress
    onProgress?.({
      status: 'uploading',
      progress: 0,
      message: 'Uploading file...'
    });

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 50); // 0-50% for upload
          onProgress?.({
            status: 'uploading',
            progress,
            message: 'Uploading file...'
          });
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const result = JSON.parse(xhr.responseText);
          
          // Switch to processing
          onProgress?.({
            status: 'processing',
            progress: 50,
            message: 'Processing audio...'
          });

          // Poll for status updates
          this.pollCallStatus(result.id, (call) => {
            const progressMap = {
              'uploaded': 55,
              'transcribing': 70,
              'analyzing': 85,
              'completed': 100,
              'failed': 100
            };

            onProgress?.({
              status: call.status === 'completed' ? 'completed' : 
                     call.status === 'failed' ? 'failed' : 'processing',
              progress: progressMap[call.status] || 50,
              message: this.getStatusMessage(call.status),
              result: call,
              error: call.error_message
            });
          }).then(resolve).catch(reject);
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        onProgress?.({
          status: 'failed',
          progress: 0,
          error: 'Upload failed'
        });
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_BASE_URL}/api/v1/calliq/upload`);
      const tokens = AuthStorage.getTokens();
      if (tokens) {
        xhr.setRequestHeader('Authorization', `Bearer ${tokens.access_token}`);
      }
      xhr.send(formData);
    });
  }

  // Bulk Upload CSV
  async bulkUpload(request: BulkUploadRequest): Promise<{ job_id: string; message: string }> {
    const formData = new FormData();
    formData.append('file', request.csv_file);

    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/bulk-upload`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': undefined as any // Let browser set boundary
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  // Get Call Insights
  async getInsights(callId: string): Promise<CallIQInsightsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/calls/${callId}/insights`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<CallIQInsightsResponse>(response);
  }

  // Get Similar Calls
  async getSimilarCalls(callId: string, limit = 5): Promise<SimilarCall[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/calls/${callId}/similar?limit=${limit}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<SimilarCall[]>(response);
  }

  // Get Patterns
  async getPatterns(callId: string): Promise<CallPattern[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/calls/${callId}/patterns`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<CallPattern[]>(response);
  }

  // Get Team Performance
  async getTeamPerformance(dateRange?: { start: string; end: string }): Promise<RepPerformance[]> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('start_date', dateRange.start);
      params.append('end_date', dateRange.end);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/team/performance?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<RepPerformance[]>(response);
  }

  // Delete Call
  async deleteCall(callId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/calls/${callId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to delete call');
    }
  }

  // Bulk Delete
  async bulkDelete(callIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/calls/bulk-delete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ call_ids: callIds })
    });
    if (!response.ok) {
      throw new Error('Failed to delete calls');
    }
  }

  // Export Calls
  async exportCalls(callIds: string[], format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/export`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ call_ids: callIds, format })
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }

  // Get Recording URL (with signed URL from GCS)
  async getRecordingUrl(callId: string): Promise<{ url: string; expires_in: number }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/calliq/calls/${callId}/recording-url`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Helper: Poll call status
  private async pollCallStatus(
    callId: string, 
    onUpdate: (call: CallIQCall) => void,
    maxAttempts = 60,
    interval = 2000
  ): Promise<CallIQCall> {
    let attempts = 0;
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const call = await this.getCall(callId);
          onUpdate(call);
          
          if (call.status === 'completed' || call.status === 'failed') {
            resolve(call);
          } else if (attempts >= maxAttempts) {
            reject(new Error('Processing timeout'));
          } else {
            attempts++;
            setTimeout(poll, interval);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }

  // Helper: Get status message
  private getStatusMessage(status: CallIQCall['status']): string {
    const messages = {
      'uploaded': 'File uploaded successfully',
      'transcribing': 'Transcribing audio...',
      'analyzing': 'Analyzing conversation...',
      'completed': 'Processing complete!',
      'failed': 'Processing failed'
    };
    return messages[status] || 'Processing...';
  }
}

export const calliqAPI = new CallIQAPI();