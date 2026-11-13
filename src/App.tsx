import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Problem from './components/Problem'
import HowItWorks from './components/HowItWorks'
import FacialRecognition from './components/FacialRecognition'
import Photographers from './components/Photographers'
import QRCode from './components/QRCode'
import EventTypes from './components/EventTypes'
import Pricing from './components/Pricing'
import FinalCTA from './components/FinalCTA'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from "./components/ProtectedRoute";
import PublicGallery from './pages/PublicGallery'

function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <FacialRecognition />
        <Photographers />
        <QRCode />
        <EventTypes />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/public/galerie/:public_token" element={<PublicGallery />}
/>


        {/* Pages protégées */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />        
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
