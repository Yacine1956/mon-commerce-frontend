
import { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  CalendarDays,
  Wallet,
  Receipt,
} from 'lucide-react'
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

    dateDebut.setDate(
      dateDebut.getDate() - (periode - 1)
    )

    apiClient
      .get('/stats/benefices', {
        params: {
          date_debut: dateDebut.toISOString().slice(0, 10),
          date_fin: dateFin.toISOString().slice(0, 10),
        },
      })
      .then((res) => setDonnees(res.data))
      .catch((err) => {
        console.error('Erreur rapports:', err)
      })
      .finally(() => setChargement(false))
  }, [periode])

  const beneficeMax = donnees
    ? Math.max(
        1,
        ...donnees.jours.map((j) =>
          Math.abs(Number(j.benefice || 0))
        )
      )
    : 1

  function formaterJour(dateStr) {
    return new Date(dateStr).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
      }
    )
  }

  function formaterMontant(value) {
    return Number(value || 0).toLocaleString('fr-FR')
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F6F8FC] text-[#14233D]">

      <div className="w-full max-w-[1600px] mx-auto px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-7 xl:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="relative overflow-hidden rounded-[22px] sm:rounded-[28px] mb-4 sm:mb-6 bg-white border border-[#DCE3EC]">

          {/* Décoration */}
          <div className="absolute -right-20 -top-24 w-56 h-56 rounded-full border border-[#D8B66A]/10" />

          <div className="absolute right-10 -bottom-24 w-48 h-48 rounded-full bg-[#D8B66A]/[0.05]" />

          <div className="relative z-10 p-4 sm:p-6 lg:p-7">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              {/* Titre */}
              <div className="min-w-0">

                <div className="flex items-center gap-2 mb-2">

                  <div className="w-9 h-9 rounded-xl bg-[#071A33] flex items-center justify-center shrink-0">
                    <BarChart3
                      size={17}
                      className="text-[#E5C77D]"
                    />
                  </div>

                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A17B2C]">
                    Analyse commerciale
                  </span>

                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#14233D] tracking-tight">
                  Rapports
                </h1>

                <p className="text-xs sm:text-sm text-[#7A8799] mt-1">
                  Analysez les performances de votre commerce.
                </p>

              </div>

              {/* Périodes */}
              <div className="w-full sm:w-auto">

                <div className="flex items-center gap-2 mb-2">

                  <CalendarDays
                    size={14}
                    className="text-[#A17B2C]"
                  />

                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#7A8799]">
                    Période
                  </span>

                </div>

                <div className="grid grid-cols-3 sm:flex gap-1.5 sm:gap-2">

                  {PERIODES.map((p) => (

                    <button
                      key={p.valeur}
                      onClick={() => setPeriode(p.valeur)}
                      className="text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-xl border transition-all active:scale-95"
                      style={
                        periode === p.valeur
                          ? {
                              background:
                                'linear-gradient(135deg, #071A33, #123F76)',
                              color: 'white',
                              borderColor: 'transparent',
                              boxShadow:
                                '0 5px 15px rgba(7,26,51,.12)',
                            }
                          : {
                              background: '#F8FAFC',
                              color: '#5B6478',
                              borderColor: '#E1E6ED',
                            }
                      }
                    >
                      {p.label}
                    </button>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {chargement || !donnees ? (

          <div className="space-y-4">

            {/* KPI skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

              {[1, 2, 3].map((item) => (

                <div
                  key={item}
                  className="h-[125px] sm:h-[145px] rounded-[20px] bg-white border border-[#DCE3EC] animate-pulse"
                />

              ))}

            </div>

            {/* Graph skeleton */}
            <div className="h-[330px] sm:h-[400px] rounded-[22px] bg-white border border-[#DCE3EC] animate-pulse" />

            {/* Table skeleton */}
            <div className="h-[300px] rounded-[22px] bg-white border border-[#DCE3EC] animate-pulse" />

          </div>

        ) : (

          <>

            {/* =================================================
                TOTAUX
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">

              {/* CA */}
              <div className="relative overflow-hidden bg-white rounded-[20px] sm:rounded-[24px] border border-[#DCE3EC] p-4 sm:p-5">

                <div className="absolute right-0 top-0 w-24 h-24 rounded-bl-full bg-[#071A33]/[0.025]" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EDF3FA] flex items-center justify-center">
                      <Wallet
                        size={17}
                        className="text-[#315B91]"
                      />
                    </div>

                    <span className="text-[9px] uppercase tracking-wider text-[#9AA3B5]">
                      Total
                    </span>

                  </div>

                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#7A8799] mt-4">
                    Chiffre d'affaires
                  </p>

                  <p className="font-display text-xl sm:text-2xl font-semibold text-[#14233D] mt-1 truncate">
                    {formaterMontant(
                      donnees.total_chiffre_affaires
                    )}{' '}
                    <span className="text-[10px] sm:text-xs font-medium text-[#9AA3B5]">
                      FCFA
                    </span>
                  </p>

                </div>

              </div>

              {/* DEPENSES */}
              <div className="relative overflow-hidden bg-white rounded-[20px] sm:rounded-[24px] border border-[#DCE3EC] p-4 sm:p-5">

                <div className="absolute right-0 top-0 w-24 h-24 rounded-bl-full bg-[#244E87]/[0.025]" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F2F4F7] flex items-center justify-center">
                      <Receipt
                        size={17}
                        className="text-[#52657E]"
                      />
                    </div>

                    <span className="text-[9px] uppercase tracking-wider text-[#9AA3B5]">
                      Total
                    </span>

                  </div>

                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#7A8799] mt-4">
                    Dépenses
                  </p>

                  <p className="font-display text-xl sm:text-2xl font-semibold text-[#14233D] mt-1 truncate">
                    {formaterMontant(
                      donnees.total_depenses
                    )}{' '}
                    <span className="text-[10px] sm:text-xs font-medium text-[#9AA3B5]">
                      FCFA
                    </span>
                  </p>

                </div>

              </div>

              {/* BENEFICE */}
              <div
                className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 text-white"
                style={{
                  background:
                    'linear-gradient(135deg, #071A33 0%, #123F76 100%)',
                }}
              >

                <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full border border-[#D8B66A]/10" />

                <div className="absolute right-6 -bottom-16 w-36 h-36 rounded-full bg-[#D8B66A]/[0.07]" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D8B66A]/15 flex items-center justify-center">

                      {donnees.total_benefice >= 0 ? (
                        <TrendingUp
                          size={17}
                          className="text-[#E5C77D]"
                        />
                      ) : (
                        <TrendingDown
                          size={17}
                          className="text-[#E5C77D]"
                        />
                      )}

                    </div>

                    <span className="text-[9px] uppercase tracking-wider text-white/45">
                      Période
                    </span>

                  </div>

                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/55 mt-4 flex items-center gap-1.5">
                    {donnees.total_benefice >= 0 ? (
                      <TrendingUp size={13} />
                    ) : (
                      <TrendingDown size={13} />
                    )}

                    Bénéfice
                  </p>

                  <p className="font-display text-xl sm:text-2xl font-semibold mt-1 truncate">
                    {formaterMontant(
                      donnees.total_benefice
                    )}{' '}
                    <span className="text-[10px] sm:text-xs font-medium text-white/45">
                      FCFA
                    </span>
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                GRAPHIQUE
            ================================================= */}

            <div className="bg-white rounded-[22px] sm:rounded-[26px] border border-[#DCE3EC] p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 overflow-hidden">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h2 className="font-semibold text-sm sm:text-base text-[#14233D]">
                    Bénéfice par jour
                  </h2>

                  <p className="text-[10px] sm:text-xs text-[#9AA3B5] mt-1">
                    Évolution sur les {periode} derniers jours
                  </p>

                </div>

                <div className="flex items-center gap-1.5">

                  <div className="w-2 h-2 rounded-full bg-[#C49A42]" />

                  <span className="text-[9px] text-[#9AA3B5] hidden sm:block">
                    Positif
                  </span>

                </div>

              </div>

              {/* Zone graphique */}
              <div className="relative">

                <div className="flex items-end gap-[3px] sm:gap-1.5 h-40 sm:h-52 overflow-hidden">

                  {donnees.jours.map((jour) => {

                    const benefice =
                      Number(jour.benefice || 0)

                    const hauteur = Math.max(
                      4,
                      (Math.abs(benefice) /
                        beneficeMax) *
                        100
                    )

                    const positif = benefice >= 0

                    return (

                      <div
                        key={jour.date}
                        className="flex-1 min-w-0 flex flex-col items-center justify-end h-full group relative"
                      >

                        <div
                          className="w-full max-w-[30px] rounded-t-[4px] sm:rounded-t-md transition-all duration-300 group-hover:opacity-80"
                          style={{
                            height: `${hauteur}%`,
                            background: positif
                              ? 'linear-gradient(180deg, #D8B66A, #A17B2C)'
                              : 'linear-gradient(180deg, #52657E, #263750)',
                          }}
                        />

                        {/* Tooltip desktop */}
                        <div className="absolute bottom-full mb-2 hidden sm:group-hover:block bg-[#071A33] text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap z-20 shadow-lg">
                          {formaterJour(jour.date)} :{' '}
                          {formaterMontant(benefice)} FCFA
                        </div>

                      </div>

                    )
                  })}

                </div>

                {/* Dates */}
                <div className="flex gap-[3px] sm:gap-1.5 mt-2">

                  {donnees.jours.map((jour, index) => (

                    <div
                      key={jour.date}
                      className="flex-1 min-w-0 text-center"
                    >

                      <span className="text-[7px] sm:text-[9px] text-[#9AA3B5] block truncate">
                        {formaterJour(jour.date)}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

              {/* Légende mobile */}
              <div className="flex items-center justify-center gap-4 mt-5 sm:hidden">

                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#C49A42]" />
                  <span className="text-[9px] text-[#9AA3B5]">
                    Bénéfice positif
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#52657E]" />
                  <span className="text-[9px] text-[#9AA3B5]">
                    Bénéfice négatif
                  </span>
                </div>

              </div>

            </div>

            {/* =================================================
                TABLEAU DES DETAILS
            ================================================= */}

            <div className="bg-white rounded-[22px] sm:rounded-[26px] border border-[#DCE3EC] overflow-hidden">

              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#E8EDF3]">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-xl bg-[#F8F2E4] flex items-center justify-center">

                    <BarChart3
                      size={17}
                      className="text-[#A17B2C]"
                    />

                  </div>

                  <div>

                    <h2 className="font-semibold text-sm sm:text-base text-[#14233D]">
                      Détail jour par jour
                    </h2>

                    <p className="text-[10px] sm:text-xs text-[#9AA3B5] mt-0.5">
                      Résumé de votre activité
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  VERSION MOBILE
              ================================================= */}

              <div className="block sm:hidden">

                <div className="p-2.5">

                  {[...donnees.jours]
                    .reverse()
                    .map((jour) => {

                      const positif =
                        Number(jour.benefice || 0) >= 0

                      return (

                        <div
                          key={jour.date}
                          className="rounded-2xl p-3.5 hover:bg-[#F8FAFC] transition border-b border-[#EEF1F5] last:border-0"
                        >

                          {/* Date */}
                          <div className="flex items-center justify-between mb-3">

                            <div className="flex items-center gap-2">

                              <div className="w-8 h-8 rounded-lg bg-[#F3F6FA] flex items-center justify-center">

                                <CalendarDays
                                  size={14}
                                  className="text-[#52657E]"
                                />

                              </div>

                              <span className="text-xs font-semibold text-[#263750]">
                                {formaterJour(jour.date)}
                              </span>

                            </div>

                            <div
                              className={`flex items-center gap-1 text-xs font-semibold ${
                                positif
                                  ? 'text-[#397866]'
                                  : 'text-[#52657E]'
                              }`}
                            >

                              {positif ? (
                                <TrendingUp size={13} />
                              ) : (
                                <TrendingDown size={13} />
                              )}

                              {formaterMontant(
                                jour.benefice
                              )}{' '}
                              FCFA

                            </div>

                          </div>

                          {/* Données */}
                          <div className="grid grid-cols-2 gap-2">

                            <div className="rounded-xl bg-[#F7F9FC] px-3 py-2.5">

                              <p className="text-[9px] uppercase tracking-wider text-[#9AA3B5]">
                                CA
                              </p>

                              <p className="text-xs font-semibold text-[#263750] mt-1 truncate">
                                {formaterMontant(
                                  jour.chiffre_affaires
                                )}{' '}
                                FCFA
                              </p>

                            </div>

                            <div className="rounded-xl bg-[#F7F9FC] px-3 py-2.5">

                              <p className="text-[9px] uppercase tracking-wider text-[#9AA3B5]">
                                Dépenses
                              </p>

                              <p className="text-xs font-semibold text-[#52657E] mt-1 truncate">
                                {formaterMontant(
                                  jour.depenses
                                )}{' '}
                                FCFA
                              </p>

                            </div>

                          </div>

                        </div>

                      )
                    })}

                </div>

              </div>

              {/* =================================================
                  VERSION DESKTOP
              ================================================= */}

              <div className="hidden sm:block overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-[#F7F9FC] text-[#7A8799] text-left">

                    <tr>

                      <th className="px-4 lg:px-5 py-3 font-medium">
                        Date
                      </th>

                      <th className="px-4 lg:px-5 py-3 font-medium text-right">
                        Chiffre d'affaires
                      </th>

                      <th className="px-4 lg:px-5 py-3 font-medium text-right">
                        Dépenses
                      </th>

                      <th className="px-4 lg:px-5 py-3 font-medium text-right">
                        Bénéfice
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-[#EEF1F5]">

                    {[...donnees.jours]
                      .reverse()
                      .map((jour) => {

                        const positif =
                          Number(jour.benefice || 0) >= 0

                        return (

                          <tr
                            key={jour.date}
                            className="hover:bg-[#F8FAFC] transition"
                          >

                            <td className="px-4 lg:px-5 py-3 text-[#263750]">
                              {formaterJour(jour.date)}
                            </td>

                            <td className="px-4 lg:px-5 py-3 text-right text-[#5B6478]">
                              {formaterMontant(
                                jour.chiffre_affaires
                              )}{' '}
                              FCFA
                            </td>

                            <td className="px-4 lg:px-5 py-3 text-right text-[#7A8799]">
                              {formaterMontant(
                                jour.depenses
                              )}{' '}
                              FCFA
                            </td>

                            <td
                              className={`px-4 lg:px-5 py-3 text-right font-semibold ${
                                positif
                                  ? 'text-[#397866]'
                                  : 'text-[#52657E]'
                              }`}
                            >

                              <span className="inline-flex items-center gap-1.5">

                                {positif ? (
                                  <TrendingUp size={13} />
                                ) : (
                                  <TrendingDown size={13} />
                                )}

                                {formaterMontant(
                                  jour.benefice
                                )}{' '}
                                FCFA

                              </span>

                            </td>

                          </tr>

                        )
                      })}

                  </tbody>

                </table>

              </div>

            </div>

          </>

        )}

      </div>

    </div>
  )
}

