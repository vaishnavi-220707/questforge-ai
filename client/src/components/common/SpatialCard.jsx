import React from 'react'

/**
 * SpatialCard
 * Cinematic card container inspired by Nexora and Collab design references.
 * Features:
 * - Corner bracket indicators (+ markers)
 * - Translucent midnight navy backdrop with subtle backdrop-blur
 * - Restrained electric cyan edge border and hover highlight
 */
export function SpatialCard({
  children,
  className = '',
  title,
  subtitle,
  badge,
  action,
  glow = false,
  cornerMarkers = true,
  ...props
}) {
  return (
    <div
      className={`relative rounded-xl bg-navy-900/80 backdrop-blur-md border ${
        glow
          ? 'border-cyan-500/40 shadow-[0_0_24px_rgba(0,240,255,0.12)]'
          : 'border-slate-800/90 hover:border-cyan-500/30'
      } transition-all duration-300 p-5 sm:p-6 group ${className}`}
      {...props}
    >
      {/* Corner Brackets */}
      {cornerMarkers && (
        <>
          <span className="absolute top-1.5 left-2 font-mono text-[9px] text-cyan-500/40 select-none group-hover:text-cyan-400 transition-colors">
            +
          </span>
          <span className="absolute top-1.5 right-2 font-mono text-[9px] text-cyan-500/40 select-none group-hover:text-cyan-400 transition-colors">
            +
          </span>
          <span className="absolute bottom-1.5 left-2 font-mono text-[9px] text-cyan-500/40 select-none group-hover:text-cyan-400 transition-colors">
            +
          </span>
          <span className="absolute bottom-1.5 right-2 font-mono text-[9px] text-cyan-500/40 select-none group-hover:text-cyan-400 transition-colors">
            +
          </span>
        </>
      )}

      {/* Header if title or badge provided */}
      {(title || badge || action) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80 gap-3">
          <div>
            {title && (
              <h3 className="font-headline font-semibold text-white text-sm sm:text-base tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 font-sans mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            {badge}
            {action}
          </div>
        </div>
      )}

      {children}
    </div>
  )
}
