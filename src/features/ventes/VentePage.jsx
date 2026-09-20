import { useEffect, useState } from 'react'
import {
  Link,
} from 'react-router-dom'
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
  History,
} from 'lucide-react'

import apiClient from '../../lib/api/client'
import {
  enregistrerVente,
  mettreEnCacheProduits,
  recupererProduitsEnCache,
} from '../../lib/offline/syncManager'

/* =========================================================
   MODES DE PAIEMENT
========================================================= */

const MODES_PAIEMENT = [
  {
    valeur: 'especes',
    label: 'Espèces',
  },
  {
    valeur: 'wave',
    label: 'Wave',
  },
  {
    valeur: 'orange_money',
    label: 'Orange Money',
  },
  {
    valeur: 'autre',
    label: 'Autre',
  },
]

/* =========================================================
   PAGE VENTE
========================================================= */

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

  /* =========================================================
     CHARGEMENT DES CATÉGORIES
  ========================================================= */

  useEffect(() => {
    apiClient
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {})
  }, [])

  /* =========================================================
     CHARGEMENT DES PRODUITS
  ========================================================= */

  useEffect(() => {
    const delai = setTimeout(async () => {
      const params = {
        page,
        per_page: 24,
      }

      if (recherche) {
        params.recherche = recherche
      }

      if (categorieId) {
        params.categorie_id = categorieId
      }

      try {
        const res = await apiClient.get('/produits', {
          params,
        })

        setProduits(res.data.data)
        setMeta(res.data.meta)
        setModeHorsLigne(false)

        /*
         * Mise en cache uniquement pour la première page
         * sans recherche ni filtre.
         */
        if (
          !recherche &&
          !categorieId &&
          page === 1
        ) {
          mettreEnCacheProduits(res.data.data)
        }
      } catch {
        const produitsCache =
          await recupererProduitsEnCache(recherche)

        setProduits(produitsCache)
        setMeta(null)
        setModeHorsLigne(true)
      }
    }, 250)

    return () => clearTimeout(delai)
  }, [recherche, categorieId, page])

  /* =========================================================
     RESET PAGE
  ========================================================= */

  useEffect(() => {
    setPage(1)
  }, [recherche, categorieId])

  /* =========================================================
     AJOUTER AU PANIER
  ========================================================= */

  function ajouterAuPanier(produit) {
    setPanier((actuel) => {
      const existant = actuel.find(
        (ligne) => ligne.produit.id === produit.id
      )

      if (existant) {
        return actuel.map((ligne) =>
          ligne.produit.id === produit.id
            ? {
                ...ligne,
                quantite: ligne.quantite + 1,
              }
            : ligne
        )
      }

      return [
        ...actuel,
        {
          produit,
          quantite: 1,
        },
      ]
    })
  }

  /* =========================================================
     MODIFIER QUANTITÉ
  ========================================================= */

  function changerQuantite(produitId, delta) {
    setPanier((actuel) =>
      actuel
        .map((ligne) =>
          ligne.produit.id === produitId
            ? {
                ...ligne,
                quantite: ligne.quantite + delta,
              }
            : ligne
        )
        .filter((ligne) => ligne.quantite > 0)
    )
  }

  /* =========================================================
     RETIRER DU PANIER
  ========================================================= */

  function retirerDuPanier(produitId) {
    setPanier((actuel) =>
      actuel.filter(
        (ligne) => ligne.produit.id !== produitId
      )
    )
  }

  /* =========================================================
     CALCULS
  ========================================================= */

  const total = panier.reduce(
    (somme, ligne) =>
      somme +
      Number(ligne.produit.prix_vente || 0) *
        ligne.quantite,
    0
  )

  const nombreArticlesPanier = panier.reduce(
    (nombre, ligne) =>
      nombre + ligne.quantite,
    0
  )

  /* =========================================================
     VALIDATION VENTE
  ========================================================= */

  async function validerVente() {
    if (panier.length === 0) {
      return
    }

    setErreur('')
    setEnregistrement(true)

    const payload = {
      uuid_client: crypto.randomUUID(),

      mode_paiement: modePaiement,

      vendue_le: new Date().toISOString(),

      lignes: panier.map((ligne) => ({
        produit_id: ligne.produit.id,
        quantite: ligne.quantite,
      })),
    }

    try {
      const resultat =
        await enregistrerVente(payload)

      setConfirmation({
        total,

        nombreArticles:
          panier.length,

        synchroniseeImmediatement:
          resultat.synchroniseeImmediatement,
      })

      setPanier([])

      setModePaiement('especes')

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

  /* =========================================================
     CONFIRMATION
  ========================================================= */

  if (confirmation) {
    return (
      <div className="min-h-full p-5 sm:p-6 flex items-center justify-center">
        <div className="text-center max-w-sm w-full">

          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-positive-soft">
            <Check
              size={28}
              className="text-positive"
            />
          </div>

          <h2 className="font-display text-xl font-semibold text-ink mb-1">
            Vente enregistrée
          </h2>

          <p className="text-ink-soft mb-2">
            {Number(
              confirmation.total
            ).toLocaleString('fr-FR')}{' '}
            FCFA — {confirmation.nombreArticles}{' '}
            article(s)
          </p>

          {!confirmation.synchroniseeImmediatement && (
            <p className="text-accent-600 text-sm mb-4 flex items-center justify-center gap-1.5">
              <WifiOff size={14} />

              Enregistrée hors ligne,
              sera synchronisée automatiquement
            </p>
          )}

          <button
            onClick={() =>
              setConfirmation(null)
            }
            className="text-white text-sm font-medium px-5 py-2.5 rounded-xl transition hover:opacity-90 mt-2"
            style={{
              background:
                'linear-gradient(135deg, #C9A96E, #9A8050)',
            }}
          >
            Nouvelle vente
          </button>

        </div>
      </div>
    )
  }

  /* =========================================================
     CONTENU DU PANIER
  ========================================================= */

  const contenuPanier = (
    <>
      {/* LISTE DES ARTICLES */}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {panier.length === 0 ? (

          <div className="py-8 text-center">
            <ShoppingCart
              size={28}
              className="mx-auto text-ink-faint mb-3"
            />

            <p className="text-ink-faint text-sm">
              Aucun article sélectionné.
            </p>
          </div>

        ) : (

          panier.map((ligne) => (
            <div
              key={ligne.produit.id}
              className="flex items-center justify-between gap-2"
            >

              <div className="min-w-0 flex-1">

                <p className="text-sm font-medium text-ink truncate">
                  {ligne.produit.nom}
                </p>

                <p className="text-xs text-ink-faint">
                  {Number(
                    ligne.produit.prix_vente
                  ).toLocaleString('fr-FR')}{' '}
                  FCFA / unité
                </p>

              </div>

              <div className="flex items-center gap-1.5 shrink-0">

                <button
                  onClick={() =>
                    changerQuantite(
                      ligne.produit.id,
                      -1
                    )
                  }
                  className="w-7 h-7 rounded-full bg-paper flex items-center justify-center hover:bg-black/5 transition"
                >
                  <Minus size={12} />
                </button>

                <span className="text-sm w-5 text-center">
                  {ligne.quantite}
                </span>

                <button
                  onClick={() =>
                    changerQuantite(
                      ligne.produit.id,
                      1
                    )
                  }
                  className="w-7 h-7 rounded-full bg-paper flex items-center justify-center hover:bg-black/5 transition"
                >
                  <Plus size={12} />
                </button>

                <button
                  onClick={() =>
                    retirerDuPanier(
                      ligne.produit.id
                    )
                  }
                  className="text-ink-faint hover:text-warning ml-1 transition"
                >
                  <Trash2 size={14} />
                </button>

              </div>

            </div>
          ))

        )}

      </div>

      {/* BAS DU PANIER */}

      <div className="p-4 border-t border-black/5 space-y-3">

        {/* PAIEMENT */}

        <div className="grid grid-cols-2 gap-2">

          {MODES_PAIEMENT.map((mode) => (

            <button
              key={mode.valeur}
              onClick={() =>
                setModePaiement(mode.valeur)
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

        {/* TOTAL */}

        <div className="flex justify-between items-center text-sm">

          <span className="text-ink-soft">
            Total
          </span>

          <span className="font-display text-lg font-semibold text-ink">
            {Number(total).toLocaleString('fr-FR')}{' '}
            FCFA
          </span>

        </div>

        {/* ERREUR */}

        {erreur && (
          <p className="text-warning text-xs">
            {erreur}
          </p>
        )}

        {/* VALIDER */}

        <button
          onClick={validerVente}
          disabled={
            panier.length === 0 ||
            enregistrement
          }
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
    </>
  )

  /* =========================================================
     PAGE PRINCIPALE
  ========================================================= */

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0 relative">

      {/* =====================================================
          COLONNE PRODUITS
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="p-4 sm:p-5 lg:p-8 pb-0">

          {/* TITRE + HISTORIQUE */}

          <div className="flex items-center justify-between gap-3 mb-4">

            <div className="flex items-center gap-2 min-w-0">

              <h1 className="font-display text-xl lg:text-2xl font-semibold text-ink whitespace-nowrap">
                Nouvelle vente
              </h1>

              {/* Hors ligne uniquement sur écran moyen/grand */}

              {modeHorsLigne && (
                <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-accent-600 bg-accent-100 px-2 py-1 rounded-full shrink-0">
                  <WifiOff size={12} />
                  Hors ligne
                </span>
              )}

            </div>

            {/* =================================================
                HISTORIQUE
                Visible sur téléphone
            ================================================= */}

            <Link
              to="/ventes/historique"
              className="
                shrink-0
                inline-flex
                items-center
                justify-center
                gap-1.5
                text-xs
                sm:text-sm
                font-semibold
                text-[#244E87]
                bg-[#EDF3FA]
                hover:bg-[#E2EAF4]
                px-3
                py-2
                rounded-xl
                transition
                whitespace-nowrap
              "
            >
              <History size={15} />

              <span className="sm:hidden">
                Historique
              </span>

              <span className="hidden sm:inline">
                Voir l'historique
              </span>
            </Link>

          </div>

          {/* =================================================
              RECHERCHE
          ================================================= */}

          <div className="relative mb-3 w-full max-w-none sm:max-w-sm">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />

            <input
              value={recherche}
              onChange={(e) =>
                setRecherche(e.target.value)
              }
              placeholder="Rechercher un produit ou un code-barres..."
              className="
                w-full
                pl-9
                pr-3
                py-2.5
                rounded-xl
                border
                border-black/10
                text-sm
                bg-surface
                focus:outline-none
                focus:ring-2
                focus:ring-accent-500
              "
            />

          </div>

          {/* =================================================
              CATEGORIES
          ================================================= */}

          {categories.length > 0 && (

            <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">

              {/* TOUS */}

              <button
                onClick={() =>
                  setCategorieId(null)
                }
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

              {/* CATEGORIES */}

              {categories.map((cat) => (

                <button
                  key={cat.id}
                  onClick={() =>
                    setCategorieId(cat.id)
                  }
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

        {/* ===================================================
            PRODUITS
        =================================================== */}

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 lg:px-8 pb-28 lg:pb-5">

          {produits.length === 0 ? (

            <div className="py-12 text-center">

              <ShoppingCart
                size={32}
                className="mx-auto text-ink-faint mb-3"
              />

              <p className="text-ink-faint text-sm">
                Aucun produit ne correspond.
              </p>

            </div>

          ) : (

            <div className="
              grid
              grid-cols-2
              sm:grid-cols-3
              xl:grid-cols-4
              gap-3
            ">

              {produits.map((produit) => (

                <button
                  key={produit.id}
                  onClick={() =>
                    ajouterAuPanier(produit)
                  }
                  disabled={
                    produit.stock_actuel <= 0
                  }
                  className="
                    bg-surface
                    border
                    border-black/5
                    rounded-2xl
                    p-3
                    sm:p-4
                    text-left
                    hover:border-accent-400
                    hover:shadow-sm
                    transition
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    active:scale-[0.98]
                  "
                >

                  <p className="font-medium text-ink text-sm mb-1 line-clamp-2 min-h-[40px]">
                    {produit.nom}
                  </p>

                  <p className="text-ink-soft text-sm font-medium">
                    {Number(
                      produit.prix_vente
                    ).toLocaleString('fr-FR')}{' '}
                    FCFA
                  </p>

                  <p className="text-xs text-ink-faint mt-1">
                    Stock : {produit.stock_actuel}
                  </p>

                </button>

              ))}

            </div>

          )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {meta && meta.last_page > 1 && (

            <div className="flex items-center justify-center gap-3 mt-5 pb-3">

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
                disabled={page <= 1}
                className="
                  p-2
                  rounded-lg
                  border
                  border-black/10
                  disabled:opacity-40
                  hover:bg-paper
                  transition
                "
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs text-ink-faint">
                Page {meta.current_page} /{' '}
                {meta.last_page}
              </span>

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      meta.last_page,
                      p + 1
                    )
                  )
                }
                disabled={
                  page >= meta.last_page
                }
                className="
                  p-2
                  rounded-lg
                  border
                  border-black/10
                  disabled:opacity-40
                  hover:bg-paper
                  transition
                "
              >
                <ChevronRight size={16} />
              </button>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          PANIER DESKTOP
      ===================================================== */}

      <div className="
        hidden
        lg:flex
        w-80
        bg-surface
        border-l
        border-black/5
        flex-col
        shrink-0
      ">

        <div className="p-4 border-b border-black/5">

          <div className="flex items-center justify-between">

            <h2 className="font-display font-semibold text-ink">
              Panier
            </h2>

            {nombreArticlesPanier > 0 && (
              <span className="text-xs font-semibold bg-[#EDF3FA] text-[#244E87] px-2 py-1 rounded-full">
                {nombreArticlesPanier}
              </span>
            )}

          </div>

        </div>

        {contenuPanier}

      </div>

      {/* =====================================================
          BARRE PANIER MOBILE
      ===================================================== */}

      {!panierOuvertMobile && (

        <button
          onClick={() =>
            setPanierOuvertMobile(true)
          }
          className="
            lg:hidden
            fixed
            bottom-4
            left-4
            right-4
            flex
            items-center
            justify-between
            text-white
            rounded-2xl
            px-5
            py-3.5
            shadow-lg
            z-30
          "
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
            {Number(total).toLocaleString('fr-FR')}{' '}
            FCFA
          </span>

        </button>

      )}

      {/* =====================================================
          PANIER MOBILE
      ===================================================== */}

      {panierOuvertMobile && (

        <div className="
          lg:hidden
          fixed
          inset-0
          bg-surface
          z-40
          flex
          flex-col
        ">

          {/* HEADER PANIER */}

          <div className="
            flex
            items-center
            justify-between
            gap-3
            p-4
            border-b
            border-black/5
          ">

            <div className="flex items-center gap-2">

              <ShoppingCart
                size={18}
                className="text-[#244E87]"
              />

              <h2 className="font-display font-semibold text-ink">
                Panier
              </h2>

              {nombreArticlesPanier > 0 && (
                <span className="text-[10px] font-bold bg-[#EDF3FA] text-[#244E87] px-2 py-1 rounded-full">
                  {nombreArticlesPanier}
                </span>
              )}

            </div>

            <button
              onClick={() =>
                setPanierOuvertMobile(false)
              }
              className="
                text-[#244E87]
                text-sm
                font-medium
                px-3
                py-2
                rounded-xl
                bg-[#EDF3FA]
                hover:bg-[#E2EAF4]
                transition
              "
            >
              Retour
            </button>

          </div>

          {contenuPanier}

        </div>

      )}

    </div>
  )
}