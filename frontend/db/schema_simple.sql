-- Schema simple SIN extensiones (sin uuid-ossp, sin citext, sin btree_gist)
-- Objetivo: cubrir autenticación básica, anuncios segmentados, reservas,
-- vehículos con capturas de placas, finanzas sencillas y notificaciones.
-- IDs: BIGSERIAL (enteros autoincrementales)
-- Estados: TEXT + CHECK
-- NOTA: Ajustado para rapidez de implementación, sin prevención automática de solapamientos.

-- =============================================================
-- 1. Seguridad / Roles / Usuarios
-- =============================================================
CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
);

CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  telefono VARCHAR(40),
  password_hash VARCHAR(255) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo','suspendido')),
  rol_id BIGINT NOT NULL REFERENCES roles(id),
  ultimo_login TIMESTAMP,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bitácora específica de cambios sobre usuarios (creación, edición, eliminación, cambio de estado, cambio de rol)
CREATE TABLE usuarios_bitacora (
  id BIGSERIAL PRIMARY KEY,
  usuario_objetivo_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, -- usuario afectado
  accion VARCHAR(30) NOT NULL CHECK (accion IN ('crear','actualizar','eliminar','cambiar_estado','cambiar_rol','reset_password')),
  actor_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL, -- quién realizó la acción (puede ser NULL si sistema)
  estado_anterior VARCHAR(20),
  estado_nuevo VARCHAR(20),
  rol_anterior BIGINT,
  rol_nuevo BIGINT,
  campos_modificados TEXT, -- lista simple: nombre,apellido,email
  detalle TEXT,            -- descripción libre adicional
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_usuarios_bitacora_usuario ON usuarios_bitacora(usuario_objetivo_id, creado_en DESC);
CREATE INDEX idx_usuarios_bitacora_accion ON usuarios_bitacora(accion);

-- Índice rápido para login case-insensitive (almacenar email siempre en minúsculas en la app)
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- =============================================================
-- 2. Propiedades / Unidades / Vehículos
-- =============================================================
CREATE TABLE propiedades (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  direccion TEXT,
  ciudad VARCHAR(80),
  estado VARCHAR(80),
  pais VARCHAR(80),
  tipo VARCHAR(30) CHECK (tipo IN ('edificio','condominio','complejo','otro')),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE unidades (
  id BIGSERIAL PRIMARY KEY,
  propiedad_id BIGINT REFERENCES propiedades(id) ON DELETE CASCADE,
  codigo VARCHAR(50) NOT NULL,
  nivel VARCHAR(30),
  metros_cuadrados NUMERIC(10,2),
  dormitorios INT,
  banos INT,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo')),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (propiedad_id, codigo)
);

CREATE TABLE usuarios_unidades (
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
  unidad_id BIGINT REFERENCES unidades(id) ON DELETE CASCADE,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('propietario','inquilino','invitado')),
  fecha_desde DATE,
  fecha_hasta DATE,
  PRIMARY KEY (usuario_id, unidad_id, rol)
);

CREATE TABLE vehiculos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  unidad_id BIGINT REFERENCES unidades(id) ON DELETE SET NULL,
  placa VARCHAR(20) NOT NULL UNIQUE,
  marca VARCHAR(60),
  modelo VARCHAR(60),
  color VARCHAR(40),
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo')),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- 3. Placas (Eventos) y Accesos Vehiculares (simple)
-- =============================================================
CREATE TABLE placas_eventos (
  id BIGSERIAL PRIMARY KEY,
  placa_detectada VARCHAR(20) NOT NULL,
  imagen_url TEXT,
  confianza NUMERIC(5,2),
  origen VARCHAR(10) NOT NULL DEFAULT 'manual' CHECK (origen IN ('manual','camara','api')),
  capturado_por BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  vehiculo_id BIGINT REFERENCES vehiculos(id) ON DELETE SET NULL,
  procesado BOOLEAN NOT NULL DEFAULT FALSE,
  evento_en TIMESTAMP NOT NULL DEFAULT NOW(),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_placas_eventos_placa ON placas_eventos(placa_detectada, evento_en DESC);

CREATE TABLE accesos_vehiculares (
  id BIGSERIAL PRIMARY KEY,
  evento_placa_id BIGINT REFERENCES placas_eventos(id) ON DELETE SET NULL,
  vehiculo_id BIGINT REFERENCES vehiculos(id) ON DELETE SET NULL,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo VARCHAR(15) NOT NULL DEFAULT 'entrada' CHECK (tipo IN ('entrada','salida','denegado')),
  autorizado BOOLEAN,
  motivo_denegado VARCHAR(255),
  autorizado_por BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  registrado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_accesos_vehiculares_vehiculo ON accesos_vehiculares(vehiculo_id, registrado_en DESC);

-- =============================================================
-- 4. Áreas comunes y Reservas (sin validación automática de solapamiento)
-- =============================================================
CREATE TABLE areas_comunes (
  id BIGSERIAL PRIMARY KEY,
  propiedad_id BIGINT REFERENCES propiedades(id) ON DELETE CASCADE,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  hora_apertura TIME,
  hora_cierre TIME,
  tarifa_hora NUMERIC(10,2),
  aforo INT,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo','mantenimiento')),
  requiere_aprobacion BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reservas (
  id BIGSERIAL PRIMARY KEY,
  area_id BIGINT NOT NULL REFERENCES areas_comunes(id) ON DELETE CASCADE,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  inicio TIMESTAMP NOT NULL,
  fin TIMESTAMP NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmada','cancelada','rechazada','expirada','completada')),
  tarifa_hora_snapshot NUMERIC(10,2),
  total_calculado NUMERIC(10,2),
  pago_estado VARCHAR(15) NOT NULL DEFAULT 'pendiente' CHECK (pago_estado IN ('pendiente','pagado','fallido','reembolsado','parcial')),
  pago_monto NUMERIC(10,2),
  pago_moneda VARCHAR(10) DEFAULT 'BOB',
  expira_en TIMESTAMP,
  notas TEXT,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (fin > inicio)
);
CREATE INDEX idx_reservas_area_inicio ON reservas(area_id, inicio);
CREATE INDEX idx_reservas_usuario ON reservas(usuario_id, inicio DESC);

-- =============================================================
-- 5. Comunicación: Anuncios (segmentados) y Lecturas
-- =============================================================
CREATE TABLE anuncios (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  contenido TEXT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador','programado','publicado','archivado','cancelado')),
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  programado_para TIMESTAMP,
  publicado_en TIMESTAMP,
  expiracion TIMESTAMP,
  creado_por BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  actualizado_por BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_anuncios_estado_programado ON anuncios(estado, programado_para);

CREATE TABLE anuncios_destinatarios (
  id BIGSERIAL PRIMARY KEY,
  anuncio_id BIGINT NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('rol','usuario')),
  rol_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
  CHECK ((tipo='rol' AND rol_id IS NOT NULL AND usuario_id IS NULL) OR (tipo='usuario' AND usuario_id IS NOT NULL AND rol_id IS NULL)),
  UNIQUE (anuncio_id, tipo, COALESCE(rol_id, -1), COALESCE(usuario_id, -1))
);

CREATE TABLE anuncios_lecturas (
  anuncio_id BIGINT REFERENCES anuncios(id) ON DELETE CASCADE,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
  leido_en TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (anuncio_id, usuario_id)
);

-- =============================================================
-- 6. Finanzas simplificadas (sin versionado de conceptos avanzado)
-- =============================================================
CREATE TABLE conceptos_financieros (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('cuota','penalidad','servicio','otros')),
  monto_base NUMERIC(12,2),
  moneda VARCHAR(10) DEFAULT 'BOB',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE cargos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  unidad_id BIGINT REFERENCES unidades(id) ON DELETE SET NULL,
  concepto_id BIGINT REFERENCES conceptos_financieros(id) ON DELETE SET NULL,
  descripcion TEXT,
  periodo VARCHAR(10), -- ej: 2025-09
  monto NUMERIC(12,2) NOT NULL,
  moneda VARCHAR(10) DEFAULT 'BOB',
  estado VARCHAR(15) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','pagado','vencido','perdonado','parcial')),
  fecha_vencimiento DATE,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cargos_usuario_estado ON cargos(usuario_id, estado);

CREATE TABLE transacciones_pago (
  id BIGSERIAL PRIMARY KEY,
  cargo_id BIGINT REFERENCES cargos(id) ON DELETE SET NULL,
  reserva_id BIGINT REFERENCES reservas(id) ON DELETE SET NULL,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  proveedor VARCHAR(30),
  referencia VARCHAR(80),
  estado VARCHAR(15) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','exitoso','fallido','reembolsado','parcial')),
  monto NUMERIC(12,2) NOT NULL,
  moneda VARCHAR(10) DEFAULT 'BOB',
  recibido_en TIMESTAMP,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transacciones_estado ON transacciones_pago(estado);

CREATE TABLE comprobantes_pago (
  id BIGSERIAL PRIMARY KEY,
  transaccion_id BIGINT NOT NULL REFERENCES transacciones_pago(id) ON DELETE CASCADE,
  tipo VARCHAR(15) NOT NULL CHECK (tipo IN ('factura','recibo','boleta')),
  numero VARCHAR(40),
  archivo_url TEXT,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (tipo, numero)
);

-- =============================================================
-- 7. Notificaciones y Recordatorios simples
-- =============================================================
CREATE TABLE notificaciones (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(160) NOT NULL,
  cuerpo TEXT NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('anuncio','reserva','pago','mantenimiento','general')),
  referencia_tipo VARCHAR(20),
  referencia_id BIGINT,
  leido BOOLEAN NOT NULL DEFAULT FALSE,
  enviado_en TIMESTAMP,
  leido_en TIMESTAMP,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notificaciones_usuario_leido ON notificaciones(usuario_id, leido);

CREATE TABLE recordatorios (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(25) NOT NULL CHECK (tipo IN ('pago_vencimiento','reserva_proxima','mantenimiento')),
  referencia_tipo VARCHAR(25) NOT NULL,
  referencia_id BIGINT NOT NULL,
  programado_para TIMESTAMP NOT NULL,
  enviado BOOLEAN NOT NULL DEFAULT FALSE,
  enviado_en TIMESTAMP,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recordatorios_programado ON recordatorios(programado_para, enviado);

-- =============================================================
-- 8. Auditoría mínima
-- =============================================================
CREATE TABLE auditoria_eventos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  entidad VARCHAR(40) NOT NULL,
  entidad_id BIGINT,
  accion VARCHAR(30) NOT NULL,
  cambios TEXT,
  ip VARCHAR(60),
  user_agent VARCHAR(200),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FIN SCHEMA SIMPLE
