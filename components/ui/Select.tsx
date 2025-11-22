import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className = '', children, ...props }, ref) => {
    const selectClasses = `w-full px-3 py-2.5 pr-9 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 bg-white transition-all cursor-pointer text-sm font-medium appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw1IDVMOSAxIiBzdHJva2U9IiM2NDc0OEIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat [&>option]:bg-white [&>option]:text-slate-900 [&>option]:py-2 ${
      error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'
    } ${className}`

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
            {label}
          </label>
        )}
        <select ref={ref} className={selectClasses} {...props}>
          {children}
        </select>
        {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
