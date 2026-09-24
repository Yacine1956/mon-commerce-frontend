import { useEffect, useState } from 'react'
import { Plus, Search, X, Users, MessageCircle, ArrowLeft, FileDown, Phone, Trash2 } from 'lucide-react'
import apiClient from '../../lib/api/client'
import Pagination from '../../components/Pagination'
import EtatVide from '../../components/EtatVide'
import SquelletteTableau from '../../components/SquelletteTableau'
import useAuthStore from '../../lib/auth/authStore'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [recherche, setRecherche] = useState('')
  const [chargement, setChargement] = useState(true)
  const [modalAjoutOuvert, setModalAjoutOuvert] = useState(false)
  const [clientOuvertId, setClientOuvertId] = useState(null)

  async function chargerClients() {
    setChargement(true)
    const params = { page }
    if (recherche) params.recherche = recherche
    const res = await apiClient.get('/clients', { params })
    setClients(res.data.data)
    setMeta(res.data.meta)
    setChargement(false)
  }

  useEffect(() => {
    const delai = setTimeout(chargerClients, 300)
    return () => clearTimeout(delai)
  }, [recherche, page])

  useEffect(() => {
    setPage(1)
  }, [recherche])

  if (clientOuvertId) {
    return (
      <FicheClient
        clientId={clientOuvertId}
        onRetour={() => { setClientOuvertId(null); chargerClients() }}
      />
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Clients</h1>
          {meta && <p className="text-sm text-ink-faint">{meta.total} client(s)</p>}
        </div>
        <button
          onClick={() => setModalAjoutOuvert(true)}
          className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
        >
          <Plus size={16} /> Ajouter un client
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un client..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      <div className="bg-surface rounded-2xl border border-black/5 overflow-hidden">
        {chargement ? (
          <SquelletteTableau colonnes={3} />
        ) : clients.length === 0 ? (
          <EtatVide
            icone={Users}
            titre={recherche ? 'Aucun client trouvé' : 'Aucun client pour le moment'}
            description={recherche ? "Essaie un autre terme." : "Ajoute tes clients pour suivre leurs achats et leurs dettes."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-paper text-ink-soft text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Téléphone</th>
                  <th className="px-4 py-3 font-medium text-right">Montant dû</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => setClientOuvertId(client.id)}
                    className="hover:bg-paper cursor-pointer transition"
                  >
                    <td className="px-4 py-3.5 font-medium text-ink">{client.nom}</td>
                    <td className="px-4 py-3.5 text-ink-soft">{client.telephone || '—'}</td>
                    <td className="px-4 py-3.5 text-right">
                      {client.montant_du > 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning-soft text-warning">
                          {client.montant_du.toLocaleString('fr-FR')} FCFA
                        </span>
                      ) : (
                        <span className="text-ink-faint text-xs">À jour</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination meta={meta} onChangerPage={setPage} />

      {modalAjoutOuvert && (
        <ModalAjoutClient
          onFerme={() => setModalAjoutOuvert(false)}
          onAjoute={() => { setModalAjoutOuvert(false); chargerClients() }}
        />
      )}
    </div>
  )
}

function ModalAjoutClient({ onFerme, onAjoute }) {
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [note, setNote] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setEnregistrement(true)
    try {
      await apiClient.post('/clients', { nom, telephone: telephone || null, note: note || null })
      onAjoute()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue.')
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 relative">
        <button onClick={onFerme} className="absolute top-4 right-4 text-ink-faint hover:text-ink">
          <X size={20} />
        </button>

        <h2 className="font-display text-lg font-semibold text-ink mb-5">Ajouter un client</h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nom</label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Ex: Aïssatou Sow"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Téléphone (optionnel)</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="771234567"
            />
            <p className="text-ink-faint text-xs mt-1">Nécessaire pour envoyer un rappel WhatsApp.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Note (optionnel)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Ex: Client régulier, quartier X..."
            />
          </div>

          {erreur && <p className="text-warning text-sm">{erreur}</p>}

          <button
            type="submit"
            disabled={enregistrement}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
          >
            {enregistrement ? 'Enregistrement...' : 'Ajouter'}
          </button>
        </form>
      </div>
    </div>
  )
}

function FicheClient({ clientId, onRetour }) {
  const { user } = useAuthStore()
  const estProprietaire = user?.role === 'proprietaire'

  const [client, setClient] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [modalCreditOuvert, setModalCreditOuvert] = useState(false)
  const [creditARembourser, setCreditARembourser] = useState(null)
  const [editionTelephone, setEditionTelephone] = useState(false)
  const [nouveauTelephone, setNouveauTelephone] = useState('')
  const [enregistrementTelephone, setEnregistrementTelephone] = useState(false)
  const [factureEnCours, setFactureEnCours] = useState(null)
  const [selecteurPeriodeOuvert, setSelecteurPeriodeOuvert] = useState(false)
  const [dateDebutReleve, setDateDebutReleve] = useState('')
  const [dateFinReleve, setDateFinReleve] = useState('')
  const [suppressionEnCours, setSuppressionEnCours] = useState(null)

  async function charger() {
    setChargement(true)
    const res = await apiClient.get(`/clients/${clientId}`)
    setClient(res.data)
    setChargement(false)
  }

  useEffect(() => {
    charger()
  }, [clientId])

  async function enregistrerTelephone(e) {
    e.preventDefault()
    setEnregistrementTelephone(true)
    try {
      await apiClient.put(`/clients/${clientId}`, { telephone: nouveauTelephone })
      setEditionTelephone(false)
      setNouveauTelephone('')
      charger()
    } finally {
      setEnregistrementTelephone(false)
    }
  }

  async function telechargerReleve() {
    setFactureEnCours('releve')
    try {
      const params = {}
      if (dateDebutReleve) params.date_debut = dateDebutReleve
      if (dateFinReleve) params.date_fin = dateFinReleve

      const res = await apiClient.get(`/clients/${clientId}/facture`, { params, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const lien = document.createElement('a')
      lien.href = url
      lien.download = `releve-${client.nom.replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(lien)
      lien.click()
      lien.remove()
      window.URL.revokeObjectURL(url)
      setSelecteurPeriodeOuvert(false)
    } finally {
      setFactureEnCours(null)
    }
  }

  async function supprimerCredit(credit) {
    if (!confirm('Supprimer ce crédit soldé de l\'historique ? Cette action est définitive.')) return
    setSuppressionEnCours(credit.id)
    try {
      await apiClient.delete(`/credits/${credit.id}`)
      charger()
    } catch (err) {
      alert(err.response?.data?.message || 'Impossible de supprimer ce crédit.')
    } finally {
      setSuppressionEnCours(null)
    }
  }

  function lienWhatsApp() {
    if (!client?.telephone) return null
    const numero = client.telephone.replace(/\D/g, '')
    const numeroInternational = numero.startsWith('221') ? numero : `221${numero}`
    const message = `Bonjour ${client.nom}, petit rappel amical : vous avez un solde de ${client.montant_du.toLocaleString('fr-FR')} FCFA chez nous. Merci de votre confiance !`
    return `https://wa.me/${numeroInternational}?text=${encodeURIComponent(message)}`
  }

  function formaterDate(iso) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (chargement || !client) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-ink-faint text-sm">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <button onClick={onRetour} className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-5">
        <ArrowLeft size={16} /> Retour aux clients
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{client.nom}</h1>
          {client.telephone ? (
            <p className="text-sm text-ink-faint">{client.telephone}</p>
          ) : editionTelephone ? (
            <form onSubmit={enregistrerTelephone} className="flex items-center gap-2 mt-1">
              <input
                type="tel"
                value={nouveauTelephone}
                onChange={(e) => setNouveauTelephone(e.target.value)}
                placeholder="771234567"
                autoFocus
                className="rounded-lg border border-black/10 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <button
                type="submit"
                disabled={enregistrementTelephone}
                className="text-xs font-medium text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
              >
                {enregistrementTelephone ? '...' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setEditionTelephone(false)} className="text-xs text-ink-faint hover:text-ink">
                Annuler
              </button>
            </form>
          ) : (
            <button
              onClick={() => setEditionTelephone(true)}
              className="flex items-center gap-1 text-sm text-accent-600 hover:underline"
            >
              <Phone size={13} /> Ajouter un numéro de téléphone
            </button>
          )}
          {client.note && <p className="text-sm text-ink-soft mt-1">{client.note}</p>}
        </div>

        <div className="flex items-center gap-2">
          {client.montant_du > 0 && lienWhatsApp() && (
            <a
              href={lienWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border border-black/10 text-ink-soft hover:border-black/20 transition"
            >
              <MessageCircle size={16} className="text-positive" /> Rappel WhatsApp
            </a>
          )}
          <div className="relative">
            <button
              onClick={() => setSelecteurPeriodeOuvert((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border border-black/10 text-ink-soft hover:border-black/20 transition"
            >
              <FileDown size={16} />
              Relevé de compte
            </button>

            {selecteurPeriodeOuvert && (
              <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl border border-black/10 shadow-lg p-4 z-10">
                <p className="text-xs font-medium text-ink-soft mb-2">Période (optionnel)</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-ink-faint mb-1">Du</label>
                    <input
                      type="date"
                      value={dateDebutReleve}
                      onChange={(e) => setDateDebutReleve(e.target.value)}
                      className="w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ink-faint mb-1">Au</label>
                    <input
                      type="date"
                      value={dateFinReleve}
                      onChange={(e) => setDateFinReleve(e.target.value)}
                      className="w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-ink-faint mt-2">Laisse vide pour tout l'historique.</p>
                <button
                  onClick={telechargerReleve}
                  disabled={factureEnCours === 'releve'}
                  className="w-full mt-3 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
                >
                  {factureEnCours === 'releve' ? 'Génération...' : 'Télécharger le PDF'}
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setModalCreditOuvert(true)}
            className="text-white text-sm font-medium px-4 py-2.5 rounded-xl transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
          >
            Ajouter un crédit
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl p-5 text-white mb-6 max-w-xs"
        style={client.montant_du > 0
          ? { background: 'linear-gradient(135deg, #DD5A1F, #B91C1C)' }
          : { background: 'linear-gradient(135deg, #1F9E5C, #16824A)' }}
      >
        <p className="text-sm text-white/85 mb-1">Montant dû</p>
        <p className="font-display text-2xl font-semibold">{client.montant_du.toLocaleString('fr-FR')} FCFA</p>
      </div>

      <h2 className="font-medium text-ink mb-3">Historique des crédits</h2>

      {client.credits.length === 0 ? (
        <EtatVide icone={Users} titre="Aucun crédit" description="Ce client n'a jamais eu de dette enregistrée." />
      ) : (
        <div className="space-y-3">
          {client.credits.map((credit) => (
            <div key={credit.id} className="bg-surface rounded-2xl border border-black/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {credit.montant_initial.toLocaleString('fr-FR')} FCFA initial
                  </p>
                  <p className="text-xs text-ink-faint">{formaterDate(credit.created_at)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    credit.statut === 'solde' ? 'bg-positive-soft text-positive' : 'bg-warning-soft text-warning'
                  }`}>
                    {credit.statut === 'solde' ? 'Soldé' : `${credit.montant_restant.toLocaleString('fr-FR')} FCFA restant`}
                  </span>
                  {credit.statut === 'solde' && estProprietaire && (
                    <button
                      onClick={() => supprimerCredit(credit)}
                      disabled={suppressionEnCours === credit.id}
                      className="flex items-center gap-1 text-xs text-ink-faint hover:text-warning mt-1.5 ml-auto disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      {suppressionEnCours === credit.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  )}
                </div>
              </div>

              {credit.remboursements.length > 0 && (
                <div className="mt-2 pt-2 border-t border-black/5 space-y-1">
                  {credit.remboursements.map((r) => (
                    <div key={r.id} className="flex justify-between text-xs text-ink-soft">
                      <span>{formaterDate(r.created_at)} {r.note && `— ${r.note}`}</span>
                      <span className="text-positive font-medium">+{r.montant.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  ))}
                </div>
              )}

              {credit.statut !== 'solde' && (
                <button
                  onClick={() => setCreditARembourser(credit)}
                  className="text-xs font-medium text-accent-600 hover:underline mt-2"
                >
                  Enregistrer un remboursement
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modalCreditOuvert && (
        <ModalNouveauCredit
          clientId={client.id}
          onFerme={() => setModalCreditOuvert(false)}
          onAjoute={() => { setModalCreditOuvert(false); charger() }}
        />
      )}

      {creditARembourser && (
        <ModalRemboursement
          credit={creditARembourser}
          onFerme={() => setCreditARembourser(null)}
          onRembourse={() => { setCreditARembourser(null); charger() }}
        />
      )}
    </div>
  )
}

function ModalNouveauCredit({ clientId, onFerme, onAjoute }) {
  const [montant, setMontant] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setEnregistrement(true)
    try {
      await apiClient.post(`/clients/${clientId}/credits`, { montant: Number(montant) })
      onAjoute()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue.')
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 relative">
        <button onClick={onFerme} className="absolute top-4 right-4 text-ink-faint hover:text-ink">
          <X size={20} />
        </button>
        <h2 className="font-display text-lg font-semibold text-ink mb-1">Ajouter un crédit</h2>
        <p className="text-ink-soft text-sm mb-5">Pour une dette déjà existante, non liée à une vente ici.</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Montant (FCFA)</label>
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              min="1"
              required
              autoFocus
            />
          </div>

          {erreur && <p className="text-warning text-sm">{erreur}</p>}

          <button
            type="submit"
            disabled={enregistrement}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
          >
            {enregistrement ? 'Enregistrement...' : 'Ajouter le crédit'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ModalRemboursement({ credit, onFerme, onRembourse }) {
  const [montant, setMontant] = useState(credit.montant_restant)
  const [note, setNote] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setEnregistrement(true)
    try {
      await apiClient.post(`/credits/${credit.id}/remboursement`, { montant: Number(montant), note: note || null })
      onRembourse()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue.')
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 relative">
        <button onClick={onFerme} className="absolute top-4 right-4 text-ink-faint hover:text-ink">
          <X size={20} />
        </button>
        <h2 className="font-display text-lg font-semibold text-ink mb-1">Enregistrer un remboursement</h2>
        <p className="text-ink-soft text-sm mb-5">Solde actuel : {credit.montant_restant.toLocaleString('fr-FR')} FCFA</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Montant remboursé (FCFA)</label>
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              min="1"
              max={credit.montant_restant}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Note (optionnel)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          {erreur && <p className="text-warning text-sm">{erreur}</p>}

          <button
            type="submit"
            disabled={enregistrement}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1F9E5C, #16824A)' }}
          >
            {enregistrement ? 'Enregistrement...' : 'Confirmer le remboursement'}
          </button>
        </form>
      </div>
    </div>
  )
}