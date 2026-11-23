import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Cursor3D } from '../3d/Cursor3D'
import { SpatialBackground3D } from '../3d/SpatialBackground3D'

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden font-sans">
      {/* Interactive 3D Cursor */}
      <Cursor3D />

      {/* Ambient 3D Particle Constellation */}
      <SpatialBackground3D />

      {/* Navigation */}
      <Navbar />

      {/* Main Content View */}
      <main className="flex-grow relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
