
import { useEffect, useState } from 'react'
import {
  Plus,
  X,
  UserRound,
  ShieldCheck,
  Store,
  Phone,
  UserCog,
  LockKeyhole,
} from 'lucide-react'
import apiClient from '../../lib/api/client'
import useAuthStore from '../../lib/auth/authStore'

const LABELS_ROLE = {
  proprietaire: 'Propriétaire',
  gestionnaire: 'Gestionnaire',
  vendeur: 'Vendeur',
}

export default function ParametresPage() {
  const { user, boutique } = useAuthStore()

  const [employes, setEmployes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [modalOuvert, setModalOuvert] = useState(false)

  const estProprietaire = user?.role === 'proprietaire'

  async function chargerEmployes() {
    if (!estProprietaire) {
      setChargement(false)
      return
    }

    setChargement(true)

    try {
      const res = await apiClient.get('/employes')
      setEmployes(res.data)
    } catch (err) {
      console.error('Erreur chargement employés:', err)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    chargerEmployes()
  }, [])

  async function toggleActif(employe) {
    try {
      await apiClient.put(`/employes/${employe.id}`, {
        actif: !employe.actif,
      })

      chargerEmployes()
    } catch (err) {
      console.error('Erreur modification employé:', err)
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F6F8FC] text-[#14233D]">

      <div className="w-full max-w-[1600px] mx-auto px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-7 xl:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="relative overflow-hidden rounded-[22px] sm:rounded-[28px] bg-white border border-[#DCE3EC] mb-4 sm:mb-6">

          {/* Décorations */}
          <div className="absolute -right-20 -top-24 w-56 h-56 rounded-full border border-[#D8B66A]/10" />

          <div className="absolute right-8 -bottom-20 w-48 h-48 rounded-full bg-[#D8B66A]/[0.05]" />

          <div className="relative z-10 p-4 sm:p-6 lg:p-7">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center bg-[#071A33] shrink-0">
                <ShieldCheck
                  size={18}
                  className="text-[#E5C77D]"
                />
              </div>

              <div className="min-w-0">

                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] font-semibold text-[#A17B2C]">
                  Configuration
                </p>

                <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-[#14233D] mt-0.5">
                  Paramètres
                </h1>

                <p className="text-[11px] sm:text-sm text-[#7A8799] mt-0.5 sm:mt-1">
                  Gérez votre boutique et vos employés.
                </p>

              </div>

            </div>

          </div>
        </div>

        {/* =====================================================
            INFORMATIONS BOUTIQUE
        ===================================================== */}

        <section className="bg-white rounded-[20px] sm:rounded-[24px] border border-[#DCE3EC] p-4 sm:p-5 mb-4 sm:mb-6">

          <div className="flex items-start gap-3">

            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#F8F2E4] flex items-center justify-center shrink-0">
              <Store
                size={18}
                className="text-[#A17B2C]"
              />
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                <div>

                  <p className="text-[9px] uppercase tracking-[0.18em] font-semibold text-[#A17B2C]">
                    Votre espace
                  </p>

                  <h2 className="font-semibold text-[#14233D] mt-0.5 text-sm sm:text-base">
                    Boutique
                  </h2>

                </div>

                <span className="self-start px-2.5 py-1 rounded-full bg-[#F3F6FA] text-[9px] sm:text-[10px] font-semibold text-[#52657E]">
                  {boutique?.plan === 'gratuit'
                    ? 'Plan gratuit'
                    : boutique?.plan || 'Plan'}
                </span>

              </div>

              <p className="text-sm sm:text-base font-medium text-[#263750] mt-3 truncate">
                {boutique?.nom || 'Ma boutique'}
              </p>

              <p className="text-[10px] sm:text-xs text-[#9AA3B5] mt-1">
                Votre espace commercial SenNoflaye
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            GESTION EMPLOYÉS
        ===================================================== */}

        {estProprietaire ? (

          <section className="bg-white rounded-[20px] sm:rounded-[24px] border border-[#DCE3EC] overflow-hidden">

            {/* HEADER EMPLOYÉS */}
            <div className="p-4 sm:p-5 border-b border-[#E8EDF3]">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#EDF3FA] flex items-center justify-center shrink-0">
                    <ShieldCheck
                      size={18}
                      className="text-[#315B91]"
                    />
                  </div>

                  <div>

                    <h2 className="font-semibold text-[#14233D] text-sm sm:text-base">
                      Employés
                    </h2>

                    <p className="text-[10px] sm:text-xs text-[#9AA3B5] mt-0.5">
                      Gérez les accès de votre équipe.
                    </p>

                  </div>

                </div>

                <button
                  onClick={() => setModalOuvert(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
                  style={{
                    background:
                      'linear-gradient(135deg, #071A33, #123F76)',
                  }}
                >
                  <Plus size={15} />
                  Ajouter un employé
                </button>

              </div>

            </div>

            {/* =================================================
                LISTE
            ================================================= */}

            {chargement ? (

              <div className="p-4 sm:p-5 space-y-3">

                {[1, 2, 3].map((item) => (

                  <div
                    key={item}
                    className="h-[82px] rounded-2xl bg-[#F5F7FA] animate-pulse"
                  />

                ))}

              </div>

            ) : employes.length === 0 ? (

              <div className="p-8 sm:p-12 text-center">

                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F3F6FA] flex items-center justify-center">

                  <UserRound
                    size={24}
                    className="text-[#A5AFBD]"
                  />

                </div>

                <h3 className="text-sm font-semibold text-[#263750] mt-4">
                  Aucun employé
                </h3>

                <p className="text-xs text-[#9AA3B5] mt-1 max-w-sm mx-auto">
                  Ajoutez votre premier employé pour commencer à gérer votre équipe.
                </p>

              </div>

            ) : (

              <div className="p-2 sm:p-3">

                {employes.map((emp) => (

                  <div
                    key={emp.id}
                    className="group p-3 sm:px-3 sm:py-3.5 rounded-2xl hover:bg-[#F8FAFC] transition"
                  >

                    <div className="flex items-start sm:items-center gap-3">

                      {/* AVATAR */}

                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#EDF3FA] flex items-center justify-center shrink-0">

                        <UserRound
                          size={17}
                          className="text-[#315B91]"
                        />

                      </div>

                      {/* INFOS */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">

                          <p className="text-sm font-semibold text-[#263750] truncate">
                            {emp.name}
                          </p>

                          {emp.role === 'proprietaire' && (
                            <span className="self-start px-2 py-0.5 rounded-full bg-[#F8F2E4] text-[#A17B2C] text-[9px] font-semibold">
                              Propriétaire
                            </span>
                          )}

                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">

                          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#8B96A7]">

                            <Phone size={11} />

                            {emp.telephone}

                          </span>

                          <span className="hidden sm:block text-[#D0D6DE]">
                            •
                          </span>

                          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#8B96A7]">

                            <UserCog size={11} />

                            {LABELS_ROLE[emp.role] || emp.role}

                          </span>

                        </div>

                      </div>

                      {/* STATUT */}

                      {emp.role !== 'proprietaire' && (

                        <button
                          onClick={() => toggleActif(emp)}
                          className={`shrink-0 text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full transition active:scale-95 ${
                            emp.actif
                              ? 'bg-[#EAF4F0] text-[#397866] hover:bg-[#DDEFE9]'
                              : 'bg-[#F1F3F6] text-[#68778C] hover:bg-[#E8EBEF]'
                          }`}
                        >
                          {emp.actif
                            ? 'Actif'
                            : 'Désactivé'}
                        </button>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        ) : (

          /* =================================================
             NON PROPRIÉTAIRE
          ================================================= */

          <section className="relative overflow-hidden bg-white rounded-[20px] sm:rounded-[24px] border border-[#DCE3EC] p-5 sm:p-6">

            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-[#071A33]/[0.025]" />

            <div className="relative flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#EDF3FA] flex items-center justify-center shrink-0">

                <LockKeyhole
                  size={17}
                  className="text-[#52657E]"
                />

              </div>

              <div>

                <h2 className="text-sm font-semibold text-[#263750]">
                  Gestion des employés
                </h2>

                <p className="text-xs text-[#8B96A7] mt-1 leading-relaxed">
                  Seul le propriétaire de la boutique peut gérer les employés et leurs accès.
                </p>

              </div>

            </div>

          </section>

        )}

      </div>

      {/* =====================================================
          MODAL AJOUT EMPLOYÉ
      ===================================================== */}

      {modalOuvert && (

        <EmployeFormModal
          onFerme={() => setModalOuvert(false)}
          onEnregistre={() => {
            setModalOuvert(false)
            chargerEmployes()
          }}
        />

      )}

    </div>
  )
}


/* =========================================================
   MODAL EMPLOYÉ
========================================================= */

function EmployeFormModal({
  onFerme,
  onEnregistre,
}) {
  const [name, setName] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('vendeur')

  const [erreurs, setErreurs] = useState({})
  const [enregistrement, setEnregistrement] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setErreurs({})
    setEnregistrement(true)

    try {

      await apiClient.post('/employes', {
        name,
        telephone,
        password,
        role,
      })

      onEnregistre()

    } catch (err) {

      if (err.response?.status === 422) {

        setErreurs(
          err.response.data.errors || {}
        )

      } else {

        console.error(
          'Erreur création employé:',
          err
        )

      }

    } finally {

      setEnregistrement(false)

    }
  }

  function erreurChamp(champ) {
    return erreurs[champ]?.[0]
  }

  return (

    <div className="fixed inset-0 z-50 bg-[#071A33]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">

      <div className="relative w-full sm:max-w-md max-h-[94vh] sm:max-h-[90vh] overflow-y-auto bg-white rounded-t-[26px] sm:rounded-[26px] shadow-2xl">

        {/* =================================================
            MODAL HEADER
        ================================================= */}

        <div className="sticky top-0 z-10 bg-white border-b border-[#E8EDF3] px-5 py-4 sm:p-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#071A33] flex items-center justify-center">

                <UserRound
                  size={17}
                  className="text-[#E5C77D]"
                />

              </div>

              <div>

                <p className="text-[9px] uppercase tracking-[0.18em] text-[#A17B2C] font-semibold">
                  Équipe
                </p>

                <h2 className="font-display text-base sm:text-lg font-semibold text-[#14233D]">
                  Ajouter un employé
                </h2>

              </div>

            </div>

            <button
              onClick={onFerme}
              type="button"
              className="w-9 h-9 rounded-xl bg-[#F4F6F8] flex items-center justify-center text-[#7A8799] hover:text-[#14233D] hover:bg-[#EDF0F4] transition"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

          </div>

        </div>

        {/* =================================================
            FORMULAIRE
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 space-y-4"
        >

          {/* NOM */}

          <div>

            <label className="block text-xs font-semibold text-[#263750] mb-1.5">
              Nom complet
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full h-11 rounded-xl border border-[#DCE3EC] bg-[#FAFBFC] px-3.5 text-sm text-[#263750] placeholder:text-[#A5AFBD] focus:outline-none focus:border-[#315B91] focus:ring-2 focus:ring-[#315B91]/10 transition"
              placeholder="Ex : Moussa Ndiaye"
              required
            />

            {erreurChamp('name') && (

              <p className="text-[#9A7021] text-[10px] mt-1.5">
                {erreurChamp('name')}
              </p>

            )}

          </div>

          {/* TELEPHONE */}

          <div>

            <label className="block text-xs font-semibold text-[#263750] mb-1.5">
              Téléphone
            </label>

            <div className="relative">

              <Phone
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA3B5]"
              />

              <input
                type="tel"
                value={telephone}
                onChange={(e) =>
                  setTelephone(e.target.value)
                }
                className="w-full h-11 rounded-xl border border-[#DCE3EC] bg-[#FAFBFC] pl-10 pr-3.5 text-sm text-[#263750] placeholder:text-[#A5AFBD] focus:outline-none focus:border-[#315B91] focus:ring-2 focus:ring-[#315B91]/10 transition"
                placeholder="771234568"
                required
              />

            </div>

            {erreurChamp('telephone') && (

              <p className="text-[#9A7021] text-[10px] mt-1.5">
                {erreurChamp('telephone')}
              </p>

            )}

          </div>

          {/* PASSWORD */}

          <div>

            <label className="block text-xs font-semibold text-[#263750] mb-1.5">
              Mot de passe temporaire
            </label>

            <div className="relative">

              <LockKeyhole
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA3B5]"
              />

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full h-11 rounded-xl border border-[#DCE3EC] bg-[#FAFBFC] pl-10 pr-3.5 text-sm text-[#263750] placeholder:text-[#A5AFBD] focus:outline-none focus:border-[#315B91] focus:ring-2 focus:ring-[#315B91]/10 transition"
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
              />

            </div>

            {erreurChamp('password') && (

              <p className="text-[#9A7021] text-[10px] mt-1.5">
                {erreurChamp('password')}
              </p>

            )}

          </div>

          {/* ROLE */}

          <div>

            <label className="block text-xs font-semibold text-[#263750] mb-2">
              Rôle
            </label>

            <div className="grid grid-cols-2 gap-2">

              {/* VENDEUR */}

              <button
                type="button"
                onClick={() =>
                  setRole('vendeur')
                }
                className={`relative text-xs sm:text-sm font-semibold py-3 rounded-xl border transition-all ${
                  role === 'vendeur'
                    ? 'text-white border-transparent shadow-md'
                    : 'text-[#52657E] bg-[#FAFBFC] border-[#DCE3EC] hover:bg-[#F5F7FA]'
                }`}
                style={
                  role === 'vendeur'
                    ? {
                        background:
                          'linear-gradient(135deg, #071A33, #123F76)',
                      }
                    : {}
                }
              >
                Vendeur
              </button>

              {/* GESTIONNAIRE */}

              <button
                type="button"
                onClick={() =>
                  setRole('gestionnaire')
                }
                className={`relative text-xs sm:text-sm font-semibold py-3 rounded-xl border transition-all ${
                  role === 'gestionnaire'
                    ? 'text-white border-transparent shadow-md'
                    : 'text-[#52657E] bg-[#FAFBFC] border-[#DCE3EC] hover:bg-[#F5F7FA]'
                }`}
                style={
                  role === 'gestionnaire'
                    ? {
                        background:
                          'linear-gradient(135deg, #071A33, #123F76)',
                      }
                    : {}
                }
              >
                Gestionnaire
              </button>

            </div>

            <div className="mt-2.5 rounded-xl bg-[#F5F7FA] px-3 py-2.5">

              <p className="text-[10px] sm:text-xs text-[#7A8799] leading-relaxed">

                {role === 'vendeur'
                  ? 'Peut enregistrer des ventes, mais ne peut pas gérer les produits ou les dépenses.'
                  : 'Peut gérer les ventes, produits et dépenses, mais ne peut pas gérer les autres employés.'}

              </p>

            </div>

          </div>

          {/* BOUTON */}

          <div className="pt-1">

            <button
              type="submit"
              disabled={enregistrement}
              className="w-full h-11 text-white text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90 active:scale-[0.99] shadow-md"
              style={{
                background:
                  'linear-gradient(135deg, #C9A96E, #9A8050)',
              }}
            >
              {enregistrement
                ? 'Création en cours...'
                : "Créer l'accès"}
            </button>

          </div>

        </form>

      </div>

    </div>

  )
}

