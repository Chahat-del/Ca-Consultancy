import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function Updates() {
  const [updates,  setUpdates]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [toggling, setToggling] = useState(null)

  async function fetchUpdates() {
    setLoading(true)
    const { data, error } = await supabase
      .from('updates')
      .select('id, title, description, date, published, created_at')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error) setUpdates(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchUpdates() }, [])

  async function togglePublish(update) {
    setToggling(update.id)
    await supabase.from('updates').update({ published: !update.published }).eq('id', update.id)
    setUpdates(prev => prev.map(u => u.id === update.id ? { ...u, published: !u.published } : u))
    setToggling(null)
  }

  async function deleteUpdate(id) {
    if (!window.confirm('Delete this update? This cannot be undone.')) return
    setDeleting(id)
    await supabase.from('updates').delete().eq('id', id)
    setUpdates(prev => prev.filter(u => u.id !== id))
    setDeleting(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif font-bold text-brand-navy text-2xl">Latest Updates</h1>
          <p className="text-gray-500 text-sm mt-1">Manage what appears on the public website.</p>
        </div>
        <Link to="/admin/updates/new" className="btn-primary text-sm self-start sm:self-auto">
          + New Update
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading updates…</div>
        ) : updates.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm mb-4">No updates yet. Add the first one.</p>
            <Link to="/admin/updates/new" className="btn-primary text-sm">+ Add Update</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Title</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">Date</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {updates.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-brand-navy truncate">{u.title}</p>
                        {u.pdf_url && (
                          <a href={u.pdf_url} target="_blank" rel="noopener noreferrer"
                            title="View PDF"
                            className="flex-shrink-0 text-[10px] font-semibold tracking-wide border border-brand-gold/40 text-brand-gold bg-brand-gold/5 px-1.5 py-0.5 rounded hover:bg-brand-gold/10 transition-colors">
                            PDF
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{u.description}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap text-sm">{fmt(u.date)}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePublish(u)}
                        disabled={toggling === u.id}
                        title={u.published ? 'Click to unpublish' : 'Click to publish'}
                        className={`text-xs font-medium px-2.5 py-1 rounded border transition-opacity hover:opacity-70 disabled:opacity-40 ${
                          u.published
                            ? 'border-brand-gold/40 text-brand-gold bg-brand-gold/5'
                            : 'border-gray-200 text-gray-400 bg-gray-50'
                        }`}
                      >
                        {toggling === u.id ? '…' : u.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/updates/${u.id}/edit`}
                          className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteUpdate(u.id)}
                          disabled={deleting === u.id}
                          className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
                        >
                          {deleting === u.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
