import React, { ReactNode } from 'react'
import { ChevronRight, ChevronDown, Info, Check, RefreshCw, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// 1. Collapsible Section Component
interface CollapsibleSectionProps {
  title: string
  isCollapsed: boolean
  onToggle: (collapsed: boolean) => void
  children: ReactNode
  className?: string
  count?: number
  actionButtons?: ReactNode
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isCollapsed,
  onToggle,
  children,
  className = '',
  count,
  actionButtons
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(!isCollapsed)}
            className="text-sm font-semibold text-gray-700 flex items-center gap-1 hover:text-gray-900"
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {title}
            {count !== undefined && ` (${count})`}
          </button>
        </div>
        {actionButtons && (
          <div className="flex items-center gap-2">
            {actionButtons}
          </div>
        )}
      </div>
      {!isCollapsed && children}
    </div>
  )
}

// For main page sections with larger chevrons
export const MainCollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isCollapsed,
  onToggle,
  children,
  className = '',
  actionButtons
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(!isCollapsed)}
            className="text-sm font-semibold text-gray-800 flex items-center gap-1 hover:text-gray-900"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {title}
          </button>
        </div>
        {actionButtons && (
          <div className="flex items-center gap-2">
            {actionButtons}
          </div>
        )}
      </div>
      {!isCollapsed && children}
    </div>
  )
}

// 2. Validated Input Component
interface ValidatedInputProps {
  label: string
  field: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: string
  disabled?: boolean
  touchedFields: Set<string>
  fieldErrors: Record<string, string>
  isFieldValid: (field: string) => boolean
  handleFieldChange: (fieldName: string, value: string, updateFunction: (value: string) => void) => void
  tooltip?: string
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  field,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  disabled = false,
  touchedFields,
  fieldErrors,
  isFieldValid,
  handleFieldChange,
  tooltip
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => handleFieldChange(field, e.target.value, onChange)}
          placeholder={placeholder}
          disabled={disabled}
          className={`bg-gray-50 text-gray-900 placeholder-gray-400 font-medium pr-10 ${
            touchedFields.has(field) && fieldErrors[field] ? 'border-red-500' : ''
          }`}
        />
        {isFieldValid(field) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>
      {touchedFields.has(field) && fieldErrors[field] && (
        <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
      )}
    </div>
  )
}

// 3. Info Tooltip Component
interface InfoTooltipProps {
  text: string
  position?: 'left' | 'right'
  width?: string
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  text, 
  position = 'left',
  width = 'w-64'
}) => {
  return (
    <div className="inline-block ml-2 group relative">
      <Info className="h-4 w-4 text-gray-400 cursor-help inline" />
      <div className={`absolute ${position}-0 top-full mt-1 hidden group-hover:block ${width} p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10`}>
        {text}
      </div>
    </div>
  )
}

// Special case for inline tooltip with different positioning
export const InlineInfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 group">
      <Info className="h-4 w-4 text-gray-400 cursor-help" />
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
        {text}
      </div>
    </div>
  )
}

// 4. Section Header Component (for edit/regenerate actions)
interface SectionHeaderProps {
  title: string
  count?: number
  onRegenerate?: () => void
  onEdit?: () => void
  isGenerating?: boolean
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  count,
  onRegenerate,
  onEdit,
  isGenerating = false
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-800">
          {title}
          {count !== undefined && ` (${count})`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title={`Regenerate ${title}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title={`Edit ${title}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// 5. Generate Button Component
interface GenerateButtonProps {
  onClick: () => void
  isLoading: boolean
  text: string
  loadingText?: string
  disabled?: boolean
  variant?: 'green' | 'purple' | 'blue'
  size?: 'normal' | 'small'
  className?: string
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  isLoading,
  text,
  loadingText,
  disabled = false,
  variant = 'green',
  size = 'normal',
  className = ''
}) => {
  const variantClasses = {
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    blue: 'bg-blue-600 hover:bg-blue-700'
  }

  const sizeClasses = {
    normal: 'px-6 py-2',
    small: 'px-4 py-1'
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {isLoading ? (loadingText || 'Generating...') : text}
    </Button>
  )
}

// Special loading spinner button for website analysis
export const LoadingButton: React.FC<{
  onClick: () => void
  isLoading: boolean
  text: string
  loadingText: string
  disabled?: boolean
  className?: string
}> = ({ onClick, isLoading, text, loadingText, disabled, className = '' }) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500 min-w-[120px] flex-shrink-0 ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {loadingText}
        </span>
      ) : (
        text
      )}
    </Button>
  )
}