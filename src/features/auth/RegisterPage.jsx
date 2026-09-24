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
  MapPin,
  Check,
  Loader2
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
  const [adresse, setAdresse] = useState('')
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

  // =========================================================
  // SELECTION DES TYPES DE COMMERCE
  // =========================================================

  function toggleType(valeur) {
    setTypesSelectionnes((actuel) =>
      actuel.includes(valeur)
        ? actuel.filter((t) => t !== valeur)
        : [...actuel, valeur]
    )
  }

  function toggleAutre() {
    setAutreCoche((actuel) => {
      if (actuel) {
        setAutreTexte('')
      }

      return !actuel
    })
  }

  // =========================================================
  // VALIDATION AVANT ENVOI
  // =========================================================

  function validerFormulaire() {
    const nouvellesErreurs = {}

    if (!nomBoutique.trim()) {
      nouvellesErreurs.nom_boutique = [
        'Le nom de la boutique est obligatoire.'
      ]
    }

    if (typesSelectionnes.length === 0 && !autreCoche) {
      nouvellesErreurs.type_commerce = [
        'Sélectionnez au moins un type de commerce.'
      ]
    }

    if (autreCoche && !autreTexte.trim()) {
      nouvellesErreurs.autre = [
        'Veuillez préciser votre activité.'
      ]
    }

    if (!name.trim()) {
      nouvellesErreurs.name = [
        'Votre nom est obligatoire.'
      ]
    }

    if (!telephone.trim()) {
      nouvellesErreurs.telephone = [
        'Le numéro de téléphone est obligatoire.'
      ]
    } else if (!/^[0-9+\s()-]{8,20}$/.test(telephone.trim())) {
      nouvellesErreurs.telephone = [
        'Veuillez saisir un numéro de téléphone valide.'
      ]
    }

    // EMAIL OBLIGATOIRE
    if (!email.trim()) {
      nouvellesErreurs.email = [
        "L'adresse email est obligatoire."
      ]
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      nouvellesErreurs.email = [
        'Veuillez saisir une adresse email valide.'
      ]
    }

    if (!password) {
      nouvellesErreurs.password = [
        'Le mot de passe est obligatoire.'
      ]
    } else if (password.length < 6) {
      nouvellesErreurs.password = [
        'Le mot de passe doit contenir au moins 6 caractères.'
      ]
    }

    if (!passwordConfirmation) {
      nouvellesErreurs.password_confirmation = [
        'Veuillez confirmer votre mot de passe.'
      ]
    } else if (password !== passwordConfirmation) {
      nouvellesErreurs.password_confirmation = [
        'Les mots de passe ne correspondent pas.'
      ]
    }

    setErreurs(nouvellesErreurs)

    return Object.keys(nouvellesErreurs).length === 0
  }

  // =========================================================
  // SOUMISSION
  // =========================================================

  async function handleSubmit(e) {
    e.preventDefault()

    setErreurs({})
    setErreurGenerale('')

    if (!validerFormulaire()) {
      return
    }

    setChargement(true)

    const morceaux = [...typesSelectionnes]

    if (autreCoche && autreTexte.trim()) {
      morceaux.push(autreTexte.trim())
    }

    const typeCommerceFinal = morceaux.join(',')

    try {
      await register({
        nom_boutique: nomBoutique.trim(),

        // Adresse facultative
        adresse: adresse.trim() || null,

        type_commerce: typeCommerceFinal || null,

        name: name.trim(),
        telephone: telephone.trim(),

        // Email obligatoire
        email: email.trim(),

        password,
        password_confirmation: passwordConfirmation,
      })

      navigate('/')
    } catch (err) {
      if (err.response?.status === 422) {
        setErreurs(err.response.data.errors || {})

        if (err.response.data.message) {
          setErreurGenerale(err.response.data.message)
        }
      } else if (err.response?.data?.message) {
        setErreurGenerale(err.response.data.message)
      } else {
        setErreurGenerale(
          'Une erreur est survenue. Vérifiez votre connexion puis réessayez.'
        )
      }
    } finally {
      setChargement(false)
    }
  }

  // =========================================================
  // STYLE DES INPUTS
  // =========================================================

  const inputStyle = {
    background: '#FAF8F3',
    border: '1px solid #E2E8F0',
    color: '#101828'
  }

  function handleFocus(e) {
    e.target.style.borderColor = '#C9A96E'
    e.target.style.boxShadow =
      '0 0 0 3px rgba(201,169,110,0.12)'
  }

  function handleBlur(e) {
    e.target.style.borderColor = '#E2E8F0'
    e.target.style.boxShadow = 'none'
  }

  // =========================================================
  // AFFICHAGE
  // =========================================================

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(
            circle at 10% 10%,
            rgba(201,169,110,0.12),
            transparent 30%
          ),
          radial-gradient(
            circle at 90% 90%,
            rgba(23,37,84,0.08),
            transparent 35%
          ),
          #FAF8F3
        `
      }}
    >
      {/* Décor haut droite */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
        style={{
          background: '#C9A96E',
          opacity: 0.06,
          filter: 'blur(80px)'
        }}
      />

      {/* Décor bas gauche */}
      <div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
        style={{
          background: '#172554',
          opacity: 0.08,
          filter: 'blur(90px)'
        }}
      />

      {/* Cercles décoratifs */}
      <div
        className="absolute top-10 right-10 w-24 h-24 rounded-full border opacity-30"
        style={{ borderColor: '#C9A96E' }}
      />

      <div
        className="absolute bottom-10 left-10 w-16 h-16 rounded-full border opacity-20"
        style={{ borderColor: '#172554' }}
      />

      <div className="relative w-full max-w-md">

        {/* =====================================================
            CARTE
        ===================================================== */}

        <div
          className="bg-white rounded-[28px] p-7 sm:p-9 border shadow-2xl"
          style={{
            borderColor: 'rgba(201,169,110,0.20)',
            boxShadow: '0 25px 70px rgba(16,24,40,0.10)'
          }}
        >

          {/* ===================================================
              LOGO
          =================================================== */}

          <div className="flex flex-col items-center text-center mb-7">

            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
              style={{
                background:
                  'linear-gradient(135deg, #172554, #101828)',
                boxShadow:
                  '0 10px 25px rgba(16,24,40,0.18)'
              }}
            >
              <Store
                size={25}
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
                className="text-[10px] uppercase tracking-[0.18em]"
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

          {/* ===================================================
              INTRODUCTION
          =================================================== */}

          <div className="mb-6">

            <h2
              className="text-lg font-semibold"
              style={{ color: '#1E293B' }}
            >
              Créez votre espace
            </h2>

            <p
              className="text-sm mt-1"
              style={{ color: '#64748B' }}
            >
              Quelques informations pour commencer votre
              gestion commerciale.
            </p>

          </div>

          {/* ===================================================
              FORMULAIRE
          =================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* =================================================
                NOM BOUTIQUE
            ================================================= */}

            <div>

              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#334155' }}
              >
                Nom de la boutique
              </label>

              <div className="relative">

                <Store
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#9A8050' }}
                />

                <input
                  type="text"
                  value={nomBoutique}
                  onChange={(e) =>
                    setNomBoutique(e.target.value)
                  }
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
                  style={inputStyle}
                  placeholder="Ex. : Boutique Sopou Nabi"
                  required
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

              </div>

              {erreurs.nom_boutique && (
                <p className="text-red-600 text-xs mt-1.5">
                  {erreurs.nom_boutique[0]}
                </p>
              )}

            </div>

            {/* =================================================
                ADRESSE BOUTIQUE
            ================================================= */}

            <div>

              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#334155' }}
              >
                Adresse de la boutique

                <span
                  className="font-normal ml-1"
                  style={{ color: '#94A3B8' }}
                >
                  (facultatif)
                </span>
              </label>

              <div className="relative">

                <MapPin
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#9A8050' }}
                />

                <input
                  type="text"
                  value={adresse}
                  onChange={(e) =>
                    setAdresse(e.target.value)
                  }
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
                  style={inputStyle}
                  placeholder="Ex. : Thiès, Grand Standing"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

              </div>

              {erreurs.adresse && (
                <p className="text-red-600 text-xs mt-1.5">
                  {erreurs.adresse[0]}
                </p>
              )}

            </div>

            {/* =================================================
                TYPE COMMERCE
            ================================================= */}

            <div>

              <div className="flex items-center justify-between mb-2">

                <label
                  className="block text-sm font-medium"
                  style={{ color: '#334155' }}
                >
                  Type de commerce
                </label>

                {typesSelectionnes.length > 0 && (
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: '#9A8050' }}
                  >
                    {typesSelectionnes.length}{' '}
                    sélectionné
                    {typesSelectionnes.length > 1
                      ? 's'
                      : ''}
                  </span>
                )}

              </div>

              <p
                className="text-xs mb-2"
                style={{ color: '#94A3B8' }}
              >
                Vous pouvez sélectionner un ou plusieurs
                types.
              </p>

              <div className="flex flex-wrap gap-2">

                {TYPES_COMMERCE.map((t) => {

                  const coche =
                    typesSelectionnes.includes(t.valeur)

                  return (
                    <button
                      key={t.valeur}
                      type="button"
                      onClick={() =>
                        toggleType(t.valeur)
                      }
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all duration-200"
                      style={
                        coche
                          ? {
                              background:
                                'linear-gradient(135deg, #172554, #101828)',
                              color: 'white',
                              borderColor:
                                'transparent',
                              boxShadow:
                                '0 4px 12px rgba(16,24,40,0.12)'
                            }
                          : {
                              background: '#FAF8F3',
                              color: '#475569',
                              borderColor:
                                '#E2E8F0'
                            }
                      }
                    >

                      {coche && (
                        <Check size={12} />
                      )}

                      {t.label}

                    </button>
                  )
                })}

                {/* AUTRE */}

                <button
                  type="button"
                  onClick={toggleAutre}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all duration-200"
                  style={
                    autreCoche
                      ? {
                          background:
                            'linear-gradient(135deg, #172554, #101828)',
                          color: 'white',
                          borderColor:
                            'transparent'
                        }
                      : {
                          background: '#FAF8F3',
                          color: '#475569',
                          borderColor:
                            '#E2E8F0'
                        }
                  }
                >

                  {autreCoche && (
                    <Check size={12} />
                  )}

                  Autre

                </button>

              </div>

              {erreurs.type_commerce && (
                <p className="text-red-600 text-xs mt-1.5">
                  {erreurs.type_commerce[0]}
                </p>
              )}

              {/* AUTRE TEXTE */}

              {autreCoche && (
                <div className="mt-2">

                  <input
                    type="text"
                    value={autreTexte}
                    onChange={(e) =>
                      setAutreTexte(e.target.value)
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={inputStyle}
                    placeholder="Ex. : Quincaillerie"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />

                  {erreurs.autre && (
                    <p className="text-red-600 text-xs mt-1.5">
                      {erreurs.autre[0]}
                    </p>
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                NOM UTILISATEUR
            ================================================= */}

            <div>

              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#334155' }}
              >
                Votre nom
              </label>

              <div className="relative">

                <UserRound
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#9A8050' }}
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
                  style={inputStyle}
                  placeholder="Votre nom et prénom"
                  required
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

              </div>

              {erreurs.name && (
                <p className="text-red-600 text-xs mt-1.5">
                  {erreurs.name[0]}
                </p>
              )}

            </div>

            {/* =================================================
                TELEPHONE
            ================================================= */}

            <div>

              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#334155' }}
              >
                Numéro de téléphone
              </label>

              <div className="relative">

                <Phone
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#9A8050' }}
                />

                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) =>
                    setTelephone(e.target.value)
                  }
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
                  style={inputStyle}
                  placeholder="Ex. : 77 123 45 67"
                  required
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

              </div>

              {erreurs.telephone && (
                <p className="text-red-600 text-xs mt-1.5">
                  {erreurs.telephone[0]}
                </p>
              )}

            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#334155' }}
              >
                Adresse email
              </label>

              <div className="relative">

                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#9A8050' }}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
                  style={inputStyle}
                  placeholder="exemple@email.com"
                  required
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

              </div>

              {erreurs.email && (
                <p className="text-red-600 text-xs mt-1.5">
                  {erreurs.email[0]}
                </p>
              )}

            </div>

            {/* =================================================
                MOTS DE PASSE
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* MOT DE PASSE */}

              <div>

                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#334155' }}
                >
                  Mot de passe
                </label>

                <div className="relative">

                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: '#9A8050' }}
                  />

                  <input
                    type={
                      afficherPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="w-full rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none transition-all"
                    style={inputStyle}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setAfficherPassword(
                        !afficherPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5"
                    style={{
                      color: '#94A3B8'
                    }}
                    aria-label={
                      afficherPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                  >
                    {afficherPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                <p
                  className="text-[11px] mt-1.5"
                  style={{ color: '#94A3B8' }}
                >
                  6 caractères minimum
                </p>

                {erreurs.password && (
                  <p className="text-red-600 text-xs mt-1.5">
                    {erreurs.password[0]}
                  </p>
                )}

              </div>

              {/* CONFIRMATION */}

              <div>

                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#334155' }}
                >
                  Confirmation
                </label>

                <div className="relative">

                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: '#9A8050' }}
                  />

                  <input
                    type={
                      afficherConfirmation
                        ? 'text'
                        : 'password'
                    }
                    value={passwordConfirmation}
                    onChange={(e) =>
                      setPasswordConfirmation(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none transition-all"
                    style={inputStyle}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setAfficherConfirmation(
                        !afficherConfirmation
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5"
                    style={{
                      color: '#94A3B8'
                    }}
                    aria-label={
                      afficherConfirmation
                        ? 'Masquer la confirmation'
                        : 'Afficher la confirmation'
                    }
                  >
                    {afficherConfirmation ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                {passwordConfirmation &&
                  password === passwordConfirmation && (
                    <p
                      className="text-[11px] mt-1.5 flex items-center gap-1"
                      style={{ color: '#15803D' }}
                    >
                      <Check size={12} />
                      Les mots de passe correspondent
                    </p>
                  )}

                {erreurs.password_confirmation && (
                  <p className="text-red-600 text-xs mt-1.5">
                    {erreurs.password_confirmation[0]}
                  </p>
                )}

              </div>

            </div>

            {/* =================================================
                ERREUR GENERALE
            ================================================= */}

            {erreurGenerale && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: '#FEF2F2',
                  color: '#B91C1C',
                  border: '1px solid #FECACA'
                }}
              >
                {erreurGenerale}
              </div>
            )}

            {/* =================================================
                BOUTON CREATION
            ================================================= */}

            <button
              type="submit"
              disabled={chargement}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 mt-2"
              style={{
                background:
                  'linear-gradient(135deg, #172554 0%, #101828 100%)',
                boxShadow:
                  '0 10px 25px rgba(16,24,40,0.18)'
              }}
            >

              {chargement ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Création de votre boutique...
                </>
              ) : (
                <>
                  Créer ma boutique
                  <ArrowRight size={17} />
                </>
              )}

            </button>

          </form>

          {/* ===================================================
              CONNEXION
          =================================================== */}

          <div className="mt-7 pt-6 border-t border-slate-100 text-center">

            <p
              className="text-sm"
              style={{ color: '#64748B' }}
            >
              Vous avez déjà un compte ?
            </p>

            <Link
              to="/connexion"
              className="inline-flex items-center gap-1 mt-1 text-sm font-semibold hover:underline"
              style={{ color: '#9A8050' }}
            >
              Se connecter
              <ArrowRight size={14} />
            </Link>

          </div>

        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

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