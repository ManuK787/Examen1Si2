import React from 'react'

// Componente de paginación con tamaño de página fijo (10)
export function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const prev = () => page > 1 && onPageChange(page - 1)
  const next = () => page < totalPages && onPageChange(page + 1)
  return (
    <div className="flex flex-wrap items-center gap-4 justify-between text-xs text-slate-500 mt-4">
      <div>
        Mostrando <span className="font-semibold text-slate-700">{(total===0)?0:((page-1)*pageSize+1)}</span>–<span className="font-semibold text-slate-700">{Math.min(page*pageSize, total)}</span> de <span className="font-semibold text-slate-700">{total}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={prev} disabled={page===1} className="px-2 py-1 rounded-md bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed">«</button>
          <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-medium">{page} / {totalPages}</span>
          <button onClick={next} disabled={page===totalPages} className="px-2 py-1 rounded-md bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed">»</button>
        </div>
      </div>
    </div>
  )
}
