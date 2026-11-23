import React from 'react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  icon: Icon
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-950 disabled:opacity-50 disabled:cursor-not-allowed'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  }

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-500 text-white focus:ring-brand-500 border border-brand-500',
    teal: 'bg-teal-600 hover:bg-teal-500 text-white focus:ring-teal-500 border border-teal-500',
    secondary: 'bg-navy-800 hover:bg-navy-700 text-slate-100 border border-slate-700 focus:ring-slate-500',
    outline: 'bg-transparent hover:bg-navy-800/80 text-slate-200 border border-slate-700 focus:ring-slate-500',
    danger: 'bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700 focus:ring-rose-500'
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  )
}
