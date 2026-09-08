import { useState } from 'react'
import { submitClientRequest } from '../lib/submitRequest'

export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | submitting | success | error

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    const fd = new FormData(e.target)
    const { error } = await submitClientRequest({
      name:    fd.get('name'),
      email:   fd.get('email'),
      phone:   fd.get('phone'),
      service: fd.get('service'),
      message: fd.get('message'),
    })
    if (error) { setStatus('error'); return }
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
                    <option>Income Tax Filing</option>
                    <option>GST Compliance</option>
                    <option>Audit Services</option>
                    <option>Business Advisory</option>
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
                    Something went wrong. Please try again or email us directly.
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
              <h2 className="section-heading mb-6">Get in Touch</h2>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5">📍</span>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">Office Address</p>
                    <p className="text-gray-500 text-sm mt-0.5">
                      [Street Address], [City], [State] – [PIN]<br />India
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5">📞</span>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">Phone</p>
                    <a href="tel:+91XXXXXXXXXX" className="text-gray-500 text-sm hover:text-brand-gold transition-colors">
                      +91 XXXXX XXXXX
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5">✉️</span>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">Email</p>
                    <a href="mailto:info@prasadandco.in" className="text-gray-500 text-sm hover:text-brand-gold transition-colors">
                      info@prasadandco.in
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5">🕐</span>
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
                title="Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzUnNDAuNiJF!5e0!3m2!1sen!2sin!4v0"
                width="100%" height="280"
                style={{ border: 0 }}
                allowFullScreen="" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-xs text-gray-400">
              * Map shows a placeholder location. Update the embed URL once office address is confirmed.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
