# Smart Condominium Frontend

Aplicación web (React + Vite) para la administración de condominios: gestión administrativa, seguridad, finanzas, áreas comunes y mantenimiento.

## Stack
- Vite
- React 19
- React Router DOM
- Zustand (estado ligero auth)

## Scripts
`npm run dev` inicia entorno desarrollo  
`npm run build` genera build producción  
`npm run preview` sirve build  
`npm run lint` ejecuta ESLint

## Estructura principal
```
src/
  app/
    App.jsx            # Raíz que monta rutas
    main.jsx           # Entrada (import en index.html)
    routes/
      index.jsx        # Definición de rutas
      ProtectedRoute.jsx
    layout/
  MainLayout.jsx
  Sidebar.jsx
  TopBar.jsx
    store/
      authStore.js
  modules/
    auth/
      pages/LoginPage.jsx
      components/LoginForm.jsx
      services/authService.js
    dashboard/
      pages/DashboardPage.jsx
  shared/
    components/        # Futuras piezas reutilizables
    constants/         # roles, rutas, etc.
  services/            # http, sockets (por implementar)
```

## Flujo de autenticación (mock)
El servicio `authService.login` valida email y password contra credenciales mock (`admin@test.com` / `123`). Al éxito guarda `user` y `token` en el store (`authStore`). Las rutas internas están protegidas por `ProtectedRoute` que redirige a `/login` si no hay token.

## TailwindCSS
Integrado con configuración clásica (`tailwind.config.js`). Paleta personalizada bajo el prefijo `brand` y utilidades reutilizables en `index.css` (`.btn`, `.card`, etc.).

### Uso rápido
Ejemplos:
```
<button class="btn">Acción</button>
<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <div class="kpi"><span class="kpi-title">Morosidad</span><span class="kpi-value">12%</span></div>
</div>
```

### Personalizar
Editar colores / fuentes en `tailwind.config.js` dentro de `theme.extend`.

## Próximos pasos sugeridos
1. Añadir manejo real de API (`services/httpClient.js`).
2. Definir constantes de roles + menú dinámico.
3. Crear módulos: usuarios, unidades, cuotas, reservas.
4. Persistir sesión (localStorage) y añadir refresh token.
5. Página de errores global + ErrorBoundary.
6. Lazy loading para módulos grandes.
7. Integrar tabla reutilizable y componentes de formularios.

## Convenciones
- `pages/`: componentes montados directamente por una ruta.
- `components/`: piezas reutilizables dentro del módulo.
- `services/`: lógica de acceso a datos (fetch, transformaciones).
- `shared/`: reutilizable global (no depende de dominios específicos).

## Variables de entorno
Crear `.env` o `.env.local`:
```
VITE_API_URL=http://localhost:3000/api
```

## Licencia
Uso académico.
