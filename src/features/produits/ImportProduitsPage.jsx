import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'
import {
  Upload,
  Download,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import apiClient from '../../lib/api/client'
import useAuthStore from '../../lib/auth/authStore'

/* =========================================================
   CHAMPS ATTENDUS + SYNONYMES POUR LA DÉTECTION AUTOMATIQUE
========================================================= */

const CHAMPS = [
  { cle: 'nom', label: 'Nom du produit', requis: true, synonymes: ['nom', 'produit', 'designation', 'article', 'libelle', 'name', 'description'] },
  { cle: 'categorie', label: 'Catégorie', requis: false, synonymes: ['categorie', 'famille', 'rayon', 'category', 'type'] },
  { cle: 'code_barres', label: 'Code-barres', requis: false, synonymes: ['codebarres', 'codebarre', 'ean', 'barcode', 'code', 'gencode', 'upc'] },
  { cle: 'prix_achat', label: "Prix d'achat", requis: true, synonymes: ['prixachat', 'prixdachat', 'achat', 'pa', 'cout', 'coutachat', 'purchaseprice'] },
  { cle: 'prix_vente', label: 'Prix de vente', requis: true, synonymes: ['prixvente', 'prixdevente', 'vente', 'pv', 'prix', 'price', 'prixttc'] },
  { cle: 'stock', label: 'Stock', requis: false, synonymes: ['stock', 'quantite', 'qte', 'qty', 'stockinitial', 'disponible'] },
  { cle: 'seuil_alerte', label: "Seuil d'alerte", requis: false, synonymes: ['seuil', 'seuilalerte', 'alerte', 'stockmin', 'stockminimum', 'minimum'] },
]

const TAILLE_LOT = 100

/* =========================================================
   FONCTIONS UTILITAIRES (pures)
========================================================= */

const normaliser = (texte) =>
  String(texte ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')

/**
 * Convertit une valeur de cellule en entier (FCFA). Tolère les espaces
 * ("1 500"), les séparateurs de milliers ("1.500", "1,500"), le suffixe
 * "FCFA", et arrondit les éventuelles décimales ("1500,50").
 * Renvoie null si la cellule est vide, NaN si elle est illisible.
 */
export function parseEntier(valeur) {
  if (valeur === '' || valeur === null || valeur === undefined) return null

  let texte = String(valeur).replace(/\s/g, '').replace(/fcfa|cfa/gi, '')
  if (texte === '') return null

  // Séparateur suivi de 1 ou 2 chiffres en fin de texte = partie décimale
  if (/[.,]\d{1,2}$/.test(texte)) {
    const nombre = Number(texte.replace(',', '.').replace(/[^0-9.\-]/g, ''))
    return Number.isFinite(nombre) ? Math.round(nombre) : NaN
  }

  const chiffres = texte.replace(/[^0-9\-]/g, '')
  if (chiffres === '' || chiffres === '-') return NaN
  return parseInt(chiffres, 10)
}

function detecterMapping(entetes) {
  const mapping = {}
  const utilises = new Set()

  CHAMPS.forEach((champ) => {
    const synonymes = champ.synonymes.map(normaliser)
    const index = entetes.findIndex((entete, i) => !utilises.has(i) && synonymes.includes(normaliser(entete)))

    if (index >= 0) {
      mapping[champ.cle] = String(index)
      utilises.add(index)
    } else {
      mapping[champ.cle] = ''
    }
  })

  return mapping
}

async function lireFichier(fichier) {
  const buffer = await fichier.arrayBuffer()
  let classeur

  if (/\.csv$/i.test(fichier.name)) {
    // Un CSV enregistré par Excel est souvent en windows-1252 plutôt qu'en
    // UTF-8 : on essaie UTF-8 strict d'abord, sinon on retombe dessus pour
    // ne pas casser les accents (é, è, à...).
    let texte
    try {
      texte = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
    } catch {
      texte = new TextDecoder('windows-1252').decode(buffer)
    }
    classeur = XLSX.read(texte, { type: 'string' })
  } else {
    classeur = XLSX.read(buffer, { type: 'array' })
  }

  const feuille = classeur.Sheets[classeur.SheetNames[0]]
  const matrice = XLSX.utils.sheet_to_json(feuille, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: true,
  })

  if (matrice.length < 2) {
    throw new Error('Le fichier est vide ou ne contient que la ligne des titres.')
  }

  const entetes = matrice[0].map((entete, i) => String(entete).trim() || `Colonne ${i + 1}`)

  const lignes = matrice
    .slice(1)
    .map((cellules, i) => ({ numero: i + 2, cellules }))
    .filter((ligne) => ligne.cellules.some((cellule) => String(cellule).trim() !== ''))

  if (lignes.length === 0) {
    throw new Error('Aucun produit trouvé dans ce fichier.')
  }

  return { entetes, lignes }
}

function analyserLignes(lignes, mapping) {
  const lire = (ligne, cle) => {
    const index = mapping[cle]
    if (index === '' || index === undefined) return ''
    return String(ligne.cellules[Number(index)] ?? '').trim()
  }

  const invalide = (nombre) => nombre === null || Number.isNaN(nombre) || nombre < 0

  const nomsVus = new Map()
  const codesVus = new Map()

  return lignes.map((ligne) => {
    const nom = lire(ligne, 'nom')
    const categorie = lire(ligne, 'categorie')
    const code = lire(ligne, 'code_barres')
    const prixAchat = parseEntier(lire(ligne, 'prix_achat'))
    const prixVente = parseEntier(lire(ligne, 'prix_vente'))

    const stockBrut = lire(ligne, 'stock')
    const seuilBrut = lire(ligne, 'seuil_alerte')
    const stock = stockBrut === '' ? 0 : parseEntier(stockBrut)
    const seuil = seuilBrut === '' ? 5 : parseEntier(seuilBrut)

    let erreur = null

    if (!nom) erreur = 'Nom manquant'
    else if (invalide(prixAchat)) erreur = "Prix d'achat manquant ou invalide"
    else if (invalide(prixVente)) erreur = 'Prix de vente manquant ou invalide'
    else if (prixVente < prixAchat) erreur = "Prix de vente inférieur au prix d'achat"
    else if (invalide(stock)) erreur = 'Stock invalide'
    else if (invalide(seuil)) erreur = "Seuil d'alerte invalide"
    else if (nomsVus.has(nom.toLowerCase())) erreur = `Doublon du produit de la ligne ${nomsVus.get(nom.toLowerCase())}`
    else if (code && codesVus.has(code)) erreur = `Code-barres déjà présent ligne ${codesVus.get(code)}`

    if (!erreur) {
      nomsVus.set(nom.toLowerCase(), ligne.numero)
      if (code) codesVus.set(code, ligne.numero)
    }

    return {
      ligne: ligne.numero,
      erreur,
      valeurs: {
        nom,
        categorie: categorie || null,
        code_barres: code || null,
        prix_achat: prixAchat,
        prix_vente: prixVente,
        stock,
        seuil_alerte: seuil,
      },
    }
  })
}

function telechargerModele() {
  const lignes = [
    ['nom', 'categorie', 'code_barres', 'prix_achat', 'prix_vente', 'stock', 'seuil_alerte'],
    ['Huile 1L', 'Alimentaire', '', 1200, 1500, 25, 5],
    ['Savon Palmida', 'Hygiène', '', 250, 350, 40, 5],
    ['Coca-Cola 33cl', 'Boissons', '5449000000996', 300, 400, 60, 10],
  ]

  const feuille = XLSX.utils.aoa_to_sheet(lignes)
  feuille['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 12 }]

  const classeur = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(classeur, feuille, 'Produits')
  XLSX.writeFile(classeur, 'modele-import-produits.xlsx')
}

const formaterNombre = (valeur) =>
  typeof valeur === 'number' && Number.isFinite(valeur) ? valeur.toLocaleString('fr-FR') : '—'

/* =========================================================
   PAGE
========================================================= */

const ETAPES = ['Fichier', 'Colonnes', 'Aperçu', 'Import']
const INDEX_ETAPE = { upload: 0, mapping: 1, apercu: 2, import: 3, termine: 3 }

export default function ImportProduitsPage() {
  const { user } = useAuthStore()
  const estGestionnaire = user?.role === 'proprietaire' || user?.role === 'gestionnaire'

  const [etape, setEtape] = useState('upload')
  const [nomFichier, setNomFichier] = useState('')
  const [donnees, setDonnees] = useState(null) // { entetes, lignes }
  const [mapping, setMapping] = useState({})
  const [erreurFichier, setErreurFichier] = useState('')
  const [lecture, setLecture] = useState(false)
  const [seulementErreurs, setSeulementErreurs] = useState(false)
  const [progression, setProgression] = useState(0)
  const [resultat, setResultat] = useState(null)

  const analyse = useMemo(
    () => (donnees ? analyserLignes(donnees.lignes, mapping) : []),
    [donnees, mapping]
  )

  const valides = analyse.filter((ligne) => !ligne.erreur)
  const enErreur = analyse.filter((ligne) => ligne.erreur)
  const requisManquants = CHAMPS.filter((champ) => champ.requis && mapping[champ.cle] === '')

  async function choisirFichier(e) {
    const fichier = e.target.files?.[0]
    e.target.value = ''
    if (!fichier) return

    setErreurFichier('')
    setLecture(true)

    try {
      const lu = await lireFichier(fichier)
      setDonnees(lu)
      setMapping(detecterMapping(lu.entetes))
      setNomFichier(fichier.name)
      setEtape('mapping')
    } catch (err) {
      setErreurFichier(err.message || "Impossible de lire ce fichier. Utilise un fichier Excel (.xlsx) ou CSV.")
    } finally {
      setLecture(false)
    }
  }

  function recommencer() {
    setEtape('upload')
    setDonnees(null)
    setMapping({})
    setNomFichier('')
    setResultat(null)
    setProgression(0)
    setSeulementErreurs(false)
  }

  async function lancerImport() {
    setEtape('import')
    setProgression(0)

    let crees = 0
    const erreursServeur = []

    for (let i = 0; i < valides.length; i += TAILLE_LOT) {
      const lot = valides.slice(i, i + TAILLE_LOT).map((ligne) => ({ ligne: ligne.ligne, ...ligne.valeurs }))

      try {
        const res = await apiClient.post('/produits/import-lot', { produits: lot })
        crees += res.data.crees
        erreursServeur.push(...res.data.erreurs)
      } catch (err) {
        const raison = err.response?.data?.message || 'Erreur de connexion'
        lot.forEach((produit) => erreursServeur.push({ ligne: produit.ligne, raison }))
      }

      setProgression(Math.min(100, Math.round(((i + TAILLE_LOT) / valides.length) * 100)))
    }

    setResultat({ crees, erreursServeur })
    setEtape('termine')
  }

  if (!estGestionnaire) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">Importer des produits</h1>
        <p className="text-ink-soft text-sm">Seuls le propriétaire et les gestionnaires peuvent importer des produits.</p>
      </div>
    )
  }

  const lignesAffichees = (seulementErreurs ? enErreur : analyse).slice(0, 100)

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <Link to="/produits" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-4">
        <ArrowLeft size={15} /> Retour aux produits
      </Link>

      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Importer des produits</h1>
      <p className="text-sm text-ink-faint mb-6">Ajoute des centaines de produits d'un coup depuis un fichier Excel ou CSV.</p>

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2 mb-8">
        {ETAPES.map((nom, i) => {
          const actuelle = INDEX_ETAPE[etape]
          const faite = i < actuelle || etape === 'termine'
          return (
            <div key={nom} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    faite ? 'bg-positive text-white' : i === actuelle ? 'text-white' : 'bg-black/5 text-ink-faint'
                  }`}
                  style={i === actuelle && !faite ? { background: 'linear-gradient(135deg, #172554, #101828)' } : undefined}
                >
                  {faite ? <Check size={13} /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === actuelle ? 'text-ink font-medium' : 'text-ink-faint'}`}>{nom}</span>
              </div>
              {i < ETAPES.length - 1 && <div className="h-px flex-1 bg-black/10" />}
            </div>
          )
        })}
      </div>

      {/* ============ ÉTAPE 1 : FICHIER ============ */}
      {etape === 'upload' && (
        <div className="space-y-4">
          <label className="block bg-surface rounded-2xl border-2 border-dashed border-black/10 hover:border-accent-400 transition cursor-pointer p-8 sm:p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent-100 flex items-center justify-center mx-auto mb-4">
              <Upload size={22} className="text-accent-600" />
            </div>
            <p className="font-medium text-ink mb-1">{lecture ? 'Lecture du fichier...' : 'Choisis ton fichier'}</p>
            <p className="text-sm text-ink-faint">Excel (.xlsx, .xls) ou CSV</p>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={choisirFichier} className="hidden" disabled={lecture} />
          </label>

          {erreurFichier && (
            <div className="bg-warning-soft text-warning text-sm rounded-xl p-3">{erreurFichier}</div>
          )}

          <div className="bg-surface rounded-2xl border border-black/5 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <FileSpreadsheet size={20} className="text-accent-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-ink">Pas encore de fichier ?</p>
                  <p className="text-xs text-ink-faint mt-0.5 max-w-md">
                    Télécharge le modèle, remplis-le avec tes produits, puis reviens l'importer. Si tu as déjà un tableau Excel de ton stock,
                    importe-le directement : on retrouve les colonnes automatiquement.
                  </p>
                </div>
              </div>
              <button
                onClick={telechargerModele}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-black/10 text-ink-soft hover:border-black/20 transition shrink-0"
              >
                <Download size={14} /> Télécharger le modèle
              </button>
            </div>
            <p className="text-[11px] text-ink-faint mt-4">
              Astuce : si tes codes-barres apparaissent comme « 5,4E+12 » dans Excel, mets cette colonne au format Texte avant d'enregistrer.
            </p>
          </div>
        </div>
      )}

      {/* ============ ÉTAPE 2 : COLONNES ============ */}
      {etape === 'mapping' && donnees && (
        <div>
          <div className="bg-surface rounded-2xl border border-black/5 p-5 mb-5">
            <p className="text-sm text-ink">
              <span className="font-medium">{nomFichier}</span>
              <span className="text-ink-faint"> — {donnees.lignes.length} ligne(s) trouvée(s)</span>
            </p>
            <p className="text-xs text-ink-faint mt-1">
              Vérifie à quelle colonne de ton fichier correspond chaque information. Les colonnes reconnues sont déjà sélectionnées.
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-black/5 divide-y divide-black/5 mb-5">
            {CHAMPS.map((champ) => (
              <div key={champ.cle} className="flex items-center justify-between gap-4 p-4 flex-wrap">
                <label className="text-sm text-ink font-medium">
                  {champ.label}
                  {champ.requis && <span className="text-warning ml-0.5">*</span>}
                </label>
                <select
                  value={mapping[champ.cle] ?? ''}
                  onChange={(e) => setMapping((actuel) => ({ ...actuel, [champ.cle]: e.target.value }))}
                  className="w-full sm:w-64 rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-surface"
                >
                  <option value="">— Ignorer —</option>
                  {donnees.entetes.map((entete, i) => (
                    <option key={i} value={String(i)}>{entete}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {requisManquants.length > 0 && (
            <p className="text-warning text-xs mb-4">
              Colonne(s) obligatoire(s) manquante(s) : {requisManquants.map((champ) => champ.label).join(', ')}
            </p>
          )}

          <div className="flex items-center justify-between">
            <button onClick={recommencer} className="text-sm text-ink-soft hover:text-ink">
              Changer de fichier
            </button>
            <button
              onClick={() => setEtape('apercu')}
              disabled={requisManquants.length > 0}
              className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-xl disabled:opacity-40 transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
            >
              Voir l'aperçu <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ============ ÉTAPE 3 : APERÇU ============ */}
      {etape === 'apercu' && (
        <div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-surface rounded-2xl border border-black/5 p-4">
              <p className="text-xs text-ink-soft mb-1">Lignes lues</p>
              <p className="font-display text-xl font-semibold text-ink">{analyse.length}</p>
            </div>
            <div className="bg-surface rounded-2xl border border-black/5 p-4">
              <p className="text-xs text-ink-soft mb-1">Prêtes à importer</p>
              <p className="font-display text-xl font-semibold text-positive">{valides.length}</p>
            </div>
            <div className="bg-surface rounded-2xl border border-black/5 p-4">
              <p className="text-xs text-ink-soft mb-1">À corriger</p>
              <p className={`font-display text-xl font-semibold ${enErreur.length > 0 ? 'text-warning' : 'text-ink'}`}>{enErreur.length}</p>
            </div>
          </div>

          {enErreur.length > 0 && (
            <div className="bg-warning-soft text-warning text-sm rounded-xl p-3 mb-4 flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                {enErreur.length} ligne(s) ne seront pas importées (détail ci-dessous). Les autres le seront normalement — tu pourras corriger
                ces lignes dans ton fichier et le réimporter ensuite.
              </span>
            </div>
          )}

          {enErreur.length > 0 && (
            <label className="flex items-center gap-2 text-xs text-ink-soft mb-3 cursor-pointer">
              <input type="checkbox" checked={seulementErreurs} onChange={(e) => setSeulementErreurs(e.target.checked)} />
              Afficher uniquement les lignes en erreur
            </label>
          )}

          <div className="bg-surface rounded-2xl border border-black/5 overflow-hidden mb-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-paper text-ink-soft text-left">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Ligne</th>
                    <th className="px-3 py-2.5 font-medium">Produit</th>
                    <th className="px-3 py-2.5 font-medium">Catégorie</th>
                    <th className="px-3 py-2.5 font-medium text-right">Achat</th>
                    <th className="px-3 py-2.5 font-medium text-right">Vente</th>
                    <th className="px-3 py-2.5 font-medium text-right">Stock</th>
                    <th className="px-3 py-2.5 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {lignesAffichees.map((ligne) => (
                    <tr key={ligne.ligne} className={ligne.erreur ? 'bg-warning-soft/40' : ''}>
                      <td className="px-3 py-2.5 text-ink-faint">{ligne.ligne}</td>
                      <td className="px-3 py-2.5 text-ink font-medium">{ligne.valeurs.nom || '—'}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{ligne.valeurs.categorie || '—'}</td>
                      <td className="px-3 py-2.5 text-right text-ink-soft">{formaterNombre(ligne.valeurs.prix_achat)}</td>
                      <td className="px-3 py-2.5 text-right text-ink-soft">{formaterNombre(ligne.valeurs.prix_vente)}</td>
                      <td className="px-3 py-2.5 text-right text-ink-soft">{formaterNombre(ligne.valeurs.stock)}</td>
                      <td className="px-3 py-2.5">
                        {ligne.erreur ? (
                          <span className="text-xs text-warning">{ligne.erreur}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-positive"><Check size={12} /> OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {(seulementErreurs ? enErreur : analyse).length > 100 && (
            <p className="text-xs text-ink-faint mb-4">Aperçu limité aux 100 premières lignes — l'import traitera bien toutes les lignes valides.</p>
          )}

          <div className="flex items-center justify-between mt-5">
            <button onClick={() => setEtape('mapping')} className="text-sm text-ink-soft hover:text-ink">
              Modifier les colonnes
            </button>
            <button
              onClick={lancerImport}
              disabled={valides.length === 0}
              className="text-white text-sm font-medium px-5 py-2.5 rounded-xl disabled:opacity-40 transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
            >
              Importer {valides.length} produit(s)
            </button>
          </div>
        </div>
      )}

      {/* ============ ÉTAPE 4 : IMPORT EN COURS ============ */}
      {etape === 'import' && (
        <div className="bg-surface rounded-2xl border border-black/5 p-8 text-center">
          <p className="font-medium text-ink mb-1">Import en cours...</p>
          <p className="text-xs text-ink-faint mb-5">Ne ferme pas cette page.</p>
          <div className="h-2 rounded-full bg-black/5 overflow-hidden max-w-sm mx-auto">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progression}%`, background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
            />
          </div>
          <p className="text-xs text-ink-soft mt-3">{progression}%</p>
        </div>
      )}

      {/* ============ TERMINÉ ============ */}
      {etape === 'termine' && resultat && (
        <div>
          <div className="bg-surface rounded-2xl border border-black/5 p-8 text-center mb-5">
            <div className="w-14 h-14 rounded-full bg-positive-soft flex items-center justify-center mx-auto mb-4">
              <Check size={26} className="text-positive" />
            </div>
            <h2 className="font-display text-xl font-semibold text-ink mb-1">Import terminé</h2>
            <p className="text-ink-soft text-sm">
              <span className="text-positive font-medium">{resultat.crees} produit(s) ajouté(s)</span>
              {enErreur.length + resultat.erreursServeur.length > 0 && (
                <span> — {enErreur.length + resultat.erreursServeur.length} ligne(s) ignorée(s)</span>
              )}
            </p>
          </div>

          {enErreur.length + resultat.erreursServeur.length > 0 && (
            <div className="bg-surface rounded-2xl border border-black/5 p-5 mb-5">
              <h3 className="text-sm font-medium text-ink mb-3">Lignes ignorées</h3>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {[
                  ...enErreur.map((ligne) => ({ ligne: ligne.ligne, raison: ligne.erreur })),
                  ...resultat.erreursServeur,
                ]
                  .sort((a, b) => a.ligne - b.ligne)
                  .map((item, i) => (
                    <p key={i} className="text-xs text-ink-soft">
                      <span className="text-ink-faint">Ligne {item.ligne} :</span> {item.raison}
                    </p>
                  ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Link
              to="/produits"
              className="text-white text-sm font-medium px-5 py-2.5 rounded-xl transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
            >
              Voir mes produits
            </Link>
            <button onClick={recommencer} className="text-sm text-ink-soft hover:text-ink">
              Importer un autre fichier
            </button>
          </div>
        </div>
      )}
    </div>
  )
}