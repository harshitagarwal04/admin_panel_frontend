'use client'

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InteractionAttempt } from '@/types'
import { Phone, Clock, User, MessageSquare, Download } from 'lucide-react'
import { formatDuration, formatDate } from '@/lib/utils'
import { useState } from 'react'

interface CallDetailModalProps {
  call: InteractionAttempt
  isOpen: boolean
  onClose: () => void
}

export function CallDetailModal({ call, isOpen, onClose }: CallDetailModalProps) {
  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'answered': return 'bg-green-100 text-green-800'
      case 'no_answer': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Extract transcript and recording_url from the call object
  // Try multiple possible locations for transcript
  const transcript = call.raw_webhook_data?.transcript || 
                    call.raw_webhook_data?.call?.transcript || 
                    ''
  const recordingUrl = call.transcript_url || ''
  const callSummary = call.summary || 'No summary available'



  const [showTranscript, setShowTranscript] = useState(false)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Call Details" size="xl">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Call Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Call ID:</span>
                  <span className="font-medium">{call.retell_call_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date/Time:</span>
                  <span className="font-medium">{formatDate(call.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {call.duration_seconds ? formatDuration(call.duration_seconds) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attempt:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    #{call.attempt_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Outcome:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(call.outcome)}`}>
                    {call.outcome?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Lead Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lead ID:</span>
                  <span className="font-medium">#{call.lead_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agent:</span>
                  <span className="font-medium">
                    {call.agent_name || 'Unknown Agent'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Call Summary</h3>
              <p className="text-sm text-gray-700">
                {callSummary}
              </p>
            </div>

            <div className="flex space-x-2">
              {recordingUrl && (
                <audio controls src={recordingUrl} className="h-10 w-full">
                  Your browser does not support the audio element.
                </audio>
              )}
              {transcript && (
                <Button variant="outline" size="sm" onClick={() => setShowTranscript(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Transcript
                </Button>
              )}
            </div>
            

          </div>
        </div>

        {/* Transcript Modal */}
        {showTranscript && (
          <Modal isOpen={showTranscript} onClose={() => setShowTranscript(false)} title="Call Transcript" size="lg">
            <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {transcript.trim() || 'No transcript available'}
              </pre>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowTranscript(false)}>
                Close
              </Button>
            </div>
          </Modal>
        )}

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}