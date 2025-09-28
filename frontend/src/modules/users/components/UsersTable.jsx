import React, { useEffect } from "react";
import { Pencil, Shield, Trash2, Eye } from "lucide-react";
import { useUsersStore } from "../store/usersStore";
import { StatusBadge, RoleBadge } from "./Badges";
import { EmptyState } from "./EmptyState";

export function UsersTable({ onEdit, onView }) {
  const { users, loading, error, changeUserStatus, deleteUser } =
    useUsersStore();
  const showLocation = loading || users.some((u) => u.role === "Residente");

  const toggleStatus = (u) => {
    const next = u.status === "Activo" ? "Inactivo" : "Activo";
    changeUserStatus(u.id, next);
  };

  const remove = (u) => {
    if (confirm("Eliminar usuario?")) deleteUser(u.id);
  };

  if (error) return <div className="text-sm text-rose-400">{error}</div>;
  if (!loading && users.length === 0) return <EmptyState />;

  return (
    <div className="mt-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
            <tr className="border-b border-slate-200">
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">
                Nombre
              </th>
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">
                Email
              </th>
              {showLocation && (
                <>
                  <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">
                    Bloque
                  </th>
                  <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">
                    Casa
                  </th>
                </>
              )}
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">
                Rol
              </th>
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">
                Estado
              </th>
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">
                Registro
              </th>
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td colSpan={showLocation ? 8 : 6} className="px-4 py-4">
                    <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
                  </td>
                </tr>
              ))}
            {!loading &&
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-2 text-slate-800 font-medium">
                    {u.fullName}
                  </td>
                  <td className="px-4 py-2 text-slate-700">{u.email}</td>
                  {showLocation && (
                    <td className="px-4 py-2 text-slate-700">
                      {u.role === "Residente" ? u.bloque || "-" : "-"}
                    </td>
                  )}
                  {showLocation && (
                    <td className="px-4 py-2 text-slate-700">
                      {u.role === "Residente" ? u.casa || "-" : "-"}
                    </td>
                  )}
                  <td className="px-4 py-2 text-slate-700">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {new Date(u.registeredAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2 text-slate-500">
                      <button
                        onClick={() => onView && onView(u)}
                        className="p-1 rounded-md hover:bg-slate-200 hover:text-slate-700"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit && onEdit(u)}
                        className="p-1 rounded-md hover:bg-slate-200 hover:text-slate-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => toggleStatus(u)}
                        className="p-1 rounded-md hover:bg-slate-200 hover:text-slate-700"
                        title="Cambiar estado"
                      >
                        <Shield size={16} />
                      </button>
                      <button
                        onClick={() => remove(u)}
                        className="p-1 rounded-md hover:bg-rose-100 hover:text-rose-600"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
