import { Link } from 'react-router-dom'
import { useModal } from '../context/ModalContext'

const values = [
  {
    icon: '⚖️',
    title: 'Integrity',
    desc: 'We hold ourselves to the highest ethical standards. Our advice is always honest — even when it\'s not what you want to hear.',
  },
  {
    icon: '🎯',
    title: 'Accuracy',
    desc: 'Financial work demands precision. We double-check every number and filing before it leaves our desk.',
  },
  {
    icon: '🤝',
    title: 'Client-First',
    desc: 'Your goals drive our work. We invest time in understanding your situation before recommending any course of action.',
  },
  {
    icon: '🔄',
    title: 'Continuity',
    desc: 'We build long-term relationships, not one-off transactions. Many of our clients have been with us for a decade or more.',
  },
]

const team = [
  {
    name: 'CA [Name]',
    role: 'Founding Partner',
    bio: 'Over 15 years of experience in direct taxation, statutory audits, and corporate compliance. ICAI member.',
  },
  {
    name: 'CA [Name]',
    role: 'Partner – GST & Indirect Tax',
    bio: 'Specialist in GST advisory, litigation support, and indirect tax planning for manufacturing and trading businesses.',
  },
  {
    name: '[Name]',
    role: 'Senior Accountant',
    bio: 'Handles bookkeeping, MIS reporting, and payroll processing for a portfolio of 50+ clients across industries.',
  },
]

export default function About() {
  const { openModal } = useModal()
  return (
    <div className="pt-20">
      {/* Page header */}
      <div className="bg-brand-navy py-20 text-center">
        <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">Our Story</span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mt-3">About Prasad &amp; Co</h1>
        <p className="mt-4 text-gray-300 max-w-xl mx-auto px-4">
          A trusted name in chartered accountancy — built on relationships, not just transactions.
        </p>
      </div>

      {/* About body */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-14 items-start">
          <div>
            <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">Background</span>
            <h2 className="section-heading mt-3">Our Practice</h2>
            <p className="mt-5 text-gray-600 leading-relaxed">
              Prasad &amp; Co was established with a clear mission: deliver CA services that are thorough, timely, and genuinely useful to the client. Since our founding, we have grown from a small practice to a full-service firm handling diverse client needs — from individual tax returns to complex corporate audits.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              We are a registered ICAI firm with a dedicated team of chartered accountants, semi-qualified staff, and support professionals. Our office-based and remote service model allows us to serve clients across geographies while maintaining close communication.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Over the years, we have developed deep expertise in income tax, GST, ROC compliance, and business advisory — making us a single point of contact for most financial and regulatory needs.
            </p>
            <button onClick={openModal} className="btn-primary inline-block mt-8 text-sm">
              Get in Touch
            </button>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map(({ icon, title, desc }) => (
              <div key={title} className="bg-brand-light rounded-xl p-6">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-serif font-bold text-brand-navy">{title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">The People</span>
            <h2 className="section-heading mt-3">Our Team</h2>
            <p className="text-gray-500 mt-3 text-sm">Real names and bios will be updated once client shares details.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {team.map(({ name, role, bio }) => (
              <div key={name} className="bg-white rounded-xl p-7 shadow-sm">
                {/* Avatar placeholder */}
                <div className="w-14 h-14 rounded-full bg-brand-navy flex items-center justify-center text-brand-gold font-serif font-bold text-xl mb-4">
                  {name.charAt(3)}
                </div>
                <h3 className="font-serif font-bold text-brand-navy text-lg">{name}</h3>
                <p className="text-brand-gold text-xs font-semibold uppercase tracking-wider mt-1">{role}</p>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
