import { Fragment, useEffect, useState } from 'react'
import { Receipt } from 'lucide-react'
import apiClient from '../../lib/api/client'
import Pagination from '../../components/Pagination'
import EtatVide from '../../components/EtatVide'
import SquelletteTableau from '../../components/SquelletteTableau'

const LABELS_PAIEMENT = {
  especes: 'Espèces',
  wave: 'Wave',
  orange_money: 'Orange Money',
  credit: 'Crédit',
  autre: 'Autre',
}

export default function VentesHistoriquePage() {
  const [ventes, setVentes] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [chargement, setChargement] = useState(true)
  const [venteOuverte, setVenteOuverte] = useState(null)

  async function chargerVentes() {
    setChargement(true)
    const params = { page }
    if (dateDebut) params.date_debut = dateDebut
    if (dateFin) params.date_fin = dateFin

    const res = await apiClient.get('/ventes', { params })
    setVentes(res.data.data)
    setMeta(res.data.meta)
    setChargement(false)
  }

  useEffect(() => {
    chargerVentes()
  }, [page, dateDebut, dateFin])

  function formaterDate(iso) {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Historique des ventes</h1>

      <div className="flex gap-3 mb-4">
        <div>
          <label className="block text-xs text-ink-soft mb-1">Du</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => { setPage(1); setDateDebut(e.target.value) }}
            className="rounded-xl border border-black/10 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft mb-1">Au</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => { setPage(1); setDateFin(e.target.value) }}
            className="rounded-xl border border-black/10 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-black/5 overflow-hidden">
        {chargement ? (
          <SquelletteTableau colonnes={5} />
        ) : ventes.length === 0 ? (
          <EtatVide
            icone={Receipt}
            titre="Aucune vente sur cette période"
            description="Essaie d'élargir les dates, ou reviens ici après ta première vente."
          />
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-paper text-ink-soft text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Vendeur</th>
                <th className="px-4 py-3 font-medium">Paiement</th>
                <th className="px-4 py-3 font-medium">Articles</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {ventes.map((vente) => (
                <Fragment key={vente.id}>
                  <tr
                    onClick={() => setVenteOuverte(venteOuverte === vente.id ? null : vente.id)}
                    className="hover:bg-paper cursor-pointer transition"
                  >
                    <td className="px-4 py-3.5 text-ink">{formaterDate(vente.vendue_le)}</td>
                    <td className="px-4 py-3.5 text-ink-soft">{vente.vendeur?.nom}</td>
                    <td className="px-4 py-3.5 text-ink-soft">{LABELS_PAIEMENT[vente.mode_paiement]}</td>
                    <td className="px-4 py-3.5 text-ink-soft">{vente.lignes?.length} article(s)</td>
                    <td className="px-4 py-3.5 text-right font-medium text-ink">{vente.total} FCFA</td>
                  </tr>
                  {venteOuverte === vente.id && (
                    <tr className="bg-paper">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="space-y-1">
                          {vente.lignes?.map((ligne, i) => (
                            <div key={i} className="flex justify-between text-xs text-ink-soft">
                              <span>{ligne.quantite} × {ligne.produit_nom}</span>
                              <span>{ligne.sous_total} FCFA</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <Pagination meta={meta} onChangerPage={setPage} />
    </div>
  )
}