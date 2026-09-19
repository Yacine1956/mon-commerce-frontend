import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import apiClient from '../../lib/api/client'

const PERIODES = [
  { valeur: 7, label: '7 jours' },
  { valeur: 14, label: '14 jours' },
  { valeur: 30, label: '30 jours' },
]

export default function RapportsPage() {
  const [periode, setPeriode] = useState(14)
  const [donnees, setDonnees] = useState(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    setChargement(true)
    const dateFin = new Date()
    const dateDebut = new Date()
    dateDebut.setDate(dateDebut.getDate() - (periode - 1))

    apiClient
      .get('/stats/benefices', {
        params: {
          date_debut: dateDebut.toISOString().slice(0, 10),
          date_fin: dateFin.toISOString().slice(0, 10),
        },
      })
      .then((res) => setDonnees(res.data))
      .finally(() => setChargement(false))
  }, [periode])

  const beneficeMax = donnees
    ? Math.max(1, ...donnees.jours.map((j) => Math.abs(j.benefice)))
    : 1

  function formaterJour(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Rapports</h1>
        <div className="flex gap-2">
          {PERIODES.map((p) => (
            <button
              key={p.valeur}
              onClick={() => setPeriode(p.valeur)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border transition"
              style={
                periode === p.valeur
                  ? { background: 'linear-gradient(135deg, #172554, #101828)', color: 'white', borderColor: 'transparent' }
                  : { background: 'var(--color-surface)', color: 'var(--color-ink-soft)', borderColor: 'rgba(0,0,0,0.1)' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {chargement || !donnees ? (
        <p className="text-ink-faint text-sm">Chargement...</p>
      ) : (
        <>
          {/* Totaux de la période */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-surface rounded-2xl border border-black/5 p-5">
              <p className="text-sm text-ink-soft mb-1">Chiffre d'affaires</p>
              <p className="font-display text-xl font-semibold text-ink">
                {donnees.total_chiffre_affaires.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div className="bg-surface rounded-2xl border border-black/5 p-5">
              <p className="text-sm text-ink-soft mb-1">Dépenses</p>
              <p className="font-display text-xl font-semibold text-ink">
                {donnees.total_depenses.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div
              className="rounded-2xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
            >
              <p className="text-sm text-white/85 mb-1 flex items-center gap-1.5">
                {donnees.total_benefice >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                Bénéfice sur la période
              </p>
              <p className="font-display text-xl font-semibold">
                {donnees.total_benefice.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>

          {/* Graphique en barres du bénéfice quotidien */}
          <div className="bg-surface rounded-2xl border border-black/5 p-5 mb-6">
            <h2 className="font-medium text-ink mb-5">Bénéfice par jour</h2>
            <div className="flex items-end gap-1.5 h-40">
              {donnees.jours.map((jour) => {
                const hauteur = Math.max(4, (Math.abs(jour.benefice) / beneficeMax) * 100)
                const positif = jour.benefice >= 0
                return (
                  <div key={jour.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div
                      className="w-full rounded-t-md transition-opacity group-hover:opacity-80"
                      style={{
                        height: `${hauteur}%`,
                        background: positif
                          ? 'linear-gradient(180deg, #C9A96E, #9A8050)'
                          : '#B91C1C',
                      }}
                    />
                    {/* Infobulle au survol */}
                    <div className="absolute bottom-full mb-1.5 hidden group-hover:block bg-ink text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap z-10">
                      {formaterJour(jour.date)} : {jour.benefice.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-1.5 mt-2">
              {donnees.jours.map((jour) => (
                <div key={jour.date} className="flex-1 text-center">
                  <span className="text-[9px] text-ink-faint">{formaterJour(jour.date)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Détail jour par jour */}
          <div className="bg-surface rounded-2xl border border-black/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper text-ink-soft text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Chiffre d'affaires</th>
                  <th className="px-4 py-3 font-medium text-right">Dépenses</th>
                  <th className="px-4 py-3 font-medium text-right">Bénéfice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {[...donnees.jours].reverse().map((jour) => (
                  <tr key={jour.date} className="hover:bg-paper transition">
                    <td className="px-4 py-3 text-ink">{formaterJour(jour.date)}</td>
                    <td className="px-4 py-3 text-right text-ink-soft">{jour.chiffre_affaires.toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-4 py-3 text-right text-expense">{jour.depenses.toLocaleString('fr-FR')} FCFA</td>
                    <td className={`px-4 py-3 text-right font-medium ${jour.benefice >= 0 ? 'text-positive' : 'text-warning'}`}>
                      {jour.benefice.toLocaleString('fr-FR')} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}