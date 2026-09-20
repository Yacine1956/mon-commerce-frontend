
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Receipt,
  ArrowUpRight,
  Package,
  Sparkles,
  ChevronRight,
  CircleDollarSign,
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'

import apiClient from '../../lib/api/client'
import useAuthStore from '../../lib/auth/authStore'

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

/* =========================================================
   MINI SPARKLINE
========================================================= */

function Sparkline({ type = 'up', dark = false }) {
  const paths = {
    up: 'M2 31 C15 29, 18 23, 29 25 C40 27, 44 15, 55 18 C66 21, 72 8, 84 11 C94 14, 100 4, 112 2',
    down: 'M2 8 C15 5, 19 13, 30 11 C42 9, 48 20, 59 17 C70 14, 78 27, 89 23 C99 20, 104 29, 112 31',
  }

  return (
    <svg
      viewBox="0 0 114 34"
      className="w-[82px] h-[28px] sm:w-[114px] sm:h-[34px]"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={paths[type]}
        stroke={dark ? 'rgba(255,255,255,.7)' : '#244E87'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const [donnees, setDonnees] = useState(null)
  const { boutique } = useAuthStore()

  useEffect(() => {
    apiClient
      .get('/dashboard')
      .then((res) => setDonnees(res.data))
      .catch((err) => {
        console.error('Erreur dashboard:', err)
      })
  }, [])

  /* =========================================================
     FORMATAGE
  ========================================================= */

  const money = (value) =>
    Number(value || 0).toLocaleString('fr-FR')

  const ca = donnees?.chiffre_affaires_jour || 0
  const depenses = donnees?.depenses_jour || 0
  const benefice = donnees?.benefice_estime_jour || 0
  const ventes = donnees?.nombre_ventes_jour || 0

  const produitsVendus =
    donnees?.produits_plus_vendus || []

  const produitsRupture =
    donnees?.produits_bientot_rupture || []

  /* =========================================================
     LOADING
  ========================================================= */

  if (!donnees) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] text-[#14233D]">
        <div className="w-full max-w-[1600px] mx-auto px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-7 xl:px-8">

          {/* Header skeleton */}
          <div className="h-[235px] sm:h-[250px] rounded-[22px] sm:rounded-[30px] bg-[#0B2A52] animate-pulse mb-4 sm:mb-6" />

          {/* KPI skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[155px] sm:h-[175px] rounded-[18px] sm:rounded-[24px] bg-white border border-[#DCE3EC] animate-pulse"
              />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-3 sm:gap-5">
            <div className="h-[380px] rounded-[22px] sm:rounded-[26px] bg-white animate-pulse" />
            <div className="h-[380px] rounded-[22px] sm:rounded-[26px] bg-white animate-pulse" />
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F6F8FC] text-[#14233D]">

      <div className="w-full max-w-[1600px] mx-auto px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-7 xl:px-8 xl:py-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative overflow-hidden rounded-[22px] sm:rounded-[30px] mb-4 sm:mb-6"
          style={{
            background:
              'linear-gradient(135deg, #071A33 0%, #0B2A52 52%, #123F76 100%)',
          }}
        >

          {/* Décorations */}
          <div className="absolute -right-24 -top-28 w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full border border-white/[0.08]" />

          <div className="absolute -right-4 -top-12 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full border border-white/[0.07]" />

          <div className="absolute right-[20%] sm:right-[28%] -bottom-28 w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] rounded-full bg-[#D8B66A]/[0.08]" />

          <div className="absolute right-[32%] top-10 w-2 h-2 rounded-full bg-[#E6C982]" />

          <div className="absolute right-[20%] bottom-10 w-1.5 h-1.5 rounded-full bg-white/30" />

          <div className="relative z-10 p-5 sm:p-7 lg:p-8">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">

              {/* =================================================
                  TEXTE
              ================================================= */}

              <div className="min-w-0">

                <div className="flex items-center gap-2 mb-3">

                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Sparkles
                      size={14}
                      className="text-[#E5C77D]"
                    />
                  </div>

                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/50">
                    Tableau de bord
                  </span>

                </div>

                <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.18em] text-[#D9BD79] mb-1">
                  Bienvenue Chez
                </p>

                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight break-words">
                  {boutique?.nom || 'Ma boutique'}
                </h1>

                <p className="text-xs sm:text-sm text-white/55 mt-2 max-w-[290px] sm:max-w-none">
                  Voici un aperçu de votre activité aujourd'hui.
                </p>

              </div>

              {/* =================================================
                  INFORMATIONS PERIODE
              ================================================= */}

              <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto">

                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.07] backdrop-blur-sm px-3 py-2.5 sm:px-5 sm:py-3.5 min-w-0">

                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40">
                    Période
                  </p>

                  <p className="text-xs sm:text-sm font-semibold text-white mt-1 truncate">
                    Aujourd'hui
                  </p>

                </div>

                <div className="rounded-xl sm:rounded-2xl bg-[#D8B66A] px-3 py-2.5 sm:px-5 sm:py-3.5 text-[#132844] shadow-lg shadow-black/10 min-w-0">

                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider opacity-60">
                    Espace
                  </p>

                  <p className="text-xs sm:text-sm font-bold mt-1 truncate">
                    {boutique?.nom || 'SenNoflaye'}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </motion.section>

        {/* =====================================================
            KPI
        ===================================================== */}

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-5"
        >

          {/* =================================================
              CA
          ================================================= */}

          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-[18px] sm:rounded-[24px] p-3.5 sm:p-5 text-white group hover:-translate-y-1 transition-all duration-300 shadow-[0_15px_40px_rgba(7,26,51,.12)]"
            style={{
              background:
                'linear-gradient(145deg, #071A33, #103662)',
            }}
          >

            <div className="absolute right-0 top-0 w-24 h-24 sm:w-32 sm:h-32 rounded-bl-[100px] bg-white/[0.035]" />

            <div className="relative flex items-start justify-between">

              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center">

                <CircleDollarSign
                  size={17}
                  className="sm:w-5 sm:h-5 text-[#E5C77D]"
                />

              </div>

              <ArrowUpRight
                size={15}
                className="sm:w-[17px] sm:h-[17px] text-[#DDBD70]"
              />

            </div>

            <div className="relative mt-4 sm:mt-5 min-w-0">

              <p className="text-[9px] sm:text-xs text-white/50 uppercase tracking-wider">
                Chiffre d'affaires
              </p>

              <div className="flex items-baseline gap-1 mt-1 min-w-0">

                <span className="font-display text-[19px] sm:text-[28px] font-semibold truncate">
                  {money(ca)}
                </span>

                <span className="text-[9px] sm:text-[11px] text-white/45 shrink-0">
                  FCFA
                </span>

              </div>

            </div>

            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 opacity-60 sm:opacity-80 scale-75 sm:scale-100 origin-bottom-right">
              <Sparkline dark />
            </div>

          </motion.div>

          {/* =================================================
              DEPENSES
          ================================================= */}

          <motion.div
            variants={fadeUp}
            className="bg-white rounded-[18px] sm:rounded-[24px] border border-[#DCE3EC] p-3.5 sm:p-5 group hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(7,26,51,.07)] transition-all duration-300"
          >

            <div className="flex items-start justify-between">

              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#EDF3FA] flex items-center justify-center">

                <Receipt
                  size={17}
                  className="sm:w-[19px] sm:h-[19px] text-[#315B91]"
                />

              </div>

              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400">
                Jour
              </span>

            </div>

            <div className="mt-4 sm:mt-5 min-w-0">

              <p className="text-[9px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
                Dépenses
              </p>

              <div className="flex items-baseline gap-1 mt-1 min-w-0">

                <span className="font-display text-[19px] sm:text-[28px] font-semibold text-[#14233D] truncate">
                  {money(depenses)}
                </span>

                <span className="text-[9px] sm:text-[11px] text-slate-400 shrink-0">
                  FCFA
                </span>

              </div>

            </div>

            <div className="flex justify-end mt-1 sm:mt-2 opacity-70">
              <Sparkline type="down" />
            </div>

          </motion.div>

          {/* =================================================
              BENEFICE
          ================================================= */}

          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-[18px] sm:rounded-[24px] p-3.5 sm:p-5 text-white group hover:-translate-y-1 transition-all duration-300 shadow-[0_15px_40px_rgba(7,26,51,.15)]"
            style={{
              background:
                'linear-gradient(145deg, #132F54 0%, #0A2140 100%)',
            }}
          >

            <div className="absolute -right-12 -top-12 w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-[#D8B66A]/10" />

            <div className="absolute right-8 -bottom-20 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#D8B66A]/[0.06]" />

            <div className="relative flex items-start justify-between">

              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#D8B66A]/15 flex items-center justify-center">

                <TrendingUp
                  size={17}
                  className="sm:w-[19px] sm:h-[19px] text-[#E5C77D]"
                />

              </div>

              <span className="px-2 py-1 rounded-full bg-white/10 text-[8px] sm:text-[9px] uppercase tracking-wider text-white/60">
                Estimé
              </span>

            </div>

            <div className="relative mt-4 sm:mt-5 min-w-0">

              <p className="text-[9px] sm:text-xs text-white/50 uppercase tracking-wider">
                Bénéfice estimé
              </p>

              <div className="flex items-baseline gap-1 mt-1 min-w-0">

                <span className="font-display text-[19px] sm:text-[28px] font-semibold truncate">
                  {money(benefice)}
                </span>

                <span className="text-[9px] sm:text-[11px] text-white/40 shrink-0">
                  FCFA
                </span>

              </div>

            </div>

            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 opacity-60 sm:opacity-80 scale-75 sm:scale-100 origin-bottom-right">
              <Sparkline dark />
            </div>

          </motion.div>

          {/* =================================================
              VENTES
          ================================================= */}

          <motion.div
            variants={fadeUp}
            className="bg-white rounded-[18px] sm:rounded-[24px] border border-[#DCE3EC] p-3.5 sm:p-5 group hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(7,26,51,.07)] transition-all duration-300"
          >

            <div className="flex items-start justify-between">

              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#F8F2E4] flex items-center justify-center">

                <ShoppingBag
                  size={17}
                  className="sm:w-[19px] sm:h-[19px] text-[#A17B2C]"
                />

              </div>

              <ArrowUpRight
                size={15}
                className="sm:w-[17px] sm:h-[17px] text-[#A17B2C]"
              />

            </div>

            <div className="mt-4 sm:mt-5">

              <p className="text-[9px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
                Ventes
              </p>

              <div className="flex items-baseline gap-2 mt-1">

                <span className="font-display text-[22px] sm:text-[28px] font-semibold text-[#14233D]">
                  {ventes}
                </span>

                <span className="text-[9px] sm:text-[11px] text-slate-400 truncate">
                  aujourd'hui
                </span>

              </div>

            </div>

            <div className="mt-3 sm:mt-4 flex items-center gap-2">

              <div className="h-1.5 flex-1 rounded-full bg-[#E8EDF4] overflow-hidden">

                <div
                  className="h-full rounded-full bg-[#244E87] transition-all duration-500"
                  style={{
                    width: `${Math.min(ventes * 5, 100)}%`,
                  }}
                />

              </div>

              <span className="hidden sm:block text-[10px] text-slate-400">
                activité
              </span>

            </div>

          </motion.div>

        </motion.div>

        {/* =====================================================
            DEUX COLONNES
        ===================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-3 sm:gap-5">

          {/* =================================================
              PRODUITS
          ================================================= */}

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-[22px] sm:rounded-[26px] border border-[#DCE3EC] overflow-hidden"
          >

            <div className="p-4 sm:p-6 border-b border-[#E8EDF3]">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3 min-w-0">

                  <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl sm:rounded-2xl bg-[#F8F2E4] flex items-center justify-center">

                    <BarChart3
                      size={18}
                      className="sm:w-[19px] sm:h-[19px] text-[#A17B2C]"
                    />

                  </div>

                  <div className="min-w-0">

                    <h2 className="font-semibold text-sm sm:text-base text-[#14233D] truncate">
                      Produits les plus vendus
                    </h2>

                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
                      Votre activité commerciale aujourd'hui
                    </p>

                  </div>

                </div>

                <Link
                  to="/produits"
                  className="hidden sm:flex shrink-0 items-center gap-1 text-xs font-semibold text-[#244E87] hover:text-[#142F59] transition"
                >
                  Voir tout
                  <ChevronRight size={14} />
                </Link>

              </div>

            </div>

            {produitsVendus.length === 0 ? (

              <div className="py-14 sm:py-16 text-center px-6">

                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-[#F3F6FA] flex items-center justify-center">

                  <ShoppingBag
                    size={22}
                    className="sm:w-6 sm:h-6 text-slate-300"
                  />

                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#24344E]">
                  Aucune vente aujourd'hui
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Vos produits vendus apparaîtront ici.
                </p>

              </div>

            ) : (

              <div className="p-2.5 sm:p-4">

                {produitsVendus.map((produit, index) => {

                  const maxVentes = Math.max(
                    ...produitsVendus.map(
                      (p) => Number(p.quantite_vendue || 0)
                    ),
                    1
                  )

                  const progression =
                    (Number(produit.quantite_vendue || 0) /
                      maxVentes) *
                    100

                  return (
                    <motion.div
                      key={produit.id}
                      initial={{
                        opacity: 0,
                        x: -12,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: 0.3 + index * 0.06,
                      }}
                      className="group px-2.5 sm:px-3 py-3 sm:py-3.5 rounded-2xl hover:bg-[#F7F9FC] transition-colors"
                    >

                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">

                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                            index === 0
                              ? 'bg-[#F8F2E4] text-[#A17B2C]'
                              : 'bg-[#EDF2F8] text-[#55708F]'
                          }`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center justify-between gap-2">

                            <div className="min-w-0">

                              <p className="text-xs sm:text-sm font-semibold text-[#263750] truncate">
                                {produit.nom}
                              </p>

                              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                                {produit.quantite_vendue} vendu(s)
                              </p>

                            </div>

                            <span className="text-[11px] sm:text-xs font-semibold text-[#263750] shrink-0">
                              {produit.quantite_vendue}
                            </span>

                          </div>

                          <div className="mt-2 h-1.5 rounded-full bg-[#E9EEF5] overflow-hidden">

                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${progression}%`,
                              }}
                              transition={{
                                duration: 0.7,
                                delay:
                                  0.35 +
                                  index * 0.06,
                              }}
                              className={`h-full rounded-full ${
                                index === 0
                                  ? 'bg-[#C49A42]'
                                  : 'bg-[#244E87]'
                              }`}
                            />

                          </div>

                        </div>

                      </div>

                    </motion.div>
                  )
                })}

              </div>
            )}

          </motion.section>

          {/* =================================================
              STOCK
          ================================================= */}

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="bg-white rounded-[22px] sm:rounded-[26px] border border-[#DCE3EC] overflow-hidden"
          >

            <div className="p-4 sm:p-6 border-b border-[#E8EDF3]">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3 min-w-0">

                  <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl sm:rounded-2xl bg-[#FFF5DE] flex items-center justify-center">

                    <AlertTriangle
                      size={18}
                      className="sm:w-[19px] sm:h-[19px] text-[#AD8127]"
                    />

                  </div>

                  <div className="min-w-0">

                    <h2 className="font-semibold text-sm sm:text-base text-[#14233D]">
                      Alertes de stock
                    </h2>

                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                      Produits à surveiller
                    </p>

                  </div>

                </div>

                {produitsRupture.length > 0 && (
                  <span className="min-w-6 h-6 px-2 rounded-full bg-[#FFF1CF] text-[#9A7021] text-[10px] font-bold flex items-center justify-center shrink-0">
                    {produitsRupture.length}
                  </span>
                )}

              </div>

            </div>

            {produitsRupture.length === 0 ? (

              <div className="py-14 sm:py-16 px-6 text-center">

                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-[#EAF4F0] flex items-center justify-center">

                  <Package
                    size={22}
                    className="sm:w-6 sm:h-6 text-[#397866]"
                  />

                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#24344E]">
                  Stock en ordre
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Aucun produit n'est bientôt en rupture.
                </p>

              </div>

            ) : (

              <div className="p-2.5 sm:p-4">

                {produitsRupture.map((produit) => (
                  <div
                    key={produit.id}
                    className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl hover:bg-[#F8F9FB] transition"
                  >

                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-[#F5F7FA] flex items-center justify-center">

                      <Package
                        size={16}
                        className="sm:w-[17px] sm:h-[17px] text-[#516983]"
                      />

                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-xs sm:text-sm font-semibold text-[#263750] truncate">
                        {produit.nom}
                      </p>

                      <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                        Stock actuel
                      </p>

                    </div>

                    <span className="shrink-0 px-2 sm:px-3 py-1.5 rounded-full bg-[#FFF2D4] text-[#9B7324] font-semibold text-[9px] sm:text-[10px]">
                      {produit.stock_actuel} restant(s)
                    </span>

                  </div>
                ))}

              </div>
            )}

            <div className="p-3 sm:p-5 pt-1">

              <Link
                to="/produits"
                className="group flex items-center justify-between w-full rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-3.5 text-white transition-all hover:shadow-lg hover:shadow-[#071A33]/15"
                style={{
                  background:
                    'linear-gradient(135deg, #071A33, #123F76)',
                }}
              >

                <div className="flex items-center gap-2.5">

                  <Package size={16} />

                  <span className="text-xs font-semibold">
                    Gérer les produits
                  </span>

                </div>

                <ArrowUpRight
                  size={16}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
                />

              </Link>

            </div>

          </motion.section>

        </div>

        {/* =====================================================
            BLOC CONSEIL
        ===================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden mt-4 sm:mt-5 rounded-[22px] sm:rounded-[26px] p-4 sm:p-6 lg:p-7"
          style={{
            background:
              'linear-gradient(120deg, #091E39 0%, #102F55 65%, #173F70 100%)',
          }}
        >

          <div className="absolute -right-20 -top-20 w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-white/[0.06]" />

          <div className="absolute right-24 -bottom-32 w-60 h-60 sm:w-72 sm:h-72 rounded-full bg-[#D8B66A]/[0.06]" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div className="flex items-start gap-3 sm:gap-4 min-w-0">

              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-2xl bg-[#D8B66A]/15 flex items-center justify-center">

                <Sparkles
                  size={18}
                  className="sm:w-5 sm:h-5 text-[#E5C77D]"
                />

              </div>

              <div className="min-w-0">

                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#D8B66A] font-semibold">
                  SenNoflaye
                </p>

                <h3 className="text-base sm:text-lg font-semibold text-white mt-1">
                  Gardez un œil sur votre activité.
                </h3>

                <p className="text-[11px] sm:text-xs text-white/50 mt-1 max-w-xl">
                  Suivez vos ventes, surveillez vos stocks et
                  gardez une vision claire de votre commerce.
                </p>

              </div>

            </div>

            <Link
              to="/produits"
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#D8B66A] hover:bg-[#E4C982] text-[#10233D] px-4 sm:px-5 py-3 text-xs font-bold transition"
            >
              Voir mes produits
              <ArrowUpRight size={15} />
            </Link>

          </div>

        </motion.section>

      </div>

    </div>
  )
}

