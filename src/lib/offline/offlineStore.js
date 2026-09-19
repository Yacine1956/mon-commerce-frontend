import { create } from 'zustand'

const useOfflineStore = create((set) => ({
  estEnLigne: navigator.onLine,
  ventesEnAttente: 0,
  depensesEnAttente: 0,
  synchronisationEnCours: false,

  setEnLigne: (valeur) => set({ estEnLigne: valeur }),
  setVentesEnAttente: (nombre) => set({ ventesEnAttente: nombre }),
  setDepensesEnAttente: (nombre) => set({ depensesEnAttente: nombre }),
  setSynchronisationEnCours: (valeur) => set({ synchronisationEnCours: valeur }),
}))

export default useOfflineStore