import React, { useEffect, useState } from 'react'

/**
 * Cursor3D
 * Cinematic, precision interactive cursor with:
 * - Micro center reticle
 * - Trailing soft cyan halo
 * - Contextual magnetic scale-up on buttons, links, and inputs
 * - Strictly non-blocking (pointer-events-none)
 * - Auto-disabled on touch devices and prefers-reduced-motion
 */
export function Cursor3D() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 })
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Disable on touch devices or reduced motion
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || isReducedMotion) return

    let currentX = -100
    let currentY = -100
    let trailX = -100
    let trailY = -100
    let animId

    const onMouseMove = (e) => {
      currentX = e.clientX
      currentY = e.clientY
      setPos({ x: currentX, y: currentY })
      if (!visible) setVisible(true)

      // Context detection
      const target = e.target
      const isInteractive = target && (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('[role="button"]') ||
        target.closest('.interactive-target')
      )
      setHovered(Boolean(isInteractive))
    }

    const onMouseLeave = () => {
      setVisible(false)
    }

    const onMouseEnter = () => {
      setVisible(true)
    }

    // Trailing smooth loop
    const loop = () => {
      trailX += (currentX - trailX) * 0.18
      trailY += (currentY - trailY) * 0.18
      setTrailingPos({ x: trailX, y: trailY })
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [visible])

  if (!visible) return null

  return (
    <>
      {/* Precision Core Dot */}
      <div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan-400 pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out shadow-[0_0_8px_#00F0FF]"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${hovered ? 1.4 : 1})`,
        }}
      />
      {/* Ambient Cybernetic Halo */}
      <div
        className={`fixed top-0 left-0 rounded-full border pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out ${
          hovered
            ? 'w-10 h-10 border-cyan-400/80 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,240,255,0.35)]'
            : 'w-6 h-6 border-cyan-500/30 bg-transparent'
        }`}
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0)`,
        }}
      />
    </>
  )
}
