import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import apiClient from '../../lib/api/client'

export default function ProduitFormModal({ produit, onFerme, onEnregistre }) {
  const estEdition = Boolean(produit)

  const [categories, setCategories] = useState([])
  const [nom, setNom] = useState(produit?.nom ?? '')
  const [categorieId, setCategorieId] = useState(produit?.categorie?.id ?? '')
  const [prixAchat, setPrixAchat] = useState(produit?.prix_achat ?? '')
  const [prixVente, setPrixVente] = useState(produit?.prix_vente ?? '')
  const [stockActuel, setStockActuel] = useState(produit?.stock_actuel ?? '')
  const [seuilAlerte, setSeuilAlerte] = useState(produit?.seuil_alerte ?? 5)
  const [erreurs, setErreurs] = useState({})
  const [enregistrement, setEnregistrement] = useState(false)

  useEffect(() => {
    apiClient.get('/categories').then((res) => setCategories(res.data))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErreurs({})
    setEnregistrement(true)

    const payload = {
      nom,
      categorie_id: categorieId || null,
      prix_achat: Number(prixAchat),
      prix_vente: Number(prixVente),
      seuil_alerte: Number(seuilAlerte),
      ...(!estEdition && { stock_actuel: Number(stockActuel) || 0 }),
    }

    try {
      if (estEdition) {
        await apiClient.put(`/produits/${produit.id}`, payload)
      } else {
        await apiClient.post('/produits', payload)
      }
      onEnregistre()
    } catch (err) {
      if (err.response?.status === 422) {
        setErreurs(err.response.data.errors)
      }
    } finally {
      setEnregistrement(false)
    }
  }

  async function handleSupprimer() {
    if (!confirm(`Supprimer "${produit.nom}" ?`)) return
    await apiClient.delete(`/produits/${produit.id}`)
    onEnregistre()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onFerme} className="absolute top-4 right-4 text-ink-faint hover:text-ink">
          <X size={20} />
        </button>

        <h2 className="font-display text-lg font-semibold text-ink mb-5">
          {estEdition ? 'Modifier le produit' : 'Ajouter un produit'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nom du produit</label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Nom du produit"
              required
            />
            {erreurs.nom && <p className="text-warning text-xs mt-1">{erreurs.nom[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Catégorie</label>
            <select
              value={categorieId}
              onChange={(e) => setCategorieId(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="">Aucune</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nom}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Prix d'achat</label>
              <input
                type="number"
                value={prixAchat}
                onChange={(e) => setPrixAchat(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                required
                min="0"
              />
              {erreurs.prix_achat && <p className="text-warning text-xs mt-1">{erreurs.prix_achat[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Prix de vente</label>
              <input
                type="number"
                value={prixVente}
                onChange={(e) => setPrixVente(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                required
                min="0"
              />
              {erreurs.prix_vente && <p className="text-warning text-xs mt-1">{erreurs.prix_vente[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!estEdition && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Stock initial</label>
                <input
                  type="number"
                  value={stockActuel}
                  onChange={(e) => setStockActuel(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                  min="0"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Seuil d'alerte</label>
              <input
                type="number"
                value={seuilAlerte}
                onChange={(e) => setSeuilAlerte(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {estEdition ? (
              <button
                type="button"
                onClick={handleSupprimer}
                className="text-sm text-warning hover:opacity-80 font-medium"
              >
                Supprimer
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={enregistrement}
              className="text-white text-sm font-medium px-5 py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
            >
              {enregistrement ? 'Enregistrement...' : estEdition ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}