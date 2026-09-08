import { useEffect, useRef, useState } from 'react'
import { submitClientRequest } from '../lib/submitRequest'

export default function ConsultationModal({ isOpen, onClose }) {
  const [status,  setStatus]  = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const overlayRef   = useRef(null)
  const firstInputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => firstInputRef.current?.focus(), 100)
    } else {
      document.body.style.overflow = ''
      setStatus('idle')
      setErrorMsg('')
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    const fd = new FormData(e.target)
    const { error } = await submitClientRequest({
      name:    fd.get('name'),
      email:   fd.get('email'),
      phone:   fd.get('phone'),
      service: fd.get('service'),
      message: fd.get('message'),
    })
    if (error) {
      setErrorMsg(error)
      setStatus('error')
      return
    }
    setStatus('success')
    e.target.reset()
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="sticky top-3 float-right mr-4 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-5 sm:px-8 pt-5 sm:pt-8 pb-7 clear-both">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-navy mb-4">
              <span className="text-brand-gold font-serif font-bold text-xl">P</span>
            </div>
            <h2 id="modal-title" className="font-serif text-2xl font-bold text-brand-navy">
              Get Free Consultation
            </h2>
            <p className="text-gray-500 text-sm mt-1">We'll get back to you within one business day.</p>
          </div>

          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-serif font-bold text-brand-navy text-lg">Message Sent!</h3>
              <p className="text-gray-500 text-sm mt-2">
                Thank you for getting in touch. Our team will contact you shortly.
              </p>
              <button onClick={onClose} className="btn-primary mt-6 text-sm px-8">Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                ref={firstInputRef}
                name="name" type="text" required
                placeholder="Name" className="modal-input"
              />
              <input
                name="email" type="email" required
                placeholder="Email" className="modal-input"
              />
              <input
                name="phone" type="tel"
                placeholder="Phone Number" className="modal-input"
              />
              <select name="service" className="modal-input bg-white">
                <option value="">Service (optional)</option>
                <option>Accounting &amp; Bookkeeping</option>
                <option>Direct Tax</option>
                <option>Indirect Tax</option>
                <option>ROC Compliance</option>
                <option>Audits</option>
                <option>Other</option>
              </select>
              <textarea
                name="message" rows={4} required
                placeholder="How can we help you?"
                className="modal-input resize-none"
              />

              {status === 'error' && (
                <p className="text-gray-600 text-xs text-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                  {errorMsg || 'Something went wrong. Please try again or call us directly.'}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-brand-navy text-white font-semibold py-3 rounded-lg hover:bg-blue-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {status === 'submitting' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </span>
                ) : 'Send Message'}
              </button>

              <p className="text-center text-sm text-gray-500 pt-1">
                Have Doubts?{' '}
                <a
                  href="https://wa.me/91XXXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-gold font-semibold hover:underline"
                >
                  Chat on WhatsApp
                </a>{' '}
                Instantly
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
