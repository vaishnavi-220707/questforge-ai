import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * SpatialBackground3D
 * Ambient, ultra-lightweight background particle constellation.
 * Uses a single requestAnimationFrame loop with device-aware particle count.
 * Honors prefers-reduced-motion and gracefully handles WebGL absence.
 */
export function SpatialBackground3D() {
  const mountRef = useRef(null)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    // Respect reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEnabled(false)
      return
    }

    const container = mountRef.current
    if (!container) return

    let animationFrameId
    let width = window.innerWidth
    let height = window.innerHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 20

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
      container.appendChild(renderer.domElement)
    } catch {
      setEnabled(false)
      return
    }

    // 140 ambient micro-particles
    const count = 140
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 40
      pos[i + 1] = (Math.random() - 0.5) * 40
      pos[i + 2] = (Math.random() - 0.5) * 20
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))

    const mat = new THREE.PointsMaterial({
      color: 0x00F0FF,
      size: 0.08,
      transparent: true,
      opacity: 0.22
    })
    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    // Subtle parallax on scroll
    let scrollY = 0
    const onScroll = () => {
      scrollY = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const onResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    let clock = new THREE.Clock()
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      particles.rotation.y = t * 0.012
      particles.rotation.x = t * 0.006 + scrollY * 0.0003

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (renderer) {
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
      geo.dispose()
      mat.dispose()
    }
  }, [])

  if (!enabled) return null

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80"
      aria-hidden="true"
    />
  )
}
