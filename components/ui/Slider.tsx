import { InputHTMLAttributes, forwardRef } from 'react'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  helperText?: string
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ label, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="range"
          className={`w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary ${className}`}
          {...props}
        />
        {helperText && <p className="text-xs text-muted-foreground mt-1.5">{helperText}</p>}
      </div>
    )
  }
)

Slider.displayName = 'Slider'
