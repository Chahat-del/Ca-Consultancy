import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ConsultationModal from './components/ConsultationModal'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import { ModalContext } from './context/ModalContext'

export default function App() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <ModalContext.Provider value={{ openModal: () => setModalOpen(true) }}>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
        <ConsultationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </BrowserRouter>
    </ModalContext.Provider>
  )
}
