import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const EMPTY = {
  title:       '',
  description: '',
  status:      'Pending',
  priority:    'Medium',
  start_date:  '',
  deadline:    '',
}

const STATUSES   = ['Pending', 'In Progress', 'Completed']
const PRIORITIES = ['Low', 'Medium', 'High']

export default function TaskForm() {
  const { id }   = useParams()
  const isEdit   = Boolean(id)
  const navigate = useNavigate()

  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!isEdit) return
    supabase
      .from('tasks').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setError('Task not found.'); return }
        setForm({
          title:       data.title,
          description: data.description || '',
          status:      data.status,
          priority:    data.priority,
          start_date:  data.start_date  || '',
          deadline:    data.deadline    || '',
        })
        setLoading(false)
      })
  }, [id])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Task title is required.'); return }

    // Validate: start_date must be before or equal to deadline if both set
    if (form.start_date && form.deadline && form.start_date > form.deadline) {
      setError('Start date cannot be after the deadline.')
      return
    }

    setError('')
    setSaving(true)

    const payload = {
      title:       form.title.trim(),
      description: form.description.trim(),
      status:      form.status,
      priority:    form.priority,
      start_date:  form.start_date || null,
      deadline:    form.deadline   || null,
    }

    const { error: dbError } = isEdit
      ? await supabase.from('tasks').update(payload).eq('id', id)
      : await supabase.from('tasks').insert(payload)

    if (dbError) { setError('Failed to save: ' + dbError.message); setSaving(false); return }
    navigate('/admin/tasks')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-[3px] border-brand-navy border-t-brand-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/tasks" className="text-gray-400 hover:text-brand-navy transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-serif font-bold text-brand-navy text-2xl">{isEdit ? 'Edit Task' : 'New Task'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{isEdit ? 'Update the task details.' : 'Fill in the details to create a task.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="title">
            Task Title <span className="text-brand-gold">*</span>
          </label>
          <input
            id="title" name="title" type="text" required maxLength={250}
            value={form.title} onChange={handleChange}
            placeholder="e.g. GST Return Filing — ABC Ltd"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="description">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="description" name="description" rows={4}
            value={form.description} onChange={handleChange}
            placeholder="Notes or context for this task…"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition resize-y"
          />
        </div>

        {/* Status + Priority */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button
                  key={s} type="button"
                  onClick={() => setForm(prev => ({ ...prev, status: s }))}
                  className={`text-xs font-medium px-3 py-1.5 rounded border transition-all ${
                    form.status === s
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p} type="button"
                  onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                  className={`text-xs font-medium px-3 py-1.5 rounded border transition-all ${
                    form.priority === p
                      ? 'bg-brand-gold text-white border-brand-gold'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Date + Deadline side by side */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="start_date">
              Start Date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="start_date" name="start_date" type="date"
              value={form.start_date} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="deadline">
              Deadline <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="deadline" name="deadline" type="date"
              value={form.deadline} onChange={handleChange}
              min={form.start_date || undefined}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition"
            />
            {form.deadline && new Date(form.deadline) < new Date(new Date().toDateString()) && form.status !== 'Completed' && (
              <p className="text-xs text-brand-gold mt-1.5">⚠ This deadline is in the past.</p>
            )}
          </div>
        </div>

        {error && (
          <div className="border border-gray-300 bg-gray-50 text-gray-700 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit" disabled={saving}
            className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </span>
            ) : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
          <Link to="/admin/tasks" className="text-sm text-gray-400 hover:text-brand-navy transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
