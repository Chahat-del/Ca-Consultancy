import { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// ── Style maps ────────────────────────────────────────────────
const STATUS_STYLE = {
  'Pending':     'border-brand-gold/40 text-brand-gold   bg-brand-gold/5',
  'In Progress': 'border-brand-navy/30 text-brand-navy   bg-brand-navy/5',
  'Completed':   'border-gray-300      text-gray-500     bg-gray-50',
}

const PRIORITY_STYLE = {
  'High':   'text-brand-navy font-semibold',
  'Medium': 'text-gray-600',
  'Low':    'text-gray-400',
}

const PRIORITY_DOT = {
  'High':   'bg-brand-gold',
  'Medium': 'bg-gray-400',
  'Low':    'bg-gray-300',
}

const STATUSES = ['Pending', 'In Progress', 'Completed']

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

// ── Inline status dropdown ────────────────────────────────────
function StatusSelect({ task, onUpdate }) {
  const [saving, setSaving] = useState(false)

  async function handleChange(e) {
    const next = e.target.value
    if (next === task.status) return
    setSaving(true)
    const { error } = await supabase
      .from('tasks')
      .update({ status: next })
      .eq('id', task.id)
    if (!error) onUpdate(task.id, next)
    setSaving(false)
  }

  return (
    <div className="relative inline-block">
      <select
        value={task.status}
        onChange={handleChange}
        disabled={saving}
        className={`appearance-none text-xs font-medium pl-2.5 pr-6 py-1 rounded-md border cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed transition-opacity
          ${STATUS_STYLE[task.status]}`}
        aria-label="Change task status"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {/* Custom chevron */}
      {saving ? (
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin block opacity-60" />
        </span>
      ) : (
        <svg
          className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 opacity-60"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function Tasks() {
  const [tasks,    setTasks]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const filterStatus = searchParams.get('status') || 'All'

  // Keep a ref to the latest tasks list for use inside realtime callbacks
  const tasksRef = useRef(tasks)
  useEffect(() => { tasksRef.current = tasks }, [tasks])

  function setFilter(status) {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev)
      status === 'All' ? p.delete('status') : p.set('status', status)
      return p
    })
  }

  // ── Initial fetch — admin tasks only (source = 'manual') ──
  async function fetchTasks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('source', 'manual')
      .order('created_at', { ascending: false })
    if (!error) setTasks(data || [])
    setLoading(false)
  }

  // ── Realtime subscription ─────────────────────────────────
  useEffect(() => {
    fetchTasks()

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const newTask = payload.new
          // Only show manual tasks here — client_request tasks go to Enquiries
          if (newTask.source !== 'manual') return
          if (tasksRef.current.some(t => t.id === newTask.id)) return
          setTasks(prev => [newTask, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          setTasks(prev =>
            prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t)
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tasks' },
        (payload) => {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Inline status update callback ────────────────────────
  function handleStatusUpdate(id, newStatus) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  // ── Delete ────────────────────────────────────────────────
  async function deleteTask(id) {
    if (!window.confirm('Delete this task? This cannot be undone.')) return
    setDeleting(id)
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id))
    } else {
      console.error('Delete failed:', error.message)
      alert('Failed to delete task. Please try again.')
    }
    setDeleting(null)
  }

  // ── Derived stats ─────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      tasks.length,
    pending:    tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed:  tasks.filter(t => t.status === 'Completed').length,
    overdue:    tasks.filter(t => isOverdue(t)).length,
  }), [tasks])

  // ── Filtered + sorted list ────────────────────────────────
  const visible = useMemo(() => {
    let list = [...tasks]
    if (filterStatus === 'Overdue')  list = list.filter(isOverdue)
    else if (filterStatus !== 'All') list = list.filter(t => t.status === filterStatus)
    list.sort((a, b) => {
      const aOver = isOverdue(a), bOver = isOverdue(b)
      if (aOver && !bOver) return -1
      if (!aOver && bOver) return 1
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline) - new Date(b.deadline)
    })
    return list
  }, [tasks, filterStatus])

  const statCards = [
    { label: 'Total Tasks',  value: stats.total,      filter: 'All'         },
    { label: 'Pending',      value: stats.pending,     filter: 'Pending'     },
    { label: 'In Progress',  value: stats.inProgress,  filter: 'In Progress' },
    { label: 'Completed',    value: stats.completed,   filter: 'Completed'   },
    { label: 'Overdue',      value: stats.overdue,     filter: 'Overdue'     },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif font-bold text-brand-navy text-2xl">Task Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage internal tasks.</p>
        </div>
        <Link to="/admin/tasks/new" className="btn-primary text-sm self-start sm:self-auto">
          + New Task
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {statCards.map(({ label, value, filter }) => {
          const active = filterStatus === filter
          return (
            <button
              key={label}
              onClick={() => setFilter(filter)}
              className={`rounded-xl p-4 text-left border transition-all hover:border-brand-gold/50 hover:shadow-sm ${
                active ? 'bg-brand-navy border-brand-navy shadow-sm' : 'bg-white border-gray-200'
              }`}
            >
              <p className={`text-2xl font-serif font-bold ${active ? 'text-white' : 'text-brand-navy'}`}>
                {loading ? '—' : value}
              </p>
              <p className={`text-xs mt-0.5 ${active ? 'text-gray-300' : 'text-gray-500'}`}>{label}</p>
            </button>
          )
        })}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {['All', 'Pending', 'In Progress', 'Completed', 'Overdue'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filterStatus === s
                ? 'bg-brand-navy text-white border-brand-navy'
                : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-brand-navy'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-auto flex items-center gap-1.5">
          {/* Live indicator */}
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" title="Live updates enabled" />
          {visible.length} task{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading tasks…</div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm mb-4">
              {filterStatus === 'All' ? 'No tasks yet.' : `No ${filterStatus.toLowerCase()} tasks.`}
            </p>
            {filterStatus === 'All' && (
              <Link to="/admin/tasks/new" className="btn-primary text-sm">+ Add Task</Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50/70">
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Task</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">Priority</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">Start Date</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">Deadline</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map(t => {
                  const overdue = isOverdue(t)
                  return (
                    <tr
                      key={t.id}
                      className={`transition-colors ${
                        overdue ? 'bg-brand-gold/[0.03] hover:bg-brand-gold/[0.06]' : 'hover:bg-gray-50/60'
                      }`}
                    >
                      {/* Task title */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-brand-navy truncate">{t.title}</p>
                          {overdue && (
                            <span className="flex-shrink-0 text-[10px] font-semibold tracking-wide border border-brand-gold/50 text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{t.description}</p>
                        )}
                      </td>

                      {/* Status — dropdown */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusSelect task={t} onUpdate={handleStatusUpdate} />
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`flex items-center gap-1.5 text-xs ${PRIORITY_STYLE[t.priority]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority]}`} />
                          {t.priority}
                        </span>
                      </td>

                      {/* Start Date */}
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fmt(t.start_date)}
                      </td>

                      {/* Deadline */}
                      <td className={`px-5 py-4 whitespace-nowrap text-sm ${
                        overdue ? 'text-brand-gold font-medium' : 'text-gray-500'
                      }`}>
                        {fmt(t.deadline)}
                      </td>                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/tasks/${t.id}/edit`}
                            className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteTask(t.id)}
                            disabled={deleting === t.id}
                            className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
                          >
                            {deleting === t.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
