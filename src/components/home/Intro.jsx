export default function Intro() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-14 items-center">
        {/* Left — visual accent */}
        <div className="relative">
          <div className="bg-brand-light rounded-2xl p-7 sm:p-10">
            <div className="border-l-4 border-brand-gold pl-5 sm:pl-6">
              <p className="font-serif text-lg sm:text-xl text-brand-navy leading-relaxed italic">
                "We don't just file returns — we build long-term financial strategies that allow our clients to grow with confidence."
              </p>
              <p className="mt-4 text-sm text-gray-500 font-medium">— Prasad &amp; Co, Founding Philosophy</p>
            </div>
          </div>
          {/* Decorative circles — hidden on mobile to avoid overflow */}
          <div className="hidden sm:block absolute -top-4 -left-4 w-16 h-16 bg-brand-gold/10 rounded-full" />
          <div className="hidden sm:block absolute -bottom-4 -right-4 w-24 h-24 bg-brand-navy/5 rounded-full" />
        </div>

        {/* Right — text */}
        <div>
          <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">Who We Are</span>
          <h2 className="section-heading mt-3">
            A Practice Built on Integrity &amp; Expertise
          </h2>
          <p className="mt-5 text-gray-600 leading-relaxed">
            Prasad &amp; Co is a full-service chartered accountancy firm committed to delivering accurate, timely, and practical financial guidance. With deep expertise across taxation, compliance, and advisory services, we serve a diverse clientele — from start-ups and MSMEs to established corporates.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Our approach is straightforward: understand the client's goals, navigate the regulatory landscape efficiently, and provide solutions that hold up under scrutiny.
          </p>
          <ul className="mt-6 space-y-2">
            {[
              'ICAI registered &amp; fully compliant practice',
              'Dedicated team for each service domain',
              'Timely filings — no last-minute surprises',
              'Transparent fee structure',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-brand-gold mt-0.5 text-base">✓</span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
