
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  UserPlus,
  History,
} from 'lucide-react'
import apiClient from '../../lib/api/client'
import {
  enregistrerVente,
  mettreEnCacheProduits,
  recupererProduitsEnCache,
} from '../../lib/offline/syncManager'

import { ScanLine } from 'lucide-react'
import BarcodeScanner from '../../components/BarcodeScanner'

const BASE_URL_STOCKAGE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/storage/'

const MODES_PAIEMENT = [
  { valeur: 'especes', label: 'Espèces' },
  { valeur: 'wave', label: 'Wave' },
  { valeur: 'orange_money', label: 'Orange Money' },
  { valeur: 'credit', label: 'Crédit' },
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
  const [panierOuvertMobile, setPanierOuvertMobile] = useState(false)
  const [scannerOuvert, setScannerOuvert] = useState(false)

  // Sélection du client, utilisée uniquement quand modePaiement === 'credit'
  const [clientId, setClientId] = useState(null)
  const [clientNom, setClientNom] = useState('')
  const [rechercheClient, setRechercheClient] = useState('')
  const [resultatsClients, setResultatsClients] = useState([])
  const [nouveauClientOuvert, setNouveauClientOuvert] = useState(false)

  useEffect(() => {
    apiClient
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {})
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

        if (!recherche && !categorieId && page === 1) {
          mettreEnCacheProduits(res.data.data)
        }
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

  useEffect(() => {
    if (modePaiement !== 'credit' || !rechercheClient) {
      setResultatsClients([])
      return
    }

    const delai = setTimeout(() => {
      apiClient
        .get('/clients', {
          params: {
            recherche: rechercheClient,
            per_page: 5,
          },
        })
        .then((res) => setResultatsClients(res.data.data))
        .catch(() => setResultatsClients([]))
    }, 250)

    return () => clearTimeout(delai)
  }, [rechercheClient, modePaiement])

  function selectionnerClient(client) {
    setClientId(client.id)
    setClientNom(client.nom)
    setRechercheClient('')
    setResultatsClients([])
  }

  function changerModePaiement(valeur) {
    setModePaiement(valeur)

    if (valeur !== 'credit') {
      setClientId(null)
      setClientNom('')
    }
  }

  function ajouterAuPanier(produit) {
    setPanier((actuel) => {
      const existant = actuel.find((l) => l.produit.id === produit.id)

      if (existant) {
        const stockDisponible = Number(produit.stock_actuel ?? 0)

        if (existant.quantite >= stockDisponible) {
          return actuel
        }

        return actuel.map((l) =>
          l.produit.id === produit.id
            ? { ...l, quantite: l.quantite + 1 }
            : l
        )
      }

      return [...actuel, { produit, quantite: 1 }]
    })
  }

  async function gererCodeScanne(codeBarres) {
    setScannerOuvert(false)
    try {
      const res = await apiClient.get(`/produits/scan/${codeBarres}`)
      ajouterAuPanier(res.data.data ?? res.data)
    } catch {
      alert("Aucun produit trouvé pour ce code-barres.")
    }
  }

  function changerQuantite(produitId, delta) {
    setPanier((actuel) =>
      actuel
        .map((l) => {
          if (l.produit.id !== produitId) {
            return l
          }

          const nouvelleQuantite = l.quantite + delta
          const stockDisponible = Number(l.produit.stock_actuel ?? 0)

          if (delta > 0 && nouvelleQuantite > stockDisponible) {
            return l
          }

          return {
            ...l,
            quantite: nouvelleQuantite,
          }
        })
        .filter((l) => l.quantite > 0)
    )
  }

  function retirerDuPanier(produitId) {
    setPanier((actuel) =>
      actuel.filter((l) => l.produit.id !== produitId)
    )
  }

  const total = panier.reduce(
    (somme, l) => somme + l.produit.prix_vente * l.quantite,
    0
  )

  const nombreArticlesPanier = panier.reduce(
    (n, l) => n + l.quantite,
    0
  )

  async function validerVente() {
    if (panier.length === 0) return

    if (modePaiement === 'credit' && !clientId) {
      setErreur('Choisis un client pour une vente à crédit.')
      return
    }

    setErreur('')
    setEnregistrement(true)

    const payload = {
      uuid_client: crypto.randomUUID(),
      mode_paiement: modePaiement,
      ...(modePaiement === 'credit' && { client_id: clientId }),
      vendue_le: new Date().toISOString(),
      lignes: panier.map((l) => ({
        produit_id: l.produit.id,
        quantite: l.quantite,
      })),
    }

    try {
      const resultat = await enregistrerVente(payload)

      setConfirmation({
        total,
        nombreArticles: nombreArticlesPanier,
        synchroniseeImmediatement:
          resultat.synchroniseeImmediatement,
      })

      setPanier([])
      setModePaiement('especes')
      setClientId(null)
      setClientNom('')
      setPanierOuvertMobile(false)
    } catch (err) {
      setErreur(
        err.response?.data?.message ||
          'Une erreur est survenue.'
      )
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

          <h2 className="font-display text-xl font-semibold text-ink mb-1">
            Vente enregistrée
          </h2>

          <p className="text-ink-soft mb-2">
            {confirmation.total} FCFA — {confirmation.nombreArticles} article(s)
          </p>

          {!confirmation.synchroniseeImmediatement && (
            <p className="text-accent-600 text-sm mb-4 flex items-center justify-center gap-1.5">
              <WifiOff size={14} />
              Enregistrée hors ligne, sera synchronisée automatiquement
            </p>
          )}

          <button
            onClick={() => setConfirmation(null)}
            className="text-white text-sm font-medium px-5 py-2.5 rounded-xl transition hover:opacity-90 mt-2"
            style={{
              background: 'linear-gradient(135deg, #C9A96E, #9A8050)',
            }}
          >
            Nouvelle vente
          </button>
        </div>
      </div>
    )
  }

  const contenuPanier = (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {panier.length === 0 ? (
          <p className="text-ink-faint text-sm">
            Aucun article sélectionné.
          </p>
        ) : (
          panier.map((ligne) => (
            <div
              key={ligne.produit.id}
              className="flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {ligne.produit.nom}
                </p>

                <p className="text-xs text-ink-faint">
                  {ligne.produit.prix_vente} FCFA / unité
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    changerQuantite(ligne.produit.id, -1)
                  }
                  className="w-7 h-7 rounded-full bg-paper flex items-center justify-center hover:bg-black/5"
                >
                  <Minus size={12} />
                </button>

                <span className="text-sm w-5 text-center">
                  {ligne.quantite}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    changerQuantite(ligne.produit.id, 1)
                  }
                  disabled={
                    ligne.quantite >=
                    Number(ligne.produit.stock_actuel ?? 0)
                  }
                  className="w-7 h-7 rounded-full bg-paper flex items-center justify-center hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Stock maximum atteint"
                >
                  <Plus size={12} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    retirerDuPanier(ligne.produit.id)
                  }
                  className="text-ink-faint hover:text-warning ml-1"
                >
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
              type="button"
              key={mode.valeur}
              onClick={() =>
                changerModePaiement(mode.valeur)
              }
              className={`text-xs font-medium py-2 rounded-lg border transition ${
                modePaiement === mode.valeur
                  ? 'text-white border-transparent'
                  : 'bg-surface text-ink-soft border-black/10 hover:border-black/20'
              }`}
              style={
                modePaiement === mode.valeur
                  ? {
                      background:
                        'linear-gradient(135deg, #C9A96E, #9A8050)',
                    }
                  : undefined
              }
            >
              {mode.label}
            </button>
          ))}
        </div>

        {modePaiement === 'credit' && (
          <div className="rounded-xl border border-black/10 p-3">
            {clientId ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink">
                  Client :{' '}
                  <span className="font-medium">
                    {clientNom}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setClientId(null)
                    setClientNom('')
                  }}
                  className="text-xs text-ink-faint hover:text-warning"
                >
                  Changer
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
                  />

                  <input
                    value={rechercheClient}
                    onChange={(e) =>
                      setRechercheClient(e.target.value)
                    }
                    placeholder="Rechercher un client..."
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>

                {resultatsClients.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {resultatsClients.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() =>
                          selectionnerClient(c)
                        }
                        className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-paper text-ink"
                      >
                        {c.nom}{' '}
                        {c.telephone && (
                          <span className="text-ink-faint">
                            — {c.telephone}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setNouveauClientOuvert(true)
                  }
                  className="flex items-center gap-1 text-xs text-accent-600 font-medium mt-2 hover:underline"
                >
                  <UserPlus size={12} />
                  Nouveau client
                </button>
              </>
            )}
          </div>
        )}

        <div className="flex justify-between items-center text-sm">
          <span className="text-ink-soft">Total</span>

          <span className="font-display text-lg font-semibold text-ink">
            {total} FCFA
          </span>
        </div>

        {erreur && (
          <p className="text-warning text-xs">
            {erreur}
          </p>
        )}

        <button
          onClick={validerVente}
          disabled={panier.length === 0 || enregistrement}
          className="w-full text-white font-medium py-2.5 rounded-xl disabled:opacity-40 transition hover:opacity-90"
          style={{
            background:
              'linear-gradient(135deg, #172554, #101828)',
          }}
        >
          {enregistrement
            ? 'Enregistrement...'
            : 'Valider la vente'}
        </button>
      </div>

      {nouveauClientOuvert && (
        <ModalNouveauClientRapide
          onFerme={() => setNouveauClientOuvert(false)}
          onCree={(client) => {
            selectionnerClient(client)
            setNouveauClientOuvert(false)
          }}
        />
      )}
    </>
  )

  return (
    <div className="flex flex-col lg:flex-row h-full relative">
      {/* Colonne produits */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="p-4 lg:p-8 pb-0 lg:pb-0">

          {/* En-tête avec bouton Historique */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="font-display text-xl lg:text-2xl font-semibold text-ink truncate">
                Nouvelle vente
              </h1>

              {modeHorsLigne && (
                <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-accent-600 bg-accent-100 px-2 py-1 rounded-full shrink-0">
                  <WifiOff size={12} />
                  Hors ligne
                </span>
              )}
            </div>

            {/* Bouton compact visible sur mobile */}
            <Link
              to="/ventes/historique"
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 bg-surface text-xs sm:text-sm font-medium text-ink-soft hover:text-accent-600 hover:border-accent-500/30 hover:bg-paper transition"
            >
              <History size={15} />
              <span>Historique</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-3 max-w-xl">
            <div className="relative flex-1 min-w-0">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
              />

              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher un produit ou un code-barres..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/10 bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent-500 transition"
              />
            </div>

            <button
              type="button"
              onClick={() => setScannerOuvert(true)}
              className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-black/10 bg-surface text-ink-soft hover:border-accent-500/40 hover:text-accent-600 hover:bg-paper transition"
              title="Scanner un code-barres"
              aria-label="Scanner un code-barres"
            >
              <ScanLine size={18} />
            </button>
          </div>

          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-1 px-1">
              <button
                onClick={() => setCategorieId(null)}
                className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                  categorieId === null
                    ? 'text-white border-transparent'
                    : 'bg-surface text-ink-soft border-black/10 hover:border-black/20'
                }`}
                style={
                  categorieId === null
                    ? {
                        background:
                          'linear-gradient(135deg, #172554, #101828)',
                      }
                    : undefined
                }
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
                  style={
                    categorieId === cat.id
                      ? {
                          background:
                            'linear-gradient(135deg, #172554, #101828)',
                        }
                      : undefined
                  }
                >
                  {cat.nom}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Espace en bas pour ne pas que la barre panier mobile cache les derniers produits */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-24 lg:pb-4">
          {produits.length === 0 ? (
            <p className="text-ink-faint text-sm py-8 text-center">
              Aucun produit ne correspond.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {produits.map((produit) => (
                <button
                  key={produit.id}
                  onClick={() =>
                    ajouterAuPanier(produit)
                  }
                  disabled={produit.stock_actuel <= 0}
                  className="bg-surface border border-black/5 rounded-2xl p-4 text-left hover:border-accent-400 hover:shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {produit.photo_url && (
                    <div className="w-full aspect-square rounded-lg bg-paper overflow-hidden mb-2">
                      <img src={BASE_URL_STOCKAGE + produit.photo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="font-medium text-ink text-sm mb-1 line-clamp-1">{produit.nom}</p>

                  <p className="text-ink-soft text-sm">
                    {produit.prix_vente} FCFA
                  </p>

                  <p className="text-xs text-ink-faint mt-1">
                    Stock : {produit.stock_actuel}
                  </p>
                </button>
              ))}
            </div>
          )}

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                disabled={page <= 1}
                className="p-2 rounded-lg border border-black/10 disabled:opacity-40 hover:bg-paper transition"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs text-ink-faint">
                Page {meta.current_page} / {meta.last_page}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((p) =>
                    Math.min(meta.last_page, p + 1)
                  )
                }
                disabled={page >= meta.last_page}
                className="p-2 rounded-lg border border-black/10 disabled:opacity-40 hover:bg-paper transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Panier — colonne fixe sur desktop, tiroir depuis le bas sur mobile */}
      <div className="hidden lg:flex w-80 bg-surface border-l border-black/5 flex-col shrink-0">
        <div className="p-4 border-b border-black/5">
          <h2 className="font-display font-semibold text-ink">
            Panier
          </h2>
        </div>

        {contenuPanier}
      </div>

      {/* Barre panier flottante sur mobile */}
      {!panierOuvertMobile && (
        <button
          type="button"
          onClick={() =>
            setPanierOuvertMobile(true)
          }
          className="lg:hidden fixed bottom-4 left-4 right-4 flex items-center justify-between text-white rounded-2xl px-5 py-3.5 shadow-lg z-30"
          style={{
            background:
              'linear-gradient(135deg, #172554, #101828)',
          }}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShoppingCart size={18} />

            {nombreArticlesPanier > 0
              ? `${nombreArticlesPanier} article(s)`
              : 'Panier vide'}
          </span>

          <span className="font-display font-semibold">
            {total} FCFA
          </span>
        </button>
      )}

      {/* Tiroir panier plein écran sur mobile */}
      {panierOuvertMobile && (
        <div className="lg:hidden fixed inset-0 bg-surface z-40 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-black/5">
            <h2 className="font-display font-semibold text-ink">
              Panier
            </h2>

            <button
              type="button"
              onClick={() =>
                setPanierOuvertMobile(false)
              }
              className="text-ink-soft text-sm font-medium"
            >
              Retour aux produits
            </button>
          </div>

          {contenuPanier}
        </div>
      )}

      {scannerOuvert && (
        <BarcodeScanner
          onFerme={() => setScannerOuvert(false)}
          onDetecte={gererCodeScanne}
        />
      )}
    </div>
  )
}

/**
 * Formulaire minimal pour créer un client sans quitter l'écran de vente,
 * quand le client qui achète à crédit n'existe pas encore dans la liste.
 */
function ModalNouveauClientRapide({ onFerme, onCree }) {
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    const nomNettoye = nom.trim()
    const telephoneNettoye = telephone.trim()

    if (!nomNettoye) {
      setErreur('Le nom du client est obligatoire.')
      return
    }

    setErreur('')
    setEnregistrement(true)

    try {
      const res = await apiClient.post('/clients', {
        nom: nomNettoye,
        telephone: telephoneNettoye || null,
      })

      onCree(res.data.data ?? res.data)
    } catch (err) {
      setErreur(
        err.response?.data?.message ||
          'Une erreur est survenue.'
      )
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 relative">
        <button
          type="button"
          onClick={onFerme}
          className="absolute top-4 right-4 text-ink-faint hover:text-ink"
        >
          ✕
        </button>

        <h2 className="font-display text-lg font-semibold text-ink mb-5">
          Nouveau client
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Nom
            </label>

            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Téléphone (optionnel)
            </label>

            <input
              type="tel"
              value={telephone}
              onChange={(e) =>
                setTelephone(e.target.value)
              }
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          {erreur && (
            <p className="text-warning text-sm">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={enregistrement}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style={{
              background:
                'linear-gradient(135deg, #172554, #101828)',
            }}
          >
            {enregistrement
              ? 'Création...'
              : 'Créer et sélectionner'}
          </button>
        </form>
      </div>
    </div>
  )

}


