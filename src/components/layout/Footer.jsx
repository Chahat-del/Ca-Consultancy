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
              <p className="text-[10px] text-gray-400 tracking-widest uppercase">Chartered Accountants</p>
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
          <ul className="space-y-2 text-sm text-gray-400">
            <li>📍 [Office Address], India</li>
            <li>📞 +91 XXXXX XXXXX</li>
            <li>✉️ info@prasadandco.in</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 text-center text-xs text-gray-500 py-5">
        © {new Date().getFullYear()} Prasad &amp; Co. All rights reserved.
      </div>
    </footer>
  )
}
