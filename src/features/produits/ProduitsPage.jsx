import { useEffect, useState } from 'react'
import { Plus, Search, AlertTriangle, Package } from 'lucide-react'
import apiClient from '../../lib/api/client'
import ProduitFormModal from './ProduitFormModal'
import Pagination from '../../components/Pagination'
import EtatVide from '../../components/EtatVide'
import SquelletteTableau from '../../components/SquelletteTableau'
import useAuthStore from '../../lib/auth/authStore'

export default function ProduitsPage() {
  const { user } = useAuthStore()
  const estGestionnaire = user?.role === 'proprietaire' || user?.role === 'gestionnaire'

  const [produits, setProduits] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)
  const [produitAEditer, setProduitAEditer] = useState(null)

  async function chargerProduits() {
    setChargement(true)
    const params = { page }
    if (recherche) params.recherche = recherche
    const res = await apiClient.get('/produits', { params })
    setProduits(res.data.data)
    setMeta(res.data.meta)
    setChargement(false)
  }

  useEffect(() => {
    const delai = setTimeout(chargerProduits, 300)
    return () => clearTimeout(delai)
  }, [recherche, page])

  useEffect(() => {
    setPage(1)
  }, [recherche])

  function ouvrirAjout() {
    setProduitAEditer(null)
    setModalOuvert(true)
  }

  function ouvrirEdition(produit) {
    setProduitAEditer(produit)
    setModalOuvert(true)
  }

  function apresEnregistrement() {
    setModalOuvert(false)
    chargerProduits()
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Produits</h1>
        {estGestionnaire && (
          <button
            onClick={ouvrirAjout}
            className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
          >
            <Plus size={16} /> Ajouter un produit
          </button>
        )}
      </div>

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
          <EtatVide
            icone={Package}
            titre={recherche ? 'Aucun produit ne correspond' : 'Aucun produit pour le moment'}
            description={recherche ? "Essaie un autre terme de recherche." : "Ajoute ton premier produit pour commencer à vendre."}
          />
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-paper text-ink-soft text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium text-right">Prix achat</th>
                <th className="px-4 py-3 font-medium text-right">Prix vente</th>
                <th className="px-4 py-3 font-medium text-right">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {produits.map((produit) => (
                <tr
                  key={produit.id}
                  onClick={estGestionnaire ? () => ouvrirEdition(produit) : undefined}
                  className={estGestionnaire ? 'hover:bg-paper cursor-pointer transition' : ''}
                >
                  <td className="px-4 py-3.5 font-medium text-ink">{produit.nom}</td>
                  <td className="px-4 py-3.5 text-ink-soft">{produit.categorie?.nom ?? '—'}</td>
                  <td className="px-4 py-3.5 text-right text-ink-soft">{produit.prix_achat} FCFA</td>
                  <td className="px-4 py-3.5 text-right text-ink-soft">{produit.prix_vente} FCFA</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={produit.stock_bas || produit.en_rupture ? 'text-warning font-medium flex items-center justify-end gap-1' : 'text-ink-soft'}>
                      {(produit.stock_bas || produit.en_rupture) && <AlertTriangle size={14} />}
                      {produit.stock_actuel}
                    </span>
                  </td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <Pagination meta={meta} onChangerPage={setPage} />

      {modalOuvert && (
        <ProduitFormModal
          produit={produitAEditer}
          onFerme={() => setModalOuvert(false)}
          onEnregistre={apresEnregistrement}
        />
      )}
    </div>
  )
}