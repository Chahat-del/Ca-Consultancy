import { useEffect, useRef, useState } from 'react'

const FORMSPREE_ID = 'YOUR_FORM_ID'

export default function ConsultationModal({ isOpen, onClose }) {
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const overlayRef = useRef(null)
  const firstInputRef = useRef(null)

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => firstInputRef.current?.focus(), 100)
    } else {
      document.body.style.overflow = ''
      setStatus('idle')
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    const data = new FormData(e.target)
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) e.target.reset()
    } catch {
      setStatus('error')
    }
  }

  if (!isOpen) return null

  return (
    /* Backdrop */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Panel */}
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-8 pt-8 pb-7">
          {/* Heading */}
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
              <h3 className="font-serif font-bold text-brand-navy text-lg">Message Received!</h3>
              <p className="text-gray-500 text-sm mt-2">
                Thank you for reaching out. Our team will contact you shortly.
              </p>
              <button onClick={onClose} className="btn-primary mt-6 text-sm px-8">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <input
                ref={firstInputRef}
                name="name"
                type="text"
                required
                placeholder="Name"
                className="modal-input"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="modal-input"
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                className="modal-input"
              />
              <select name="service" className="modal-input bg-white appearance-none">
                <option value="">Services</option>
                <option>Accounting &amp; Bookkeeping</option>
                <option>Income Tax Filing</option>
                <option>GST Compliance</option>
                <option>Audit Services</option>
                <option>Business Advisory</option>
                <option>Other</option>
              </select>
              <textarea
                name="message"
                rows={4}
                placeholder="Message"
                className="modal-input resize-none"
              />

              {status === 'error' && (
                <p className="text-red-500 text-xs text-center">
                  Something went wrong. Please try again or email us directly.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-brand-navy text-white font-semibold py-3 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {status === 'submitting' ? 'Sending…' : 'Send'}
              </button>

              {/* WhatsApp line */}
              <p className="text-center text-sm text-gray-500 pt-1">
                Have Doubts?{' '}
                <a
                  href="https://wa.me/91XXXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-semibold hover:underline"
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
