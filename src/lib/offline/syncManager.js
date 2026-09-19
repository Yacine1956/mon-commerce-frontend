import db from './db'
import apiClient from '../api/client'
import useOfflineStore from './offlineStore'

/**
 * Met en cache localement la liste des produits, pour pouvoir vendre
 * même sans connexion. Appelée à chaque chargement réussi depuis l'API.
 */
export async function mettreEnCacheProduits(produits) {
  await db.produits.clear()
  await db.produits.bulkPut(produits)
}

/**
 * Renvoie les produits depuis le cache local (utilisé quand l'appel réseau échoue).
 */
export async function recupererProduitsEnCache(recherche = '') {
  const tous = await db.produits.toArray()
  if (!recherche) return tous
  const terme = recherche.toLowerCase()
  return tous.filter(
    (p) => p.nom.toLowerCase().includes(terme) || p.code_barres === recherche
  )
}

/**
 * Enregistre une vente. Essaie d'abord en ligne ; si ça échoue (hors ligne
 * ou erreur réseau), la vente est mise en file d'attente locale et sera
 * synchronisée automatiquement au retour de la connexion.
 *
 * Dans les deux cas, le stock local en cache est ajusté immédiatement pour
 * que l'écran de vente reflète la réalité sans attendre la synchronisation.
 */
export async function enregistrerVente(payload) {
  try {
    const res = await apiClient.post('/ventes', payload)
    await ajusterStockLocal(payload.lignes)
    return { synchroniseeImmediatement: true, vente: res.data.data }
  } catch (err) {
    if (estErreurReseau(err)) {
      await db.ventes_en_attente.put({ ...payload, creee_le: new Date().toISOString() })
      await ajusterStockLocal(payload.lignes)
      await rafraichirCompteurs()
      return { synchroniseeImmediatement: false }
    }
    throw err // erreur de validation ou autre : on ne la met pas en file, on la remonte
  }
}

/**
 * Enregistre une dépense, avec la même logique de repli hors ligne.
 */
export async function enregistrerDepense(payload) {
  try {
    const res = await apiClient.post('/depenses', payload)
    return { synchroniseeImmediatement: true, depense: res.data.data }
  } catch (err) {
    if (estErreurReseau(err)) {
      await db.depenses_en_attente.put({ ...payload, creee_le: new Date().toISOString() })
      await rafraichirCompteurs()
      return { synchroniseeImmediatement: false }
    }
    throw err
  }
}

async function ajusterStockLocal(lignes) {
  for (const ligne of lignes) {
    const produit = await db.produits.get(ligne.produit_id)
    if (produit) {
      await db.produits.update(ligne.produit_id, {
        stock_actuel: Math.max(0, produit.stock_actuel - ligne.quantite),
      })
    }
  }
}

function estErreurReseau(err) {
  // Pas de réponse du serveur du tout = coupure réseau (par opposition à une
  // erreur 422/403 où le serveur a bien répondu mais a refusé la requête).
  return !err.response
}

/**
 * Tente de synchroniser tout ce qui est en attente. Appelée automatiquement
 * au retour de la connexion, et peut aussi être déclenchée manuellement.
 */
export async function synchroniser() {
  const { setSynchronisationEnCours } = useOfflineStore.getState()
  setSynchronisationEnCours(true)

  try {
    await synchroniserVentes()
    await synchroniserDepenses()
  } finally {
    await rafraichirCompteurs()
    setSynchronisationEnCours(false)
  }
}

async function synchroniserVentes() {
  const enAttente = await db.ventes_en_attente.toArray()
  if (enAttente.length === 0) return

  const ventes = enAttente.map(({ creee_le, ...vente }) => vente)

  try {
    const res = await apiClient.post('/ventes/sync', { ventes })
    // Laravel peut envelopper chaque ressource dans une clé "data" ou non
    // selon le contexte de sérialisation : on gère les deux cas.
    const uuidsReussis = res.data.reussies.map((v) => (v.data ? v.data.uuid_client : v.uuid_client))
    // On retire de la file locale tout ce qui a été traité avec succès.
    // Les échecs (ex: stock insuffisant détecté côté serveur) restent en
    // file pour inspection manuelle plutôt que d'être perdus silencieusement.
    await db.ventes_en_attente.bulkDelete(uuidsReussis)
  } catch {
    // Toujours hors ligne ou erreur serveur : on réessaiera au prochain
    // événement "online" ou au prochain appel manuel.
  }
}

async function synchroniserDepenses() {
  const enAttente = await db.depenses_en_attente.toArray()

  for (const { creee_le, ...depense } of enAttente) {
    try {
      await apiClient.post('/depenses', depense)
      await db.depenses_en_attente.delete(depense.uuid_client)
    } catch (err) {
      if (!estErreurReseau(err)) {
        // Erreur de validation définitive : on retire pour ne pas bloquer
        // la file indéfiniment (à améliorer plus tard avec une vraie UI d'erreurs).
        await db.depenses_en_attente.delete(depense.uuid_client)
      }
      // Sinon (erreur réseau) : on garde et on réessaiera plus tard.
    }
  }
}

export async function rafraichirCompteurs() {
  const { setVentesEnAttente, setDepensesEnAttente } = useOfflineStore.getState()
  setVentesEnAttente(await db.ventes_en_attente.count())
  setDepensesEnAttente(await db.depenses_en_attente.count())
}

/**
 * À appeler une fois au démarrage de l'application : branche les écouteurs
 * réseau et tente une synchronisation immédiate si on est déjà en ligne.
 */
export function initialiserSynchronisation() {
  const { setEnLigne } = useOfflineStore.getState()

  window.addEventListener('online', () => {
    setEnLigne(true)
    synchroniser()
  })
  window.addEventListener('offline', () => {
    setEnLigne(false)
  })

  rafraichirCompteurs()
  if (navigator.onLine) {
    synchroniser()
  }
}