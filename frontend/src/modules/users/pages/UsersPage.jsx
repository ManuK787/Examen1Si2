import { useState, useEffect } from 'react'
import { UsersToolbar } from '../components/UsersToolbar'
import { UsersTable } from '../components/UsersTable'
import { UserDetailModal } from '../components/UserDetailModal'
import { Pagination } from '../components/Pagination'
import { UserModal } from '../components/UserModal'
import { useUsersStore } from '../store/usersStore'

export default function UsersPage() {
  const { page, pageSize, total, setPage, fetchRoles, roles, users, fetchUsers } = useUsersStore()
  const [openCreate, setOpenCreate] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [viewUser, setViewUser] = useState(null)

  useEffect(() => { if (roles.length === 0) fetchRoles() }, [])
  // Garantiza fetch inicial incluso si algún efecto hijo falla
  useEffect(() => {
    if (users.length === 0) {
      fetchUsers({ page: 1 })
    }
  }, [])

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Gestión de Usuarios</h1>
        <p className="text-sm leading-relaxed text-slate-600 max-w-2xl">
          Administra <span className="text-slate-700 font-semibold">cuentas</span>, asigna <span className="text-slate-700 font-semibold">roles</span> y controla el <span className="text-slate-700 font-semibold">estado de acceso</span> de los residentes y personal interno.
        </p>
      </div>
  <UsersToolbar onNew={() => { setEditingUser(null); setOpenCreate(true) }} />
  <UsersTable onView={(u)=>setViewUser(u)} onEdit={(u) => { setEditingUser(u); setOpenCreate(true) }} />
  <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
  <UserModal open={openCreate} onClose={() => setOpenCreate(false)} user={editingUser} />
  <UserDetailModal open={!!viewUser} user={viewUser} onClose={()=>setViewUser(null)} />
      {/* Placeholder futuro: pestaña Roles & Permisos */}
    </div>
  )
}
