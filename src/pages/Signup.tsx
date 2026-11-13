import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Logo from '../components/Logo'

export default function Signup() {
  const navigate = useNavigate()
  const [firstname, setfirstname] = useState('')
  const [lastname, setlastname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!agreed) return

  setLoading(true)

  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}auth/register`,
      {
        firstname,
        lastname,
        email,
        password,
      }
    )
    // console.log("ok");
    
    navigate('/login')
  } catch (error: any) {
    console.error(error)

    alert(
      error.response?.data?.detail ||
      "Une erreur est survenue lors de l'inscription"
    )
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/[0.06] blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 flex justify-center"><Logo size="lg" /></div>

        <div className="bg-ink-900/60 backdrop-blur-xl border border-overlay/[0.06] rounded-3xl p-8 md:p-10 shadow-2xl">
          <h1 className="text-2xl font-bold text-ink-50 mb-2">Créez votre espace photographe</h1>
          <p className="text-sm text-ink-400 mb-8">Commencez gratuitement, sans engagement</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* firstname */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Nom</label>
              <input
                type="text"
                value={firstname}
                onChange={(e) => setfirstname(e.target.value)}
                placeholder="Nom"
                required
                className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 placeholder-ink-500 text-sm outline-none transition-all focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10"
              />
            </div>

            {/* firstname */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Prénoms</label>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setlastname(e.target.value)}
                placeholder="Prénoms"
                required
                className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 placeholder-ink-500 text-sm outline-none transition-all focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Adresse e-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 placeholder-ink-500 text-sm outline-none transition-all focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 placeholder-ink-500 text-sm outline-none transition-all focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                      <path d="M3 3l18 18M10.5 10.7a2 2 0 002.8 2.8M9.9 5.1A9.7 9.7 0 0112 5c5 0 9 4.5 10 7a13 13 0 01-2.2 3.2M6.1 6.1A13 13 0 002 12c1 2.5 5 7 10 7a9.7 9.7 0 004.9-1.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-ink-500 mt-1.5">Au moins 6 caractères</p>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 text-sm text-ink-400 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded accent-brand-500 shrink-0"
              />
              <span>
                J'accepte les{' '}
                <a href="#" className="text-brand-400 hover:text-brand-300">Conditions d'utilisation</a>
                {' '}et la{' '}
                <a href="#" className="text-brand-400 hover:text-brand-300">Politique de confidentialité</a>
              </span>
            </label>

            {/* Submit */}
           <button
            type="submit"
            disabled={!agreed || loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 text-white font-semibold shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? "Création du compte..." : "Créer mon compte"}
          </button>
          </form>

          {/* Switch */}
          <p className="text-center text-sm text-ink-400 mt-7">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-ink-500 hover:text-ink-300 transition-colors">
            ← Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  )
}
