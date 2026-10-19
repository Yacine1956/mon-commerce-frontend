import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { X, Camera, Keyboard } from 'lucide-react'

/**
 * Scanner de code-barres plein écran, utilise la caméra du téléphone.
 * Appelle onDetecte(codeBarres) dès qu'un code est reconnu, puis se ferme
 * automatiquement. Prévoit aussi une saisie manuelle en repli, au cas où
 * la caméra est indisponible ou le code-barres est abîmé/illisible.
 */
export default function BarcodeScanner({ onFerme, onDetecte }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [erreur, setErreur] = useState('')
  const [modeManuel, setModeManuel] = useState(false)
  const [codeManuel, setCodeManuel] = useState('')

  useEffect(() => {
    if (modeManuel) return

    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader
    let actif = true

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (resultat, erreurDecodage) => {
          if (resultat && actif) {
            actif = false
            onDetecte(resultat.getText())
          }
        }
      )
      .catch(() => {
        setErreur("Impossible d'accéder à la caméra. Vérifie les autorisations, ou saisis le code manuellement.")
        setModeManuel(true)
      })

    return () => {
      actif = false
      try {
        readerRef.current?.reset?.()
      } catch {
        // rien à faire si déjà arrêté
      }
    }
  }, [modeManuel])

  function soumettreCodeManuel(e) {
    e.preventDefault()
    if (codeManuel.trim()) onDetecte(codeManuel.trim())
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-white font-display font-semibold">Scanner un code-barres</h2>
        <button onClick={onFerme} className="text-white/70 hover:text-white p-1">
          <X size={22} />
        </button>
      </div>

      {!modeManuel ? (
        <>
          <div className="flex-1 relative overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            {/* Cadre de visée */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-40 border-2 border-white/80 rounded-xl" />
            </div>
          </div>
          <div className="p-5 text-center">
            <p className="text-white/60 text-sm mb-3">Vise le code-barres avec la caméra</p>
            <button
              onClick={() => setModeManuel(true)}
              className="flex items-center gap-1.5 text-white/80 text-sm mx-auto hover:text-white"
            >
              <Keyboard size={15} /> Saisir le code manuellement
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Camera size={40} className="text-white/30 mb-4" />
          {erreur && <p className="text-white/60 text-sm text-center mb-5 max-w-xs">{erreur}</p>}
          <form onSubmit={soumettreCodeManuel} className="w-full max-w-xs space-y-3">
            <input
              value={codeManuel}
              onChange={(e) => setCodeManuel(e.target.value)}
              placeholder="Code-barres"
              autoFocus
              className="w-full rounded-xl border border-white/20 bg-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 placeholder:text-white/40"
            />
            <button
              type="submit"
              className="w-full text-white text-sm font-medium py-2.5 rounded-xl transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }}
            >
              Valider
            </button>
          </form>
        </div>
      )}
    </div>
  )
}