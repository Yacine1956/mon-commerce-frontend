
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Store } from 'lucide-react'
import useAuthStore from '../../lib/auth/authStore'

export default function LoginPage() {
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [afficherPassword, setAfficherPassword] = useState(false)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)

    try {
      await login(telephone, password)
      navigate('/')
    } catch (err) {
      setErreur(
        err.response?.data?.message ||
        'Identifiants incorrects.'
      )
    } finally {
      setChargement(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 10% 10%, rgba(201,169,110,0.12), transparent 30%),
          radial-gradient(circle at 90% 90%, rgba(23,37,84,0.08), transparent 35%),
          #FAF8F3
        `
      }}
    >

      {/* Décoration arrière */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
        style={{
          background: '#C9A96E',
          opacity: 0.06,
          filter: 'blur(80px)'
        }}
      />

      <div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
        style={{
          background: '#172554',
          opacity: 0.08,
          filter: 'blur(90px)'
        }}
      />

      {/* Petit motif décoratif */}
      <div
        className="absolute top-10 right-10 w-24 h-24 rounded-full border opacity-30"
        style={{ borderColor: '#C9A96E' }}
      />

      <div
        className="absolute bottom-10 left-10 w-16 h-16 rounded-full border opacity-20"
        style={{ borderColor: '#172554' }}
      />

      {/* Carte */}
      <div className="relative w-full max-w-md">

        <div
          className="bg-white rounded-[28px] p-8 sm:p-10 border shadow-2xl"
          style={{
            borderColor: 'rgba(201,169,110,0.20)',
            boxShadow: '0 25px 70px rgba(16,24,40,0.10)'
          }}
        >

          {/* Logo */}
          <div className="flex flex-col items-center text-center mb-8">

            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #172554, #101828)',
                boxShadow: '0 10px 25px rgba(16,24,40,0.18)'
              }}
            >
              <Store
                size={28}
                strokeWidth={1.8}
                color="#E5CC9F"
              />
            </div>

            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: '#101828' }}
            >
              SenNoflaye
            </h1>

            <div className="flex items-center gap-2 mt-2">
              <div
                className="h-px w-8"
                style={{ background: '#C9A96E' }}
              />

              <p
                className="text-xs uppercase tracking-[0.18em]"
                style={{ color: '#9A8050' }}
              >
                Yombal sa liggéey si lu leer
              </p>

              <div
                className="h-px w-8"
                style={{ background: '#C9A96E' }}
              />
            </div>
          </div>

          {/* Bienvenue */}
          <div className="mb-7">
            <h2
              className="text-lg font-semibold"
              style={{ color: '#1E293B' }}
            >
              Bienvenue 👋
            </h2>

            <p
              className="text-sm mt-1"
              style={{ color: '#64748B' }}
            >
              Connectez-vous pour accéder à votre espace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Téléphone */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#334155' }}
              >
                Numéro de téléphone
              </label>

              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="77 123 45 67"
                required
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
                style={{
                  background: '#FAF8F3',
                  border: '1px solid #E2E8F0',
                  color: '#101828'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C9A96E'
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(201,169,110,0.12)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#334155' }}
              >
                Mot de passe
              </label>

              <div className="relative">

                <input
                  type={afficherPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="w-full rounded-xl px-4 py-3.5 pr-12 text-sm outline-none transition-all"
                  style={{
                    background: '#FAF8F3',
                    border: '1px solid #E2E8F0',
                    color: '#101828'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#C9A96E'
                    e.target.style.boxShadow =
                      '0 0 0 3px rgba(201,169,110,0.12)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0'
                    e.target.style.boxShadow = 'none'
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setAfficherPassword(!afficherPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
                  style={{ color: '#94A3B8' }}
                >
                  {afficherPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            {/* Erreur */}
            {erreur && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: '#FEF2F2',
                  color: '#B91C1C',
                  border: '1px solid #FECACA'
                }}
              >
                {erreur}
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={chargement}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60"
              style={{
                background:
                  'linear-gradient(135deg, #172554 0%, #101828 100%)',
                boxShadow:
                  '0 10px 25px rgba(16,24,40,0.18)'
              }}
              onMouseEnter={(e) => {
                if (!chargement) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow =
                    '0 14px 30px rgba(16,24,40,0.23)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow =
                  '0 10px 25px rgba(16,24,40,0.18)'
              }}
            >
              {chargement ? (
                'Connexion...'
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={17} />
                </>
              )}
            </button>

          </form>

          {/* Inscription */}
          <div className="mt-7 pt-6 border-t border-slate-100 text-center">

            <p
              className="text-sm"
              style={{ color: '#64748B' }}
            >
              Pas encore de compte ?
            </p>

            <Link
              to="/inscription"
              className="inline-flex items-center gap-1 mt-1 text-sm font-semibold hover:underline"
              style={{ color: '#9A8050' }}
            >
              Créer ma boutique
              <ArrowRight size={14} />
            </Link>

          </div>

        </div>

        {/* Signature */}
        <p
          className="text-center text-xs mt-5"
          style={{ color: '#94A3B8' }}
        >
          Une gestion simple pour votre commerce
        </p>

      </div>
    </div>
  )
}

