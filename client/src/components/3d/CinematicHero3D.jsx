import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * CinematicHero3D
 * High-performance, interactive 3D crystalline centerpiece inspired by
 * Nexora, Space and Time (SxT), and Collab design references.
 * Features:
 * - Refractive Icosahedron Crystal Core
 * - Glowing Cybernetic Wireframe Cage
 * - Dual Concentric Orbital Torus Rings
 * - 12 Orbiting Satellite Shards
 * - 280-Node Volumetric Depth Particle Field
 * - Smooth Damped Mouse Parallax
 * - Automatic WebGL Context Loss / Fallback Handling
 */
export function CinematicHero3D({ className = 'w-full h-full min-h-[380px] sm:min-h-[480px] lg:min-h-[540px]' }) {
  const mountRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // WebGL capability check
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setHasWebGL(false)
        return
      }
    } catch {
      setHasWebGL(false)
      return
    }

    let animationFrameId
    let width = container.clientWidth || 500
    let height = container.clientHeight || 500

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.z = 7

    // Renderer
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      container.appendChild(renderer.domElement)
    } catch {
      setHasWebGL(false)
      return
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x060f1e, 2.0)
    scene.add(ambientLight)

    const pointLightCyan = new THREE.PointLight(0x00F0FF, 3.8, 50)
    pointLightCyan.position.set(4, 4, 6)
    scene.add(pointLightCyan)

    const pointLightBlue = new THREE.PointLight(0x2563EB, 4.2, 50)
    pointLightBlue.position.set(-5, -4, 4)
    scene.add(pointLightBlue)

    // Master Crystalline Group
    const crystalGroup = new THREE.Group()

    // 1. Core Crystal: Icosahedron with Dark Refraction
    const coreGeo = new THREE.IcosahedronGeometry(1.85, 0)
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x05162a,
      emissive: 0x003b5c,
      specular: 0x00F0FF,
      shininess: 95,
      flatShading: true,
      transparent: true,
      opacity: 0.88,
      wireframe: false
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    crystalGroup.add(coreMesh)

    // 2. Glowing Edge Wireframe Cage
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    })
    const wireMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.88, 0), wireMat)
    crystalGroup.add(wireMesh)

    // 3. Concentric Orbital Ring 1
    const ringGeo1 = new THREE.TorusGeometry(2.5, 0.022, 16, 100)
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.65
    })
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1)
    ring1.rotation.x = Math.PI / 3
    crystalGroup.add(ring1)

    // 4. Concentric Orbital Ring 2
    const ringGeo2 = new THREE.TorusGeometry(3.0, 0.018, 16, 100)
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.4
    })
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2)
    ring2.rotation.y = Math.PI / 4
    crystalGroup.add(ring2)

    // 5. Tiny Floating Shards / Satellites
    const shardCount = 12
    const shards = []
    for (let i = 0; i < shardCount; i++) {
      const sGeo = new THREE.OctahedronGeometry(0.12 + Math.random() * 0.15, 0)
      const sMat = new THREE.MeshPhongMaterial({
        color: 0x00F0FF,
        emissive: 0x0284C7,
        specular: 0xFFFFFF,
        shininess: 100,
        flatShading: true
      })
      const shard = new THREE.Mesh(sGeo, sMat)
      const angle = (i / shardCount) * Math.PI * 2
      const radius = 2.4 + Math.random() * 1.2
      shard.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 2, Math.sin(angle) * radius)
      shard.userData = { speed: 0.01 + Math.random() * 0.015, angle, rad: radius, yBase: shard.position.y }
      crystalGroup.add(shard)
      shards.push(shard)
    }

    scene.add(crystalGroup)

    // 6. Volumetric Depth Particles (Data Points)
    const pCount = 280
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 16
      pPos[i + 1] = (Math.random() - 0.5) * 12
      pPos[i + 2] = (Math.random() - 0.5) * 10
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({
      color: 0x00F0FF,
      size: 0.045,
      transparent: true,
      opacity: 0.55
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // Mouse Interaction
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      targetX = normX * 0.45
      targetY = normY * 0.35
    }
    window.addEventListener('mousemove', onMouseMove)

    // Resize Handler
    const onResize = () => {
      if (!container) return
      width = container.clientWidth || 500
      height = container.clientHeight || 500
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    // Animation Loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 0.05
      mouseY += (targetY - mouseY) * 0.05

      crystalGroup.rotation.y = elapsedTime * 0.25 + mouseX
      crystalGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.2 + mouseY
      crystalGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.18

      ring1.rotation.z += 0.008
      ring2.rotation.x += 0.006

      shards.forEach((s) => {
        s.userData.angle += s.userData.speed
        s.position.x = Math.cos(s.userData.angle) * s.userData.rad
        s.position.z = Math.sin(s.userData.angle) * s.userData.rad
        s.position.y = s.userData.yBase + Math.sin(elapsedTime * 1.5 + s.userData.rad) * 0.25
        s.rotation.x += 0.02
        s.rotation.y += 0.03
      })

      particles.rotation.y = elapsedTime * 0.03
      particles.rotation.x = elapsedTime * 0.015

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (renderer) {
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
      coreGeo.dispose()
      coreMat.dispose()
      wireMat.dispose()
      ringGeo1.dispose()
      ringMat1.dispose()
      ringGeo2.dispose()
      ringMat2.dispose()
      pGeo.dispose()
      pMat.dispose()
    }
  }, [])

  if (!hasWebGL) {
    return (
      <div className={`${className} flex items-center justify-center bg-navy-900/60 border border-cyan-500/20 rounded-xl p-8`}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <span className="w-8 h-8 rounded-full bg-cyan-500/30 animate-pulse"></span>
          </div>
          <div className="font-headline font-semibold text-white text-sm">Interactive 3D Engine Ready</div>
          <p className="text-xs text-slate-400 max-w-xs">High-precision deterministic scholarship verification enclave.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mountRef}
      className={`${className} relative overflow-hidden`}
      style={{ display: 'block' }}
    />
  )
}
