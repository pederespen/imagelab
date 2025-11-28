import { ButtonHTMLAttributes, forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md',
  secondary: 'bg-secondary hover:bg-muted text-secondary-foreground border border-border',
  success: 'bg-success hover:bg-success/90 text-white shadow-sm hover:shadow-md',
  ghost: 'bg-transparent hover:bg-secondary text-foreground border border-border',
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
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
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
