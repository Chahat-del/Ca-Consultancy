import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function isOverdue(task) {
  if (!task.deadline || task.status === 'Completed') return false
  return new Date(task.deadline) < new Date(new Date().toDateString())
}

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function Dashboard() {
  const [updateStats,   setUpdateStats]   = useState({ total: 0, published: 0, draft: 0 })
  const [taskStats,     setTaskStats]     = useState({ total: 0, pending: 0, inProgress: 0, overdue: 0 })
  const [enquiryCount,  setEnquiryCount]  = useState(0)
  const [recentUpdates, setRecentUpdates] = useState([])
  const [urgentTasks,   setUrgentTasks]   = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { data: recentU },
        { count: totalU },
        { count: pubU },
        { data: allTasks },
        { count: enqCount },
      ] = await Promise.all([
        supabase.from('updates').select('id,title,date,published').order('created_at', { ascending: false }).limit(5),
        supabase.from('updates').select('*', { count: 'exact', head: true }),
        supabase.from('updates').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('tasks').select('*').eq('source', 'manual').neq('status', 'Completed').order('deadline', { ascending: true }),
        supabase.from('client_requests').select('*', { count: 'exact', head: true }),
      ])

      setUpdateStats({ total: totalU || 0, published: pubU || 0, draft: (totalU || 0) - (pubU || 0) })
      setRecentUpdates(recentU || [])
      setEnquiryCount(enqCount || 0)

      const tasks = allTasks || []
      setTaskStats({
        total:      tasks.length,
        pending:    tasks.filter(t => t.status === 'Pending').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        overdue:    tasks.filter(t => isOverdue(t)).length,
      })
      setUrgentTasks(tasks.filter(t => isOverdue(t) || t.priority === 'High').slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  const V = (n) => loading ? '—' : n  // display helper

  return (
    <div className="space-y-7">

      {/* Page title */}
      <div>
        <h1 className="font-serif font-bold text-brand-navy text-2xl">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here's a quick overview.</p>
      </div>

      {/* ── Updates row ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Latest Updates</p>
          <Link to="/admin/updates" className="text-xs text-brand-gold hover:underline">Manage →</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',     value: V(updateStats.total),     active: false },
            { label: 'Published', value: V(updateStats.published), active: true  },
            { label: 'Drafts',    value: V(updateStats.draft),     active: false },
          ].map(({ label, value, active }) => (
            <div key={label} className={`rounded-xl border p-4 ${active ? 'bg-brand-navy border-brand-navy' : 'bg-white border-gray-200'}`}>
              <p className={`text-2xl font-serif font-bold ${active ? 'text-white' : 'text-brand-navy'}`}>{value}</p>
              <p className={`text-xs mt-0.5 ${active ? 'text-gray-300' : 'text-gray-500'}`}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tasks row ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tasks</p>
          <Link to="/admin/tasks" className="text-xs text-brand-gold hover:underline">Manage →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Active Tasks', value: V(taskStats.total),      to: '/admin/tasks',                   active: false },
            { label: 'Pending',      value: V(taskStats.pending),    to: '/admin/tasks?status=Pending',     active: false },
            { label: 'In Progress',  value: V(taskStats.inProgress), to: '/admin/tasks?status=In+Progress', active: false },
            { label: 'Overdue',      value: V(taskStats.overdue),    to: '/admin/tasks?status=Overdue',     active: taskStats.overdue > 0 },
          ].map(({ label, value, to, active }) => (
            <Link
              key={label}
              to={to}
              className={`rounded-xl border p-4 block hover:shadow-sm transition-all group ${
                active ? 'bg-brand-navy border-brand-navy' : 'bg-white border-gray-200 hover:border-brand-gold/50'
              }`}
            >
              <p className={`text-2xl font-serif font-bold ${active ? 'text-white' : 'text-brand-navy'}`}>{value}</p>
              <p className={`text-xs mt-0.5 ${active ? 'text-gray-300' : 'text-gray-500'}`}>{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Enquiries row ───────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Enquiries</p>
          <Link to="/admin/enquiries" className="text-xs text-brand-gold hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Link
            to="/admin/enquiries"
            className="rounded-xl border bg-white border-gray-200 hover:border-brand-gold/50 p-4 flex items-center justify-between hover:shadow-sm transition-all"
          >
            <div>
              <p className="text-2xl font-serif font-bold text-brand-navy">{V(enquiryCount)}</p>
              <p className="text-xs mt-0.5 text-gray-500">Total Enquiries Received</p>
            </div>
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Detail panel — Recent Updates (full width) ────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <p className="font-semibold text-brand-navy text-sm">Recent Updates</p>
          <Link to="/admin/updates/new" className="text-xs text-brand-gold hover:underline">+ Add</Link>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-center text-gray-400 text-sm">Loading…</p>
        ) : recentUpdates.length === 0 ? (
          <p className="px-5 py-10 text-center text-gray-400 text-sm">No updates yet.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentUpdates.map(u => (
              <li key={u.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-navy truncate">{u.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmt(u.date)}</p>
                </div>
                <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded border ${
                  u.published
                    ? 'border-brand-gold/40 text-brand-gold bg-brand-gold/5'
                    : 'border-gray-200 text-gray-400 bg-gray-50'
                }`}>
                  {u.published ? 'Live' : 'Draft'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-brand-navy rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white text-sm">New Update</p>
            <p className="text-xs text-gray-400 mt-0.5">Publish to the public website.</p>
          </div>
          <Link to="/admin/updates/new" className="flex-shrink-0 text-xs font-semibold bg-brand-gold text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors">
            + Add
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-brand-navy text-sm">New Task</p>
            <p className="text-xs text-gray-500 mt-0.5">Track client or internal work.</p>
          </div>
          <Link to="/admin/tasks/new" className="flex-shrink-0 text-xs font-semibold bg-brand-navy text-white px-4 py-2 rounded hover:bg-blue-950 transition-colors">
            + Add
          </Link>
        </div>
      </div>

    </div>
  )
}
