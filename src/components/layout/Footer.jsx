import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded bg-brand-gold flex items-center justify-center text-white font-serif font-bold text-lg">P</span>
            <div className="leading-tight">
              <p className="font-serif font-bold text-white text-base">Prasad &amp; Co</p>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase">Accounting & Tax Consultancy</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Trusted financial and compliance partners for individuals, SMEs, and corporates across India.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About Us' },
              { to: '/services', label: 'Services' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="hover:text-brand-gold transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">📍</span>
              <div>
                <p className="text-gray-300 font-medium text-xs uppercase tracking-wide mb-0.5">Bangalore</p>
                <p>3rd Floor, Sri Skanda, 8th Main Road,<br />Govindaraja Nagar, Vijayanagar,<br />Bangalore – 560038</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">📍</span>
              <div>
                <p className="text-gray-300 font-medium text-xs uppercase tracking-wide mb-0.5">Chilakaluripet</p>
                <p>1-169/13, Ground Floor, 2nd Line,<br />Polireddy Palem, Chilakaluripet,<br />Palnadu Dist – 522616</p>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <span>✉️</span>
              <a href="mailto:info@prasadandco.in" className="hover:text-brand-gold transition-colors">
                info@prasadandco.in
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span>
              <a href="tel:+918790273040" className="hover:text-brand-gold transition-colors">
                +91 87902 73040
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 text-center text-xs text-gray-500 py-5">
        <p>© {new Date().getFullYear()} Prasad &amp; Co. All rights reserved.</p>
        <p className="mt-1 text-gray-600">Developed by MG Solutions</p>
      </div>
    </footer>
  )
}
