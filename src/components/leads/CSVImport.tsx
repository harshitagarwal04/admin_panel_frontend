'use client'

import { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Lead, Agent } from '@/types'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { LeadAPI } from '@/lib/lead-api'
import { useAuth } from '@/contexts/AuthContext'

interface CSVImportProps {
  isOpen: boolean
  onClose: () => void
  onImport: (leads: Lead[]) => void
  agents: Agent[]
}

export function CSVImport({ isOpen, onClose, onImport, agents }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [preview, setPreview] = useState<any[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [importResult, setImportResult] = useState<{ success_count: number; error_count: number; errors: Array<{ row: number; error: string }> } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { tokens } = useAuth()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      parseCSV(selectedFile)
    } else {
      setErrors(['Please select a valid CSV file'])
    }
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim())
        const rows = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim())
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || ''
            return obj
          }, {} as Record<string, string>)
        })
        setPreview(rows)
        
        const mapping: Record<string, string> = {}
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase()
          if (lowerHeader.includes('name') || lowerHeader.includes('first')) {
            mapping['first_name'] = header
          } else if (lowerHeader.includes('phone')) {
            mapping['phone_e164'] = header
          }
        })
        setColumnMapping(mapping)
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!file || !selectedAgent || !tokens?.access_token) {
      setErrors(['Please select an agent and upload a CSV file'])
      return
    }

    setImporting(true)
    setProgress(25)
    setErrors([])
    setImportResult(null)

    try {
      const result = await LeadAPI.importCSV(file, selectedAgent, tokens.access_token)
      setProgress(100)
      setImportResult(result)
      
      if (result.error_count === 0) {
        setTimeout(() => {
          onImport([]) // We don't return the actual leads, just trigger refresh
        }, 1500)
      }
    } catch (error) {
      setImporting(false)
      setErrors([error instanceof Error ? error.message : 'Failed to import CSV file'])
    } finally {
      setImporting(false)
    }
  }

  const resetState = () => {
    setFile(null)
    setSelectedAgent('')
    setImporting(false)
    setProgress(0)
    setErrors([])
    setPreview([])
    setColumnMapping({})
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Leads from CSV" size="lg">
      <div className="space-y-6">
        {!file && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="csv-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload CSV file
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  or drag and drop
                </span>
              </label>
              <input
                ref={fileInputRef}
                id="csv-upload"
                name="csv-upload"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFileSelect}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              CSV up to 10MB
            </p>
          </div>
        )}

        {file && !importing && progress === 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span className="font-medium">{file.name}</span>
              <Button variant="outline" size="sm" onClick={resetState}>
                Remove
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Agent <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                <option value="">Select agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                All leads in this CSV will be assigned to the selected agent
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">CSV Format Requirements</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">Required Columns:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>first_name</strong> - Lead's first name</li>
                  <li>• <strong>phone</strong> - Phone number (will be normalized to E.164 format)</li>
                </ul>
                <h4 className="font-medium text-blue-900 mt-3 mb-2">Optional Columns:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>schedule_at</strong> - ISO 8601 datetime for scheduling</li>
                  <li>• Any other columns will be stored as custom fields</li>
                </ul>
              </div>
            </div>

            {preview.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Preview (First 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview[0]).map(key => (
                          <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {value as string}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {importing && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-medium">Importing leads...</div>
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-1 text-sm text-gray-600">{Math.round(progress)}%</div>
              </div>
            </div>
          </div>
        )}

        {importResult && (
          <div className="text-center space-y-4">
            {importResult.error_count === 0 ? (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <div>
                  <div className="text-lg font-medium text-green-800">Import completed!</div>
                  <div className="text-sm text-gray-600">
                    Successfully imported {importResult.success_count} leads
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="mx-auto h-12 w-12 text-yellow-600" />
                <div>
                  <div className="text-lg font-medium text-yellow-800">Import completed with warnings</div>
                  <div className="text-sm text-gray-600">
                    Successfully imported {importResult.success_count} leads, {importResult.error_count} failed
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-4 text-left">
                    <h4 className="font-medium text-red-800 mb-2">Import Errors:</h4>
                    <div className="bg-red-50 border border-red-200 rounded p-3 max-h-32 overflow-y-auto">
                      <ul className="text-sm text-red-700 space-y-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>Row {error.row}: {error.error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {errors.length > 0 && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Import Errors</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {file && !importing && !importResult && (
            <Button 
              onClick={handleImport}
              disabled={!selectedAgent}
            >
              Import Leads
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}