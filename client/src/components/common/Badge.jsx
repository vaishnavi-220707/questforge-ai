import React from 'react'

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    demo: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
    info: 'bg-sky-950/80 text-sky-300 border-sky-800/80',
    teal: 'bg-teal-950/80 text-teal-300 border-teal-800/80'
  }

  const selectedVariant = variants[variant] || variants.default

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${selectedVariant} ${className}`}
    >
      {children}
    </span>
  )
}
