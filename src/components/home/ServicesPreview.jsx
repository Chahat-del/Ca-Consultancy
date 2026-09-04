import { Link } from 'react-router-dom'
import { useModal } from '../../context/ModalContext'

const services = [
  {
    icon: '📊',
    title: 'Accounting & Bookkeeping',
    desc: 'Accurate, up-to-date financial records that give you a clear picture of your business health.',
  },
  {
    icon: '📋',
    title: 'Tax Filing',
    desc: 'ITR filing for individuals, firms, and companies — on time, every time, with maximum legitimate savings.',
  },
  {
    icon: '🧾',
    title: 'GST Compliance',
    desc: 'GST registration, return filing, reconciliation, and advisory to keep your business fully compliant.',
  },
  {
    icon: '🔍',
    title: 'Audit Services',
    desc: 'Statutory, internal, and tax audits conducted with thoroughness and professional independence.',
  },
  {
    icon: '💼',
    title: 'Business Advisory',
    desc: 'Company incorporation, MIS reporting, financial planning, and strategic guidance for growth.',
  },
]

export default function ServicesPreview() {
  const { openModal } = useModal()
  return (
    <section className="py-20 bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">What We Do</span>
          <h2 className="section-heading mt-3 mx-auto">Our Core Services</h2>
          <p className="section-subheading mx-auto text-center mt-3">
            End-to-end financial and compliance services tailored to your needs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-xl p-7 shadow-sm hover:shadow-md border border-transparent hover:border-brand-gold/30 transition-all duration-200 group"
            >
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-serif font-bold text-brand-navy text-lg group-hover:text-brand-gold transition-colors">
                {title}
              </h3>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}

          {/* CTA card */}
          <div className="bg-brand-navy rounded-xl p-7 flex flex-col justify-between">
            <div>
              <p className="text-brand-gold font-semibold text-sm uppercase tracking-wider">Need something specific?</p>
              <h3 className="font-serif font-bold text-white text-lg mt-2">
                Let's discuss your requirements
              </h3>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">
                Every client situation is unique. Reach out and we'll craft a solution that fits.
              </p>
            </div>
            <button onClick={openModal} className="btn-primary mt-6 text-sm text-center">
              Get in Touch →
            </button>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link to="/services" className="btn-outline text-sm">
            View All Services
          </Link>
        </div>
      </div>
    </section>
  )
}
