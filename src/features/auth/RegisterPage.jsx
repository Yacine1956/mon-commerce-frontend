import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Store,
  UserRound,
  Phone,
  Mail,
  Lock,
  Check
} from 'lucide-react'
import useAuthStore from '../../lib/auth/authStore'

const TYPES_COMMERCE = [
  { valeur: 'boutique', label: 'Boutique de quartier' },
  { valeur: 'mini_marche', label: 'Mini-marché' },
  { valeur: 'vetements', label: 'Vêtements' },
  { valeur: 'chaussures', label: 'Chaussures' },
  { valeur: 'bambinerie', label: 'Bambinerie' },
  { valeur: 'cosmetiques', label: 'Cosmétiques' },
  { valeur: 'telephonie', label: 'Téléphones / accessoires' },
  { valeur: 'vaisselle', label: 'Vaisselle / ménager' },
]

export default function RegisterPage() {
  const [nomBoutique, setNomBoutique] = useState('')
  const [typesSelectionnes, setTypesSelectionnes] = useState([])
  const [autreCoche, setAutreCoche] = useState(false)
  const [autreTexte, setAutreTexte] = useState('')
  const [name, setName] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const [afficherPassword, setAfficherPassword] = useState(false)
  const [afficherConfirmation, setAfficherConfirmation] = useState(false)

  const [erreurs, setErreurs] = useState({})
  const [erreurGenerale, setErreurGenerale] = useState('')
  const [chargement, setChargement] = useState(false)

  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()

  function toggleType(valeur) {
    setTypesSelectionnes((actuel) =>
      actuel.includes(valeur) ? actuel.filter((t) => t !== valeur) : [...actuel, valeur]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setErreurs({})
    setErreurGenerale('')
    setChargement(true)

    // On envoie plusieurs types séparés par des virgules si le commerçant
    // vend plusieurs catégories de produits (ex: vêtements + chaussures).
    // Le texte libre d'"Autre" est ajouté tel quel pour garder une trace
    // descriptive, même s'il ne correspond à aucune catégorie prédéfinie.
    const morceaux = [...typesSelectionnes]
    if (autreCoche && autreTexte.trim()) morceaux.push(autreTexte.trim())
    const typeCommerceFinal = morceaux.join(',')

    try {
      await register({
        nom_boutique: nomBoutique,
        type_commerce: typeCommerceFinal || null,
        name,
        telephone,
        email: email || null,
        password,
        password_confirmation: passwordConfirmation,
      })

      navigate('/')
    } catch (err) {
      if (err.response?.status === 422) {
        setErreurs(err.response.data.errors || {})
      } else {
        setErreurGenerale('Une erreur est survenue. Réessaie.')
      }
    } finally {
      setChargement(false)
    }
  }

  const inputStyle = {
    background: '#FAF8F3',
    border: '1px solid #E2E8F0',
    color: '#101828'
  }

  function handleFocus(e) {
    e.target.style.borderColor = '#C9A96E'
    e.target.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.12)'
  }

  function handleBlur(e) {
    e.target.style.borderColor = '#E2E8F0'
    e.target.style.boxShadow = 'none'
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
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full" style={{ background: '#C9A96E', opacity: 0.06, filter: 'blur(80px)' }} />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full" style={{ background: '#172554', opacity: 0.08, filter: 'blur(90px)' }} />
      <div className="absolute top-10 right-10 w-24 h-24 rounded-full border opacity-30" style={{ borderColor: '#C9A96E' }} />
      <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full border opacity-20" style={{ borderColor: '#172554' }} />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-[28px] p-7 sm:p-9 border shadow-2xl" style={{ borderColor: 'rgba(201,169,110,0.20)', boxShadow: '0 25px 70px rgba(16,24,40,0.10)' }}>
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #172554, #101828)', boxShadow: '0 10px 25px rgba(16,24,40,0.18)' }}>
              <Store size={25} strokeWidth={1.8} color="#E5CC9F" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#101828' }}>SenNoflaye</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-px w-8" style={{ background: '#C9A96E' }} />
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: '#9A8050' }}>Yombal sa liggéey si lu leer</p>
              <div className="h-px w-8" style={{ background: '#C9A96E' }} />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold" style={{ color: '#1E293B' }}>Créez votre espace</h2>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>Quelques informations pour commencer votre gestion commerciale.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>Nom de la boutique</label>
              <div className="relative">
                <Store size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9A8050' }} />
                <input
                  value={nomBoutique}
                  onChange={(e) => setNomBoutique(e.target.value)}
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
                  style={inputStyle}
                  placeholder="Ex : Boutique sopou nabi"
                  required
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              {erreurs.nom_boutique && <p className="text-red-600 text-xs mt-1.5">{erreurs.nom_boutique[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>
                Type de commerce <span className="font-normal" style={{ color: '#94A3B8' }}>(un ou plusieurs)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPES_COMMERCE.map((t) => {
                  const coche = typesSelectionnes.includes(t.valeur)
                  return (
                    <button
                      key={t.valeur}
                      type="button"
                      onClick={() => toggleType(t.valeur)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition"
                      style={
                        coche
                          ? { background: 'linear-gradient(135deg, #172554, #101828)', color: 'white', borderColor: 'transparent' }
                          : { background: '#FAF8F3', color: '#475569', borderColor: '#E2E8F0' }
                      }
                    >
                      {coche && <Check size={12} />}
                      {t.label}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setAutreCoche(!autreCoche)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition"
                  style={
                    autreCoche
                      ? { background: 'linear-gradient(135deg, #172554, #101828)', color: 'white', borderColor: 'transparent' }
                      : { background: '#FAF8F3', color: '#475569', borderColor: '#E2E8F0' }
                  }
                >
                  {autreCoche && <Check size={12} />}
                  Autre
                </button>
              </div>

              {autreCoche && (
                <input
                  value={autreTexte}
                  onChange={(e) => setAutreTexte(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all mt-2"
                  style={inputStyle}
                  placeholder="Décris ton activité, ex : Quincaillerie"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>Votre nom</label>
              <div className="relative">
                <UserRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9A8050' }} />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
                  style={inputStyle}
                  placeholder="Ex : Fatou Diop"
                  required
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              {erreurs.name && <p className="text-red-600 text-xs mt-1.5">{erreurs.name[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>Numéro de téléphone</label>
              <div className="relative">
                <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9A8050' }} />
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
                  style={inputStyle}
                  placeholder="votre numero"
                  required
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              {erreurs.telephone && <p className="text-red-600 text-xs mt-1.5">{erreurs.telephone[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>
                Email <span className="font-normal ml-1" style={{ color: '#94A3B8' }}></span>
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9A8050' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
                  style={inputStyle}
                  placeholder="exemple@email.com"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              {erreurs.email && <p className="text-red-600 text-xs mt-1.5">{erreurs.email[0]}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9A8050' }} />
                  <input
                    type={afficherPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none transition-all"
                    style={inputStyle}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <button type="button" onClick={() => setAfficherPassword(!afficherPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5" style={{ color: '#94A3B8' }}>
                    {afficherPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {erreurs.password && <p className="text-red-600 text-xs mt-1.5">{erreurs.password[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>Confirmation</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9A8050' }} />
                  <input
                    type={afficherConfirmation ? 'text' : 'password'}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none transition-all"
                    style={inputStyle}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <button type="button" onClick={() => setAfficherConfirmation(!afficherConfirmation)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5" style={{ color: '#94A3B8' }}>
                    {afficherConfirmation ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </div>

            {erreurGenerale && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
                {erreurGenerale}
              </div>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, #172554 0%, #101828 100%)', boxShadow: '0 10px 25px rgba(16,24,40,0.18)' }}
            >
              {chargement ? 'Création...' : (<>Créer ma boutique <ArrowRight size={17} /></>)}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm" style={{ color: '#64748B' }}>Vous avez déjà un compte ?</p>
            <Link to="/connexion" className="inline-flex items-center gap-1 mt-1 text-sm font-semibold hover:underline" style={{ color: '#9A8050' }}>
              Se connecter <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: '#94A3B8' }}>Une gestion simple pour votre commerce</p>
      </div>
    </div>
  )
}