export default function PageAVenir({ titre }) {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-2">{titre}</h1>
      <p className="text-ink-faint">Cet écran arrive bientôt.</p>
    </div>
  )
}