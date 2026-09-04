const testimonials = [
  {
    name: 'Rajesh Mehta',
    role: 'Director, Mehta Exports Pvt. Ltd.',
    quote:
      'Prasad &amp; Co has been our CA firm for over 7 years. Their proactive approach to tax planning has consistently saved us money while keeping us fully compliant. Highly reliable.',
  },
  {
    name: 'Anita Sharma',
    role: 'Freelancer & Consultant',
    quote:
      'I was confused about ITR filing as a freelancer. The team at Prasad &amp; Co explained everything clearly and handled my returns without any hassle. I\'ve referred them to all my peers.',
  },
  {
    name: 'Kiran Patel',
    role: 'Founder, Patel Tech Solutions',
    quote:
      'GST compliance used to be a nightmare for us. Since we partnered with Prasad &amp; Co, filings are always on time and we\'ve had zero notices. That peace of mind is priceless.',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">Client Voices</span>
          <h2 className="section-heading mt-3 mx-auto">What Our Clients Say</h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
          {testimonials.map(({ name, role, quote }) => (
            <div
              key={name}
              className="bg-brand-light rounded-xl p-6 md:p-8 border border-gray-100 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 text-brand-gold text-sm mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p
                className="text-gray-600 text-sm leading-relaxed flex-1 italic"
                dangerouslySetInnerHTML={{ __html: `"${quote}"` }}
              />
              <div className="mt-6 pt-5 border-t border-gray-200">
                <p className="font-semibold text-brand-navy text-sm">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
