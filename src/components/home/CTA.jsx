import { Link } from 'react-router-dom'
import { useModal } from '../../context/ModalContext'

export default function CTA() {
  const { openModal } = useModal()
  return (
    <section className="py-20 bg-brand-navy">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">Let's Work Together</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-4 leading-tight">
          Ready to Simplify Your Finances?
        </h2>
        <p className="mt-5 text-gray-300 leading-relaxed">
          Whether you need help with your annual returns, GST filings, or a full financial review — our team is ready. Reach out today and let's start with a conversation.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button onClick={openModal} className="btn-primary">
            Schedule a Consultation
          </button>
          <Link to="/services" className="btn-outline">
            Browse Services
          </Link>
        </div>
      </div>
    </section>
  )
}
