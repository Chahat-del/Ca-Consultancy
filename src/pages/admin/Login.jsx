import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { session, isAdmin, checking, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from     = location.state?.from?.pathname || '/admin/dashboard'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPw,   setShowPw]   = useState(false)

  useEffect(() => {
    if (!checking && session && isAdmin) navigate(from, { replace: true })
  }, [checking, session, isAdmin])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel (hidden on mobile) ───────────── */}
      <div className="hidden lg:flex lg:w-[420px] bg-brand-navy flex-col justify-between px-12 py-14 flex-shrink-0">
        {/* Top — logo */}
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-brand-gold flex items-center justify-center font-serif font-bold text-white text-xl">
            P
          </span>
          <div>
            <p className="font-serif font-bold text-white text-base leading-tight">Prasad &amp; Co</p>
            <p className="text-gray-400 text-[11px] tracking-widest uppercase">Chartered Accountants</p>
          </div>
        </div>

        {/* Middle — tagline */}
        <div>
          <h2 className="font-serif font-bold text-white text-3xl leading-snug">
            Manage your<br />
            practice from<br />
            one place.
          </h2>
          <p className="text-gray-400 text-sm mt-4 leading-relaxed">
            Updates, tasks, and client inquiries — all in your admin panel.
          </p>

          {/* Feature list */}
          <ul className="mt-8 space-y-3">
            {[
              'Publish updates to the public website',
              'Track and manage client tasks',
              'Receive client inquiries automatically',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                <span className="w-5 h-5 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} Prasad &amp; Co. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">

        {/* Mobile logo (shown only on small screens) */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <span className="w-9 h-9 rounded-lg bg-brand-navy flex items-center justify-center font-serif font-bold text-brand-gold text-lg">P</span>
          <div>
            <p className="font-serif font-bold text-brand-navy text-sm leading-tight">Prasad &amp; Co</p>
            <p className="text-gray-400 text-[10px] tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="font-serif font-bold text-brand-navy text-2xl">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1 mb-8">Sign in to your admin panel.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@prasadandco.in"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700">
                <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-navy text-white font-semibold py-3 rounded-lg hover:bg-blue-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-8">
            Authorised administrators only.
          </p>
        </div>
      </div>

    </div>
  )
}
