import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Minus, Trash2, Check, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '../../lib/api/client'
import { enregistrerVente, mettreEnCacheProduits, recupererProduitsEnCache } from '../../lib/offline/syncManager'

const MODES_PAIEMENT = [
  { valeur: 'especes', label: 'Espèces' },
  { valeur: 'wave', label: 'Wave' },
  { valeur: 'orange_money', label: 'Orange Money' },
  { valeur: 'autre', label: 'Autre' },
]

export default function VentePage() {
  const [produits, setProduits] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState([])
  const [categorieId, setCategorieId] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [panier, setPanier] = useState([])
  const [modePaiement, setModePaiement] = useState('especes')
  const [enregistrement, setEnregistrement] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [erreur, setErreur] = useState('')
  const [modeHorsLigne, setModeHorsLigne] = useState(false)

  useEffect(() => {
    apiClient.get('/categories').then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const delai = setTimeout(async () => {
      const params = { page, per_page: 24 }
      if (recherche) params.recherche = recherche
      if (categorieId) params.categorie_id = categorieId

      try {
        const res = await apiClient.get('/produits', { params })
        setProduits(res.data.data)
        setMeta(res.data.meta)
        setModeHorsLigne(false)
        if (!recherche && !categorieId && page === 1) mettreEnCacheProduits(res.data.data)
      } catch {
        const produitsCache = await recupererProduitsEnCache(recherche)
        setProduits(produitsCache)
        setMeta(null)
        setModeHorsLigne(true)
      }
    }, 250)
    return () => clearTimeout(delai)
  }, [recherche, categorieId, page])

  useEffect(() => {
    setPage(1)
  }, [recherche, categorieId])

  function ajouterAuPanier(produit) {
    setPanier((actuel) => {
      const existant = actuel.find((l) => l.produit.id === produit.id)
      if (existant) {
        return actuel.map((l) =>
          l.produit.id === produit.id ? { ...l, quantite: l.quantite + 1 } : l
        )
      }
      return [...actuel, { produit, quantite: 1 }]
    })
  }

  function changerQuantite(produitId, delta) {
    setPanier((actuel) =>
      actuel
        .map((l) => (l.produit.id === produitId ? { ...l, quantite: l.quantite + delta } : l))
        .filter((l) => l.quantite > 0)
    )
  }

  function retirerDuPanier(produitId) {
    setPanier((actuel) => actuel.filter((l) => l.produit.id !== produitId))
  }

  const total = panier.reduce((somme, l) => somme + l.produit.prix_vente * l.quantite, 0)

  async function validerVente() {
    if (panier.length === 0) return
    setErreur('')
    setEnregistrement(true)

    const payload = {
      uuid_client: crypto.randomUUID(),
      mode_paiement: modePaiement,
      vendue_le: new Date().toISOString(),
      lignes: panier.map((l) => ({ produit_id: l.produit.id, quantite: l.quantite })),
    }

    try {
      const resultat = await enregistrerVente(payload)
      setConfirmation({
        total,
        nombreArticles: panier.length,
        synchroniseeImmediatement: resultat.synchroniseeImmediatement,
      })
      setPanier([])
      setModePaiement('especes')
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue.')
    } finally {
      setEnregistrement(false)
    }
  }

  if (confirmation) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-positive-soft">
            <Check size={28} className="text-positive" />
          </div>
          <h2 className="font-display text-xl font-semibold text-ink mb-1">Vente enregistrée</h2>
          <p className="text-ink-soft mb-2">{confirmation.total} FCFA — {confirmation.nombreArticles} article(s)</p>
          {!confirmation.synchroniseeImmediatement && (
            <p className="text-accent-600 text-sm mb-4 flex items-center justify-center gap-1.5">
              <WifiOff size={14} /> Enregistrée hors ligne, sera synchronisée automatiquement
            </p>
          )}
          <button
            onClick={() => setConfirmation(null)}
            className="text-white text-sm font-medium px-5 py-2.5 rounded-xl transition hover:opacity-90 mt-2"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
          >
            Nouvelle vente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Colonne produits */}
      <div className="flex-1 flex flex-col h-full">
        <div className="p-6 lg:p-8 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-semibold text-ink">Nouvelle vente</h1>
              {modeHorsLigne && (
                <span className="flex items-center gap-1 text-xs font-medium text-accent-600 bg-accent-100 px-2 py-1 rounded-full">
                  <WifiOff size={12} /> Hors ligne
                </span>
              )}
            </div>
            <Link to="/ventes/historique" className="text-sm text-accent-600 font-medium hover:underline">
              Voir l'historique
            </Link>
          </div>

          <div className="relative mb-3 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un produit ou un code-barres..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              autoFocus
            />
          </div>

          {/* Filtres rapides par catégorie */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-1 px-1">
              <button
                onClick={() => setCategorieId(null)}
                className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                  categorieId === null
                    ? 'text-white border-transparent'
                    : 'bg-surface text-ink-soft border-black/10 hover:border-black/20'
                }`}
                style={categorieId === null ? { background: 'linear-gradient(135deg, #172554, #101828)' } : undefined}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategorieId(cat.id)}
                  className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                    categorieId === cat.id
                      ? 'text-white border-transparent'
                      : 'bg-surface text-ink-soft border-black/10 hover:border-black/20'
                  }`}
                  style={categorieId === cat.id ? { background: 'linear-gradient(135deg, #172554, #101828)' } : undefined}
                >
                  {cat.nom}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-4">
          {produits.length === 0 ? (
            <p className="text-ink-faint text-sm py-8 text-center">Aucun produit ne correspond.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {produits.map((produit) => (
                <button
                  key={produit.id}
                  onClick={() => ajouterAuPanier(produit)}
                  disabled={produit.stock_actuel <= 0}
                  className="bg-surface border border-black/5 rounded-2xl p-4 text-left hover:border-accent-400 hover:shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <p className="font-medium text-ink text-sm mb-1 line-clamp-1">{produit.nom}</p>
                  <p className="text-ink-soft text-sm">{produit.prix_vente} FCFA</p>
                  <p className="text-xs text-ink-faint mt-1">Stock : {produit.stock_actuel}</p>
                </button>
              ))}
            </div>
          )}

          {/* Pagination compacte, pensée pour une boutique à gros catalogue */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-black/10 disabled:opacity-40 hover:bg-paper transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-ink-faint">Page {meta.current_page} / {meta.last_page}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
                className="p-2 rounded-lg border border-black/10 disabled:opacity-40 hover:bg-paper transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Colonne panier */}
      <div className="w-80 bg-surface border-l border-black/5 flex flex-col shrink-0">
        <div className="p-4 border-b border-black/5">
          <h2 className="font-display font-semibold text-ink">Panier</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {panier.length === 0 ? (
            <p className="text-ink-faint text-sm">Aucun article sélectionné.</p>
          ) : (
            panier.map((ligne) => (
              <div key={ligne.produit.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{ligne.produit.nom}</p>
                  <p className="text-xs text-ink-faint">{ligne.produit.prix_vente} FCFA / unité</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => changerQuantite(ligne.produit.id, -1)} className="w-6 h-6 rounded-full bg-paper flex items-center justify-center hover:bg-black/5">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm w-5 text-center">{ligne.quantite}</span>
                  <button onClick={() => changerQuantite(ligne.produit.id, 1)} className="w-6 h-6 rounded-full bg-paper flex items-center justify-center hover:bg-black/5">
                    <Plus size={12} />
                  </button>
                  <button onClick={() => retirerDuPanier(ligne.produit.id)} className="text-ink-faint hover:text-warning ml-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-black/5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {MODES_PAIEMENT.map((mode) => (
              <button
                key={mode.valeur}
                onClick={() => setModePaiement(mode.valeur)}
                className={`text-xs font-medium py-2 rounded-lg border transition ${
                  modePaiement === mode.valeur
                    ? 'text-white border-transparent'
                    : 'bg-surface text-ink-soft border-black/10 hover:border-black/20'
                }`}
                style={
                  modePaiement === mode.valeur
                    ? { background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }
                    : undefined
                }
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-ink-soft">Total</span>
            <span className="font-display text-lg font-semibold text-ink">{total} FCFA</span>
          </div>

          {erreur && <p className="text-warning text-xs">{erreur}</p>}

          <button
            onClick={validerVente}
            disabled={panier.length === 0 || enregistrement}
            className="w-full text-white font-medium py-2.5 rounded-xl disabled:opacity-40 transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
          >
            {enregistrement ? 'Enregistrement...' : 'Valider la vente'}
          </button>
        </div>
      </div>
    </div>
  )
}