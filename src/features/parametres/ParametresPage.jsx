import { useEffect, useState } from 'react'
import { Plus, X, UserRound, ShieldCheck, Store, Camera, Pencil } from 'lucide-react'
import apiClient from '../../lib/api/client'
import useAuthStore from '../../lib/auth/authStore'

const LABELS_ROLE = {
  proprietaire: 'Propriétaire',
  gestionnaire: 'Gestionnaire',
  vendeur: 'Vendeur',
}

const BASE_URL_STOCKAGE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/storage/'

export default function ParametresPage() {
  const { user, boutique } = useAuthStore()
  const [employes, setEmployes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [modalOuvert, setModalOuvert] = useState(false)
  const [editionBoutiqueOuverte, setEditionBoutiqueOuverte] = useState(false)

  const estProprietaire = user?.role === 'proprietaire'

  async function chargerEmployes() {
    if (!estProprietaire) return
    setChargement(true)
    try {
      const res = await apiClient.get('/employes')
      setEmployes(res.data)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    chargerEmployes()
  }, [])

  async function toggleActif(employe) {
    await apiClient.put(`/employes/${employe.id}`, { actif: !employe.actif })
    chargerEmployes()
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Paramètres</h1>

      {/* Infos boutique */}
      <div className="bg-surface rounded-2xl border border-black/5 p-5 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-display font-bold shrink-0 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
            >
              {boutique?.logo_url ? (
                <img src={BASE_URL_STOCKAGE + boutique.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                boutique?.nom?.slice(0, 2).toUpperCase() || 'SN'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Store size={16} className="text-accent-600" />
                <h2 className="font-medium text-ink">Boutique</h2>
              </div>
              <p className="text-ink-soft text-sm">{boutique?.nom}</p>
              <p className="text-ink-faint text-xs mt-0.5">
                {boutique?.telephone || 'Aucun téléphone'} {boutique?.adresse && `— ${boutique.adresse}`}
              </p>
              <p className="text-ink-faint text-xs mt-0.5">
                Plan : {boutique?.plan === 'gratuit' ? 'Gratuit' : boutique?.plan}
              </p>
            </div>
          </div>

          {estProprietaire && (
            <button
              onClick={() => setEditionBoutiqueOuverte(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-black/10 text-ink-soft hover:border-black/20 transition shrink-0"
            >
              <Pencil size={13} /> Modifier
            </button>
          )}
        </div>
      </div>

      {/* Gestion des employés — visible uniquement par le propriétaire */}
      {estProprietaire ? (
        <div className="bg-surface rounded-2xl border border-black/5 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-black/5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-accent-600" />
              <h2 className="font-medium text-ink">Employés</h2>
            </div>
            <button
              onClick={() => setModalOuvert(true)}
              className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-2 rounded-lg transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
            >
              <Plus size={14} /> Ajouter un employé
            </button>
          </div>

          {chargement ? (
            <p className="p-5 text-ink-faint text-sm">Chargement...</p>
          ) : (
            <div className="divide-y divide-black/5">
              {employes.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent-100 flex items-center justify-center shrink-0">
                      <UserRound size={16} className="text-accent-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{emp.name}</p>
                      <p className="text-xs text-ink-faint">{emp.telephone} · {LABELS_ROLE[emp.role]}</p>
                    </div>
                  </div>

                  {emp.role !== 'proprietaire' && (
                    <button
                      onClick={() => toggleActif(emp)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${
                        emp.actif
                          ? 'bg-positive-soft text-positive hover:opacity-80'
                          : 'bg-warning-soft text-warning hover:opacity-80'
                      }`}
                    >
                      {emp.actif ? 'Actif' : 'Désactivé'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-black/5 p-5">
          <p className="text-ink-soft text-sm">
            Seul le propriétaire de la boutique peut gérer les employés.
          </p>
        </div>
      )}

      {modalOuvert && (
        <EmployeFormModal
          onFerme={() => setModalOuvert(false)}
          onEnregistre={() => { setModalOuvert(false); chargerEmployes() }}
        />
      )}

      {editionBoutiqueOuverte && (
        <ModalEditionBoutique onFerme={() => setEditionBoutiqueOuverte(false)} />
      )}
    </div>
  )
}

function ModalEditionBoutique({ onFerme }) {
  const { boutique, setBoutique } = useAuthStore()
  const [nom, setNom] = useState(boutique?.nom ?? '')
  const [typeCommerce, setTypeCommerce] = useState(boutique?.type_commerce ?? '')
  const [telephone, setTelephone] = useState(boutique?.telephone ?? '')
  const [adresse, setAdresse] = useState(boutique?.adresse ?? '')
  const [logoFichier, setLogoFichier] = useState(null)
  const [apercuLogo, setApercuLogo] = useState(boutique?.logo_url ? BASE_URL_STOCKAGE + boutique.logo_url : null)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreurs, setErreurs] = useState({})

  function choisirLogo(e) {
    const fichier = e.target.files?.[0]
    if (!fichier) return
    setLogoFichier(fichier)
    setApercuLogo(URL.createObjectURL(fichier))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErreurs({})
    setEnregistrement(true)

    const formData = new FormData()
    formData.append('nom', nom)
    if (typeCommerce) formData.append('type_commerce', typeCommerce)
    if (telephone) formData.append('telephone', telephone)
    if (adresse) formData.append('adresse', adresse)
    if (logoFichier) formData.append('logo', logoFichier)

    try {
      const res = await apiClient.post('/boutique', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setBoutique(res.data)
      onFerme()
    } catch (err) {
      if (err.response?.status === 422) {
        setErreurs(err.response.data.errors || {})
      }
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onFerme} className="absolute top-4 right-4 text-ink-faint hover:text-ink">
          <X size={20} />
        </button>

        <h2 className="font-display text-lg font-semibold text-ink mb-5">Modifier la boutique</h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Logo */}
          <div className="flex flex-col items-center mb-2">
            <label className="relative cursor-pointer group">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
              >
                {apercuLogo ? (
                  <img src={apercuLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  nom?.slice(0, 2).toUpperCase() || 'SN'
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera size={20} className="text-white" />
              </div>
              <input type="file" accept="image/*" onChange={choisirLogo} className="hidden" />
            </label>
            <p className="text-xs text-ink-faint mt-2">Touche le logo pour le changer</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nom de la boutique</label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              required
            />
            {erreurs.nom && <p className="text-warning text-xs mt-1">{erreurs.nom[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Type de commerce</label>
            <input
              value={typeCommerce}
              onChange={(e) => setTypeCommerce(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Ex: boutique, vêtements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Adresse</label>
            <input
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          <button
            type="submit"
            disabled={enregistrement}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
          >
            {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}

function EmployeFormModal({ onFerme, onEnregistre }) {
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
      await apiClient.post('/employes', { name, telephone, password, role })
      onEnregistre()
    } catch (err) {
      if (err.response?.status === 422) {
        setErreurs(err.response.data.errors || {})
      }
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onFerme} className="absolute top-4 right-4 text-ink-faint hover:text-ink">
          <X size={20} />
        </button>

        <h2 className="font-display text-lg font-semibold text-ink mb-5">Ajouter un employé</h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Ex: Moussa Ndiaye"
              required
            />
            {erreurs.name && <p className="text-warning text-xs mt-1">{erreurs.name[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="771234568"
              required
            />
            {erreurs.telephone && <p className="text-warning text-xs mt-1">{erreurs.telephone[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Mot de passe temporaire</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              required
              minLength={6}
            />
            {erreurs.password && <p className="text-warning text-xs mt-1">{erreurs.password[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Rôle</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('vendeur')}
                className="text-sm font-medium py-2.5 rounded-xl border transition"
                style={
                  role === 'vendeur'
                    ? { background: 'linear-gradient(135deg, #172554, #101828)', color: 'white', borderColor: 'transparent' }
                    : { borderColor: 'rgba(0,0,0,0.1)' }
                }
              >
                Vendeur
              </button>
              <button
                type="button"
                onClick={() => setRole('gestionnaire')}
                className="text-sm font-medium py-2.5 rounded-xl border transition"
                style={
                  role === 'gestionnaire'
                    ? { background: 'linear-gradient(135deg, #172554, #101828)', color: 'white', borderColor: 'transparent' }
                    : { borderColor: 'rgba(0,0,0,0.1)' }
                }
              >
                Gestionnaire
              </button>
            </div>
            <p className="text-ink-faint text-xs mt-1.5">
              {role === 'vendeur'
                ? 'Peut enregistrer des ventes, mais ne peut pas gérer produits ou dépenses.'
                : 'Peut tout faire sauf gérer les autres employés.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={enregistrement}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
          >
            {enregistrement ? 'Création...' : "Créer l'accès"}
          </button>
        </form>
      </div>
    </div>
  )
}