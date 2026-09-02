import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'

// Vistas
import CallbackView from '@/views/CallbackView.vue'
import DashboardView from '@/views/DashboardView.vue'
import UnauthorizedView from '@/views/UnauthorizedView.vue'
import CreateRequestView from '@/views/solicitudes/CreateRequestView.vue'
import TrackingView from '@/views/solicitudes/TrackingView.vue'
import EvidenceView from '@/views/solicitudes/EvidenceView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 1. RUTAS PÚBLICAS
    {
      path: '/',
      redirect: '/admin/dashboard'
    },
    {
      path: '/callback',
      name: 'callback',
      component: CallbackView
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnauthorizedView
    },

    // 2. RUTAS PROTEGIDAS
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, permission: 'app_mercadeo' },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { title: 'Modulo Mercadeo', permission: 'admin_mercadeo' }
        },
        // RUTAS SOLICITUDES
        {
          path: 'solicitudes/crear',
          name: 'solicitudes-crear',
          component: CreateRequestView,
          meta: { title: 'Gestionar Mis Solicitudes', permissionsAny: ['gestionar_solicitudes', 'admin_mercadeo'] }
        },
        {
          path: 'solicitudes/seguimiento',
          name: 'solicitudes-seguimiento',
          component: TrackingView,
          meta: { title: 'Bandeja de Entrada Solicitudes', permission: 'admin_mercadeo' }
        },
        {
          path: 'solicitudes/evidencias',
          name: 'solicitudes-evidencias',
          component: EvidenceView,
          meta: { title: 'Evidencias', permissionsAny: ['gestionar_solicitudes', 'admin_mercadeo'] }
        },
        {
          path: 'solicitudes/auditoria',
          name: 'solicitudes-auditoria',
          component: () => import('@/views/solicitudes/AuditView.vue'),
          meta: { title: 'Auditoría General', permission: 'auditoria_mercadeo' }
        },
        {
          path: 'solicitudes/tipos-apoyo',
          name: 'tipos-apoyo',
          component: () => import('@/views/solicitudes/TiposApoyoView.vue'),
          meta: { title: 'Tipos de Apoyo', permission: 'admin_mercadeo' }
        },
        {
          path: 'localidades',
          name: 'localidades',
          component: () => import('@/views/solicitudes/LocalidadesView.vue'),
          meta: { title: 'Gestión Localidades', permission: 'admin_mercadeo' }
        },
        // RUTAS FACTURAS
        {
          path: 'facturas/listado',
          name: 'facturas-listado',
          component: () => import('@/views/Facturas/FacturasView.vue'),
          meta: { title: 'Listado Facturas', permission: 'admin_mercadeo' }
        },
        {
          path: 'facturas/categorias',
          name: 'facturas-categorias',
          component: () => import('@/views/Facturas/CategoriasView.vue'),
          meta: { title: 'Categorías Facturas', permission: 'admin_mercadeo' }
        },
        // MÓDULO LA CARTILLA GANADORA (ADMIN)
        {
          path: 'cartilla-dashboard',
          name: 'cartilla-dashboard',
          component: () => import('@/views/cartilla/DashboardGlobalView.vue'),
          meta: { title: 'Cartilla - Dashboard General', permissionsAny: ['admin_promocion', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-registros',
          name: 'cartilla-registros',
          component: () => import('@/views/cartilla/RegistrosView.vue'),
          meta: { title: 'Cartilla - Registros', permissionsAny: ['admin_promocion', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-historial-registros',
          name: 'cartilla-historial-registros',
          component: () => import('@/views/cartilla/HistorialRegistrosView.vue'),
          meta: { title: 'Cartilla - Historial Registros', permissionsAny: ['admin_promocion', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-inventario',
          name: 'cartilla-inventario',
          component: () => import('@/views/cartilla/InventarioView.vue'),
          meta: { title: 'Cartilla - Inventario Central', permissionsAny: ['admin_promocion', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-balance',
          name: 'cartilla-balance',
          component: () => import('@/views/cartilla/BalanceInventarioView.vue'),
          meta: { title: 'Cartilla - Balance de Inventario', permissionsAny: ['admin_promocion', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-historial-inventario',
          name: 'cartilla-historial-inventario',
          component: () => import('@/views/cartilla/HistorialInventarioView.vue'),
          meta: { title: 'Cartilla - Historial Inventario', permissionsAny: ['admin_promocion', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-exportaciones',
          name: 'cartilla-exportaciones',
          component: () => import('@/views/cartilla/ExportacionesView.vue'),
          meta: { title: 'Cartilla - Exportaciones', permissionsAny: ['admin_promocion', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-colocaciones',
          name: 'cartilla-colocaciones',
          component: () => import('@/views/cartilla/ColocacionesView.vue'),
          meta: { title: 'Cartilla - Colocaciones', permissionsAny: ['admin_promocion', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-configuracion',
          name: 'cartilla-configuracion',
          component: () => import('@/views/cartilla/ConfiguracionView.vue'),
          meta: { title: 'Cartilla - Configuración', permissionsAny: ['admin_promocion', 'cartilla_mercadeo'] }
        },
        // MÓDULO LA CARTILLA GANADORA (AGENCIAS)
        {
          path: 'cartilla-agencia-dashboard',
          name: 'cartilla-agencia-dashboard',
          component: () => import('@/views/cartilla/DashboardAgenciaView.vue'),
          meta: { title: 'Cartilla Agencia - Dashboard', permissionsAny: ['admin_promocion', 'edicion_promocion_agencia', 'lectura_promocion_agencia', 'cartilla_operativo', 'cartilla_consultor', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-agencia-registros',
          name: 'cartilla-agencia-registros',
          component: () => import('@/views/cartilla/RegistrosAgenciaView.vue'),
          meta: { title: 'Cartilla Agencia - Registros', permissionsAny: ['admin_promocion', 'edicion_promocion_agencia', 'lectura_promocion_agencia', 'cartilla_operativo', 'cartilla_consultor', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-agencia-colocaciones',
          name: 'cartilla-agencia-colocaciones',
          component: () => import('@/views/cartilla/ColocacionesAgenciaView.vue'),
          meta: { title: 'Cartilla Agencia - Pagos Automáticos', permissionsAny: ['admin_promocion', 'edicion_promocion_agencia', 'lectura_promocion_agencia', 'cartilla_operativo', 'cartilla_consultor', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-agencia-historial-registros',
          name: 'cartilla-agencia-historial-registros',
          component: () => import('@/views/cartilla/HistorialRegistrosAgenciaView.vue'),
          meta: { title: 'Cartilla Agencia - Historial Registros', permissionsAny: ['admin_promocion', 'edicion_promocion_agencia', 'lectura_promocion_agencia', 'cartilla_operativo', 'cartilla_consultor', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-agencia-inventario',
          name: 'cartilla-agencia-inventario',
          component: () => import('@/views/cartilla/InventarioAgenciaView.vue'),
          meta: { title: 'Cartilla Agencia - Inventario', permissionsAny: ['admin_promocion', 'edicion_promocion_agencia', 'lectura_promocion_agencia', 'cartilla_operativo', 'cartilla_consultor', 'cartilla_mercadeo'] }
        },
        {
          path: 'cartilla-agencia-balance',
          name: 'cartilla-agencia-balance',
          component: () => import('@/views/cartilla/BalanceInventarioView.vue'),
          meta: { title: 'Cartilla Agencia - Balance de Inventario', permissionsAny: ['admin_promocion', 'edicion_promocion_agencia', 'lectura_promocion_agencia', 'cartilla_operativo', 'cartilla_consultor', 'cartilla_mercadeo'] }
        }
      ]
    },

    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

// --- GUARDIA DE NAVEGACIÓN ---
// --- GUARDIA DE NAVEGACIÓN ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 0. Si vamos al Callback (Legacy) o Unauthorized, dejamos pasar SIEMPRE
  // Nota: Con la lógica anterior, el 'CallbackView' ya casi no se usará si entra por aquí,
  // pero lo dejamos por compatibilidad o fallback explícito.
  if (to.name === 'callback' || to.name === 'unauthorized') {
    return next()
  }

  const isAuthenticated = !!authStore.token

  // Caso 1: Ruta requiere Auth y no tenemos token
  if (to.matched.some(record => record.meta.requiresAuth) || to.path === '/') {
    if (!isAuthenticated) {
      console.log("🔒 Acceso Hija: Usuario sin sesión. Iniciando flujo SSO...");
      authStore.login(to.fullPath); // Guardar URL original
      return next(false); // CRÍTICO: Bloqueamos a Vue Router mientras redirecciona
    }
  }

  // Caso 2: Estamos autenticados, verificar identidad y permisos
  if (isAuthenticated) {
    // Asegurar que el usuario esté cargado
    if (!authStore.isReady || !authStore.user) {
      try {
        await authStore.fetchUser();
      } catch {
        // RE-AUTENTICACIÓN FLUIDA:
        // Si el token falló, intentamos PKCE silencioso antes de rendirnos
        console.log("🔒 Re-autenticación fallida. Iniciando flujo SSO...");
        authStore.login(to.fullPath);
        return next(false);
      }
    }

    // Verificar Permiso único
    if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
      const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173';
      console.warn(`⛔ Acceso denegado: Usuario no tiene el permiso '${to.meta.permission}'. Redirigiendo a App Madre...`);
      window.location.href = `${motherAppUrl}/apps`;
      return;
    }

    // Verificar Permisos opcionales (al menos uno)
    if (to.meta.permissionsAny && Array.isArray(to.meta.permissionsAny)) {
      const hasAny = to.meta.permissionsAny.some(p => authStore.hasPermission(p) || authStore.hasRole('Super Admin'))
      if (!hasAny) {
        const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173';
        console.warn(`⛔ Acceso denegado: Usuario no tiene ninguno de los permisos requeridos. Redirigiendo a App Madre...`);
        window.location.href = `${motherAppUrl}/apps`;
        return;
      }
    }


    // Verificar Rol
    if (to.meta.role && !authStore.hasRole(to.meta.role)) {
      // Usuario logueado pero SIN ROL -> Redirigir a App Madre
      const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173';

      console.warn(`⛔ Acceso denegado: Usuario no tiene el rol '${to.meta.role}'. Redirigiendo a App Madre...`);
      window.location.href = `${motherAppUrl}/apps`;
      return;
    }
  }

  next()
})

export default router
