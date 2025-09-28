# API Contract (Frontend Expectations)

Este documento describe los endpoints y formatos que el frontend ya espera. El backend debe respetar estos caminos y llaves para asegurar integración sin cambios.

Base URL: `${VITE_API_URL}` (ej: https://api.midominio.com/api)
Todas las respuestas JSON. Autenticación vía header `Authorization: Bearer <token>` excepto login/refresh.

---
## Auth
| Acción | Método | Endpoint | Request Body | Respuesta (200) |
|--------|--------|----------|--------------|-----------------|
| Login | POST | `/auth/login/` | `{ email, password }` | `{ token, refresh, user: {...user} }` |
| Register | POST | `/auth/register/` | `{ full_name, email, password, ... }` | `{ id, full_name, email, ... }` |
| Me | GET | `/auth/me/` | - | `{ id, full_name, email, ... }` |
| Logout | POST | `/auth/logout/` | - | `{ success: true }` |
| Refresh | POST | `/auth/refresh/` | `{ refresh }` | `{ token, refresh? }` |
| Change Password | POST | `/auth/change-password/` | `{ current_password, new_password }` | `{ success: true }` |

User shape mínimo esperado (normalizado):
```
{
  id: string|number,
  full_name (o fullName),
  email,
  phone?,
  ci?,
  block?,
  house_number?,
  residency_type?,
  role_name (o role),
  status: 'active' | 'inactive',
  created_at,
  last_access_at?
}
```

---
## Users
| Acción | Método | Endpoint | Notas |
|--------|--------|----------|-------|
| Listar | GET | `/users/?page=1&page_size=10&search=abc` | Respuesta paginada |
| Crear | POST | `/users/` | Body snake_case |
| Detalle | GET | `/users/{id}/` |  |
| Actualizar parcial | PATCH | `/users/{id}/` |  |
| Cambiar estado | PATCH | `/users/{id}/status/` | `{ status: 'active'|'inactive' }` |
| Eliminar | DELETE | `/users/{id}/` |  |

Respuesta paginada esperada:
```
{
  count: number,
  results: [ { ...user } ]
}
```

---
## Roles
| Acción | Método | Endpoint |
|--------|--------|----------|
| Listar | GET | `/roles/` |
| Crear | POST | `/roles/` |
| Detalle | GET | `/roles/{id}/` |
| Actualizar | PATCH | `/roles/{id}/` |
| Eliminar | DELETE | `/roles/{id}/` |
| Matriz permisos | GET | `/permissions/matrix/` |

Role mínimo:
```
{
  id,
  name,
  description?,
  permissions: [],
  users_count?
}
```

---
## Vehicles
| Acción | Método | Endpoint | Notas |
|--------|--------|----------|-------|
| Listar | GET | `/vehicles/?page=1&page_size=10&search=abc` | Puede filtrar por `plate`, owner, etc. |
| Crear | POST | `/vehicles/` | `{ plate, brand, model, color, owner_user_id? }` |
| Detalle | GET | `/vehicles/{id}/` |  |
| Actualizar | PATCH | `/vehicles/{id}/` |  |
| Eliminar | DELETE | `/vehicles/{id}/` |  |
| Colores (opcional) | GET | `/vehicles/colors/` | Respuesta: `{ colors: ['rojo','azul', ...] }` |

Vehicle backend shape sugerido:
```
{
  id,
  plate,
  brand,
  model,
  color,
  owner_user_id?,
  owner_name?,
  created_at,
  updated_at
}
```

---
## Properties
| Acción | Método | Endpoint | Query Params | Body (crear/actualizar) |
|--------|--------|----------|--------------|-------------------------|
| Listar | GET | `/properties/` | `page, page_size, block, search` | - |
| Crear | POST | `/properties/` | - | `{ block, number, owner_name, land_size_m2, capacity, occupancy_status }` |
| Detalle (futuro) | GET | `/properties/{id}/` | - | - |
| Actualizar | PATCH | `/properties/{id}/` | - | cualquier subset de campos |
| Eliminar | DELETE | `/properties/{id}/` | - | - |
| Stats (opcional) | GET | `/properties/stats/` | - | - |

Valores esperados:
- `block`: string estilo `b1`, `b2` (frontend envía minúsculas)
- `number`: entero o string; backend devuelve como número o string (frontend normaliza y pad a 2 dígitos)
- `occupancy_status`: 'occupied' | 'free'

Respuesta paginada:
```
{
  count: number,
  results: [
    {
      id,
      block: 'b1',
      number: 1,
      owner_name: 'Propietario X',
      land_size_m2: 150,
      capacity: 4,
      occupancy_status: 'occupied'|'free',
      created_at,
      updated_at
    }
  ]
}
```

---
## Errores estándar
Backend debe devolver para errores de validación (400):
```
{
  detail: "Mensaje de error amigable" | { field: ["msg"] }
}
```
Para autenticación expirada: 401 con `{ detail: 'Token expired' }`.

---
## Reglas de Serialización Front -> Back
| Campo Front | Campo Back | Notas |
|-------------|-----------|-------|
| ownerName | owner_name | vehicles / properties |
| landSizeM2 | land_size_m2 | properties |
| occupancyStatus ('ocupado'/'libre') | occupancy_status ('occupied'/'free') | mapping bidireccional |
| fullName | full_name | users |
| house_number | house_number | users/properties si aplica |

---
## Normalización clave en frontend
- Se aceptan tanto snake_case como camelCase en payloads de respuesta. El normalizador tomará la que exista.
- Fechas esperadas en ISO 8601.

---
## Seguridad
- Todas las peticiones autenticadas requieren Bearer token.
- Refresh token vía `/auth/refresh/`.

---
## Checklist para backend antes de exponer
- [ ] Implementar endpoints exactos.
- [ ] Respuestas paginadas uniformes `{ count, results }`.
- [ ] Campos snake_case.
- [ ] Códigos HTTP correctos: 201 (create), 200 (get/update), 204 (delete sin body opcional), 400, 401, 404.
- [ ] CORS habilitado para origen del frontend.
- [ ] Timeouts < 15s para evitar abort en cliente.

---
## Futuro (Opcional)
- `/properties/blocks/` -> `{ blocks: ['b1','b2',...] }` para optimizar filtro.
- `/dashboard/summary/` para KPIs (ocupación, totales). 

Cualquier cambio nuevo debe añadirse aquí primero para evitar desalineaciones.

---
## Common Areas (Áreas Comunes)
Gestión de espacios compartidos (salón, piscina, cancha, etc.) — la UI actual oculta el `code` aunque el backend puede seguir enviándolo.

| Acción | Método | Endpoint | Query Params | Body (crear/actualizar) |
|--------|--------|----------|--------------|-------------------------|
| Listar | GET | `/common-areas/` | `page, page_size, search, type, status` | `status`: `available`\|`reserved`\|`maintenance` |
| Crear | POST | `/common-areas/` | - | `{ code?, name, type, capacity, open_time, close_time, requires_approval, status, hourly_rate? }` |
| Detalle (futuro) | GET | `/common-areas/{id}/` | - | - |
| Actualizar | PUT/PATCH | `/common-areas/{id}/` | - | subset/campos completos |
| Eliminar | DELETE | `/common-areas/{id}/` | - | - |
| Disponibilidad (opcional futuro) | GET | `/common-areas/{id}/availability/` | `date` | - |
| Reservas (opcional futuro) | GET/POST | `/common-areas/{id}/reservations/` | `date` | crear reserva `{ date, start_time, end_time, ... }` |

Campos esperados backend -> frontend (normalizador):
```
{
  id,
  code,             // string único (si backend no lo genera, frontend lo puede omitir en create)
  name,             // nombre del área
  type,             // 'salon' | 'piscina' | 'gimnasio' | 'cancha' | 'parque' | otros futuros
  capacity,         // entero > 0
  open_time,        // 'HH:MM' 24h
  close_time,       // 'HH:MM' 24h (close_time > open_time)
  requires_approval,// boolean
  hourly_rate?,     // número decimal (monto por hora). Si se omite o 0 => área sin costo
  status: 'available' | 'reserved' | 'maintenance',
  created_at,
  updated_at
}
```

Frontend map (normalizado) (sin mostrar `code` en UI por ahora):
```
{
  id,
  code,
  name,
  type,
  capacity,
  openTime,
  closeTime,
  requiresApproval,
  hourlyRate, // number|null
  status: 'disponible' | 'reservado' | 'mantenimiento'
}
```

Validaciones frontend actuales:
- name: requerido, trim > 0
- type: requerido
- capacity: número > 0
- openTime/closeTime: formato HH:MM 24h
- openTime < closeTime

Serialización frontend -> backend (`serializeCommonArea`):
| Front | Back |
|-------|------|
| name | name |
| type | type |
| capacity | capacity |
| openTime | open_time |
| closeTime | close_time |
| requiresApproval | requires_approval |
| status ('disponible'/'reservado'/'mantenimiento') | status ('available'/'reserved'/'maintenance') |
| hourlyRate | hourly_rate |
| code (opcional) | code |

Respuesta paginada ejemplo:
```
{
  count: 23,
  results: [ { id, code, name, type, capacity, open_time, close_time, requires_approval, hourly_rate, status, created_at, updated_at } ]
}
```

Notas futuras:
- Podría añadirse campo `rules` (markdown / texto) para reglas de uso.
- Reservas: endpoint separado con validaciones de solapamiento y aprobación.
- Métricas: `/common-areas/stats/` (ocupación, reservas pendientes, etc.)
- Posible `pricing_mode` futuro si se requieren esquemas distintos (flat vs hourly).

---
## Reservas de Áreas Comunes (Reservations)
Gestiona las solicitudes y asignaciones de uso de las áreas comunes.

Estados ciclo de vida sugeridos:
| Estado Backend | Label UI | Significado |
|----------------|----------|------------|
| `pending` | pendiente | Solicitud creada, requiere (o no) aprobación según área |
| `approved` | aprobada | Aprobada y vigente (no iniciada o en curso) |
| `rejected` | rechazada | Rechazada (con motivo) |
| `cancelled` | cancelada | Cancelada por solicitante/admin antes de iniciar |
| `expired` | expirada | Finalizó su horario (estado derivado, no siempre persistido) |

Si el área `requires_approval = false`, se puede crear directamente como `approved` (opcional). El frontend aceptará respuesta en cualquier estado listado.

| Acción | Método | Endpoint | Query Params | Body (crear) |
|--------|--------|----------|--------------|--------------|
| Listar | GET | `/reservations/` | `page, page_size, status, area_id, date_from, date_to, search` | - |
| Crear | POST | `/reservations/` | - | `{ common_area_id, date, start_time, end_time, notes?, attendees?, requested_by? }` |
| Detalle (futuro) | GET | `/reservations/{id}/` | - | - |
| Actualizar (horarios/notas)* | PATCH | `/reservations/{id}/` | - | subset campos (solo mientras pending) |
| Cambiar estado | POST/PATCH | `/reservations/{id}/status/` | - | `{ status: 'approved'|'rejected'|'cancelled', reason? }` |
| Eliminar (opcional) | DELETE | `/reservations/{id}/` | - | - |

*Restricción: No se permite editar horarios si ya está `approved` (el frontend bloqueará, backend debe validar).

Validaciones esperadas backend:
- `start_time < end_time` (formato `HH:MM` 24h)
- No traslape con otra reserva `approved` o `pending` de la misma área que se superponga en `[start_time, end_time)` para la misma `date`.
- Fecha no en el pasado (o permitir con control admin).
- Si `requires_approval=true` y se crea como `approved`, backend puede forzar a `pending`.
- `attendees` <= `capacity` del área (opcional, si se envía).

Modelo de pago adoptado: Flujo A (pago después de aprobación). Sin reembolsos en esta fase.

Reglas flujo A:
- Reserva se crea `pending` sin intento de pago.
- Al aprobar, backend calcula monto basado en tarifa por hora del área y duración (snapshot) y marca estado de pago inicial.
- Sin reembolsos: si se rechaza antes de pagar no hay transacción; si se cancela antes de pagar se queda `cancelled`.

Campos de pago (fase actual):
```
hourly_rate_snapshot: number|null, // copia de hourly_rate del área al momento de aprobación
duration_hours: number,           // horas decimales (end-start) ej 1.50
total_amount: number,             // round(hourly_rate_snapshot * duration_hours, 2)
currency: 'BOB',
payment_required: boolean,        // total_amount > 0
payment_status: 'none'|'pending'|'paid'|'overdue',
paid_at: string|null              // ISO cuando se marcó pagado
```

Transiciones de pago:
- Al aprobar: si total_amount>0 => payment_status='pending', si 0 => 'none'.
- Marcar pago recibido: 'pending' -> 'paid' (set paid_at).
- Overdue (derivado): si payment_status='pending' y la hora de inicio ya pasó.
- Cancel / Reject no modifican payment_status (queda histórico) salvo que estuviera 'pending' y quieras opcionalmente limpiarlo (no requerido por frontend).

Shape backend -> frontend (normalizado por `normalizeReservation`):
```
{
  id,
  common_area_id,
  area: { id, name, type }?, // opcional embedding
  date,              // 'YYYY-MM-DD'
  start_time,        // 'HH:MM'
  end_time,          // 'HH:MM'
  status: 'pending'|'approved'|'rejected'|'cancelled',
  attendees?,        // número participantes
  notes?,            // texto libre
  reason? ,          // motivo rechazo/cancelación
  requested_by,      // user id
  requester_name?,   // nombre residente
  created_at,
  updated_at,
  hourly_rate_snapshot?,
  duration_hours?,
  total_amount?,
  currency?,
  payment_required?,
  payment_status?,
  paid_at?
}
```

Frontend normalizado:
```
{
  id,
  areaId,
  areaName,
  areaType,
  date, // ISO date (YYYY-MM-DD)
  startTime,
  endTime,
  status: 'pendiente'|'aprobada'|'rechazada'|'cancelada'|'expirada',
  attendees: number|null,
  notes: string,
  reason: string|null,
  requestedBy: number|string,
  requesterName: string,
  createdAt,
  updatedAt,
  hourlyRateSnapshot: number|null,
  durationHours: number|null,
  totalAmount: number|null,
  currency: 'BOB'|null,
  paymentRequired: boolean,
  paymentStatus: 'none'|'pending'|'paid'|'overdue',
  paidAt: string|null
}
```

Mapeo status backend -> frontend:
| Back | Front |
|------|-------|
| pending | pendiente |
| approved | aprobada |
| rejected | rechazada |
| cancelled | cancelada |
| (derivado si fecha+hora pasada) | expirada |

Serialización frontend -> backend (`serializeReservation`):
| Front | Back |
|-------|------|
| areaId | common_area_id |
| date | date |
| startTime | start_time |
| endTime | end_time |
| attendees | attendees |
| notes | notes |
| requestedBy | requested_by |

Respuesta paginada ejemplo:
```
{
  count: 42,
  results: [ { id, common_area_id, date, start_time, end_time, status, attendees, notes, reason, requested_by, created_at, updated_at } ]
}
```

Endpoint de cambio de estado ejemplo (rechazo):
Request:
```
POST /reservations/15/status/
{ "status": "rejected", "reason": "Horario ya ocupado" }
```
Respuesta:
```
{ id:15, status:"rejected", reason:"Horario ya ocupado", ... }
```

Notas adicionales:
- El frontend marcará localmente como `expirada` si `status` ∈ {approved} y `date < hoy` o (si `date === hoy` y `end_time < hora actual`).
- Para performance futura: endpoint `/reservations/calendar/?from=YYYY-MM-DD&to=YYYY-MM-DD` que devuelva rango sin paginar.
- Posible exportación CSV: `/reservations/export/?from=...&to=...`.


---
## Mantenimiento (Maintenance Tasks - Versión Simple)
Módulo simplificado: sólo tareas para personal interno. Sin adjuntos ni proveedores externos.

### Estados
| Backend | UI | Descripción |
|---------|----|-------------|
| `pending` | pendiente | Creada, aún no iniciada |
| `in_progress` | en progreso | Personal trabajando |
| `done` | completada | Trabajo finalizado |
| `cancelled` | cancelada | Cancelada antes de completar |

Transiciones permitidas:
`pending -> in_progress -> done`
`pending -> cancelled`
`in_progress -> cancelled`

### Endpoints
| Acción | Método | Endpoint | Query Params | Body (crear) |
|--------|--------|----------|--------------|--------------|
| Listar | GET | `/maintenance-tasks/` | `page, page_size, status, priority, assignee_id, search` | - |
| Crear | POST | `/maintenance-tasks/` | - | `{ title, description?, priority, assignee_id, due_date? }` |
| Detalle (opcional futuro) | GET | `/maintenance-tasks/{id}/` | - | - |
| Actualizar parcial | PATCH | `/maintenance-tasks/{id}/` | - | subset (si status = pending) |
| Cambiar estado | POST | `/maintenance-tasks/{id}/status/` | - | `{ status, progress_percent?, reason? }` |
| Eliminar (opcional) | DELETE | `/maintenance-tasks/{id}/` | - | - |

### Campos backend -> frontend
```
{
  id,
  title,
  description,
  priority: 'low'|'medium'|'high'|'urgent',
  status: 'pending'|'in_progress'|'done'|'cancelled',
  assignee_id,
  assignee_name?,
  progress_percent?,      // 0-100 (sólo informativo)
  due_date?,              // 'YYYY-MM-DD'
  started_at?,            // ISO
  completed_at?,          // ISO
  cancellation_reason?,
  created_at,
  updated_at
}
```

### Frontend normalizado
```
{
  id,
  title,
  description,
  priority,
  status: 'pendiente'|'en progreso'|'completada'|'cancelada',
  assigneeId,
  assigneeName,
  progressPercent: number|null,
  dueDate: string|null,
  startedAt: string|null,
  completedAt: string|null,
  cancellationReason: string|null,
  createdAt,
  updatedAt
}
```

### Serialización (crear/editar)
| Front | Back |
|-------|------|
| title | title |
| description | description |
| priority | priority |
| assigneeId | assignee_id |
| dueDate | due_date |

### Cambio de estado
Request:
```
POST /maintenance-tasks/12/status/
{ "status": "in_progress", "progress_percent": 10 }
```
Ó:
```
POST /maintenance-tasks/12/status/
{ "status": "cancelled", "reason": "Duplicada" }
```

### Validaciones esperadas
- `assignee_id` requerido.
- Editar título/priority/asignado sólo cuando `status = pending`.
- `done` sólo desde `in_progress` (o permitir atajo pending->done si se desea, frontend no lo usará por defecto).
- `cancelled` desde `pending` o `in_progress` con `reason`.
- `progress_percent` 0–100 sólo aceptado si `status = in_progress`.

### Respuesta paginada ejemplo
```
{
  count: 14,
  results: [ { id, title, priority, status, assignee_id, assignee_name, progress_percent, due_date, created_at, updated_at } ]
}
```

---


## Comunicados (Announcements)
Sistema para publicar avisos internos a residentes/personal. Soporta ciclo de vida: borrador, programado, publicado, archivado, cancelado.

### Estados y Transiciones
| Estado | Significado | Transiciones permitidas |
|--------|-------------|-------------------------|
| `draft` | Borrador editable | `draft -> scheduled`, `draft -> published`, `draft -> cancelled` |
| `scheduled` | Programado para publicar automáticamente en `publish_at` | `scheduled -> published` (automático al llegar fecha), `scheduled -> cancelled` |
| `published` | Visible para usuarios | `published -> archived` |
| `archived` | Historial no visible en listados activos | — |
| `cancelled` | Anulado antes de publicar (no visible) | — |

Regla auto-publicación: backend (o cron) debe mover `scheduled` a `published` cuando `now >= publish_at`.

### Endpoints
| Acción | Método | Endpoint | Query Params / Body | Notas |
|--------|--------|----------|---------------------|-------|
| Listar | GET | `/announcements/` | `page,page_size,status,priority,search,tag` | Respuesta paginada |
| Crear | POST | `/announcements/` | `{ title, body, excerpt?, priority?, tags?[], publish_at? }` | Si incluye `publish_at` futuro => puede guardarse como `scheduled` (o mantener draft y requerir endpoint específico) |
| Detalle | GET | `/announcements/{id}/` | - |  |
| Actualizar | PATCH | `/announcements/{id}/` | subset campos (sólo si estado editable) | Estados editables: `draft`, `scheduled` (excepto cambiar `publish_at` pasado) |
| Publicar | POST | `/announcements/{id}/publish/` | - | Forzar publicación inmediata (debe retornar objeto actualizado) |
| Programar | POST | `/announcements/{id}/schedule/` | `{ publish_at }` | Cambia a `scheduled` si `publish_at > now` |
| Archivar | POST | `/announcements/{id}/archive/` | - | Sólo desde `published` |
| Cancelar | POST | `/announcements/{id}/cancel/` | `{ reason? }` | Desde `draft` o `scheduled` |
| Marcar leído | POST | `/announcements/{id}/read/` | - | Incrementa métrica de lectura (si aplica) |
| Activos (banner) | GET | `/announcements/active/` | `limit?` | Devuelve publicados recientes vigentes para mostrar destacados |
| Métricas | GET | `/announcements/{id}/metrics/` | - | `{ read_count, total_recipients, ... }` |
| No leídos (contador) | GET | `/announcements/unread-count/` | - | `{ unread: number }` |

### Modelo Backend -> Frontend
Respuesta base de un anuncio:
```
{
  id,
  title,
  body,
  excerpt?,
  status: 'draft'|'scheduled'|'published'|'archived'|'cancelled',
  priority: 'normal'|'high'|'urgent',
  tags: [string],
  publish_at?,        // ISO futuro (si scheduled)
  published_at?,      // ISO (cuando realmente se publicó)
  archived_at?,       // ISO
  cancelled_at?,      // ISO
  cancellation_reason?,
  author_id?,         // opcional
  author_name?,       // opcional
  metrics?: {
    read_count: number,
    total_recipients?: number
  },
  created_at,
  updated_at
}
```

### Normalización Frontend (ya implementado)
`normalizeAnnouncement` produce:
```
{
  id,
  title,
  body,
  excerpt,
  status,
  priority,
  tags: [],
  publishAt,      // (publish_at)
  publishedAt,    // (published_at)
  archivedAt,
  cancelledAt,
  cancellationReason,
  authorId,
  authorName,
  metrics,        // objeto plano conservado
  createdAt,
  updatedAt
}
```

### Serialización Front -> Back
`serializeAnnouncement(payload)` acepta campos camelCase y devuelve snake_case:
| Front | Back |
|-------|------|
| title | title |
| body | body |
| excerpt | excerpt |
| priority | priority |
| tags | tags |
| publishAt | publish_at |

Acciones de estado usan endpoints dedicados sin body (excepto schedule, cancel). Ejemplos:
```
POST /announcements/10/publish/
=> { id:10, status:'published', published_at:"2025-01-15T14:00:00Z", ... }

POST /announcements/11/schedule/
{ "publish_at": "2025-02-01T12:00:00Z" }
=> { id:11, status:'scheduled', publish_at:"2025-02-01T12:00:00Z", ... }

POST /announcements/12/cancel/
{ "reason": "Contenido obsoleto" }
=> { id:12, status:'cancelled', cancellation_reason:"Contenido obsoleto", cancelled_at:"..." }
```

### Reglas de Validación Backend Esperadas
- `title` requerido (1-160 chars)
- `body` requerido
- `priority` en {normal, high, urgent} (default normal)
- `publish_at` futuro para schedule
- No cambiar `publish_at` a pasado si estado `scheduled`
- Un anuncio `published` no se puede editar (sólo archivar)
- `archived` y `cancelled` son terminales (sin cambios adicionales)

### Respuesta paginada
```
{
  count: number,
  results: [ { id, title, status, priority, publish_at, published_at, ... } ]
}
```

### Contador No Leídos
`GET /announcements/unread-count/` -> `{ unread: 3 }`

`POST /announcements/{id}/read/` debe registrar lectura y devolver `{ success:true }` (o anuncio actualizado con métricas ascendidas).

### Notas Futuras
- Adjuntos: `/announcements/{id}/attachments/`
- Segmentación de audiencia: `target_roles`, `target_blocks`.
- Canal en tiempo real: WebSocket / SSE para push inmediato.
- Borradores colaborativos (lock optimista).

---

