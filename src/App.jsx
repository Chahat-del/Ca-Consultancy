import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Public layout + pages
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AnnouncementBar from './components/layout/AnnouncementBar'
import ConsultationModal from './components/ConsultationModal'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'

// Admin
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Updates from './pages/admin/Updates'
import UpdateForm from './pages/admin/UpdateForm'
import Tasks from './pages/admin/Tasks'
import TaskForm from './pages/admin/TaskForm'
import Enquiries from './pages/admin/Enquiries'

// Contexts
import { ModalContext } from './context/ModalContext'
import { AuthProvider } from './context/AuthContext'

// ── Public site wrapper ───────────────────────────────────────
function PublicSite() {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <ModalContext.Provider value={{ openModal: () => setModalOpen(true) }}>
      <AnnouncementBar />
      <Navbar />
      <main>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/about"   element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
      <ConsultationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </ModalContext.Provider>
  )
}

// ── Root app ──────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin login — no Navbar/Footer */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected admin area */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"          element={<Dashboard />} />
            <Route path="updates"            element={<Updates />} />
            <Route path="updates/new"        element={<UpdateForm />} />
            <Route path="updates/:id/edit"   element={<UpdateForm />} />
            <Route path="tasks"              element={<Tasks />} />
            <Route path="tasks/new"          element={<TaskForm />} />
            <Route path="tasks/:id/edit"     element={<TaskForm />} />
            <Route path="enquiries"          element={<Enquiries />} />
          </Route>

          {/* Public site — all other routes */}
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
