import { useEffect, useState } from 'react'
import { X, Camera, ScanLine } from 'lucide-react'
import apiClient from '../../lib/api/client'
import BarcodeScanner from '../../components/BarcodeScanner'
const BASE_URL_STOCKAGE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/storage/'

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
  const [codeBarres, setCodeBarres] = useState(produit?.code_barres ?? '')
  const [scannerOuvert, setScannerOuvert] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [apercuPhoto, setApercuPhoto] = useState(produit?.photo_url ? BASE_URL_STOCKAGE + produit.photo_url : null)

  useEffect(() => {
    apiClient.get('/categories').then((res) => setCategories(res.data))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErreurs({})
    setEnregistrement(true)

    const formData = new FormData()
    formData.append('nom', nom)
    if (categorieId) formData.append('categorie_id', categorieId)
    if (codeBarres) formData.append('code_barres', codeBarres)
    formData.append('prix_achat', prixAchat)
    formData.append('prix_vente', prixVente)
    formData.append('seuil_alerte', seuilAlerte)
    if (!estEdition) formData.append('stock_actuel', stockActuel || 0)
    if (photo) formData.append('photo', photo)

    try {
      if (estEdition) {
        formData.append('_method', 'PUT')
        await apiClient.post(`/produits/${produit.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await apiClient.post('/produits', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
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

  function choisirPhoto(e) {
    const fichier = e.target.files?.[0]
    if (!fichier) return
    setPhoto(fichier)
    setApercuPhoto(URL.createObjectURL(fichier))
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
          
          <div className="flex flex-col items-center mb-2">
            <label className="relative cursor-pointer group">
              <div className="w-20 h-20 rounded-2xl bg-paper border border-black/10 flex items-center justify-center overflow-hidden">
                {apercuPhoto ? (
                  <img src={apercuPhoto} alt="Produit" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={22} className="text-ink-faint" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera size={20} className="text-white" />
              </div>
              <input type="file" accept="image/*" onChange={choisirPhoto} className="hidden" />
            </label>
            <p className="text-xs text-ink-faint mt-2">Photo du produit (optionnel)</p>
          </div>
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
            <label className="block text-sm font-medium text-ink mb-1">Code-barres (optionnel)</label>
            <div className="flex gap-2">
              <input
                value={codeBarres}
                onChange={(e) => setCodeBarres(e.target.value)}
                className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="Ex: 3017620422003"
              />
              <button
                type="button"
                onClick={() => setScannerOuvert(true)}
                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-black/10 text-ink-soft hover:border-black/20 transition"
                title="Scanner le code-barres"
                >
                <ScanLine size={18} />
              </button>
            </div>
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
        {scannerOuvert && (
          <BarcodeScanner
            onFerme={() => setScannerOuvert(false)}
            onDetecte={(code) => { setCodeBarres(code); setScannerOuvert(false) }}
          />
        )}
      </div>
    </div>
  )
}