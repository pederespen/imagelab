import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const inputClasses = `w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 transition-shadow ${
      error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'
    } ${className}`

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
            {label}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
