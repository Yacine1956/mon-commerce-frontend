import { useEffect, useState } from 'react'
import { Search, AlertTriangle, XCircle, Boxes, X, History } from 'lucide-react'
import apiClient from '../../lib/api/client'
import Pagination from '../../components/Pagination'
import EtatVide from '../../components/EtatVide'
import SquelletteTableau from '../../components/SquelletteTableau'
import useAuthStore from '../../lib/auth/authStore'

export default function StockPage() {
  const { user } = useAuthStore()
  const estGestionnaire = user?.role === 'proprietaire' || user?.role === 'gestionnaire'

  const [onglet, setOnglet] = useState('vue') // 'vue' ou 'historique'

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Stock</h1>
      <p className="text-sm text-ink-faint mb-6">Vue d'ensemble et historique des mouvements</p>

      <div className="flex gap-2 mb-6 border-b border-black/5">
        <button
          onClick={() => setOnglet('vue')}
          className={`text-sm font-medium px-1 pb-3 border-b-2 transition ${
            onglet === 'vue' ? 'border-accent-500 text-ink' : 'border-transparent text-ink-faint hover:text-ink-soft'
          }`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setOnglet('historique')}
          className={`text-sm font-medium px-1 pb-3 ml-5 border-b-2 transition ${
            onglet === 'historique' ? 'border-accent-500 text-ink' : 'border-transparent text-ink-faint hover:text-ink-soft'
          }`}
        >
          Historique des mouvements
        </button>
      </div>

      {onglet === 'vue' ? (
        <VueEnsemble estGestionnaire={estGestionnaire} />
      ) : (
        <HistoriqueMouvements />
      )}
    </div>
  )
}

function VueEnsemble({ estGestionnaire }) {
  const [produits, setProduits] = useState([])
  const [meta, setMeta] = useState(null)
  const [resume, setResume] = useState(null)
  const [page, setPage] = useState(1)
  const [recherche, setRecherche] = useState('')
  const [chargement, setChargement] = useState(true)
  const [produitAjustement, setProduitAjustement] = useState(null)

  async function charger() {
    setChargement(true)
    const params = { page }
    if (recherche) params.recherche = recherche
    const res = await apiClient.get('/stock', { params })
    setProduits(res.data.data)
    setMeta(res.data.meta)
    setResume(res.data.resume)
    setChargement(false)
  }

  useEffect(() => {
    const delai = setTimeout(charger, 300)
    return () => clearTimeout(delai)
  }, [recherche, page])

  useEffect(() => {
    setPage(1)
  }, [recherche])

  function statutProduit(p) {
    if (p.en_rupture) return { label: 'Rupture', classe: 'bg-warning-soft text-warning' }
    if (p.stock_bas) return { label: 'Stock bas', classe: 'bg-accent-100 text-accent-600' }
    return { label: 'OK', classe: 'bg-positive-soft text-positive' }
  }

  return (
    <>
      {resume && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-surface rounded-2xl border border-black/5 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Boxes size={15} className="text-ink-soft" />
              <p className="text-sm text-ink-soft">Produits actifs</p>
            </div>
            <p className="font-display text-xl font-semibold text-ink">{resume.total_produits}</p>
          </div>
          <div className="bg-surface rounded-2xl border border-black/5 p-5">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={15} className="text-accent-600" />
              <p className="text-sm text-ink-soft">Stock bas</p>
            </div>
            <p className="font-display text-xl font-semibold text-ink">{resume.stock_bas}</p>
          </div>
          <div className="bg-surface rounded-2xl border border-black/5 p-5">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={15} className="text-warning" />
              <p className="text-sm text-ink-soft">En rupture</p>
            </div>
            <p className="font-display text-xl font-semibold text-ink">{resume.en_rupture}</p>
          </div>
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      <div className="bg-surface rounded-2xl border border-black/5 overflow-hidden">
        {chargement ? (
          <SquelletteTableau colonnes={5} />
        ) : produits.length === 0 ? (
          <EtatVide icone={Boxes} titre="Aucun produit trouvé" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-paper text-ink-soft text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Produit</th>
                  <th className="px-4 py-3 font-medium">Catégorie</th>
                  <th className="px-4 py-3 font-medium text-right">Stock actuel</th>
                  <th className="px-4 py-3 font-medium text-right">Seuil d'alerte</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {produits.map((p) => {
                  const statut = statutProduit(p)
                  return (
                    <tr key={p.id} className="hover:bg-paper transition">
                      <td className="px-4 py-3.5 font-medium text-ink">{p.nom}</td>
                      <td className="px-4 py-3.5 text-ink-soft">{p.categorie ?? '—'}</td>
                      <td className="px-4 py-3.5 text-right text-ink-soft">{p.stock_actuel}</td>
                      <td className="px-4 py-3.5 text-right text-ink-soft">{p.seuil_alerte}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statut.classe}`}>
                          {statut.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {estGestionnaire && (
                          <button
                            onClick={() => setProduitAjustement(p)}
                            className="text-xs font-medium text-accent-600 hover:underline"
                          >
                            Ajuster
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination meta={meta} onChangerPage={setPage} />

      {produitAjustement && (
        <ModalAjustement
          produit={produitAjustement}
          onFerme={() => setProduitAjustement(null)}
          onAjuste={() => { setProduitAjustement(null); charger() }}
        />
      )}
    </>
  )
}

function ModalAjustement({ produit, onFerme, onAjuste }) {
  const [nouveauStock, setNouveauStock] = useState(produit.stock_actuel)
  const [motif, setMotif] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setEnregistrement(true)
    try {
      await apiClient.post('/stock/ajustement', {
        produit_id: produit.id,
        nouveau_stock: Number(nouveauStock),
        motif: motif || null,
      })
      onAjuste()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue.')
    } finally {
      setEnregistrement(false)
    }
  }

  const delta = Number(nouveauStock) - produit.stock_actuel

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 relative">
        <button onClick={onFerme} className="absolute top-4 right-4 text-ink-faint hover:text-ink">
          <X size={20} />
        </button>

        <h2 className="font-display text-lg font-semibold text-ink mb-1">Ajuster le stock</h2>
        <p className="text-ink-soft text-sm mb-5">{produit.nom} — stock actuel : {produit.stock_actuel}</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nouveau stock réel</label>
            <input
              type="number"
              value={nouveauStock}
              onChange={(e) => setNouveauStock(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              min="0"
              required
            />
            {delta !== 0 && (
              <p className={`text-xs mt-1 ${delta > 0 ? 'text-positive' : 'text-warning'}`}>
                {delta > 0 ? `+${delta}` : delta} par rapport au stock actuel
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Motif (optionnel)</label>
            <input
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Ex: Inventaire, casse, péremption..."
            />
          </div>

          {erreur && <p className="text-warning text-sm">{erreur}</p>}

          <button
            type="submit"
            disabled={enregistrement}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
          >
            {enregistrement ? 'Enregistrement...' : "Confirmer l'ajustement"}
          </button>
        </form>
      </div>
    </div>
  )
}

const LABELS_TYPE_MOUVEMENT = {
  entree: 'Entrée',
  sortie_vente: 'Vente',
  ajustement: 'Ajustement',
  import_initial: 'Import',
}

function HistoriqueMouvements() {
  const [mouvements, setMouvements] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [chargement, setChargement] = useState(true)

  async function charger() {
    setChargement(true)
    const res = await apiClient.get('/stock/mouvements', { params: { page } })
    setMouvements(res.data.data)
    setMeta(res.data.meta)
    setChargement(false)
  }

  useEffect(() => {
    charger()
  }, [page])

  function formaterDate(iso) {
    return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <div className="bg-surface rounded-2xl border border-black/5 overflow-hidden">
        {chargement ? (
          <SquelletteTableau colonnes={6} />
        ) : mouvements.length === 0 ? (
          <EtatVide icone={History} titre="Aucun mouvement de stock" description="Les ventes, entrées et ajustements apparaîtront ici." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead className="bg-paper text-ink-soft text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Produit</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Quantité</th>
                  <th className="px-4 py-3 font-medium text-right">Stock après</th>
                  <th className="px-4 py-3 font-medium">Par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {mouvements.map((m) => (
                  <tr key={m.id} className="hover:bg-paper transition">
                    <td className="px-4 py-3.5 text-ink-soft">{formaterDate(m.created_at)}</td>
                    <td className="px-4 py-3.5 text-ink">{m.produit_nom}</td>
                    <td className="px-4 py-3.5 text-ink-soft">{LABELS_TYPE_MOUVEMENT[m.type] ?? m.type}</td>
                    <td className={`px-4 py-3.5 text-right font-medium ${m.quantite >= 0 ? 'text-positive' : 'text-warning'}`}>
                      {m.quantite >= 0 ? `+${m.quantite}` : m.quantite}
                    </td>
                    <td className="px-4 py-3.5 text-right text-ink-soft">{m.stock_apres}</td>
                    <td className="px-4 py-3.5 text-ink-soft">{m.utilisateur ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination meta={meta} onChangerPage={setPage} />
    </>
  )
}