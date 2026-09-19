import Dexie from 'dexie'

// Base de données locale du navigateur. Sert à deux choses :
// 1. Garder une copie des produits pour pouvoir vendre même hors ligne.
// 2. Mettre en file d'attente les ventes/dépenses créées hors ligne,
//    en attendant de les synchroniser avec le serveur.
export const db = new Dexie('mon_commerce_offline')

db.version(1).stores({
  // Copie locale des produits, indexée par id serveur. Rafraîchie à chaque
  // chargement réussi depuis l'API.
  produits: 'id, nom, code_barres',

  // File d'attente des ventes créées hors ligne. uuid_client est la clé
  // primaire ET la clé d'idempotence côté serveur (voir VenteService::enregistrer).
  ventes_en_attente: 'uuid_client, creee_le',

  // Idem pour les dépenses.
  depenses_en_attente: 'uuid_client, creee_le',
})

export default db