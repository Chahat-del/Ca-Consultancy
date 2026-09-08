import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function ProtectedRoute({ children }) {
  const { session, isAdmin, checking } = useAuth()
  const location = useLocation()

  // Still loading session from Supabase — render nothing to avoid flash
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="w-8 h-8 border-4 border-brand-navy border-t-brand-gold rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in → redirect to login, preserving intended destination
  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Logged in but not an admin → deny with a clear message
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light px-4">
        <div className="bg-white rounded-xl shadow p-10 max-w-sm text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="font-serif font-bold text-brand-navy text-xl">Access Denied</h2>
          <p className="text-gray-500 text-sm mt-3">
            Your account does not have admin privileges. Contact the site owner.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-6 btn-primary text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return children
}
