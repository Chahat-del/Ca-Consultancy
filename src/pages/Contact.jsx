import { useState } from 'react'
import { submitClientRequest } from '../lib/submitRequest'

export default function Contact() {
  const [status,   setStatus]   = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

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

  return (
    <div className="pt-[100px] md:pt-[116px]">
      {/* Page header */}
      <div className="bg-brand-navy py-14 md:py-20 text-center px-4">
        <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">Reach Out</span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3">Contact Us</h1>
        <p className="mt-4 text-gray-300 max-w-xl mx-auto text-sm sm:text-base">
          Have a question or ready to get started? We'd love to hear from you.
        </p>
      </div>

      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-14">

          {/* Contact form */}
          <div>
            <h2 className="section-heading mb-2">Send Us a Message</h2>
            <p className="text-gray-500 text-sm mb-8">We typically respond within one business day.</p>

            {status === 'success' ? (
              <div className="bg-brand-light border border-brand-gold/20 rounded-xl p-7 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-serif font-bold text-brand-navy text-lg">Message Received</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Thank you for reaching out. Our team will get back to you within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                      Full Name <span className="text-brand-gold">*</span>
                    </label>
                    <input
                      id="name" name="name" type="text" required
                      placeholder="Your name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      id="phone" name="phone" type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email Address <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    id="email" name="email" type="email" required
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="service">
                    Service You're Interested In
                  </label>
                  <select
                    id="service" name="service"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition bg-white"
                  >
                    <option value="">Select a service (optional)</option>
                    <option>Accounting &amp; Bookkeeping</option>
                    <option>Direct Tax</option>
                    <option>Indirect Tax</option>
                    <option>ROC Compliance</option>
                    <option>Audits</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">
                    Message <span className="text-brand-gold">*</span>
                  </label>
                  <textarea
                    id="message" name="message" rows={5} required
                    placeholder="Tell us about your requirement…"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                    {errorMsg || 'Something went wrong. Please try again or email us directly.'}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-primary w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact info + map */}
          <div className="space-y-8">
            <div>
              <h2 className="section-heading mb-6">Our Offices</h2>
              <ul className="space-y-6">

                {/* Bangalore */}
                <li className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5 flex-shrink-0">📍</span>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">Bangalore Office</p>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                      3rd Floor, Sri Skanda, 8th Main Road,<br />
                      Govindaraja Nagar, Vijayanagar,<br />
                      Bangalore – 560038
                    </p>
                  </div>
                </li>

                {/* Chilakaluripet */}
                <li className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5 flex-shrink-0">📍</span>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">Chilakaluripet Office</p>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                      1-169/13, Ground Floor, 2nd Line,<br />
                      Polireddy Palem, Chilakaluripet,<br />
                      Palnadu Dist – 522616
                    </p>
                  </div>
                </li>

                {/* Email */}
                <li className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5 flex-shrink-0">✉️</span>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">Email</p>
                    <a href="mailto:info@prasadandco.in" className="text-gray-500 text-sm hover:text-brand-gold transition-colors mt-0.5 block">
                      info@prasadandco.in
                    </a>
                  </div>
                </li>

                {/* Office hours */}
                <li className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5 flex-shrink-0">🕐</span>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">Office Hours</p>
                    <p className="text-gray-500 text-sm mt-0.5">
                      Mon – Sat: 9:30 AM – 6:30 PM<br />Sunday: Closed
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <iframe
                title="Bangalore Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.6!2d77.5350!3d12.9750!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3e000000000%3A0x0!2sVijayanagar%2C%20Bengaluru%2C%20Karnataka%20560040!5e0!3m2!1sen!2sin!4v0"
                width="100%" height="260"
                style={{ border: 0 }}
                allowFullScreen="" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-xs text-gray-400">
              * Map shows approximate Vijayanagar area, Bangalore. Share a Google Maps link to update the exact pin.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
