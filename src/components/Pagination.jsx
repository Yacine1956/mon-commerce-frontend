import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ meta, onChangerPage }) {
  if (!meta || meta.last_page <= 1) return null

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-ink-soft">
      <span>
        {meta.from}–{meta.to} sur {meta.total}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChangerPage(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          className="p-1.5 rounded-lg border border-black/10 disabled:opacity-40 hover:bg-paper transition"
          aria-label="Page précédente"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs text-ink-faint px-1">
          {meta.current_page} / {meta.last_page}
        </span>
        <button
          onClick={() => onChangerPage(meta.current_page + 1)}
          disabled={meta.current_page >= meta.last_page}
          className="p-1.5 rounded-lg border border-black/10 disabled:opacity-40 hover:bg-paper transition"
          aria-label="Page suivante"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}