import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative bg-brand-navy min-h-[92vh] flex items-center overflow-hidden pt-20">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <span className="inline-block text-brand-gold text-xs font-semibold tracking-[0.2em] uppercase mb-5">
            Chartered Accountants
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Financial Clarity,<br />
            <span className="text-brand-gold">Built on Trust.</span>
          </h1>
          <p className="mt-6 text-gray-300 text-lg leading-relaxed max-w-lg">
            Prasad &amp; Co provides expert accounting, taxation, GST, audit, and business advisory services — helping individuals and businesses make confident financial decisions.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/services" className="btn-primary">
              Explore Services
            </Link>
            <Link to="/contact" className="btn-outline">
              Talk to Us
            </Link>
          </div>
        </div>

        {/* Stats card */}
        <div className="hidden md:grid grid-cols-2 gap-5">
          {[
            { value: '15+', label: 'Years of Experience' },
            { value: '500+', label: 'Clients Served' },
            { value: '5', label: 'Core Practice Areas' },
            { value: '100%', label: 'Compliance Focused' },
          ].map(({ value, label }) => (
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
    </section>
  )
}
