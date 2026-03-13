<template>
  <div class="p-6 space-y-8 animate-fade-in">
    <!-- HEADER -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Auditoría General</h1>
            <p class="text-gray-500 dark:text-gray-400 font-medium">Panel de control y seguimiento global de solicitudes.</p>
        </div>
        <button @click="refreshAll" :disabled="loading" class="group bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50">
            <svg class="w-5 h-5 transition-transform duration-500 group-hover:rotate-180" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span class="font-bold">Actualizar Datos</span>
        </button>
    </div>

    <!-- STATS CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(stat, index) in statItems" :key="index" 
             class="bg-white dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div class="flex items-center justify-between mb-4">
                <div :class="stat.iconBg" class="p-3 rounded-xl transition-colors duration-300">
                    <svg :class="stat.iconColor" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon" />
                    </svg>
                </div>
                <span class="text-xs font-bold uppercase tracking-wider text-gray-400">{{ stat.label }}</span>
            </div>
            <div class="flex items-end justify-between">
                <h3 class="text-3xl font-black text-gray-900 dark:text-white leading-none">{{ stat.value }}</h3>
                <div class="text-[10px] font-bold text-gray-400 group-hover:text-indigo-500 transition-colors uppercase italic">En tiempo real</div>
            </div>
        </div>
    </div>

    <!-- FILTERS BAR -->
    <div class="bg-white/70 dark:bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
        <div class="flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            <h2 class="font-black uppercase tracking-widest text-sm text-gray-700 dark:text-gray-300">Filtros Avanzados</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
            <div class="space-y-1.5">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Solicitud</label>
                <input v-model="filters.id" type="number" placeholder="Ej: 145" class="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium" @keyup.enter="loadData(1)">
            </div>
            
            <div class="space-y-1.5">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Agencia</label>
                <select v-model="filters.agencia_id" class="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium">
                    <option value="">Todas</option>
                    <option v-for="ag in agencias" :key="ag.agencia_id" :value="ag.agencia_id">Agencia {{ ag.agencia_id }}</option>
                </select>
            </div>

            <div class="space-y-1.5">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estado</label>
                <select v-model="filters.estado" class="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium">
                    <option value="">Cualquier Etapa</option>
                    <option value="SOLICITADO">Solicitado</option>
                    <option value="EN_GESTION">Gestión</option>
                    <option value="APROBADO">Aprobados</option>
                    <option value="FINALIZADO">Finalizados</option>
                    <option value="RECHAZADO">Denegados</option>
                </select>
            </div>

            <div class="lg:col-span-2 grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha Inicio</label>
                    <input v-model="filters.fecha_inicio" type="date" class="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-xs font-medium">
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha Fin</label>
                    <input v-model="filters.fecha_fin" type="date" class="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-xs font-medium">
                </div>
            </div>

            <div class="flex gap-2">
                <button @click="resetFilters" class="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 font-bold py-2.5 rounded-xl transition-all">Limpiar</button>
                <button @click="loadData(1)" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-95">Buscar</button>
            </div>
        </div>
    </div>

    <!-- TABLE AREA -->
    <div class="relative group">
        <BaseTable
            :columns="columns"
            :rows="requests"
            :loading="loading"
            :pagination="pagination"
            @change-page="changePage"
        >
            <template #cell-id="{ value }">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <span class="font-mono font-black text-gray-900 dark:text-white">#{{ value }}</span>
                </div>
            </template>

            <template #cell-agencia_id="{ value }">
                 <div class="flex items-center gap-2">
                    <div class="p-1 px-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-black text-gray-600 dark:text-gray-400 border dark:border-gray-700">
                        AGE-{{ value }}
                    </div>
                 </div>
            </template>

            <template #cell-fecha_evento_inicio="{ row }">
                 <div class="flex flex-col">
                    <span class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ formatDate(row.fecha_evento_inicio) }}</span>
                    <span class="text-[10px] font-black text-gray-400 uppercase">A las {{ formatDate(row.fecha_evento_fin) }}</span>
                </div>
            </template>

            <template #cell-estado="{ value }">
                 <span :class="getStatusClass(value)" class="px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border shadow-sm">
                     {{ value === 'RECHAZADO' ? 'DENEGADO' : value }}
                 </span>
            </template>

            <template #cell-actions="{ row }">
                 <button @click="openTracking(row)" class="group bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-sm border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Seguimiento
                 </button>
            </template>
            <template #empty>
            <div class="py-12 flex flex-col items-center justify-center space-y-4">
                <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-full">
                    <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div class="text-center">
                    <p class="text-lg font-black text-gray-900 dark:text-white">No se encontraron solicitudes</p>
                    <p class="text-sm text-gray-500">Prueba ajustando los filtros de búsqueda.</p>
                </div>
                <button @click="resetFilters" class="text-indigo-600 font-bold text-sm hover:underline">Limpiar todos los filtros</button>
            </div>
        </template>
    </BaseTable>
    </div>

    <!-- MODAL (Manteniendo la lógica pero el look vendrá del componente) -->
    <TimelineModal :show="showTimeline" :request="selectedItem" :readOnly="true" @close="closeTimeline" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useSolicitudesStore } from '@/stores/solicitudes'
import BaseTable from '@/components/ui/BaseTable.vue'
import TimelineModal from './Seguimiento/TimelineModal.vue'

const store = useSolicitudesStore()
const requests = ref([])
const agencias = ref([])
const stats = ref({ total: 0, pendientes: 0, aprobados: 0, finalizados: 0 })
const loading = ref(false)
const filters = reactive({ id: '', agencia_id: '', estado: '', fecha_inicio: '', fecha_fin: '' })
const pagination = ref({ current_page: 1, last_page: 1 })
const showTimeline = ref(false)
const selectedItem = ref(null)

const statItems = computed(() => [
    { label: 'Total Registros', value: stats.value.total, icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', iconBg: 'bg-indigo-50 dark:bg-indigo-900/20', iconColor: 'text-indigo-600' },
    { label: 'En Proceso', value: stats.value.pendientes, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600' },
    { label: 'Aprobados', value: stats.value.aprobados, icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.13 3.13 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.13 3.13 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.13-3.13 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.13-3.13z', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600' },
    { label: 'Finalizados/Den.', value: stats.value.finalizados, icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', iconBg: 'bg-gray-50 dark:bg-gray-900/20', iconColor: 'text-gray-600' },
])

const columns = [
    { key: 'id', label: 'ID', truncate: true },
    { key: 'agencia_id', label: 'Agencia', truncate: true },
    { key: 'nombre_solicitante', label: 'Solicitante', truncate: false },
    { key: 'fecha_evento_inicio', label: 'Periodo Evento', truncate: false },
    { key: 'estado', label: 'Estado', truncate: false },
    { key: 'actions', label: 'Acciones', align: 'right', truncate: false }
]

onMounted(() => {
    refreshAll()
})

const refreshAll = async () => {
    loading.value = true
    try {
        await Promise.all([
            loadData(1),
            loadAgencias(),
            loadStats()
        ])
    } finally {
        loading.value = false
    }
}

const loadData = async (page = 1) => {
    const res = await store.fetchAuditSolicitudes({ ...filters, page })
    if (res.data) {
        requests.value = res.data
        pagination.value = { current_page: res.current_page, last_page: res.last_page }
    }
}

const loadAgencias = async () => {
    agencias.value = await store.fetchAgenciasCatalog()
}

const loadStats = async () => {
    stats.value = await store.fetchAuditStats()
}

const changePage = (page) => loadData(page)
const resetFilters = () => {
    Object.keys(filters).forEach(k => filters[k] = '')
    loadData(1)
}

const openTracking = (row) => { selectedItem.value = row; showTimeline.value = true }
const closeTimeline = () => { showTimeline.value = false; selectedItem.value = null }

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
}

const getStatusClass = (status) => {
    const base = 'border-opacity-30 '
    switch(status) {
        case 'SOLICITADO': return base + 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900'
        case 'EN_GESTION': return base + 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900'
        case 'APROBADO': return base + 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900'
        case 'FINALIZADO': return base + 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
        case 'RECHAZADO': return base + 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900'
        default: return 'bg-gray-100'
    }
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Custom input/select focus rings */
input:focus, select:focus {
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}
</style>
