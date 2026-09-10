import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function LatestUpdates() {
  const [updates,  setUpdates]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    supabase
      .from('updates')
      .select('id, title, description, date, pdf_url')
      .eq('published', true)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setUpdates(data || [])
        setLoading(false)
      })
  }, [])

  if (loading || updates.length === 0) return null

  const [latest, ...older] = updates

  return (
    <section className="py-16 md:py-20 bg-brand-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <div className="text-center mb-10">
          <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">
            Stay Informed
          </span>
          <h2 className="section-heading mt-3">Latest Updates</h2>
          <p className="section-subheading mx-auto text-center mt-2">
            Important announcements, deadlines, and regulatory changes.
          </p>
        </div>

        {/* ── Newest update — featured card ───────────────── */}
        <div className="bg-white rounded-2xl border-l-4 border-brand-gold shadow-sm overflow-hidden mb-4">
          <button
            onClick={() => setExpanded(expanded === latest.id ? null : latest.id)}
            className="w-full text-left px-5 sm:px-6 py-5 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
            aria-expanded={expanded === latest.id}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-brand-gold">
                  Latest
                </span>
                <span className="text-xs text-gray-400">{fmtDate(latest.date)}</span>
                {latest.pdf_url && (
                  <span className="text-[10px] font-medium text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    PDF
                  </span>
                )}
              </div>
              <p className="font-serif font-bold text-brand-navy text-lg leading-snug">{latest.title}</p>
              {expanded !== latest.id && (
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{latest.description}</p>
              )}
            </div>
            <svg
              className={`flex-shrink-0 w-5 h-5 text-gray-400 mt-1 transition-transform duration-200 ${expanded === latest.id ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded === latest.id && (
            <div className="px-5 sm:px-6 pb-5 border-t border-gray-100">
              <p className="text-gray-600 text-sm leading-relaxed mt-4 whitespace-pre-line">{latest.description}</p>
              {latest.pdf_url && (
                <a href={latest.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-brand-navy border border-brand-gold/40 bg-brand-gold/5 hover:bg-brand-gold/10 px-4 py-2 rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  Download PDF
                </a>
              )}
            </div>
          )}
        </div>

        {/* ── Older updates — compact timeline list ───────── */}
        {older.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {older.map(u => (
              <div key={u.id}>
                <button
                  onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                  className="w-full text-left px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  aria-expanded={expanded === u.id}
                >
                  <div className="min-w-0 flex items-center gap-3">
                    {/* Timeline dot */}
                    <span className="w-2 h-2 rounded-full bg-brand-gold/40 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-brand-navy text-sm truncate">{u.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDate(u.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {u.pdf_url && (
                      <span className="text-[10px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">PDF</span>
                    )}
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded === u.id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expanded === u.id && (
                  <div className="px-5 sm:px-6 pb-4 border-t border-gray-50">
                    <p className="text-gray-600 text-sm leading-relaxed mt-3 whitespace-pre-line">{u.description}</p>
                    {u.pdf_url && (
                      <a href={u.pdf_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-brand-navy border border-brand-gold/40 bg-brand-gold/5 hover:bg-brand-gold/10 px-4 py-2 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        Download PDF
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
