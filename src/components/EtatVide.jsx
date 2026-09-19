export default function EtatVide({ icone: Icone, titre, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center mb-3">
        <Icone size={20} className="text-accent-600" />
      </div>
      <p className="text-ink font-medium text-sm mb-1">{titre}</p>
      {description && <p className="text-ink-faint text-sm max-w-xs">{description}</p>}
    </div>
  )
}