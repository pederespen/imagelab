import { ButtonHTMLAttributes, forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm',
  ghost: 'hover:bg-slate-100 text-slate-700 border border-transparent hover:border-slate-200',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', fullWidth = false, className = '', disabled, ...props },
    ref
  ) => {
    const baseClasses =
      'font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1'
    const disabledClasses = disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
    const widthClass = fullWidth ? 'w-full' : ''

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      disabledClasses,
      widthClass,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return <button ref={ref} disabled={disabled} className={classes} {...props} />
  }
)

Button.displayName = 'Button'
