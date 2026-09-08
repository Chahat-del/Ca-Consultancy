import { Link } from 'react-router-dom'
import { useModal } from '../context/ModalContext'

const services = [
  {
    id: 'accounting',
    icon: '📊',
    title: 'Accounting & Bookkeeping',
    tagline: 'Organised books. Informed decisions.',
    description:
      'Accurate financial records are the foundation of every good business decision. We provide end-to-end bookkeeping, ledger maintenance, bank reconciliation, and MIS reporting — whether monthly, quarterly, or annually.',
    bullets: [
      'Tally / cloud accounting setup and management',
      'Monthly / quarterly management accounts',
      'Bank and credit card reconciliation',
      'Payroll accounting and processing',
      'Year-end financial statement preparation',
    ],
  },
  {
    id: 'direct-tax',
    icon: '📋',
    title: 'Direct Tax',
    tagline: 'Timely. Accurate. Optimised.',
    description:
      'We handle all direct tax compliance for salaried individuals, freelancers, HUFs, firms, LLPs, and companies. Our approach ensures maximum legitimate deductions while keeping you fully compliant with current provisions.',
    bullets: [
      'ITR filing — all forms (ITR-1 through ITR-6)',
      'Tax planning and advance tax computation',
      'TDS returns (24Q, 26Q, 27Q)',
      'Income tax notice handling and scrutiny support',
      'Capital gains calculation and tax optimisation',
    ],
  },
  {
    id: 'indirect-tax',
    icon: '🧾',
    title: 'Indirect Tax',
    tagline: 'Registration to reconciliation — fully covered.',
    description:
      'GST and other indirect tax compliance can be complex, but non-compliance is costlier. We manage the entire lifecycle — from registration and returns to reconciliation and departmental representation.',
    bullets: [
      'GST registration (regular, composition, casual)',
      'GSTR-1, GSTR-3B, GSTR-9 / 9C filing',
      'Input tax credit reconciliation',
      'E-way bill management',
      'GST departmental representation and advisory',
    ],
  },
  {
    id: 'roc',
    icon: '🏛️',
    title: 'ROC Compliance',
    tagline: 'Stay compliant with MCA requirements.',
    description:
      'Companies and LLPs registered under the Companies Act must meet regular filing obligations with the Registrar of Companies. We manage all MCA compliance so your company remains in good standing.',
    bullets: [
      'Company / LLP incorporation',
      'Annual return and financial statement filing (AOC-4, MGT-7)',
      'Director KYC and DIN-related filings',
      'Statutory register maintenance',
      'Changes in directors, registered office, or share capital',
    ],
  },
  {
    id: 'audits',
    icon: '🔍',
    title: 'Audits',
    tagline: 'Independent. Thorough. Credible.',
    description:
      'Our audit services cover statutory, internal, and tax audits conducted with rigour and professional independence. We help businesses identify process gaps, ensure compliance, and build stakeholder confidence.',
    bullets: [
      'Statutory audit under the Companies Act',
      'Tax audit (Section 44AB)',
      'Internal audit and process reviews',
      'Bank and stock audits',
      'Concurrent and revenue audits',
    ],
  },
]

export default function Services() {
  const { openModal } = useModal()
  return (
    <div className="pt-[100px] md:pt-[116px]">
      {/* Page header */}
      <div className="bg-brand-navy py-14 md:py-20 text-center px-4">
        <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">What We Offer</span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3">Our Services</h1>
        <p className="mt-4 text-gray-300 max-w-xl mx-auto text-sm sm:text-base">
          Comprehensive accounting, tax, and compliance services — delivered with expertise and care.
        </p>
      </div>

      {/* Services list */}
      <section className="py-14 md:py-20 bg-white overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-16">
          {services.map(({ id, icon, title, tagline, description, bullets }, idx) => (
            <div
              key={id}
              id={id}
              className="grid md:grid-cols-2 gap-8 md:gap-10 items-start"
            >
              {/* Icon + heading block */}
              <div className={idx % 2 !== 0 ? 'md:order-2' : ''}>
                <div className="text-4xl md:text-5xl mb-4">{icon}</div>
                <h2 className="section-heading">{title}</h2>
                <p className="text-brand-gold font-medium mt-1 text-xs sm:text-sm uppercase tracking-wide">{tagline}</p>
                <p className="mt-4 text-gray-600 leading-relaxed text-sm sm:text-base">{description}</p>
              </div>

              {/* Bullets */}
              <div className={`bg-brand-light rounded-xl p-5 sm:p-7 ${idx % 2 !== 0 ? 'md:order-1' : ''}`}>
                <h3 className="font-semibold text-brand-navy text-xs sm:text-sm uppercase tracking-wider mb-4">
                  What's included
                </h3>
                <ul className="space-y-3">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="text-brand-gold mt-0.5 font-bold flex-shrink-0">→</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-navy text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-white">Not sure what you need?</h2>
          <p className="text-gray-300 mt-4">
            We're happy to have an initial conversation. Tell us about your situation and we'll recommend the right services.
          </p>
          <button onClick={openModal} className="btn-primary mt-8 inline-block">
            Talk to Our Team
          </button>
        </div>
      </section>
    </div>
  )
}
