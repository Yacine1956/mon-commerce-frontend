import { useEffect, useState } from 'react'
import { Plus, X, Receipt } from 'lucide-react'
import apiClient from '../../lib/api/client'
import Pagination from '../../components/Pagination'
import EtatVide from '../../components/EtatVide'
import SquelletteTableau from '../../components/SquelletteTableau'
import useAuthStore from '../../lib/auth/authStore'

const TYPES_DEPENSE = [
  { valeur: 'achat_marchandise', label: 'Achat de marchandise' },
  { valeur: 'transport', label: 'Transport' },
  { valeur: 'electricite', label: 'Électricité' },
  { valeur: 'loyer', label: 'Loyer' },
  { valeur: 'salaires', label: 'Salaires' },
  { valeur: 'autre', label: 'Autre' },
]

function labelType(valeur) {
  return TYPES_DEPENSE.find((t) => t.valeur === valeur)?.label ?? valeur
}

export default function DepensesPage() {
  const { user } = useAuthStore()
  const estGestionnaire = user?.role === 'proprietaire' || user?.role === 'gestionnaire'

  const [depenses, setDepenses] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [chargement, setChargement] = useState(true)
  const [modalOuvert, setModalOuvert] = useState(false)

  async function chargerDepenses() {
    setChargement(true)
    const res = await apiClient.get('/depenses', { params: { page } })
    setDepenses(res.data.data)
    setMeta(res.data.meta)
    setChargement(false)
  }

  useEffect(() => {
    chargerDepenses()
  }, [page])

  function formaterDate(iso) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const totalPage = depenses.reduce((somme, d) => somme + d.montant, 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Dépenses</h1>
          {meta && <p className="text-sm text-ink-faint">{meta.total} dépense(s) au total</p>}
        </div>
        {estGestionnaire && (
          <button
            onClick={() => setModalOuvert(true)}
            className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
          >
            <Plus size={16} /> Ajouter une dépense
          </button>
        )}
      </div>

      <div className="bg-surface rounded-2xl border border-black/5 overflow-hidden">
        {chargement ? (
          <SquelletteTableau colonnes={4} />
        ) : depenses.length === 0 ? (
          <EtatVide
            icone={Receipt}
            titre="Aucune dépense enregistrée"
            description="Enregistre tes achats, factures et frais pour suivre ton vrai bénéfice."
          />
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-paper text-ink-soft text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {depenses.map((depense) => (
                <tr key={depense.id} className="hover:bg-paper transition">
                  <td className="px-4 py-3.5 text-ink-soft">{formaterDate(depense.depensee_le)}</td>
                  <td className="px-4 py-3.5 text-ink">{labelType(depense.type)}</td>
                  <td className="px-4 py-3.5 text-ink-soft">{depense.description || '—'}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-expense">
                    {depense.montant.toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
            {depenses.length > 0 && (
              <tfoot>
                <tr className="border-t border-black/5">
                  <td colSpan={3} className="px-4 py-3 text-ink-soft text-xs">Total de cette page</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink text-xs">
                    {totalPage.toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
          </div>
        )}
      </div>

      <Pagination meta={meta} onChangerPage={setPage} />

      {modalOuvert && (
        <DepenseFormModal
          onFerme={() => setModalOuvert(false)}
          onEnregistre={() => { setModalOuvert(false); chargerDepenses() }}
        />
      )}
    </div>
  )
}

function DepenseFormModal({ onFerme, onEnregistre }) {
  const [type, setType] = useState('achat_marchandise')
  const [montant, setMontant] = useState('')
  const [description, setDescription] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setEnregistrement(true)

    try {
      await apiClient.post('/depenses', {
        uuid_client: crypto.randomUUID(),
        type,
        montant: Number(montant),
        description: description || null,
      })
      onEnregistre()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue.')
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

        <h2 className="font-display text-lg font-semibold text-ink mb-5">Ajouter une dépense</h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Type de dépense</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              {TYPES_DEPENSE.map((t) => (
                <option key={t.valeur} value={t.valeur}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Montant (FCFA)</label>
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Description (optionnel)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Ex: Facture Senelec de septembre"
            />
          </div>

          {erreur && <p className="text-warning text-sm">{erreur}</p>}

          <button
            type="submit"
            disabled={enregistrement}
            className="w-full text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
          >
            {enregistrement ? 'Enregistrement...' : 'Ajouter la dépense'}
          </button>
        </form>
      </div>
    </div>
  )
}