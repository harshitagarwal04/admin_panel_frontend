'use client'

import { useState } from 'react'
import { Input } from './Input'

interface Country {
  code: string
  name: string
  flag: string
  dialCode: string
}

const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
]

interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export function PhoneInput({ value = '', onChange, placeholder, label, className }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0])
  const [phoneNumber, setPhoneNumber] = useState('')

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country)
    const cleanNumber = phoneNumber.replace(/^\+\d+/, '')
    const newValue = `${country.dialCode}${cleanNumber}`
    onChange?.(newValue)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setPhoneNumber(inputValue)
    
    // If user starts typing with +, try to detect country
    if (inputValue.startsWith('+')) {
      const country = countries.find(c => inputValue.startsWith(c.dialCode))
      if (country && country.code !== selectedCountry.code) {
        setSelectedCountry(country)
      }
      onChange?.(inputValue)
    } else {
      // Add selected country code
      const newValue = `${selectedCountry.dialCode}${inputValue}`
      onChange?.(newValue)
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex">
        <div className="relative">
          <select
            value={selectedCountry.code}
            onChange={(e) => {
              const country = countries.find(c => c.code === e.target.value)
              if (country) handleCountryChange(country)
            }}
            className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 text-sm min-w-[80px]"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.dialCode}
              </option>
            ))}
          </select>
        </div>
        <Input
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder || `${selectedCountry.dialCode}1234567890`}
          className="flex-1 rounded-l-none border-l-0"
        />
      </div>
    </div>
  )
}