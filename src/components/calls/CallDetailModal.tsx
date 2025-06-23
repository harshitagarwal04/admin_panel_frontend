'use client'

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InteractionAttempt } from '@/types'
import { Phone, Clock, User, MessageSquare, Download } from 'lucide-react'
import { formatDuration, formatDate } from '@/lib/utils'

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

  const mockTranscript = `
Agent: Hello! I'm calling from HealthCare Corp regarding your interest in our healthcare services. Is this a good time to talk?

Lead: Hi, yes this is fine. I was looking into consultation services.

Agent: Great! I'd be happy to help you with that. Can you tell me what type of healthcare service you're interested in?

Lead: I'm looking for a general health consultation. I've been having some concerns about my overall wellness.

Agent: I understand. Our general health consultations are comprehensive and can address a wide range of wellness concerns. Would you be interested in scheduling an appointment with one of our healthcare professionals?

Lead: Yes, that sounds good. When are you available?

Agent: Let me check our calendar. We have availability next week on Tuesday at 2 PM or Wednesday at 10 AM. Which works better for you?

Lead: Tuesday at 2 PM would be perfect.

Agent: Excellent! I'll schedule you for Tuesday at 2 PM. You'll receive a confirmation email shortly with all the details. Is there anything else I can help you with today?

Lead: No, that covers everything. Thank you!

Agent: You're welcome! We look forward to seeing you on Tuesday. Have a great day!

Lead: Thank you, you too!
  `

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
                    {call.agent_id === '1' ? 'Healthcare Lead Qualifier' : 'Real Estate Appointment Setter'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Call Summary</h3>
              <p className="text-sm text-gray-700">
                {call.summary || 'No summary available'}
              </p>
            </div>

            <div className="flex space-x-2">
              {call.transcript_url && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Recording
                </Button>
              )}
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                View Raw Data
              </Button>
            </div>
          </div>
        </div>

        {call.outcome === 'answered' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Call Transcript</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {mockTranscript.trim()}
              </pre>
            </div>
          </div>
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