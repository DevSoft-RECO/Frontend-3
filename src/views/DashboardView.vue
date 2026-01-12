<template>
    <div class="space-y-6 animate-fade-in-up">

      <!-- Welcome Card -->
      <div v-if="authStore.user" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
              <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                  Hola, <span class="text-azul-cope">{{ authStore.user.name }}</span>
              </h2>
              <p class="text-gray-500 dark:text-gray-400 mt-1">
                  Bienvenido a la App de Mercadeo
              </p>
          </div>
          <div>
              <a @click="returnToPortal" class="cursor-pointer text-sm font-medium text-azul-cope hover:underline flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Volver al Portal
              </a>
          </div>
      </div>

      <!-- STATS CARDS -->
      <div v-if="dashboardStore.loading" class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div v-for="i in 5" :key="i" class="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- CARD: SOLICITADO -->
          <DashboardCard
              title="Solicitados"
              :count="stats?.SOLICITADO?.count || 0"
              icon="inbox"
              color="blue"
              :clickable="canInteract"
              @click="openIdsModal('SOLICITADO', stats?.SOLICITADO?.ids)"
          />
          <!-- CARD: EN GESTION -->
          <DashboardCard
              title="En Gestión"
              :count="stats?.EN_GESTION?.count || 0"
              icon="clock"
              color="yellow"
              :clickable="canInteract"
              @click="openIdsModal('EN_GESTION', stats?.EN_GESTION?.ids)"
          />
          <!-- CARD: APROBADO -->
          <DashboardCard
              title="Aprobados"
              :count="stats?.APROBADO?.count || 0"
              icon="check-circle"
              color="green"
              :clickable="canInteract"
              @click="openIdsModal('APROBADO', stats?.APROBADO?.ids)"
          />
           <!-- CARD: FINALIZADO -->
           <DashboardCard
              title="Finalizados"
              :count="stats?.FINALIZADO?.count || 0"
              icon="flag"
              color="gray"
              :clickable="canInteract"
              @click="openIdsModal('FINALIZADO', stats?.FINALIZADO?.ids)"
          />
           <!-- CARD: DENEGADO (RECHAZADO internally) -->
           <DashboardCard
              title="Denegados"
              :count="stats?.RECHAZADO?.count || 0"
              icon="ban"
              color="red"
              :clickable="canInteract"
              @click="openIdsModal('RECHAZADO', stats?.RECHAZADO?.ids)"
          />
      </div>

      <!-- UPCOMING EVENTS & SHORTCUTS -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Section: Próximos Eventos -->
          <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-verde-cope" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Próximos Eventos
              </h3>

              <div v-if="dashboardStore.loading" class="space-y-3">
                   <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>

              <div v-else-if="upcomingEvents.length === 0" class="text-center py-8 text-gray-500">
                  No hay eventos próximos registrados.
              </div>

              <div v-else class="space-y-4">
                  <div
                      v-for="event in upcomingEvents"
                      :key="event.id"
                      class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 transition group"
                      :class="canInteract ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer' : 'cursor-default'"
                      @click="openEventDetail(event)"
                  >
                      <div class="flex items-center gap-4">
                          <div class="font-bold text-2xl text-verde-cope text-center leading-none w-12">
                              <div>{{ new Date(event.fecha_evento).getDate() }}</div>
                              <div class="text-xs text-gray-400 uppercase">{{ getMonthShort(event.fecha_evento) }}</div>
                          </div>
                          <div>
                              <h4 class="font-bold text-gray-800 dark:text-gray-100 group-hover:text-azul-cope">
                                  <span>#{{ event.id }}</span> - {{ event.nombre_solicitante }}
                              </h4>
                              <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                  {{ event.lugar }}
                              </p>
                          </div>
                      </div>
                      <div class="flex items-center gap-3">
                           <span :class="getStatusClass(event.estado)" class="px-2 py-1 text-xs font-bold rounded-full">
                               {{ event.estado === 'RECHAZADO' ? 'DENEGADO' : event.estado }}
                           </span>
                           <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Shortcuts -->
           <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Accesos Directos</h3>
              <div class="space-y-3">
                  <router-link
                      v-if="authStore.can('gestionar_solicitudes')"
                      to="/admin/solicitudes/crear"
                      class="block w-full text-left p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 transition flex items-center gap-3"
                  >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                      <span>Nueva Solicitud</span>
                  </router-link>
                   <router-link
                      v-if="authStore.can('admin_mercadeo')"
                      to="/admin/solicitudes/seguimiento"
                      class="block w-full text-left p-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/30 transition flex items-center gap-3"
                  >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                      <span>Bandeja de Entrada</span>
                  </router-link>
                  <router-link
                      v-if="authStore.can('admin_mercadeo')"
                      to="/admin/facturas/listado"
                      class="block w-full text-left p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30 transition flex items-center gap-3"
                  >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <span>Facturas</span>
                  </router-link>
              </div>
           </div>
      </div>

       <!-- IDS MODAL -->
       <div v-if="showIdsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
           <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 relative">
                <button @click="showIdsModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h3 class="text-lg font-bold mb-4 dark:text-white">
                    Solicitudes: <span class="capitalize">{{ modalTitle }}</span>
                </h3>
                <div v-if="modalIds.length > 0" class="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                    <div v-for="id in modalIds" :key="id" class="p-2 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600 flex justify-between items-center">
                        <span class="font-mono text-sm dark:text-gray-200">#{{ id }}</span>
                         <button @click="goToDetail(id)" class="text-xs text-blue-600 hover:underline">Ver</button>
                    </div>
                </div>
                <div v-else class="text-gray-500 text-sm italic">
                    No hay solicitudes en este estado.
                </div>
           </div>
       </div>



    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import DashboardCard from '@/components/ui/DashboardCard.vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const router = useRouter();

const showIdsModal = ref(false)
const modalIds = ref([])
const modalTitle = ref('')

const stats = computed(() => dashboardStore.stats)
const upcomingEvents = computed(() => dashboardStore.upcomingEvents)

onMounted(async () => {
    await dashboardStore.fetchDashboardData()
})

// Helpers
const getMonthShort = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
}

const getStatusClass = (status) => {
     return status === 'SOLICITADO' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
            status === 'EN_GESTION' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
            status === 'APROBADO' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
            status === 'FINALIZADO' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
            status === 'RECHAZADO' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100'
}

const canInteract = computed(() => authStore.can('dashboard_mercadeo'));

// Actions
const openIdsModal = (status, ids) => {
    if (!canInteract.value) return; // Permission check
    modalTitle.value = status === 'RECHAZADO' ? 'DENEGADOS' : status.toLowerCase().replace('_', ' ')
    modalIds.value = ids || []
    showIdsModal.value = true
}

const goToDetail = () => {
    showIdsModal.value = false
    router.push({ path: '/admin/solicitudes/seguimiento' }) // Accesible via direct link or standard nav
}

const openEventDetail = () => {
    if (!canInteract.value) return; // Permission check
    // Redirect to TrackingView. User will search manually.
    router.push({ path: '/admin/solicitudes/seguimiento' })
}

const returnToPortal = () => {
    const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173';
    window.location.href = `${motherAppUrl}/admin/dashboard`;
}
</script>

<style scoped>
.animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
.animate-fade-in { animation: fadeIn 0.2s ease-out; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
