import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function fmtTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState(null)
  const [deleting,  setDeleting]  = useState(null)
  const [newCount,  setNewCount]  = useState(0)
  const listRef = useRef(enquiries)
  useEffect(() => { listRef.current = enquiries }, [enquiries])

  async function fetchEnquiries() {
    setLoading(true)
    const { data, error } = await supabase
      .from('client_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setEnquiries(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchEnquiries()
    const channel = supabase
      .channel('enquiries-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'client_requests' },
        (payload) => {
          if (listRef.current.some(e => e.id === payload.new.id)) return
          setEnquiries(prev => [payload.new, ...prev])
          setNewCount(n => n + 1)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function deleteEnquiry(id) {
    if (!window.confirm('Delete this enquiry? This cannot be undone.')) return
    setDeleting(id)
    const { error } = await supabase.from('client_requests').delete().eq('id', id)
    if (!error) {
      setEnquiries(prev => prev.filter(e => e.id !== id))
      if (expanded === id) setExpanded(null)
    }
    setDeleting(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif font-bold text-brand-navy text-2xl">Enquiries</h1>
            {newCount > 0 && (
              <span className="text-xs font-semibold bg-brand-gold text-white px-2 py-0.5 rounded-full animate-pulse">
                {newCount} new
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Messages submitted by visitors through the public contact forms.
          </p>
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1.5 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          Live updates
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading enquiries…</div>
        ) : enquiries.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400 text-sm">No enquiries yet.</p>
            <p className="text-gray-300 text-xs mt-1">They will appear here when visitors submit the contact form.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {enquiries.map(e => (
              <div key={e.id} className="hover:bg-gray-50/60 transition-colors">

                {/* Summary row */}
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  {/* Clickable left side — expand/collapse */}
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                    aria-expanded={expanded === e.id}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-brand-navy text-sm">{e.name}</p>
                      {e.service && (
                        <span className="text-[10px] font-medium border border-brand-gold/40 text-brand-gold bg-brand-gold/5 px-2 py-0.5 rounded">
                          {e.service}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">{e.email}</span>
                      {e.phone && <span className="text-xs text-gray-400">{e.phone}</span>}
                    </div>
                    {expanded !== e.id && (
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-md">{e.message}</p>
                    )}
                  </button>

                  {/* Right — date, expand chevron, delete */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500">{fmt(e.created_at)}</p>
                      <p className="text-[11px] text-gray-300">{fmtTime(e.created_at)}</p>
                    </div>

                    {/* Expand chevron */}
                    <button
                      onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                      className="p-1 text-gray-300 hover:text-gray-500 transition-colors"
                      aria-label="Toggle details"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${expanded === e.id ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteEnquiry(e.id)}
                      disabled={deleting === e.id}
                      className="p-1 text-gray-300 hover:text-gray-600 transition-colors disabled:opacity-40"
                      aria-label="Delete enquiry"
                      title="Delete this enquiry"
                    >
                      {deleting === e.id ? (
                        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin block" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === e.id && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="grid sm:grid-cols-2 gap-4 mt-4 mb-4">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Name</p>
                        <p className="text-sm text-brand-navy font-medium">{e.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Received</p>
                        <p className="text-sm text-gray-600">{fmt(e.created_at)} at {fmtTime(e.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                        <a href={`mailto:${e.email}`} className="text-sm text-brand-navy hover:text-brand-gold transition-colors">
                          {e.email}
                        </a>
                      </div>
                      {e.phone && (
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                          <a href={`tel:${e.phone}`} className="text-sm text-brand-navy hover:text-brand-gold transition-colors">
                            {e.phone}
                          </a>
                        </div>
                      )}
                      {e.service && (
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Service Enquired</p>
                          <p className="text-sm text-gray-600">{e.service}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</p>
                      <p className="text-sm text-gray-700 leading-relaxed bg-brand-light rounded-lg px-4 py-3 whitespace-pre-line">
                        {e.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {e.email ? (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(e.email)}&su=${encodeURIComponent('Regarding your enquiry with Prasad & Co')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium border border-brand-navy text-brand-navy rounded-lg px-4 py-2 hover:bg-brand-navy hover:text-white transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Reply via Gmail
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-300 rounded-lg px-4 py-2 cursor-not-allowed">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          No email provided
                        </span>
                      )}
                      {e.phone && (
                        <a
                          href={`tel:${e.phone}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg px-4 py-2 hover:border-brand-navy hover:text-brand-navy transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call
                        </a>
                      )}
                      <button
                        onClick={() => deleteEnquiry(e.id)}
                        disabled={deleting === e.id}
                        className="inline-flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-400 rounded-lg px-4 py-2 hover:border-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40 ml-auto"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deleting === e.id ? 'Deleting…' : 'Delete Enquiry'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
