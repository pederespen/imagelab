'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  helperText?: string
  error?: string
  className?: string
}

export function Dropdown({
  label,
  value,
  onChange,
  options,
  helperText,
  error,
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={`w-full relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 pr-9 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 bg-card text-foreground transition-all text-sm font-medium text-left relative cursor-pointer ${
          error ? 'border-red-400' : 'border-input hover:border-border'
        }`}
      >
        <span className="block truncate">{selectedOption?.label || 'Select...'}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              className="text-muted-foreground"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 right-0 bg-popover border border-card-border rounded-lg shadow-xl max-h-60 overflow-auto">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2.5 text-left text-sm transition-all cursor-pointer bg-popover ${
                option.value === value
                  ? '!bg-primary/10 text-popover-foreground font-semibold border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-popover-foreground hover:pl-4'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted-foreground mt-1.5">{helperText}</p>}
    </div>
  )
}
