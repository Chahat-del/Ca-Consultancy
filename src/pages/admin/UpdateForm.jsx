import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const EMPTY = {
  title:       '',
  description: '',
  date:        new Date().toISOString().split('T')[0],
  published:   false,
  pdf_url:     null,
}

const MAX_PDF_MB = 10

export default function UpdateForm() {
  const { id }   = useParams()
  const isEdit   = Boolean(id)
  const navigate = useNavigate()

  const [form,         setForm]         = useState(EMPTY)
  const [loading,      setLoading]      = useState(isEdit)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')
  // PDF state
  const [pdfFile,      setPdfFile]      = useState(null)   // File object chosen by admin
  const [pdfUploading, setPdfUploading] = useState(false)
  const [pdfProgress,  setPdfProgress]  = useState(0)
  const [removePdf,    setRemovePdf]    = useState(false)  // admin flagged existing PDF for removal
  const fileInputRef = useRef(null)

  // Load existing record when editing
  useEffect(() => {
    if (!isEdit) return
    supabase
      .from('updates').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setError('Update not found.'); return }
        setForm({
          title:       data.title,
          description: data.description,
          date:        data.date,
          published:   data.published,
          pdf_url:     data.pdf_url || null,
        })
        setLoading(false)
      })
  }, [id])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setError(`PDF must be under ${MAX_PDF_MB} MB.`)
      e.target.value = ''
      return
    }
    setError('')
    setPdfFile(file)
    setRemovePdf(false)
  }

  function clearFileChoice() {
    setPdfFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Upload PDF to Supabase Storage, return public URL
  async function uploadPdf(file, updateId) {
    setPdfUploading(true)
    setPdfProgress(0)
    const ext      = 'pdf'
    const path     = `${updateId}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('update-pdfs')
      .upload(path, file, { contentType: 'application/pdf', upsert: true })

    if (upErr) {
      setPdfUploading(false)
      throw new Error('PDF upload failed: ' + upErr.message)
    }

    const { data } = supabase.storage.from('update-pdfs').getPublicUrl(path)
    setPdfUploading(false)
    setPdfProgress(100)
    return data.publicUrl
  }

  // Delete old PDF from storage when replacing or removing
  async function deleteOldPdf(url) {
    if (!url) return
    try {
      // Extract path from URL: …/update-pdfs/<path>
      const marker = '/update-pdfs/'
      const idx    = url.indexOf(marker)
      if (idx === -1) return
      const storagePath = url.slice(idx + marker.length)
      await supabase.storage.from('update-pdfs').remove([storagePath])
    } catch (e) {
      console.warn('Could not delete old PDF:', e)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.')
      return
    }
    setError('')
    setSaving(true)

    try {
      // ── Determine final pdf_url ──────────────────────────
      let finalPdfUrl = form.pdf_url

      if (removePdf && form.pdf_url) {
        await deleteOldPdf(form.pdf_url)
        finalPdfUrl = null
      }

      if (pdfFile) {
        // Need a real ID to use as the storage folder
        // For new records, insert first to get the ID, then upload
        if (!isEdit) {
          const { data: newRow, error: insErr } = await supabase
            .from('updates')
            .insert({
              title:       form.title.trim(),
              description: form.description.trim(),
              date:        form.date,
              published:   form.published,
              pdf_url:     null,
            })
            .select('id')
            .single()

          if (insErr) throw new Error(insErr.message)

          if (form.pdf_url) await deleteOldPdf(form.pdf_url)
          finalPdfUrl = await uploadPdf(pdfFile, newRow.id)

          await supabase.from('updates').update({ pdf_url: finalPdfUrl }).eq('id', newRow.id)
          navigate('/admin/updates')
          return
        } else {
          if (form.pdf_url) await deleteOldPdf(form.pdf_url)
          finalPdfUrl = await uploadPdf(pdfFile, id)
        }
      }

      // ── Save / update the row ────────────────────────────
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        date:        form.date,
        published:   form.published,
        pdf_url:     finalPdfUrl,
      }

      const { error: dbError } = isEdit
        ? await supabase.from('updates').update(payload).eq('id', id)
        : await supabase.from('updates').insert(payload)

      if (dbError) throw new Error(dbError.message)
      navigate('/admin/updates')

    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to save.')
      setSaving(false)
      setPdfUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-navy border-t-brand-gold rounded-full animate-spin" />
      </div>
    )
  }

  const isBusy = saving || pdfUploading

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/updates" className="text-gray-400 hover:text-brand-navy transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-serif font-bold text-brand-navy text-2xl">
            {isEdit ? 'Edit Update' : 'New Update'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? 'Modify the existing entry.' : 'This will appear on the public website when published.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="title">
            Title <span className="text-brand-gold">*</span>
          </label>
          <input
            id="title" name="title" type="text" required maxLength={200}
            value={form.title} onChange={handleChange}
            placeholder="e.g. Income Tax Return Filing Deadline Extended"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="description">
            Description / Content <span className="text-brand-gold">*</span>
          </label>
          <textarea
            id="description" name="description" required rows={6}
            value={form.description} onChange={handleChange}
            placeholder="Provide full details about this update…"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition resize-y"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="date">Date</label>
          <input
            id="date" name="date" type="date"
            value={form.date} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition"
          />
        </div>

        {/* ── PDF attachment ────────────────────────────────── */}
        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            {/* PDF icon */}
            <svg className="w-5 h-5 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">PDF Attachment</p>
            <span className="text-xs text-gray-400">(optional, max {MAX_PDF_MB} MB)</span>
          </div>

          {/* Existing PDF */}
          {form.pdf_url && !removePdf && !pdfFile && (
            <div className="flex items-center justify-between gap-3 bg-brand-light rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <a href={form.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-brand-navy hover:text-brand-gold transition-colors truncate underline underline-offset-2">
                  View current PDF
                </a>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="text-xs px-2.5 py-1 border border-gray-200 rounded text-gray-600 hover:border-brand-navy hover:text-brand-navy transition-colors">
                  Replace
                </button>
                <button type="button" onClick={() => setRemovePdf(true)}
                  className="text-xs px-2.5 py-1 border border-gray-200 rounded text-gray-400 hover:border-gray-400 hover:text-gray-700 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Removal confirmation */}
          {removePdf && (
            <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              <p className="text-xs text-gray-500">PDF will be removed on save.</p>
              <button type="button" onClick={() => setRemovePdf(false)}
                className="text-xs text-brand-gold hover:underline">Undo</button>
            </div>
          )}

          {/* New file chosen */}
          {pdfFile && (
            <div className="flex items-center justify-between gap-3 bg-brand-light rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-brand-navy truncate">{pdfFile.name}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <button type="button" onClick={clearFileChoice}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                ✕ Remove
              </button>
            </div>
          )}

          {/* Upload progress */}
          {pdfUploading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Uploading PDF…</span>
                <span>{pdfProgress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gold rounded-full transition-all duration-300"
                  style={{ width: `${pdfProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Drop zone / file picker (always shown unless existing PDF is displayed) */}
          {(!form.pdf_url || removePdf || pdfFile) && !pdfFile && (
            <label
              htmlFor="pdf-upload"
              className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-6 cursor-pointer hover:border-brand-gold/50 hover:bg-brand-gold/[0.02] transition-colors"
            >
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-gray-500">
                <span className="text-brand-gold font-medium">Click to upload</span> a PDF
              </span>
              <span className="text-xs text-gray-400">PDF only · max {MAX_PDF_MB} MB</span>
            </label>
          )}

          <input
            ref={fileInputRef}
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>

        {/* Published toggle */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            role="switch"
            aria-checked={form.published}
            onClick={() => setForm(prev => ({ ...prev, published: !prev.published }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 ${
              form.published ? 'bg-brand-navy' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              form.published ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <div>
            <p className="text-sm font-medium text-gray-700">{form.published ? 'Published' : 'Draft'}</p>
            <p className="text-xs text-gray-400">
              {form.published ? 'Visible to visitors on the public website.' : 'Not visible. Save as draft to publish later.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="border border-gray-300 bg-gray-50 text-gray-700 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isBusy}
            className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isBusy ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {pdfUploading ? 'Uploading PDF…' : 'Saving…'}
              </span>
            ) : isEdit ? 'Save Changes' : 'Create Update'}
          </button>
          <Link to="/admin/updates" className="text-sm text-gray-400 hover:text-brand-navy transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
