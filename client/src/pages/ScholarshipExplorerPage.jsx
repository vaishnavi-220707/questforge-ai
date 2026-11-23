import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Calendar, Award, CheckSquare, ArrowRight, AlertCircle, RefreshCw, Compass, Shield, ArrowUpRight } from 'lucide-react'
import { fetchScholarships } from '../services/api'
import { SpatialCard } from '../components/common/SpatialCard'

export function ScholarshipExplorerPage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [educationLevel, setEducationLevel] = useState('All')

  const loadScholarships = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchScholarships({ search, category, educationLevel })
      setScholarships(response.data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch scholarships')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadScholarships()
  }, [category, educationLevel])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadScholarships()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono uppercase tracking-wider text-cyan-400">
            <Compass className="w-3.5 h-3.5 mr-1" />
            Scholarship Explorer
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
            Synthetic Demonstration Data
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-white tracking-tight">
          Configured Scholarship Index
        </h1>
        <p className="text-sm text-slate-300 font-sans leading-relaxed">
          Browse verified scholarship schemes with configured mandatory checklists and eligibility thresholds. Select a program to inspect rule clauses or launch a pre-submission document audit.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <SpatialCard className="p-4 sm:p-5" glow>
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, provider, or code (e.g. NMTS)..."
              className="w-full bg-navy-950/90 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-navy-950/90 border border-slate-700/80 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            >
              <option value="All">All Categories</option>
              <option value="Merit-Cum-Means">Merit-Cum-Means</option>
              <option value="Merit-Based">Merit-Based</option>
              <option value="Need-Based">Need-Based</option>
            </select>
          </div>

          {/* Education Level Filter */}
          <div>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full bg-navy-950/90 border border-slate-700/80 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            >
              <option value="All">All Education Levels</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>
        </form>
      </SpatialCard>

      {/* Scholarship List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Querying configured scholarship rule index...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-950/40 border border-rose-900/80 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-sm font-headline font-semibold text-white">Failed to Query Scholarships</h3>
          <p className="text-xs text-rose-200">{error}</p>
          <button
            onClick={loadScholarships}
            className="px-4 py-2 rounded-lg text-xs font-mono bg-navy-900 border border-slate-700 text-white hover:border-cyan-400"
          >
            Retry Connection
          </button>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="p-14 bg-navy-900/80 border border-slate-800 rounded-xl text-center space-y-3">
          <p className="text-xs font-mono text-slate-400">No scholarships match the selected query.</p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setEducationLevel('All'); }}
            className="px-4 py-2 rounded-lg text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((sch) => (
            <SpatialCard
              key={sch.id}
              className="flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-all hover:-translate-y-0.5"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-navy-950 border border-cyan-500/20">
                    {sch.code}
                  </span>
                  {sch.isDemonstration && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Demonstration
                    </span>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-headline font-bold text-white tracking-tight leading-snug">
                  {sch.title}
                </h2>

                <p className="text-xs text-slate-400">
                  <strong className="text-slate-300 font-medium">Provider:</strong> {sch.provider}
                </p>

                <p className="text-xs text-slate-300 line-clamp-2 font-sans leading-relaxed">
                  {sch.description}
                </p>

                <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-300 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <Award className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
                      Award:
                    </span>
                    <span className="font-semibold text-white">{sch.awardAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                      Deadline:
                    </span>
                    <span className="text-slate-300">{sch.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
                      Mandatory:
                    </span>
                    <span className="text-emerald-400">{sch.mandatoryDocuments?.length || 0} Documents</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <Link
                  to={`/scholarships/${sch.id}`}
                  className="text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors underline"
                >
                  View Rules
                </Link>
                <Link
                  to={`/upload?scholarshipId=${sch.id}`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-headline font-semibold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-navy-950 shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all"
                >
                  <span>Audit Documents</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </SpatialCard>
          ))}
        </div>
      )}
    </div>
  )
}
