export default function SquelletteTableau({ colonnes = 4, lignes = 5 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: lignes }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-black/5 last:border-0">
          {Array.from({ length: colonnes }).map((__, j) => (
            <div
              key={j}
              className="h-3.5 rounded bg-black/5"
              style={{ width: j === 0 ? '30%' : `${60 / colonnes}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}