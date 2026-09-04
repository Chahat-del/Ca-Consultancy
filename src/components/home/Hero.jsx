import { Link } from 'react-router-dom'
import { useModal } from '../../context/ModalContext'

const stats = [
  { value: '15+', label: 'Years of Experience' },
  { value: '500+', label: 'Clients Served' },
  { value: '5', label: 'Practice Areas' },
  { value: '100%', label: 'Compliance Focused' },
]

export default function Hero() {
  const { openModal } = useModal()

  return (
    <section className="relative bg-brand-navy overflow-hidden pt-16 md:pt-20">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        {/* Text */}
        <div>
          <span className="inline-block text-brand-gold text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Chartered Accountants
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Financial Clarity,<br />
            <span className="text-brand-gold">Built on Trust.</span>
          </h1>
          <p className="mt-5 text-gray-300 text-base sm:text-lg leading-relaxed max-w-lg">
            Prasad &amp; Co provides expert accounting, taxation, GST, audit, and business advisory services — helping individuals and businesses make confident financial decisions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/services" className="btn-primary text-sm sm:text-base">
              Explore Services
            </Link>
            <button onClick={openModal} className="btn-outline text-sm sm:text-base">
              Talk to Us
            </button>
          </div>
        </div>

        {/* Desktop stats grid — hidden on mobile */}
        <div className="hidden md:grid grid-cols-2 gap-5">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur"
            >
              <p className="text-3xl font-serif font-bold text-brand-gold">{value}</p>
              <p className="text-gray-300 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile stats strip — visible only on small screens */}
      <div className="md:hidden border-t border-white/10 grid grid-cols-2 divide-x divide-y divide-white/10">
        {stats.map(({ value, label }) => (
          <div key={label} className="px-5 py-4 text-center">
            <p className="text-xl font-serif font-bold text-brand-gold">{value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
