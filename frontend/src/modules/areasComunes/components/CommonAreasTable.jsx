import { useCommonAreasStore } from '../store/commonAreasStore'
import { useEffect } from 'react'

export function CommonAreasTable(){
  const { items, fetch, loading, error, openEditModal, deleteItem, page, pageSize, total, setPage } = useCommonAreasStore()

  useEffect(() => { fetch() }, [page, pageSize]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-3">
      {error && <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded p-2">{error}</div>}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Nombre</th>
              <th className="text-left px-3 py-2 font-medium">Tipo</th>
              <th className="text-left px-3 py-2 font-medium">Capacidad</th>
               <th className="text-left px-3 py-2 font-medium">Costo/Hr</th>
              <th className="text-left px-3 py-2 font-medium">Horario</th>
              <th className="text-left px-3 py-2 font-medium">Estado</th>
              <th className="text-right px-3 py-2 font-medium w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">Cargando...</td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">Sin registros</td>
              </tr>
            )}
            {!loading && items.map(area => (
              <tr key={area.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 align-top">{area.name}</td>
                <td className="px-3 py-2 align-top capitalize">{area.type}</td>
                <td className="px-3 py-2 align-top">{area.capacity}</td>
                 <td className="px-3 py-2 align-top">{(area.hourlyRate ?? 0) > 0 ? `Bs ${Number(area.hourlyRate).toFixed(2)}` : '—'}</td>
                <td className="px-3 py-2 align-top">{area.openTime} - {area.closeTime}</td>
                <td className="px-3 py-2 align-top">
                  {area.status === 'disponible' && (
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Disponible</span>
                  )}
                  {area.status === 'reservado' && (
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Reservado</span>
                  )}
                  {area.status === 'mantenimiento' && (
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium bg-slate-200 text-slate-700 border border-slate-300">Mantenimiento</span>
                  )}
                </td>
                <td className="px-3 py-2 align-top text-right space-x-2">
                  <button onClick={() => openEditModal(area)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700" title="Editar">
                    ✎
                  </button>
                  <button onClick={() => { if (window.confirm('¿Eliminar área?')) deleteItem(area.id) }} className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600" title="Eliminar">
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Mostrando {items.length} de {total}</span>
        <div className="flex items-center gap-1">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-2 py-1 border rounded disabled:opacity-40">Prev</button>
          <span className="px-2">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 border rounded disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  )
}
