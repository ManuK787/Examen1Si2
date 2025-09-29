-- Esquema ampliado (sin ENUMs) con soporte móvil, notificaciones, comprobantes,
-- bloqueos de áreas, recordatorios, expiraciones, IA (reconocimiento facial y placas)
-- Usar PostgreSQL >= 13

-- Extensiones recomendadas esto averiguar para ver si lo tomamos en cuenta o no
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS citext;        -- Case-insensitive text
CREATE EXTENSION IF NOT EXISTS btree_gist;    -- Para EXCLUDE constraints (reservas)

-- =====================================================================
-- 1. Seguridad / Autenticación / Biometría
-- =====================================================================
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  telefono TEXT,
  hash_password TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo','suspendido')),
  rol_id UUID NOT NULL REFERENCES roles(id),
  ultimo_login TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Permisos (opcional granularidad)
CREATE TABLE permisos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave TEXT NOT NULL UNIQUE,
  descripcion TEXT
);

CREATE TABLE roles_permisos (
  rol_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id UUID REFERENCES permisos(id) ON DELETE CASCADE,
  PRIMARY KEY (rol_id, permiso_id)
);

-- Tokens de dispositivos para push
CREATE TABLE dispositivo_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  plataforma TEXT NOT NULL CHECK (plataforma IN ('android','ios','web')),
  token TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_uso TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (token)
);

-- Datos biométricos (rostros) referenciando embeddings vectoriales externos
CREATE TABLE usuarios_biometria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('rostro')),
  proveedor TEXT NOT NULL, -- ej: 'azure_face', 'aws_rekognition', 'internal'
  embedding_hash TEXT NOT NULL, -- hash del embedding almacenado en storage externo
  imagen_url TEXT,              -- referencia a imagen base
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, embedding_hash)
);

-- =====================================================================
-- 2. Propiedades / Unidades / Vehículos / Placas
-- =====================================================================
CREATE TABLE propiedades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  direccion TEXT,
  ciudad TEXT,
  estado TEXT,
  pais TEXT,
  tipo TEXT CHECK (tipo IN ('edificio','condominio','complejo','otro')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE unidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  propiedad_id UUID NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nivel TEXT,
  metros_cuadrados NUMERIC(10,2),
  dormitorios INT,
  banos INT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (propiedad_id, codigo)
);

CREATE TABLE usuarios_unidades (
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES unidades(id) ON DELETE CASCADE,
  rol TEXT NOT NULL CHECK (rol IN ('propietario','inquilino','invitado')),
  fecha_desde DATE,
  fecha_hasta DATE,
  PRIMARY KEY (usuario_id, unidad_id, rol)
);

CREATE TABLE vehiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  unidad_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  placa TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  color TEXT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (placa)
);

-- Capturas de placas detectadas por cámaras (raw events)
CREATE TABLE placas_eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placa_detectada TEXT NOT NULL,
  confianza NUMERIC(5,2) CHECK (confianza >= 0 AND confianza <= 100),
  imagen_url TEXT,              -- snapshot de la cámara
  camara_id TEXT,               -- identificador lógico de cámara
  evento_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  vehiculo_id UUID REFERENCES vehiculos(id) ON DELETE SET NULL, -- si se resolvió
  procesado BOOLEAN NOT NULL DEFAULT FALSE,
  origen TEXT NOT NULL DEFAULT 'manual' CHECK (origen IN ('manual','camara','api')),
  capturado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enlaces entre evento de placa y un usuario (si se deduce por múltiples vehículos o reglas)
CREATE TABLE placas_eventos_usuarios (
  evento_id UUID REFERENCES placas_eventos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  score NUMERIC(5,2),
  PRIMARY KEY (evento_id, usuario_id)
);

-- =====================================================================
-- 3. Áreas comunes / Reservas / Bloqueos
-- =====================================================================
CREATE TABLE areas_comunes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  propiedad_id UUID REFERENCES propiedades(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  hora_apertura TIME,
  hora_cierre TIME,
  tarifa_hora NUMERIC(10,2),
  aforo INT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo','mantenimiento')),
  requiere_aprobacion BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bloqueos administrativos programados (mantenimiento, eventos internos)
CREATE TABLE areas_bloqueos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES areas_comunes(id) ON DELETE CASCADE,
  motivo TEXT NOT NULL,
  inicio TIMESTAMPTZ NOT NULL,
  fin TIMESTAMPTZ NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('mantenimiento','evento','otro')),
  creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fin > inicio)
);

-- Reservas (con expiración y snapshot de tarifa)
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES areas_comunes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  inicio TIMESTAMPTZ NOT NULL,
  fin TIMESTAMPTZ NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmada','cancelada','rechazada','expirada','completada')),
  tarifa_hora_snapshot NUMERIC(10,2),
  total_calculado NUMERIC(10,2),
  pago_estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (pago_estado IN ('pendiente','pagado','fallido','reembolsado','parcial')),
  pago_monto NUMERIC(10,2),
  pago_moneda TEXT DEFAULT 'BOB',
  expira_en TIMESTAMPTZ, -- tiempo límite para confirmar o pagar
  notas TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fin > inicio)
);

-- Evitar traslapes: requiere índice GIST, se puede agregar luego (ejemplo) --
-- CREATE INDEX reservas_area_tsrange_idx ON reservas USING GIST (tsrange(inicio, fin));
-- ALTER TABLE reservas ADD CONSTRAINT reservas_no_overlap EXCLUDE USING GIST (area_id WITH =, tsrange(inicio,fin) WITH &&) WHERE (estado IN ('pendiente','confirmada'));

-- =====================================================================
-- 4. Comunicación (Anuncios) y Lecturas
-- =====================================================================
CREATE TABLE anuncios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador','programado','publicado','archivado','cancelado')),
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  programado_para TIMESTAMPTZ,
  publicado_en TIMESTAMPTZ,
  expiracion TIMESTAMPTZ,
  creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  actualizado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audiencia específica de anuncios: por rol o por usuario
CREATE TABLE anuncios_destinatarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('rol','usuario')),
  rol_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  CHECK ((tipo='rol' AND rol_id IS NOT NULL AND usuario_id IS NULL) OR (tipo='usuario' AND usuario_id IS NOT NULL AND rol_id IS NULL)),
  UNIQUE (anuncio_id, tipo, COALESCE(rol_id, '00000000-0000-0000-0000-000000000000'), COALESCE(usuario_id,'00000000-0000-0000-0000-000000000000'))
);

CREATE TABLE anuncios_lecturas (
  anuncio_id UUID REFERENCES anuncios(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  leido_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (anuncio_id, usuario_id)
);

-- =====================================================================
-- 5. Finanzas (Conceptos, Versiones, Cargos, Transacciones, Comprobantes)
-- =====================================================================
CREATE TABLE conceptos_financieros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('cuota','penalidad','servicio','otros')),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE conceptos_financieros_versiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concepto_id UUID NOT NULL REFERENCES conceptos_financieros(id) ON DELETE CASCADE,
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE,
  monto NUMERIC(12,2) NOT NULL,
  moneda TEXT NOT NULL DEFAULT 'BOB',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (concepto_id, vigente_desde)
);

CREATE TABLE cargos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  unidad_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  concepto_id UUID REFERENCES conceptos_financieros(id) ON DELETE SET NULL,
  descripcion TEXT,
  periodo TEXT, -- ej: 2025-09
  monto NUMERIC(12,2) NOT NULL,
  moneda TEXT NOT NULL DEFAULT 'BOB',
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','pagado','vencido','perdonado','parcial')),
  fecha_vencimiento DATE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transacciones_pago (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cargo_id UUID REFERENCES cargos(id) ON DELETE SET NULL,
  reserva_id UUID REFERENCES reservas(id) ON DELETE SET NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  proveedor TEXT, -- 'stripe','paypal','manual','qr'
  referencia TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','exitoso','fallido','reembolsado','parcial')),
  monto NUMERIC(12,2) NOT NULL,
  moneda TEXT NOT NULL DEFAULT 'BOB',
  recibido_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comprobantes_pago (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaccion_id UUID NOT NULL REFERENCES transacciones_pago(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('factura','recibo','boleta')),
  numero TEXT,
  archivo_url TEXT, -- PDF o imagen
  metadata JSONB,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tipo, numero)
);

-- =====================================================================
-- 6. Mantenimiento (Simplificado placeholder)
-- =====================================================================
CREATE TABLE mantenimiento_tareas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta','en_progreso','resuelta','cerrada','cancelada')),
  prioridad TEXT CHECK (prioridad IN ('baja','media','alta','critica')),
  creada_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  asignada_a UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 7. Notificaciones / Recordatorios
-- =====================================================================
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  cuerpo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('anuncio','reserva','pago','mantenimiento','general')),
  referencia_tipo TEXT,  -- ej: 'anuncio','reserva','cargo','tarea'
  referencia_id UUID,    -- valor UUID a la tabla referenciada
  leido BOOLEAN NOT NULL DEFAULT FALSE,
  enviado_en TIMESTAMPTZ,
  leido_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recordatorios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('pago_vencimiento','reserva_proxima','mantenimiento')),
  referencia_tipo TEXT NOT NULL,
  referencia_id UUID NOT NULL,
  programado_para TIMESTAMPTZ NOT NULL,
  enviado BOOLEAN NOT NULL DEFAULT FALSE,
  enviado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 8. Auditoría
-- =====================================================================
CREATE TABLE auditoria_eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  entidad TEXT NOT NULL,
  entidad_id UUID,
  accion TEXT NOT NULL, -- 'crear','actualizar','eliminar','login','estado_cambio'
  cambios JSONB,
  ip TEXT,
  user_agent TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 9. Índices adicionales sugeridos (crear luego de poblar datos)
-- =====================================================================
-- CREATE INDEX ON usuarios(email);
-- CREATE INDEX ON reservas(area_id, inicio);
-- CREATE INDEX ON reservas(usuario_id);
-- CREATE INDEX ON cargos(usuario_id, estado);
-- CREATE INDEX ON transacciones_pago(estado);
-- CREATE INDEX ON notificaciones(usuario_id, leido);
-- CREATE INDEX ON anuncios(estado, programado_para);
-- CREATE INDEX ON placas_eventos(placa_detectada, evento_en);
-- CREATE INDEX ON usuarios_biometria(usuario_id);

-- =====================================================================
-- 10. Vistas / Materializadas (ejemplos opcionales)
-- =====================================================================
-- CREATE MATERIALIZED VIEW mv_reservas_pendientes_pago AS
-- SELECT r.id, r.usuario_id, r.total_calculado - COALESCE(SUM(t.monto) FILTER (WHERE t.estado='exitoso'),0) AS saldo
-- FROM reservas r
-- LEFT JOIN transacciones_pago t ON t.reserva_id = r.id
-- WHERE r.pago_estado IN ('pendiente','parcial')
-- GROUP BY r.id;

-- =====================================================================
-- 11. Comentarios de dominio (para documentación interna)
-- =====================================================================
COMMENT ON TABLE usuarios_biometria IS 'Metadatos para reconocimiento facial; embeddings almacenados fuera de la BD.';
COMMENT ON TABLE placas_eventos IS 'Eventos crudos de reconocimiento de placas de cámaras. Se pueden procesar para asociar a vehículos.';
COMMENT ON COLUMN placas_eventos.origen IS 'manual (foto guardia), camara (automática), api (fuente externa).';
COMMENT ON COLUMN placas_eventos.capturado_por IS 'Usuario guardia que realizó la captura manual.';
COMMENT ON COLUMN reservas.expira_en IS 'Fecha límite para que la reserva sea confirmada/pagada antes de expirar.';
COMMENT ON COLUMN anuncios.destacado IS 'Permite marcar anuncios prioritarios para la app móvil.';
COMMENT ON TABLE recordatorios IS 'Programación de envíos (push/email) automáticos para eventos futuros.';

-- =====================================================================
-- 12. Accesos vehiculares (derivados de eventos de placa)
-- =====================================================================
CREATE TABLE accesos_vehiculares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_placa_id UUID REFERENCES placas_eventos(id) ON DELETE SET NULL,
  vehiculo_id UUID REFERENCES vehiculos(id) ON DELETE SET NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL DEFAULT 'entrada' CHECK (tipo IN ('entrada','salida','denegado')),
  autorizado BOOLEAN,
  motivo_denegado TEXT,
  autorizado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  registrado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE accesos_vehiculares IS 'Registro de entradas/salidas/denegados basados en reconocimiento o validación manual de placas.';
COMMENT ON COLUMN accesos_vehiculares.autorizado IS 'TRUE si se permitió, FALSE si se denegó, NULL si no decidido.';

-- Permisos semillas sugeridos:
-- INSERT INTO roles(nombre, descripcion) VALUES ('guardia','Personal de seguridad');
-- INSERT INTO permisos(clave, descripcion) VALUES
--   ('placas:capturar','Puede registrar eventos manuales de placas'),
--   ('placas:ver','Puede ver eventos de placas'),
--   ('accesos:registrar','Puede registrar accesos vehiculares'),
--   ('anuncios:ver_guardia','Puede ver anuncios dirigidos al rol guardia');

-- FIN DEL SCRIPT
