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
          meta: { title: 'Modulo Mercadeo' } // Ejemplo: si necesitara permiso, agregar permission: 'ver_dashboard'
        },
        // RUTAS SOLICITUDES
        {
          path: 'solicitudes/crear',
          name: 'solicitudes-crear',
          component: CreateRequestView
        },
        {
          path: 'solicitudes/seguimiento',
          name: 'solicitudes-seguimiento',
          component: TrackingView
        },
        {
          path: 'solicitudes/evidencias',
          name: 'solicitudes-evidencias',
          component: EvidenceView
        },
        {
          path: 'solicitudes/auditoria',
          name: 'solicitudes-auditoria',
          component: () => import('@/views/solicitudes/AuditView.vue'),
          meta: { title: 'Auditoría General', permission: 'auditoria' }
        },
        {
          path: 'solicitudes/tipos-apoyo',
          name: 'tipos-apoyo',
          component: () => import('@/views/solicitudes/TiposApoyoView.vue')
        },
        {
          path: 'localidades',
          name: 'localidades',
          component: () => import('@/views/solicitudes/LocalidadesView.vue')
        },
        // RUTAS FACTURAS
        {
          path: 'facturas/listado',
          name: 'facturas-listado',
          component: () => import('@/views/Facturas/FacturasView.vue')
        },
        {
          path: 'facturas/categorias',
          name: 'facturas-categorias',
          component: () => import('@/views/Facturas/CategoriasView.vue')
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
      authStore.login();
      return next(false); // CRÍTICO: Bloqueamos a Vue Router mientras redirecciona
    }
  }

  // Caso 2: Estamos autenticados, verificar identidad y permisos
  if (isAuthenticated) {
    // Asegurar que el usuario esté cargado
    if (!authStore.isReady) {
      try {
        await authStore.fetchUser();
      } catch {
        // Si falla, el store ya maneja el logout, pero detenemos navegación
        return;
      }
    }


    // Verificar Permiso
    if (to.meta.permission && !authStore.can(to.meta.permission)) {
      const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173';
      console.warn(`⛔ Acceso denegado: Usuario no tiene el permiso '${to.meta.permission}'. Redirigiendo a App Madre...`);
      window.location.href = `${motherAppUrl}/apps`;
      return;
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
