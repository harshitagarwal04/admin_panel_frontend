'use client'

import { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Lead } from '@/types'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface CSVImportProps {
  isOpen: boolean
  onClose: () => void
  onImport: (leads: Lead[]) => void
}

export function CSVImport({ isOpen, onClose, onImport }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [preview, setPreview] = useState<any[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (!file || !columnMapping.first_name || !columnMapping.phone_e164) {
      setErrors(['Please map required fields: First Name and Phone'])
      return
    }

    setImporting(true)
    setProgress(0)
    setErrors([])

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim())
        
        const leads: Lead[] = []
        const errors: string[] = []
        
        for (let i = 1; i < lines.length; i++) {
          setProgress((i / (lines.length - 1)) * 100)
          
          const values = lines[i].split(',').map(v => v.trim())
          const row = headers.reduce((obj, header, index) => {
            obj[header] = values[index] || ''
            return obj
          }, {} as Record<string, string>)

          const firstName = row[columnMapping.first_name]
          const phone = row[columnMapping.phone_e164]

          if (!firstName || !phone) {
            errors.push(`Row ${i + 1}: Missing required fields`)
            continue
          }

          const lead: Lead = {
            id: Math.random().toString(36).substr(2, 9),
            agent_id: '1',
            first_name: firstName,
            phone_e164: phone.startsWith('+') ? phone : `+1${phone}`,
            status: 'new',
            custom_fields: Object.keys(row).reduce((fields, key) => {
              if (key !== columnMapping.first_name && key !== columnMapping.phone_e164) {
                fields[key] = row[key]
              }
              return fields
            }, {} as Record<string, any>),
            schedule_at: new Date().toISOString(),
            attempts_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          leads.push(lead)
        }

        setTimeout(() => {
          setImporting(false)
          setProgress(100)
          if (errors.length > 0) {
            setErrors(errors)
          } else {
            onImport(leads)
          }
        }, 1000)
      }
      reader.readAsText(file)
    } catch (error) {
      setImporting(false)
      setErrors(['Failed to import CSV file'])
    }
  }

  const resetState = () => {
    setFile(null)
    setImporting(false)
    setProgress(0)
    setErrors([])
    setPreview([])
    setColumnMapping({})
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
              <h3 className="text-lg font-medium mb-3">Column Mapping</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    value={columnMapping.first_name || ''}
                    onChange={(e) => setColumnMapping(prev => ({ ...prev, first_name: e.target.value }))}
                  >
                    <option value="">Select column...</option>
                    {preview.length > 0 && Object.keys(preview[0]).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    value={columnMapping.phone_e164 || ''}
                    onChange={(e) => setColumnMapping(prev => ({ ...prev, phone_e164: e.target.value }))}
                  >
                    <option value="">Select column...</option>
                    {preview.length > 0 && Object.keys(preview[0]).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
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

        {progress === 100 && !importing && (
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <div>
              <div className="text-lg font-medium text-green-800">Import completed!</div>
              <div className="text-sm text-gray-600">Leads have been successfully imported</div>
            </div>
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
          {file && !importing && progress === 0 && (
            <Button 
              onClick={handleImport}
              disabled={!columnMapping.first_name || !columnMapping.phone_e164}
            >
              Import Leads
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}