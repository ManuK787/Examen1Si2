# Examen 1 SI2 — Monorepo (PostgreSQL + Django + React (frontend) + Flutter)

## Estructura
- **backend/**: API Django + DRF
- **frontend/**: Frontend React (Vite)
- **mobile/**: App Flutter
- **infra/**: Infraestructura (DB, scripts)
- **docs/**: Documentación y UML

## Requisitos
- Python 3.11+
- Node 18+ (LTS)
- Flutter 3.x
- PostgreSQL 14+
- Git 2.40+

## Variables de entorno
Copia **.env.sample** a **.env** y ajusta valores:
- `PG_HOST, PG_PORT, PG_DB, PG_USER, PG_PASS`
- `DJANGO_SECRET, DJANGO_DEBUG`
- `VITE_API_URL` (frontend)
- `FLUTTER_API_URL` (emulador Android usa 10.0.2.2)

## Servicios locales
Levantar Postgres + pgAdmin:
```bash
docker compose up -d

```

## Pasos por proyecto (Windows / cmd)

Sigue estos pasos desde la raíz del repo. Adapta rutas según tu entorno.

### 1 Infra (Base de datos con Docker)
- Requisitos: Docker Desktop instalado y en ejecución.
- Variables: asegúrate de tener un `.env` en la raíz con los valores de Postgres.
- Levantar contenedores:

```bash
docker compose up -d
```

- Ver estado:

```bash
docker compose ps
```

### 2 Backend (Django + DRF)
Asumiendo que el proyecto Django vive en `backend/`.

```bash
cd backend
:: crear entorno virtual (Python 3.11+)
python -m venv venv
venv\Scripts\activate

:: instalar dependencias (si existe requirements.txt)
pip install -r requirements.txt

:: aplicar migraciones
python manage.py migrate

:: crear superusuario (opcional)
python manage.py createsuperuser

:: ejecutar servidor
python manage.py runserver 0.0.0.0:8000
```

Notas:
- Si tu configuración de Django lee variables desde la raíz, mantén el `.env` en la raíz. Si el backend usa su propio `.env`, colócalo en `backend/.env`.
- Ajusta el puerto si 8000 está en uso.

### 3 Frontend (React + Vite)
Asumiendo que el frontend está en `frontend/`.

```bash
cd frontend
npm install

:: copia variables
:: (si existe .env.sample)
copy .env.sample .env

:: inicia servidor de desarrollo
npm run dev
```

Configura `VITE_API_URL` en `frontend/.env` para apuntar al backend, por ejemplo:

```bash
VITE_API_URL=http://localhost:8000
```

### 4 Mobile (Flutter)
Asumiendo que la app está en `mobile/`.

```bash
cd mobile
flutter pub get

:: ejecutar en emulador Android apuntando al backend local
flutter run --dart-define=FLUTTER_API_URL=http://10.0.2.2:8000
```

Notas:
- En emulador Android, el host de tu máquina es `10.0.2.2`.
- En iOS Simulator suele ser `localhost`.
- Si tu app usa `flutter_dotenv`, copia un `.env.sample` a `.env` y define `FLUTTER_API_URL`. Si no, usa `--dart-define` como arriba.

## Siguientes pasos sugeridos
- Añadir archivos `.env.sample` en raíz, `backend/` y `frontend/` con ejemplos de variables.
- Incluir `docker-compose.yml` (o `compose.yaml`) en la raíz con servicios de Postgres y pgAdmin.
- Documentar scripts de linters/formatters y cómo correr tests en cada paquete.
