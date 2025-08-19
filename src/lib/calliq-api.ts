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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

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
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        console.error('Authentication error - status:', response.status);
        // Try to refresh the page to re-authenticate
        if (response.status === 401) {
          window.location.href = '/login';
        }
        throw new Error('Authentication failed. Please log in again.');
      }
      
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      
      // Log technical errors to console but show user-friendly messages
      if (error.detail && (error.detail.includes('psycopg2') || error.detail.includes('SQL'))) {
        console.error('Database error:', error.detail);
        throw new Error('A database error occurred. Please try again.');
      }
      
      // Clean up error messages for users
      let userMessage = error.detail || 'Request failed';
      if (userMessage.includes('UUID')) {
        userMessage = 'Invalid request. Please refresh and try again.';
      }
      
      throw new Error(userMessage);
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

    const response = await fetch(`${API_BASE_URL}/calliq/stats?${params}`, {
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

    const response = await fetch(`${API_BASE_URL}/calliq/calls?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<CallIQListResponse>(response);
  }

  // Get Single Call
  async getCall(callId: string): Promise<CallIQCall> {
    const response = await fetch(`${API_BASE_URL}/calliq/calls/${callId}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<CallIQCall>(response);
  }

  // Get Call Status (for polling during upload)
  async getCallStatus(callId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/calliq/calls/${callId}/status`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
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

          // Poll for status updates - call_id is in data.call_id
          const callId = result.data?.call_id || result.call_id || result.id;
          if (!callId) {
            console.error('No call_id in response:', result);
            reject(new Error('No call ID returned from upload'));
            return;
          }
          
          this.pollCallStatus(callId, (call) => {
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

      xhr.open('POST', `${API_BASE_URL}/calliq/upload/audio`);
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

    const response = await fetch(`${API_BASE_URL}/calliq/upload/csv`, {
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
    const response = await fetch(`${API_BASE_URL}/calliq/calls/${callId}/insights`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<CallIQInsightsResponse>(response);
  }

  // Get All Insights (across all calls)
  async getAllInsights(page = 1, pageSize = 50): Promise<CallIQInsightsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    
    const response = await fetch(`${API_BASE_URL}/calliq/insights?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<CallIQInsightsResponse>(response);
  }

  // Get Similar Calls
  async getSimilarCalls(callId: string, limit = 5): Promise<SimilarCall[]> {
    const response = await fetch(`${API_BASE_URL}/calliq/calls/${callId}/similar?limit=${limit}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<SimilarCall[]>(response);
  }

  // Get Patterns
  async getPatterns(callId: string): Promise<CallPattern[]> {
    const response = await fetch(`${API_BASE_URL}/calliq/calls/${callId}/patterns`, {
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

    const response = await fetch(`${API_BASE_URL}/calliq/team/performance?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<RepPerformance[]>(response);
  }

  // Delete Call
  async deleteCall(callId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/calliq/calls/${callId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to delete call');
    }
  }

  // Bulk Delete
  async bulkDelete(callIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/calliq/calls/bulk-delete`, {
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
    const response = await fetch(`${API_BASE_URL}/calliq/export`, {
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
    const response = await fetch(`${API_BASE_URL}/calliq/calls/${callId}/recording-url`, {
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
          const call = await this.getCallStatus(callId);
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
          // Log polling errors but don't necessarily fail
          console.error('Error polling call status:', error);
          
          // If we get a 404, the call might not be created yet, keep trying
          if (error instanceof Error && error.message.includes('not found')) {
            if (attempts < 5) {
              // Try a few more times for new calls
              attempts++;
              setTimeout(poll, interval);
              return;
            }
          }
          
          // For other errors, reject with a user-friendly message
          const userError = error instanceof Error ? error.message : 'Unable to check processing status';
          reject(new Error(userError));
        }
      };
      
      poll();
    });
  }

  // Helper: Get status message
  private getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
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