import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

// How long each headline is visible before sliding to the next (ms)
const INTERVAL = 4500

export default function AnnouncementBar() {
  const [updates,  setUpdates]  = useState([])
  const [current,  setCurrent]  = useState(0)
  const [visible,  setVisible]  = useState(true)   // bar dismissed?
  const [drawer,   setDrawer]   = useState(null)    // update object shown in drawer
  const [animate,  setAnimate]  = useState(false)   // ticker slide animation
  const timerRef = useRef(null)

  useEffect(() => {
    supabase
      .from('updates')
      .select('id, title, description, date, pdf_url')
      .eq('published', true)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setUpdates(data || []))
  }, [])

  // Auto-advance ticker
  useEffect(() => {
    if (updates.length < 2 || !visible) return
    timerRef.current = setInterval(() => {
      setAnimate(true)
      setTimeout(() => {
        setCurrent(c => (c + 1) % updates.length)
        setAnimate(false)
      }, 350)
    }, INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [updates, visible])

  // Nothing published → render nothing
  if (!visible || updates.length === 0) return null

  const u = updates[current]

  return (
    <>
      {/* ── Announcement bar ─────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-brand-navy border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">

          {/* Left label */}
          <span className="hidden sm:flex items-center gap-1.5 text-brand-gold text-[11px] font-semibold tracking-widest uppercase flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
            Updates
          </span>

          {/* Ticker headline — clickable */}
          <button
            onClick={() => setDrawer(u)}
            className={`flex-1 text-left text-white text-xs font-medium truncate hover:text-brand-gold transition-all duration-300 ${
              animate ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
            }`}
            style={{ transform: animate ? 'translateY(4px)' : 'translateY(0)', transition: 'opacity 0.3s, transform 0.3s' }}
          >
            {u.title}
          </button>

          {/* Right — dot nav + read more + close */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Dot indicators */}
            {updates.length > 1 && (
              <div className="hidden sm:flex items-center gap-1">
                {updates.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`rounded-full transition-all ${
                      i === current ? 'w-3 h-1.5 bg-brand-gold' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to update ${i + 1}`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={() => setDrawer(u)}
              className="text-[11px] font-medium text-brand-gold hover:text-yellow-400 transition-colors whitespace-nowrap"
            >
              Read more →
            </button>

            <button
              onClick={() => setVisible(false)}
              className="text-white/40 hover:text-white/80 transition-colors ml-1"
              aria-label="Dismiss announcements"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Drawer overlay ────────────────────────────────── */}
      {drawer && (
        <div
          className="fixed inset-0 z-[70] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Update details"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawer(null)}
          />

          {/* Panel */}
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slideIn overflow-hidden">

            {/* Drawer header */}
            <div className="bg-brand-navy px-6 py-5 flex items-start justify-between gap-4 flex-shrink-0">
              <div className="min-w-0">
                <span className="text-brand-gold text-[10px] font-semibold tracking-widest uppercase">
                  {new Date(drawer.date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
                <h2 className="font-serif font-bold text-white text-lg leading-snug mt-1">
                  {drawer.title}
                </h2>
              </div>
              <button
                onClick={() => setDrawer(null)}
                className="flex-shrink-0 mt-0.5 text-white/50 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {drawer.description}
              </p>

              {drawer.pdf_url && (
                <a
                  href={drawer.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 border border-brand-gold/30 bg-brand-gold/5 hover:bg-brand-gold/10 rounded-xl px-5 py-4 transition-colors group"
                >
                  <span className="w-10 h-10 rounded-lg bg-brand-navy flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-navy group-hover:text-brand-gold transition-colors">
                      Download PDF
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Opens in a new tab</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-gold transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>

            {/* Footer — browse other updates */}
            {updates.length > 1 && (
              <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">Other updates</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {updates.filter(x => x.id !== drawer.id).map(x => (
                    <button
                      key={x.id}
                      onClick={() => setDrawer(x)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-light transition-colors group"
                    >
                      <p className="text-xs font-medium text-brand-navy group-hover:text-brand-gold transition-colors truncate">
                        {x.title}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(x.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
