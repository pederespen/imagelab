import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/60 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`p-5 lg:p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <h3 className={`text-base font-semibold text-slate-900 tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  )
}
