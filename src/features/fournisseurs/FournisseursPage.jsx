import { useEffect, useState } from 'react'
import {
  Plus, Search, X, Truck, ArrowLeft, Package, Check, Ban, Wallet,
  Phone, MessageCircle, Pencil, PowerOff, Power, FileDown, AlertTriangle,
  ShoppingBasket, TrendingUp,
} from 'lucide-react'
import apiClient from '../../lib/api/client'
import Pagination from '../../components/Pagination'
import EtatVide from '../../components/EtatVide'
import SquelletteTableau from '../../components/SquelletteTableau'

const LABELS_STATUT = {
  en_attente: { label: 'En attente', classe: 'bg-accent-100 text-accent-600' },
  recue: { label: 'Reçue', classe: 'bg-positive-soft text-positive' },
  annulee: { label: 'Annulée', classe: 'bg-black/5 text-ink-faint' },
}

function lienWhatsAppTel(telephone, message = '') {
  if (!telephone) return null
  const numero = telephone.replace(/\D/g, '')
  const numeroComplet = numero.startsWith('221') ? numero : `221${numero.replace(/^0+/, '')}`
  return `https://wa.me/${numeroComplet}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}

export default function FournisseursPage() {
  const [onglet, setOnglet] = useState('fournisseurs') // 'fournisseurs' | 'a_commander'
  const [fournisseurId, setFournisseurId] = useState(null)

  if (fournisseurId) {
    return <FicheFournisseur fournisseurId={fournisseurId} onRetour={() => setFournisseurId(null)} />
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Fournisseurs</h1>
      <p className="text-sm text-ink-faint mb-6">Commandes, paiements et réapprovisionnement</p>

      <div className="flex gap-2 mb-6 border-b border-black/5">
        <button
          onClick={() => setOnglet('fournisseurs')}
          className={`text-sm font-medium px-1 pb-3 border-b-2 transition ${
            onglet === 'fournisseurs' ? 'border-accent-500 text-ink' : 'border-transparent text-ink-faint hover:text-ink-soft'
          }`}
        >
          Fournisseurs
        </button>
        <button
          onClick={() => setOnglet('a_commander')}
          className={`text-sm font-medium px-1 pb-3 ml-5 border-b-2 transition ${
            onglet === 'a_commander' ? 'border-accent-500 text-ink' : 'border-transparent text-ink-faint hover:text-ink-soft'
          }`}
        >
          À commander
        </button>
      </div>

      {onglet === 'fournisseurs' ? (
        <ListeFournisseurs onOuvrir={setFournisseurId} />
      ) : (
        <ACommander />
      )}
    </div>
  )
}

/* ============================= LISTE ============================= */

function ListeFournisseurs({ onOuvrir }) {
  const [fournisseurs, setFournisseurs] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [recherche, setRecherche] = useState('')
  const [inclureInactifs, setInclureInactifs] = useState(false)
  const [chargement, setChargement] = useState(true)
  const [modalOuvert, setModalOuvert] = useState(false)
  const [fournisseurAEditer, setFournisseurAEditer] = useState(null)

  async function charger() {
    setChargement(true)
    const params = { page }
    if (recherche) params.recherche = recherche
    if (inclureInactifs) params.inclure_inactifs = 1
    const res = await apiClient.get('/fournisseurs', { params })
    setFournisseurs(res.data.data)
    setMeta(res.data.meta)
    setChargement(false)
  }

  useEffect(() => {
    const delai = setTimeout(charger, 300)
    return () => clearTimeout(delai)
  }, [recherche, page, inclureInactifs])

  useEffect(() => { setPage(1) }, [recherche, inclureInactifs])

  async function toggleActif(fournisseur) {
    await apiClient.put(`/fournisseurs/${fournisseur.id}`, { actif: !fournisseur.actif })
    charger()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un fournisseur..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-ink-soft cursor-pointer">
            <input type="checkbox" checked={inclureInactifs} onChange={(e) => setInclureInactifs(e.target.checked)} />
            Afficher les désactivés
          </label>
          <button
            onClick={() => { setFournisseurAEditer(null); setModalOuvert(true) }}
            className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
          >
            <Plus size={16} /> Ajouter un fournisseur
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-black/5 overflow-hidden">
        {chargement ? (
          <SquelletteTableau colonnes={4} />
        ) : fournisseurs.length === 0 ? (
          <EtatVide icone={Truck} titre="Aucun fournisseur" description="Ajoute tes fournisseurs pour suivre tes commandes et ce que tu leur dois." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-paper text-ink-soft text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium text-right">Montant dû</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {fournisseurs.map((f) => (
                  <tr key={f.id} className={`hover:bg-paper transition ${!f.actif ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3.5 font-medium text-ink cursor-pointer" onClick={() => onOuvrir(f.id)}>
                      {f.nom}
                      {!f.actif && <span className="ml-2 text-[10px] uppercase text-ink-faint">Désactivé</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      {f.telephone ? (
                        <div className="flex items-center gap-2">
                          <span className="text-ink-soft">{f.telephone}</span>
                          <a href={`tel:${f.telephone}`} onClick={(e) => e.stopPropagation()} className="text-ink-faint hover:text-accent-600">
                            <Phone size={14} />
                          </a>
                          <a
                            href={lienWhatsAppTel(f.telephone)}
                            target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-ink-faint hover:text-positive"
                          >
                            <MessageCircle size={14} />
                          </a>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right cursor-pointer" onClick={() => onOuvrir(f.id)}>
                      {f.montant_du > 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning-soft text-warning">
                          {f.montant_du.toLocaleString('fr-FR')} FCFA
                        </span>
                      ) : (
                        <span className="text-ink-faint text-xs">À jour</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setFournisseurAEditer(f); setModalOuvert(true) }} className="text-ink-faint hover:text-ink" title="Modifier">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => toggleActif(f)} className="text-ink-faint hover:text-warning" title={f.actif ? 'Désactiver' : 'Réactiver'}>
                          {f.actif ? <PowerOff size={14} /> : <Power size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination meta={meta} onChangerPage={setPage} />

      {modalOuvert && (
        <ModalFournisseur
          fournisseur={fournisseurAEditer}
          onFerme={() => setModalOuvert(false)}
          onEnregistre={() => { setModalOuvert(false); charger() }}
        />
      )}
    </>
  )
}

function ModalFournisseur({ fournisseur, onFerme, onEnregistre }) {
  const estEdition = Boolean(fournisseur)
  const [nom, setNom] = useState(fournisseur?.nom ?? '')
  const [telephone, setTelephone] = useState(fournisseur?.telephone ?? '')
  const [adresse, setAdresse] = useState(fournisseur?.adresse ?? '')
  const [enregistrement, setEnregistrement] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setEnregistrement(true)
    try {
      const payload = { nom, telephone: telephone || null, adresse: adresse || null }
      if (estEdition) {
        await apiClient.put(`/fournisseurs/${fournisseur.id}`, payload)
      } else {
        await apiClient.post('/fournisseurs', payload)
      }
      onEnregistre()
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
        <h2 className="font-display text-lg font-semibold text-ink mb-5">
          {estEdition ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nom</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Téléphone (optionnel)</label>
            <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Adresse (optionnel)</label>
            <input value={adresse} onChange={(e) => setAdresse(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
          </div>
          <button type="submit" disabled={enregistrement}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}>
            {enregistrement ? 'Enregistrement...' : estEdition ? 'Enregistrer' : 'Créer le fournisseur'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ============================= FICHE ============================= */

function FicheFournisseur({ fournisseurId, onRetour }) {
  const [fournisseur, setFournisseur] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [modalCommandeOuvert, setModalCommandeOuvert] = useState(false)
  const [modalPaiementCommande, setModalPaiementCommande] = useState(null)
  const [modalEditionOuvert, setModalEditionOuvert] = useState(false)
  const [actionEnCours, setActionEnCours] = useState(null)
  const [telechargementEnCours, setTelechargementEnCours] = useState(null)

  async function charger() {
    setChargement(true)
    const res = await apiClient.get(`/fournisseurs/${fournisseurId}`)
    setFournisseur(res.data)
    setChargement(false)
  }

  useEffect(() => { charger() }, [fournisseurId])

  async function marquerRecue(commande) {
    if (!confirm('Confirmer la réception ? Le stock des produits sera mis à jour automatiquement.')) return
    setActionEnCours(commande.id)
    try {
      await apiClient.post(`/commandes-fournisseur/${commande.id}/recevoir`)
      charger()
    } finally {
      setActionEnCours(null)
    }
  }

  async function annulerCommande(commande) {
    if (!confirm('Annuler cette commande ?')) return
    setActionEnCours(commande.id)
    try {
      await apiClient.post(`/commandes-fournisseur/${commande.id}/annuler`)
      charger()
    } finally {
      setActionEnCours(null)
    }
  }

  async function toggleActif() {
    await apiClient.put(`/fournisseurs/${fournisseurId}`, { actif: !fournisseur.actif })
    charger()
  }

  async function telechargerBon(commande) {
    setTelechargementEnCours(commande.id)
    try {
      const res = await apiClient.get(`/commandes-fournisseur/${commande.id}/bon-commande`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const lien = document.createElement('a')
      lien.href = url
      lien.download = `bon-commande-${commande.id}.pdf`
      document.body.appendChild(lien)
      lien.click()
      lien.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setTelechargementEnCours(null)
    }
  }

  function lienWhatsAppCommande(commande) {
    const message = `Bonjour ${fournisseur.nom}, voici notre commande n°${commande.id} du ${new Date(commande.date_commande).toLocaleDateString('fr-FR')} pour un total de ${commande.montant_total.toLocaleString('fr-FR')} FCFA. Le bon de commande PDF suit en pièce jointe.`
    return lienWhatsAppTel(fournisseur.telephone, message)
  }

  if (chargement || !fournisseur) {
    return <div className="p-6 lg:p-8 text-ink-faint text-sm">Chargement...</div>
  }

  return (
    <div className="p-6 lg:p-8">
      <button onClick={onRetour} className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-4">
        <ArrowLeft size={15} /> Retour aux fournisseurs
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-ink">{fournisseur.nom}</h1>
            {!fournisseur.actif && <span className="text-[10px] uppercase text-ink-faint bg-black/5 px-2 py-0.5 rounded-full">Désactivé</span>}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-ink-faint">{fournisseur.telephone || 'Aucun téléphone'} {fournisseur.adresse && `— ${fournisseur.adresse}`}</p>
            {fournisseur.telephone && (
              <>
                <a href={`tel:${fournisseur.telephone}`} className="text-ink-faint hover:text-accent-600" title="Appeler">
                  <Phone size={15} />
                </a>
                <a href={lienWhatsAppTel(fournisseur.telephone)} target="_blank" rel="noopener noreferrer" className="text-ink-faint hover:text-positive" title="WhatsApp">
                  <MessageCircle size={15} />
                </a>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setModalEditionOuvert(true)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-black/10 text-ink-soft hover:border-black/20 transition">
            <Pencil size={13} /> Modifier
          </button>
          <button onClick={toggleActif} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-black/10 text-ink-soft hover:border-black/20 transition">
            {fournisseur.actif ? <><PowerOff size={13} /> Désactiver</> : <><Power size={13} /> Réactiver</>}
          </button>
          <button
            onClick={() => setModalCommandeOuvert(true)}
            className="text-white text-sm font-medium px-4 py-2.5 rounded-xl transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
          >
            Nouvelle commande
          </button>
        </div>
      </div>

      {fournisseur.montant_du > 0 && (
        <div className="rounded-2xl p-4 mb-6 bg-warning-soft text-warning text-sm font-medium">
          Montant total dû à ce fournisseur : {fournisseur.montant_du.toLocaleString('fr-FR')} FCFA
        </div>
      )}

      <h2 className="font-medium text-ink mb-3">Commandes ({fournisseur.commandes.length})</h2>

      {fournisseur.commandes.length === 0 ? (
        <EtatVide icone={Package} titre="Aucune commande" description="Passe une première commande à ce fournisseur." />
      ) : (
        <div className="space-y-3">
          {fournisseur.commandes.map((commande) => {
            const statut = LABELS_STATUT[commande.statut]
            const restant = commande.montant_total - commande.montant_paye
            return (
              <div key={commande.id} className="bg-surface rounded-2xl border border-black/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ink-soft">
                    {new Date(commande.date_commande).toLocaleDateString('fr-FR')} — {commande.lignes.length} article(s)
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statut.classe}`}>
                    {statut.label}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  {commande.lignes.map((ligne) => (
                    <div key={ligne.id} className="flex justify-between text-xs text-ink-soft">
                      <span>{ligne.quantite} × {ligne.produit?.nom ?? 'Produit'}</span>
                      <span>{ligne.sous_total.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-black/5 pt-3 flex-wrap gap-2">
                  <div className="text-sm">
                    <span className="font-display font-semibold text-ink">{commande.montant_total.toLocaleString('fr-FR')} FCFA</span>
                    {restant > 0 && commande.statut !== 'annulee' && (
                      <span className="text-warning text-xs ml-2">{restant.toLocaleString('fr-FR')} FCFA restant</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => telechargerBon(commande)}
                      disabled={telechargementEnCours === commande.id}
                      className="flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink disabled:opacity-50"
                    >
                      <FileDown size={13} /> {telechargementEnCours === commande.id ? 'Génération...' : 'Bon PDF'}
                    </button>

                    {fournisseur.telephone && (
                      <a
                        href={lienWhatsAppCommande(commande)}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-medium text-positive hover:underline"
                      >
                        <MessageCircle size={13} /> Partager
                      </a>
                    )}

                    {commande.statut === 'en_attente' && (
                      <>
                        <button onClick={() => annulerCommande(commande)} disabled={actionEnCours === commande.id}
                          className="flex items-center gap-1 text-xs font-medium text-ink-faint hover:text-warning disabled:opacity-50">
                          <Ban size={13} /> Annuler
                        </button>
                        <button onClick={() => marquerRecue(commande)} disabled={actionEnCours === commande.id}
                          className="flex items-center gap-1 text-xs font-medium text-positive hover:underline disabled:opacity-50">
                          <Check size={13} /> Marquer reçue
                        </button>
                      </>
                    )}
                    {restant > 0 && commande.statut !== 'annulee' && (
                      <button onClick={() => setModalPaiementCommande(commande)} className="flex items-center gap-1 text-xs font-medium text-accent-600 hover:underline">
                        <Wallet size={13} /> Payer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalCommandeOuvert && (
        <ModalNouvelleCommande
          fournisseurId={fournisseurId}
          onFerme={() => setModalCommandeOuvert(false)}
          onCreee={() => { setModalCommandeOuvert(false); charger() }}
        />
      )}

      {modalPaiementCommande && (
        <ModalPaiementCommande
          commande={modalPaiementCommande}
          onFerme={() => setModalPaiementCommande(null)}
          onPaye={() => { setModalPaiementCommande(null); charger() }}
        />
      )}

      {modalEditionOuvert && (
        <ModalFournisseur
          fournisseur={fournisseur}
          onFerme={() => setModalEditionOuvert(false)}
          onEnregistre={() => { setModalEditionOuvert(false); charger() }}
        />
      )}
    </div>
  )
}

function ModalPaiementCommande({ commande, onFerme, onPaye }) {
  const restant = commande.montant_total - commande.montant_paye
  const [montant, setMontant] = useState(restant)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setEnregistrement(true)
    try {
      await apiClient.post(`/commandes-fournisseur/${commande.id}/paiement`, { montant: Number(montant) })
      onPaye()
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
        <h2 className="font-display text-lg font-semibold text-ink mb-1">Enregistrer un paiement</h2>
        <p className="text-ink-soft text-sm mb-5">Reste dû : {restant.toLocaleString('fr-FR')} FCFA</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Montant payé (FCFA)</label>
            <input type="number" value={montant} onChange={(e) => setMontant(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              max={restant} min={1} required />
          </div>
          {erreur && <p className="text-warning text-sm">{erreur}</p>}
          <button type="submit" disabled={enregistrement}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}>
            {enregistrement ? 'Enregistrement...' : 'Confirmer le paiement'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ===================== NOUVELLE COMMANDE (avec historique prix + création rapide) ===================== */

function ModalNouvelleCommande({ fournisseurId, onFerme, onCreee, lignesInitiales = [] }) {
  const [recherche, setRecherche] = useState('')
  const [resultats, setResultats] = useState([])
  const [rechercheSansResultat, setRechercheSansResultat] = useState(false)
  const [lignes, setLignes] = useState(lignesInitiales)
  const [dateCommande, setDateCommande] = useState(new Date().toISOString().slice(0, 10))
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [avertissements, setAvertissements] = useState(null)
  const [modalCreationProduit, setModalCreationProduit] = useState(false)

  useEffect(() => {
    if (!recherche) {
      setResultats([])
      setRechercheSansResultat(false)
      return
    }
    const delai = setTimeout(() => {
      apiClient.get('/produits', { params: { recherche, per_page: 5 } })
        .then((res) => {
          setResultats(res.data.data)
          setRechercheSansResultat(res.data.data.length === 0)
        })
    }, 250)
    return () => clearTimeout(delai)
  }, [recherche])

  async function ajouterLigne(produit) {
    if (lignes.some((l) => l.produit.id === produit.id)) return

    let dernierPrix = produit.prix_achat
    let infoPrix = null
    try {
      const res = await apiClient.get(`/produits/${produit.id}/historique-achat`, { params: { fournisseur_id: fournisseurId } })
      dernierPrix = res.data.dernier_prix
      infoPrix = res.data
    } catch {
      // pas grave si l'historique échoue, on garde le prix catalogue
    }

    setLignes((actuel) => [...actuel, {
      produit,
      quantite: 1,
      prix_unitaire_achat: dernierPrix,
      infoPrix,
    }])
    setRecherche('')
    setResultats([])
  }

  function modifierLigne(produitId, champ, valeur) {
    setLignes((actuel) => actuel.map((l) => (l.produit.id === produitId ? { ...l, [champ]: valeur } : l)))
  }

  function retirerLigne(produitId) {
    setLignes((actuel) => actuel.filter((l) => l.produit.id !== produitId))
  }

  const total = lignes.reduce((s, l) => s + Number(l.quantite || 0) * Number(l.prix_unitaire_achat || 0), 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (lignes.length === 0) {
      setErreur('Ajoute au moins un produit.')
      return
    }
    setErreur('')
    setEnregistrement(true)
    try {
      const res = await apiClient.post('/commandes-fournisseur', {
        fournisseur_id: fournisseurId,
        date_commande: dateCommande,
        lignes: lignes.map((l) => ({
          produit_id: l.produit.id,
          quantite: Number(l.quantite),
          prix_unitaire_achat: Number(l.prix_unitaire_achat),
        })),
      })
      if (res.data.avertissements && res.data.avertissements.length > 0) {
        setAvertissements(res.data.avertissements)
      } else {
        onCreee()
      }
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue.')
    } finally {
      setEnregistrement(false)
    }
  }

  // Écran d'avertissements après création (hausse de prix / marge négative)
  if (avertissements) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-surface rounded-2xl w-full max-w-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-warning" />
            <h2 className="font-display text-lg font-semibold text-ink">Commande créée — à noter</h2>
          </div>
          <div className="space-y-3 mb-5">
            {avertissements.map((a, i) => (
              <div key={i} className="bg-warning-soft rounded-xl p-3 text-sm text-warning">
                {a.type === 'hausse_prix' ? (
                  <>📈 <strong>{a.produit}</strong> : le prix d'achat est passé de {a.ancien_prix.toLocaleString('fr-FR')} à {a.nouveau_prix.toLocaleString('fr-FR')} FCFA.</>
                ) : (
                  <>⚠️ <strong>{a.produit}</strong> : avec le prix de vente actuel ({a.prix_vente_actuel.toLocaleString('fr-FR')} FCFA), la marge est {a.marge < 0 ? 'négative' : 'nulle'} ({a.marge.toLocaleString('fr-FR')} FCFA). Pense à ajuster le prix de vente.</>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={onCreee}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
          >
            J'ai compris
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onFerme} className="absolute top-4 right-4 text-ink-faint hover:text-ink">
          <X size={20} />
        </button>
        <h2 className="font-display text-lg font-semibold text-ink mb-5">Nouvelle commande</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-ink mb-1">Date de commande</label>
          <input type="date" value={dateCommande} onChange={(e) => setDateCommande(e.target.value)}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
        </div>

        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-ink mb-1">Ajouter un produit</label>
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          {resultats.length > 0 && (
            <div className="absolute z-10 w-full bg-surface border border-black/10 rounded-xl mt-1 shadow-lg overflow-hidden">
              {resultats.map((p) => (
                <button key={p.id} type="button" onClick={() => ajouterLigne(p)} className="w-full text-left px-3 py-2 text-sm hover:bg-paper">
                  {p.nom} <span className="text-ink-faint text-xs">— achat habituel {p.prix_achat} FCFA</span>
                </button>
              ))}
            </div>
          )}
          {rechercheSansResultat && (
            <button
              type="button"
              onClick={() => setModalCreationProduit(true)}
              className="mt-1.5 flex items-center gap-1 text-xs font-medium text-accent-600 hover:underline"
            >
              <Plus size={12} /> Créer "{recherche}" comme nouveau produit
            </button>
          )}
        </div>

        {lignes.length > 0 && (
          <div className="space-y-2 mb-4">
            {lignes.map((l) => {
              const marge = (l.produit.prix_vente ?? 0) - Number(l.prix_unitaire_achat || 0)
              const hausse = l.infoPrix?.dernier_prix != null && Number(l.prix_unitaire_achat) > l.infoPrix.dernier_prix
              return (
                <div key={l.produit.id} className="bg-paper rounded-xl p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-ink truncate">{l.produit.nom}</span>
                    <input type="number" value={l.quantite} onChange={(e) => modifierLigne(l.produit.id, 'quantite', e.target.value)}
                      className="w-16 rounded-lg border border-black/10 px-2 py-1 text-xs text-right" min="1" />
                    <span className="text-xs text-ink-faint">×</span>
                    <input type="number" value={l.prix_unitaire_achat} onChange={(e) => modifierLigne(l.produit.id, 'prix_unitaire_achat', e.target.value)}
                      className="w-20 rounded-lg border border-black/10 px-2 py-1 text-xs text-right" min="0" />
                    <button type="button" onClick={() => retirerLigne(l.produit.id)} className="text-ink-faint hover:text-warning">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 ml-1">
                    {l.infoPrix?.dernier_prix != null && (
                      <span className={`text-[11px] flex items-center gap-1 ${hausse ? 'text-warning' : 'text-ink-faint'}`}>
                        {hausse && <TrendingUp size={11} />}
                        Dernier prix payé : {l.infoPrix.dernier_prix.toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                    <span className={`text-[11px] ${marge <= 0 ? 'text-warning font-medium' : 'text-ink-faint'}`}>
                      Marge avec le prix de vente actuel : {marge.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-between items-center text-sm mb-4 pt-3 border-t border-black/5">
          <span className="text-ink-soft">Total</span>
          <span className="font-display text-lg font-semibold text-ink">{total.toLocaleString('fr-FR')} FCFA</span>
        </div>

        {erreur && <p className="text-warning text-sm mb-3">{erreur}</p>}

        <button onClick={handleSubmit} disabled={enregistrement}
          className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}>
          {enregistrement ? 'Création...' : 'Créer la commande'}
        </button>
      </div>

      {modalCreationProduit && (
        <ModalCreationRapideProduit
          nomInitial={recherche}
          onFerme={() => setModalCreationProduit(false)}
          onCree={(produit) => {
            setModalCreationProduit(false)
            ajouterLigne(produit)
          }}
        />
      )}
    </div>
  )
}

function ModalCreationRapideProduit({ nomInitial, onFerme, onCree }) {
  const [nom, setNom] = useState(nomInitial)
  const [prixAchat, setPrixAchat] = useState('')
  const [prixVente, setPrixVente] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setEnregistrement(true)
    try {
      const res = await apiClient.post('/produits', {
        nom,
        prix_achat: Number(prixAchat),
        prix_vente: Number(prixVente),
        stock_actuel: 0,
      })
      onCree(res.data.data ?? res.data)
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue.')
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 relative">
        <button onClick={onFerme} className="absolute top-4 right-4 text-ink-faint hover:text-ink">
          <X size={20} />
        </button>
        <h2 className="font-display text-lg font-semibold text-ink mb-1">Nouveau produit</h2>
        <p className="text-ink-soft text-sm mb-5">Créé directement, sans quitter la commande.</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nom du produit</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Prix d'achat</label>
              <input type="number" value={prixAchat} onChange={(e) => setPrixAchat(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" min="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Prix de vente</label>
              <input type="number" value={prixVente} onChange={(e) => setPrixVente(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" min="0" required />
            </div>
          </div>
          {erreur && <p className="text-warning text-sm">{erreur}</p>}
          <button type="submit" disabled={enregistrement}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}>
            {enregistrement ? 'Création...' : 'Créer et ajouter à la commande'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ===================== À COMMANDER (stocks faibles/ruptures) ===================== */

function ACommander() {
  const [produits, setProduits] = useState([])
  const [chargement, setChargement] = useState(true)
  const [selection, setSelection] = useState({}) // { produitId: quantite }
  const [fournisseurs, setFournisseurs] = useState([])
  const [fournisseurId, setFournisseurId] = useState('')
  const [modalCommandeOuvert, setModalCommandeOuvert] = useState(false)

  async function charger() {
    setChargement(true)
    const res = await apiClient.get('/stock', { params: { per_page: 100 } })
    const produitsAttention = res.data.data.filter((p) => p.en_rupture || p.stock_bas)
    setProduits(produitsAttention)
    setChargement(false)
  }

  useEffect(() => {
    charger()
    apiClient.get('/fournisseurs').then((res) => setFournisseurs(res.data.data))
  }, [])

  function toggleSelection(produit) {
    setSelection((actuel) => {
      const copie = { ...actuel }
      if (copie[produit.id] !== undefined) {
        delete copie[produit.id]
      } else {
        copie[produit.id] = Math.max(produit.seuil_alerte * 2 - produit.stock_actuel, 1)
      }
      return copie
    })
  }

  function changerQuantite(produitId, quantite) {
    setSelection((actuel) => ({ ...actuel, [produitId]: quantite }))
  }

  const nombreSelectionnes = Object.keys(selection).length

  function ouvrirCommande() {
    if (!fournisseurId) {
      alert('Choisis un fournisseur avant de créer la commande.')
      return
    }
    setModalCommandeOuvert(true)
  }

  const lignesInitiales = produits
    .filter((p) => selection[p.id] !== undefined)
    .map((p) => ({
      produit: p,
      quantite: selection[p.id],
      prix_unitaire_achat: p.prix_achat ?? 0,
    }))

  if (chargement) return <SquelletteTableau colonnes={4} />

  if (produits.length === 0) {
    return <EtatVide icone={ShoppingBasket} titre="Rien à commander" description="Tous tes produits ont un stock suffisant pour le moment." />
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="text-sm text-ink-soft">{produits.length} produit(s) en rupture ou stock bas</p>
        <div className="flex items-center gap-2">
          <select
            value={fournisseurId}
            onChange={(e) => setFournisseurId(e.target.value)}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option value="">Choisir un fournisseur...</option>
            {fournisseurs.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
          <button
            onClick={ouvrirCommande}
            disabled={nombreSelectionnes === 0}
            className="text-white text-sm font-medium px-4 py-2.5 rounded-xl transition hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
          >
            Commander ({nombreSelectionnes})
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-paper text-ink-soft text-left">
              <tr>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium text-right">Stock actuel</th>
                <th className="px-4 py-3 font-medium text-right">Quantité à commander</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {produits.map((p) => (
                <tr key={p.id} className="hover:bg-paper transition">
                  <td className="px-4 py-3.5">
                    <input type="checkbox" checked={selection[p.id] !== undefined} onChange={() => toggleSelection(p)} />
                  </td>
                  <td className="px-4 py-3.5 font-medium text-ink">
                    {p.nom}
                    {p.en_rupture ? (
                      <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warning-soft text-warning">RUPTURE</span>
                    ) : (
                      <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent-100 text-accent-600">STOCK BAS</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right text-ink-soft">{p.stock_actuel}</td>
                  <td className="px-4 py-3.5 text-right">
                    {selection[p.id] !== undefined ? (
                      <input
                        type="number"
                        value={selection[p.id]}
                        onChange={(e) => changerQuantite(p.id, Number(e.target.value))}
                        className="w-20 rounded-lg border border-black/10 px-2 py-1 text-xs text-right"
                        min="1"
                      />
                    ) : (
                      <span className="text-ink-faint text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalCommandeOuvert && (
        <ModalNouvelleCommande
          fournisseurId={Number(fournisseurId)}
          lignesInitiales={lignesInitiales}
          onFerme={() => setModalCommandeOuvert(false)}
          onCreee={() => { setModalCommandeOuvert(false); setSelection({}); charger() }}
        />
      )}
    </>
  )
}