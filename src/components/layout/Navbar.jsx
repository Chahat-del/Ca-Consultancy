import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useModal } from '../../context/ModalContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { openModal } = useModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-9 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/95'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="w-9 h-9 rounded bg-brand-navy flex items-center justify-center text-brand-gold font-serif font-bold text-lg">P</span>
            <div className="leading-tight">
              <p className="font-serif font-bold text-brand-navy text-base">Prasad &amp; Co</p>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">Chartered Accountants</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand-gold border-b-2 border-brand-gold pb-0.5'
                      : 'text-gray-600 hover:text-brand-navy'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <button onClick={openModal} className="btn-primary text-sm py-2 px-5">
              Get in Touch
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-brand-navy"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="md:hidden pb-4 border-t border-gray-100 pt-3 flex flex-col gap-3">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-2 py-1 text-sm font-medium rounded transition-colors ${
                    isActive ? 'text-brand-gold bg-yellow-50' : 'text-gray-700 hover:text-brand-navy'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              onClick={() => { setOpen(false); openModal() }}
              className="btn-primary text-sm text-center mt-1"
            >
              Get in Touch
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
