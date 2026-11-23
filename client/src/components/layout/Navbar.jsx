import React, { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Compass, UploadCloud, LayoutDashboard, Menu, X, Info, Cpu, ArrowUpRight, User, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  const navItems = [
    { name: 'Scholarship Explorer', path: '/scholarships', icon: Compass },
    { name: 'Upload & Audit', path: '/upload', icon: UploadCloud },
    { name: 'Student Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'About', path: '/about', icon: Info },
  ]

  const linkClass = ({ isActive }) =>
    `inline-flex items-center text-xs uppercase tracking-wider font-medium transition-all px-3 py-2 rounded-lg ${
      isActive
        ? 'text-cyan-400 bg-navy-800/90 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
        : 'text-slate-300 hover:text-white hover:bg-navy-800/50'
    }`

  return (
    <header className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo & Product Identification */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center text-cyan-400 font-headline font-bold text-sm tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.2)] border border-cyan-500/40 group-hover:border-cyan-400 transition-colors">
              QF
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-headline font-bold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  QUESTFORGE <span className="text-cyan-400 font-medium text-xs tracking-widest uppercase ml-1 px-1.5 py-0.5 rounded bg-navy-800 border border-cyan-500/20">AI</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
                Level Up Your Scholarship Application
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  <Icon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              to="/about"
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-navy-900/80 hover:bg-navy-800 border border-slate-800 hover:border-cyan-500/40 transition-all"
              title="Multi-Provider AI Status & Failover"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400 ml-0.5" />
              <span className="text-[11px] font-mono text-slate-300">AI Status</span>
            </Link>

            {user ? (
              <Link
                to="/profile"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 hover:text-white bg-navy-900 border border-cyan-500/30 hover:border-cyan-400 transition"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate max-w-[100px]">{user.user_metadata?.full_name?.split(' ')[0] || 'Profile'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-navy-800 border border-slate-800 hover:border-slate-700 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            <Link
              to="/upload"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-headline font-semibold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-navy-950 shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Launch Audit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 border border-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-navy-900/95 backdrop-blur-xl px-4 pt-2 pb-5 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3.5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium ${
                  isActive
                    ? 'text-cyan-400 bg-navy-800 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <Icon className="w-4 h-4 mr-2.5 text-slate-400" />
                {item.name}
              </Link>
            )
          })}

          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            {user ? (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3.5 py-2.5 rounded-lg text-xs font-mono text-cyan-300 bg-navy-800/60 border border-cyan-500/20"
              >
                <User className="w-4 h-4 mr-2.5 text-cyan-400" />
                <span>Account Profile ({user.email})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3.5 py-2.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-navy-800/40 border border-slate-800"
              >
                <LogIn className="w-4 h-4 mr-2.5 text-slate-400" />
                <span>Student Sign In / Register</span>
              </Link>
            )}

            <Link
              to="/upload"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-headline font-semibold uppercase tracking-wider bg-cyan-500 text-navy-950 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            >
              <span>Launch Readiness Audit</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
